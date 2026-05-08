export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

export type StepControlType = 'code' | 'llm' | 'tool_calling'

export interface WorkflowStepConfig<TContext = unknown> {
  name: string
  description?: string
  controlType: StepControlType
  execute: (context: TContext) => Promise<void>
}

export interface WorkflowExecutionLog {
  step: string
  startedAt: number
  completedAt?: number
  durationMs?: number
  error?: string
}

export interface WorkflowTaskState {
  id: string
  status: WorkflowStatus
  currentStep: string
  errorMsg?: string
  errorStep?: string
  createdAt: number
  updatedAt: number
  startedAt?: number
  completedAt?: number
  durationMs?: number
}

export interface WorkflowTaskPersister {
  createTask(params: { taskId: string; workflowType: string }): Promise<void>
  updateTask(taskId: string, state: Partial<WorkflowTaskState>): Promise<void>
  appendLog(taskId: string, entry: WorkflowExecutionLog): Promise<void>
  getTask?(taskId: string): Promise<WorkflowTaskState | null>
  getLogs?(taskId: string): Promise<WorkflowExecutionLog[]>
}

export interface WorkflowSnapshot<TContext = unknown> {
  task: WorkflowTaskState
  context: TContext
  executionLogs: WorkflowExecutionLog[]
}

function createNoopPersister(): WorkflowTaskPersister {
  return {
    createTask: async () => { },
    updateTask: async () => { },
    appendLog: async () => { }
  }
}

export abstract class WorkflowEngine<TContext = unknown> {
  protected task: WorkflowTaskState
  protected context: TContext
  protected executionLogs: WorkflowExecutionLog[] = []
  protected steps: WorkflowStepConfig<TContext>[] = []
  protected persister: WorkflowTaskPersister

  constructor(taskId: string, context: TContext, persister?: WorkflowTaskPersister) {
    this.persister = persister || createNoopPersister()
    this.task = {
      id: taskId,
      status: WorkflowStatus.PENDING,
      currentStep: 'init',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    this.context = context
  }

  protected abstract get workflowType(): string

  protected abstract defineSteps(): WorkflowStepConfig<TContext>[]

  async execute(): Promise<TContext> {
    const startTime = Date.now()

    try {
      this.steps = this.defineSteps()
      this.updateStatus(WorkflowStatus.RUNNING)
      this.task.startedAt = Date.now()

      await this.persister.createTask({
        taskId: this.task.id,
        workflowType: this.workflowType
      })
      await this.persistState()

      for (const step of this.steps) {
        await this.executeStep(step)
      }

      this.updateStatus(WorkflowStatus.COMPLETED)
      this.task.completedAt = Date.now()
      this.task.durationMs = Date.now() - startTime
      await this.persistState()

      return this.context
    } catch (error) {
      this.task.durationMs = Date.now() - startTime
      await this.handleError(error as Error)
      throw error
    }
  }

  async resume(fromStepName?: string): Promise<TContext> {
    const startTime = Date.now()

    try {
      this.steps = this.defineSteps()
      this.updateStatus(WorkflowStatus.RUNNING)
      this.task.startedAt = this.task.startedAt || Date.now()

      const startIndex = fromStepName
        ? this.steps.findIndex(s => s.name === fromStepName)
        : this.steps.findIndex(s => s.name === this.task.currentStep)

      if (startIndex === -1) {
        throw new Error(`无法找到恢复步骤: ${fromStepName || this.task.currentStep}`)
      }

      await this.persistState()

      for (let i = startIndex; i < this.steps.length; i++) {
        await this.executeStep(this.steps[i])
      }

      this.updateStatus(WorkflowStatus.COMPLETED)
      this.task.completedAt = Date.now()
      this.task.durationMs = (this.task.durationMs || 0) + (Date.now() - startTime)
      await this.persistState()

      return this.context
    } catch (error) {
      this.task.durationMs = (this.task.durationMs || 0) + (Date.now() - startTime)
      await this.handleError(error as Error)
      throw error
    }
  }

  private async executeStep(step: WorkflowStepConfig<TContext>): Promise<void> {
    const stepStart = Date.now()
    this.updateStep(step.name)

    try {
      await step.execute(this.context)
      await this.logStep(step.name, stepStart)
    } catch (error) {
      await this.logStep(step.name, stepStart, error as Error)
      throw error
    }
  }

  protected updateStep(stepName: string): void {
    this.task.currentStep = stepName
    this.task.updatedAt = Date.now()
  }

  protected updateStatus(status: WorkflowStatus): void {
    this.task.status = status
    this.task.updatedAt = Date.now()
  }

  protected async logStep(stepName: string, startTime: number, error?: Error): Promise<void> {
    const entry: WorkflowExecutionLog = {
      step: stepName,
      startedAt: startTime,
      completedAt: Date.now(),
      durationMs: Date.now() - startTime,
      error: error?.message
    }
    this.executionLogs.push(entry)
    await this.persister.appendLog(this.task.id, entry)
    await this.persistState()
  }

  protected async handleError(error: Error): Promise<void> {
    this.updateStatus(WorkflowStatus.FAILED)
    this.task.errorMsg = error.message
    this.task.errorStep = this.task.currentStep
    await this.persistState()
  }

  protected async persistState(): Promise<void> {
    await this.persister.updateTask(this.task.id, {
      status: this.task.status,
      currentStep: this.task.currentStep,
      errorMsg: this.task.errorMsg,
      errorStep: this.task.errorStep,
      startedAt: this.task.startedAt,
      completedAt: this.task.completedAt,
      durationMs: this.task.durationMs
    })
  }

  getTask(): WorkflowTaskState {
    return this.task
  }

  getExecutionLogs(): WorkflowExecutionLog[] {
    return this.executionLogs
  }

  getContext(): TContext {
    return this.context
  }

  toSnapshot(): WorkflowSnapshot<TContext> {
    return {
      task: { ...this.task },
      context: this.context,
      executionLogs: [...this.executionLogs]
    }
  }

  restoreState(snapshot: WorkflowSnapshot<TContext>): void {
    this.task = { ...snapshot.task }
    this.context = snapshot.context
    this.executionLogs = [...snapshot.executionLogs]
  }

  static async load<TContext>(
    taskId: string,
    persister: WorkflowTaskPersister,
    contextFactory: () => TContext
  ): Promise<WorkflowSnapshot<TContext> | null> {
    if (!persister.getTask) return null

    const task = await persister.getTask(taskId)
    if (!task) return null

    const logs = persister.getLogs ? await persister.getLogs(taskId) : []

    return {
      task,
      context: contextFactory(),
      executionLogs: logs
    }
  }
}
