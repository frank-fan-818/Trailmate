import type PerceptionModule from '../../index'
import type { ItineraryPlan } from '../../../trip-tools/itinerary-generator/src/types'
import { generateTimeline, startTimelineScheduler } from '../services/timeline.service'
import { startRuleScheduler } from '../services/rule-engine.service'
import { PerceptionContext } from '../types'

/**
 * 处理行程生成事件
 */
export async function handlePlanGenerated(this: PerceptionModule, data: {
  userId: string
  plans: ItineraryPlan[]
}) {
  const { userId, plans } = data
  if (!plans || plans.length === 0) return

  // 默认使用第一个行程方案创建上下文
  const primaryPlan = plans[0]

  // 创建情境感知上下文
  const context: PerceptionContext = {
    id: `ctx_${Date.now()}`,
    userId,
    planId: primaryPlan.id,
    currentDayIndex: 0,
    currentProgress: 0,
    travelMode: 'driving',
    isAutoSimulate: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }

  this.setContext(userId, context)

  // 生成初始时间线
  await generateTimeline(userId, primaryPlan)

  // 启动规则调度器
  await startRuleScheduler.call(this, userId)

  // 启动时间线状态更新调度器
  await startTimelineScheduler.call(this, userId)

  console.log(`✅ 用户${userId}行程生成，情境感知上下文已创建，规则调度和时间线更新已启动`)
}

/**
 * 处理行程更新事件
 */
export async function handlePlanUpdated(this: PerceptionModule, data: {
  userId: string
  plan: ItineraryPlan
}) {
  const { userId, plan } = data

  const context = this.getContext(userId)
  if (!context) return

  // 更新上下文关联的行程ID
  context.planId = plan.id
  context.updatedAt = Date.now()
  this.setContext(userId, context)

  // 重新生成时间线
  await generateTimeline(userId, plan)

  console.log(`✅ 用户${userId}行程更新，时间线已同步`)
}
