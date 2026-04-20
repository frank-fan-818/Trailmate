import type { ItineraryPlan } from '../../../trip-tools/itinerary-generator/src/types'
import type PerceptionModule from '../../index'
import { pushNotification } from '../services/notification.service'
import { startRuleScheduler } from '../services/rule-engine.service'
import { generateTimeline, startTimelineScheduler } from '../services/timeline.service'
import type { PerceptionContext } from '../types'

export async function handlePlanGenerated(
  this: PerceptionModule,
  data: { userId: string; plans: ItineraryPlan[] }
): Promise<void> {
  const { userId, plans } = data
  const primaryPlan = plans[0]
  if (!primaryPlan) {
    return
  }

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
  await generateTimeline.call(this, userId, primaryPlan)
  await startRuleScheduler.call(this, userId)
  await startTimelineScheduler.call(this, userId)
  await pushNotification.call(this, {
    userId,
    planId: primaryPlan.id,
    level: 'info',
    content: 'Perception timeline is ready. You can now simulate location changes to trigger alerts.'
  })
}

export async function handlePlanUpdated(
  this: PerceptionModule,
  data: { userId: string; plan: ItineraryPlan }
): Promise<void> {
  const { userId, plan } = data
  const existingContext = this.getContext(userId)

  this.setContext(userId, {
    id: existingContext?.id ?? `ctx_${Date.now()}`,
    userId,
    planId: plan.id,
    currentLocation: existingContext?.currentLocation,
    currentDayIndex: existingContext?.currentDayIndex ?? 0,
    currentProgress: existingContext?.currentProgress ?? 0,
    travelMode: existingContext?.travelMode ?? 'driving',
    isAutoSimulate: existingContext?.isAutoSimulate ?? false,
    createdAt: existingContext?.createdAt ?? Date.now(),
    updatedAt: Date.now()
  })

  await generateTimeline.call(this, userId, plan)
  await pushNotification.call(this, {
    userId,
    planId: plan.id,
    level: 'info',
    content: 'Timeline refreshed after the latest itinerary update.'
  })
}
