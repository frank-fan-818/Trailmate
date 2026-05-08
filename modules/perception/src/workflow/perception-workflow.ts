import {
  WorkflowEngine,
  type WorkflowStepConfig,
  type WorkflowExecutionLog,
  type WorkflowTaskPersister
} from '../../../../core/workflow-engine.js'

export enum PerceptionWorkflowStep {
  INIT = 'init',
  COLLECT_CONTEXT = 'collect_context',
  ANALYZE_RULES = 'analyze_rules',
  GENERATE_NOTIFICATIONS = 'generate_notifications',
  UPDATE_TIMELINE = 'update_timeline',
  COMPLETE = 'complete',
  ERROR = 'error'
}

export interface PerceptionWorkflowRequest {
  userId: string
  triggerType?: 'scheduled' | 'location_change' | 'plan_update' | 'manual'
  planId?: string
}

export interface PerceptionContext {
  userId: string
  triggerType: string
  planId?: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
  currentTime: number
  activePlan?: {
    id: string
    name: string
    currentDay: number
    currentNodeIndex: number
  }
  ruleResults?: Array<{
    ruleId: string
    ruleName: string
    triggered: boolean
    data?: unknown
  }>
  notifications?: Array<{
    id: string
    level: 'info' | 'warning' | 'alert'
    title: string
    message: string
    action?: string
  }>
  timelineUpdates?: Array<{
    nodeId: string
    status: string
    actualTime?: number
  }>
}

function createNoopPersister(): WorkflowTaskPersister {
  return {
    createTask: async () => {},
    updateTask: async () => {},
    appendLog: async () => {}
  }
}

export class PerceptionWorkflow extends WorkflowEngine<PerceptionContext> {
  private onNotificationGenerated?: (notifications: PerceptionContext['notifications']) => void
  private onTimelineUpdated?: (updates: PerceptionContext['timelineUpdates']) => void

