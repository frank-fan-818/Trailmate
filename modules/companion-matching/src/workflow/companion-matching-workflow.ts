import {
  WorkflowEngine,
  WorkflowStatus,
  type WorkflowStepConfig,
  type WorkflowExecutionLog,
  type WorkflowTaskPersister
} from '../../../../core/workflow-engine.js'
import type { UserProfile, CompanionFilters, MatchResult } from '../types/index'
import { filterCompanions, getMockCompanions } from '../services/matching.service'

export enum CompanionMatchingWorkflowStep {
  INIT = 'init',
  LOAD_USER_PROFILE = 'load_user_profile',
  APPLY_FILTERS = 'apply_filters',
  CALCULATE_MATCHES = 'calculate_matches',
  RANK_RESULTS = 'rank_results',
  COMPLETE = 'complete',
  ERROR = 'error'
}

export interface CompanionMatchingRequest {
  userId: string
  userProfile: UserProfile
  filters?: CompanionFilters
}

export interface CompanionMatchingContext {
  userId: string
  userProfile: UserProfile
  filters: CompanionFilters
  matchResults: MatchResult[]
}

function createNoopPersister(): WorkflowTaskPersister {
  return {
    createTask: async () => {},
    updateTask: async () => {},
    appendLog: async () => {}
  }
}

export class CompanionMatchingWorkflow extends WorkflowEngine<CompanionMatchingContext> {
  constructor(
    request: CompanionMatchingRequest,
    persister?: WorkflowTaskPersister
  ) {
    const context: CompanionMatchingContext = {
      userId: request.userId,
      userProfile: request.userProfile,
      filters: request.filters || {},
      matchResults: []
    }
    const taskId = `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    super(taskId, context, persister || createNoopPersister())
  }

  protected get workflowType(): string {
    return 'companion_matching'
  }

  protected defineSteps(): WorkflowStepConfig<CompanionMatchingContext>[] {
    return [
      {
        name: CompanionMatchingWorkflowStep.LOAD_USER_PROFILE,
        description: '加载用户画像和偏好',
        controlType: 'code',
        execute: this.stepLoadUserProfile.bind(this)
      },
      {
        name: CompanionMatchingWorkflowStep.APPLY_FILTERS,
        description: '应用筛选条件',
        controlType: 'code',
        execute: this.stepApplyFilters.bind(this)
      },
      {
        name: CompanionMatchingWorkflowStep.CALCULATE_MATCHES,
        description: '计算匹配度评分',
        controlType: 'code',
        execute: this.stepCalculateMatches.bind(this)
      },
      {
        name: CompanionMatchingWorkflowStep.RANK_RESULTS,
        description: '排序并返回匹配结果',
        controlType: 'code',
        execute: this.stepRankResults.bind(this)
      },
      {
        name: CompanionMatchingWorkflowStep.COMPLETE,
        description: '完成匹配',
        controlType: 'code',
        execute: this.stepComplete.bind(this)
      }
    ]
  }

  async execute(): Promise<MatchResult[]> {
    console.log(`\n[CompanionMatching] 开始匹配 - 用户: ${this.getContext().userId}`)
    await super.execute()
    console.log(`[CompanionMatching] 匹配完成 - 耗时: ${this.getTask().durationMs}ms`)
    return this.getContext().matchResults
  }

  private async stepLoadUserProfile(context: CompanionMatchingContext): Promise<void> {
    console.log(`  [Step 1/5] 加载用户画像`)
    console.log(`  ✓ 目的地: ${context.userProfile.destination}`)
    console.log(`  ✓ 预算: ${context.userProfile.budgetType}`)
    console.log(`  ✓ 偏好: ${context.userProfile.travelTypes.join(', ')}`)
  }

  private async stepApplyFilters(context: CompanionMatchingContext): Promise<void> {
    console.log(`  [Step 2/5] 应用筛选条件`)
    const activeFilters = Object.entries(context.filters)
      .filter(([_, v]) => v !== undefined && v !== '')
    console.log(`  ✓ 激活的筛选条件: ${activeFilters.length} 个`)
  }

  private async stepCalculateMatches(context: CompanionMatchingContext): Promise<void> {
    console.log(`  [Step 3/5] 计算匹配度`)
    context.matchResults = filterCompanions(getMockCompanions(), context.filters, context.userProfile)
    console.log(`  ✓ 计算完成: ${context.matchResults.length} 个匹配结果`)
  }

  private async stepRankResults(context: CompanionMatchingContext): Promise<void> {
    console.log(`  [Step 4/5] 排序结果`)
    context.matchResults.sort((a, b) => b.matchScore - a.matchScore)
    const top3 = context.matchResults.slice(0, 3)
    top3.forEach((r, i) => {
      console.log(`  ${i + 1}. ${r.companion.name} - ${r.matchScore}%`)
    })
  }

  private async stepComplete(context: CompanionMatchingContext): Promise<void> {
    console.log(`  [Step 5/5] 匹配完成`)
    console.log(`  ✓ 共找到 ${context.matchResults.length} 位匹配旅伴`)
  }
}

export async function runCompanionMatchingWorkflow(
  request: CompanionMatchingRequest,
  persister?: WorkflowTaskPersister
): Promise<{
  results: MatchResult[]
  task: ReturnType<WorkflowEngine['getTask']>
  logs: WorkflowExecutionLog[]
}> {
  const workflow = new CompanionMatchingWorkflow(request, persister)
  const results = await workflow.execute()
  return {
    results,
    task: workflow.getTask(),
    logs: workflow.getExecutionLogs()
  }
}