  constructor(
    request: PerceptionWorkflowRequest,
    options?: {
      persister?: WorkflowTaskPersister
      onNotificationGenerated?: (notifications: PerceptionContext['notifications']) => void
      onTimelineUpdated?: (updates: PerceptionContext['timelineUpdates']) => void
    }
  ) {
    const context: PerceptionContext = {
      userId: request.userId,
      triggerType: request.triggerType || 'manual',
      planId: request.planId,
      currentTime: Date.now()
    }
    const taskId = `perception_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    super(taskId, context, options?.persister || createNoopPersister())
    this.onNotificationGenerated = options?.onNotificationGenerated
    this.onTimelineUpdated = options?.onTimelineUpdated
  }

  protected get workflowType(): string {
    return 'perception_analysis'
  }

  protected defineSteps(): WorkflowStepConfig<PerceptionContext>[] {
    return [
      {
        name: PerceptionWorkflowStep.COLLECT_CONTEXT,
        description: '收集位置、时间、行程等上下文数据',
        controlType: 'code',
        execute: this.stepCollectContext.bind(this)
      },
      {
        name: PerceptionWorkflowStep.ANALYZE_RULES,
        description: '运行规则引擎检测触发条件',
        controlType: 'code',
        execute: this.stepAnalyzeRules.bind(this)
      },
      {
        name: PerceptionWorkflowStep.GENERATE_NOTIFICATIONS,
        description: '根据规则结果生成通知',
        controlType: 'llm',
        execute: this.stepGenerateNotifications.bind(this)
      },
      {
        name: PerceptionWorkflowStep.UPDATE_TIMELINE,
        description: '更新时间线节点状态',
        controlType: 'code',
        execute: this.stepUpdateTimeline.bind(this)
      },
      {
        name: PerceptionWorkflowStep.COMPLETE,
        description: '完成情境分析',
        controlType: 'code',
        execute: this.stepComplete.bind(this)
      }
    ]
  }

  async execute(): Promise<PerceptionContext> {
    console.log(`\n[PerceptionWorkflow] 开始情境分析 - 用户: ${this.getContext().userId}`)
    const result = await super.execute()
    console.log(`[PerceptionWorkflow] 情境分析完成 - 耗时: ${this.getTask().durationMs}ms`)
    return result
  }

  private async stepCollectContext(context: PerceptionContext): Promise<void> {
    console.log(`  [Step 1/5] 收集上下文数据`)

    context.currentTime = Date.now()

    context.location = {
      lat: 36.0671,
      lng: 120.3826,
      address: '青岛市市南区'
    }

    if (context.planId) {
      context.activePlan = {
        id: context.planId,
        name: '青岛亲子游',
        currentDay: 2,
        currentNodeIndex: 3
      }
    }

    console.log(`  ✓ 上下文收集完成: 位置=${context.location?.address}, 时间=${new Date(context.currentTime).toLocaleTimeString()}`)
  }

  private async stepAnalyzeRules(context: PerceptionContext): Promise<void> {
    console.log(`  [Step 2/5] 运行规则引擎`)

    const rules = [
      {
        ruleId: 'rule_time_check',
        ruleName: '时间检查',
        check: (ctx: PerceptionContext) => {
          const hour = new Date(ctx.currentTime).getHours()
          return hour >= 11 && hour < 13
        },
        data: { suggestion: '午餐时间到了' }
      },
      {
        ruleId: 'rule_location_deviation',
        ruleName: '位置偏离检测',
        check: (ctx: PerceptionContext) => {
          return ctx.activePlan !== undefined && ctx.location !== undefined
        },
        data: { distance: 1.2, expected: '栈桥', actual: '金沙滩' }
      },
      {
        ruleId: 'rule_schedule_delay',
        ruleName: '行程延误检测',
        check: (ctx: PerceptionContext) => {
          return ctx.activePlan !== undefined && ctx.activePlan.currentNodeIndex > 2
        },
        data: { delayMinutes: 15, nodeName: '极地海洋世界' }
      },
      {
        ruleId: 'rule_weather_alert',
        ruleName: '天气预警',
        check: () => false,
        data: null
      }
    ]

    context.ruleResults = rules.map(rule => ({
      ruleId: rule.ruleId,
      ruleName: rule.ruleName,
      triggered: rule.check(context),
      data: rule.check(context) ? rule.data : undefined
    }))

    const triggeredCount = context.ruleResults.filter(r => r.triggered).length
    console.log(`  ✓ 规则分析完成: ${triggeredCount}/${rules.length} 条规则触发`)
  }

  private async stepGenerateNotifications(context: PerceptionContext): Promise<void> {
    console.log(`  [Step 3/5] 生成通知`)

    const notifications: PerceptionContext['notifications'] = []

    for (const result of context.ruleResults || []) {
      if (!result.triggered) continue

      switch (result.ruleId) {
        case 'rule_time_check':
          notifications.push({
            id: `notif_${Date.now()}_1`,
            level: 'info',
            title: '午餐提醒',
            message: '当前已到午餐时间，附近有多家推荐餐厅',
            action: '查看推荐'
          })
          break
        case 'rule_location_deviation':
          notifications.push({
            id: `notif_${Date.now()}_2`,
            level: 'warning',
            title: '位置偏离',
            message: '您当前在金沙滩，行程计划下一站是栈桥（距离1.2km）',
            action: '调整路线'
          })
          break
        case 'rule_schedule_delay':
          notifications.push({
            id: `notif_${Date.now()}_3`,
            level: 'alert',
            title: '行程延误',
            message: '极地海洋世界已延误15分钟，可能影响后续行程',
            action: '调整计划'
          })
          break
      }
    }

    context.notifications = notifications
    console.log(`  ✓ 生成 ${notifications.length} 条通知`)

    if (this.onNotificationGenerated) {
      this.onNotificationGenerated(notifications)
    }
  }

  private async stepUpdateTimeline(context: PerceptionContext): Promise<void> {
    console.log(`  [Step 4/5] 更新时间线`)

    const updates: PerceptionContext['timelineUpdates'] = []

    if (context.activePlan) {
      updates.push({
        nodeId: `node_${context.activePlan.currentDay}_${context.activePlan.currentNodeIndex}`,
        status: 'in_progress',
        actualTime: Date.now()
      })
    }

    context.timelineUpdates = updates
    console.log(`  ✓ 时间线更新完成: ${updates.length} 个节点`)

    if (this.onTimelineUpdated) {
      this.onTimelineUpdated(updates)
    }
  }

  private async stepComplete(context: PerceptionContext): Promise<void> {
    console.log(`  [Step 5/5] 情境分析完成`)
    console.log(`  ✓ 通知数: ${context.notifications?.length || 0}`)
    console.log(`  ✓ 时间线更新: ${context.timelineUpdates?.length || 0}`)
  }
}

export async function runPerceptionWorkflow(
  request: PerceptionWorkflowRequest,
  options?: {
    persister?: WorkflowTaskPersister
    onNotificationGenerated?: (notifications: PerceptionContext['notifications']) => void
    onTimelineUpdated?: (updates: PerceptionContext['timelineUpdates']) => void
  }
): Promise<{
  context: PerceptionContext
  task: ReturnType<WorkflowEngine['getTask']>
  logs: WorkflowExecutionLog[]
}> {
  const workflow = new PerceptionWorkflow(request, options)
  const context = await workflow.execute()
  return {
    context,
    task: workflow.getTask(),
    logs: workflow.getExecutionLogs()
  }
}
