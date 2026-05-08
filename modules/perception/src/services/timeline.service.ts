import { GlobalEvent } from '../../../../core'
import type { ItineraryItemType, ItineraryPlan } from '../../../../shared/types/itinerary.types'
import type PerceptionModule from '../../index'
import {
  TimelineNodeStatus,
  TimelineNodeType,
  type TimelineNode
} from '../types'

const planTimelines = new Map<string, TimelineNode[]>()
const timelineUpdateTimers = new Map<string, ReturnType<typeof setInterval>>()

export function mapItineraryItemTypeToTimelineType(itemType: ItineraryItemType): TimelineNodeType {
  switch (itemType) {
    case 'flight':
      return TimelineNodeType.FLIGHT
    case 'hotel':
      return TimelineNodeType.HOTEL
    case 'attraction':
      return TimelineNodeType.ATTRACTION
    case 'meal':
      return TimelineNodeType.MEAL
    case 'transport':
      return TimelineNodeType.TRANSPORT
    default:
      return TimelineNodeType.CUSTOM
  }
}

export async function generateTimeline(
  this: PerceptionModule,
  userId: string,
  plan: ItineraryPlan
): Promise<TimelineNode[]> {
  const timeline = plan.days.flatMap((day, dayIndex) => {
    return day.items.map((item, itemIndex) => ({
      id: `timeline_${plan.id}_${dayIndex}_${itemIndex}`,
      planId: plan.id,
      dayIndex,
      startTime: item.startTime,
      endTime: item.endTime,
      title: item.name,
      description: item.description,
      type: mapItineraryItemTypeToTimelineType(item.type),
      status: TimelineNodeStatus.NOT_STARTED,
      address: item.address,
      relatedId: item.id,
      tags: item.tags,
      remindTime: item.type === 'flight' ? 90 : 30
    }))
  })

  planTimelines.set(plan.id, timeline)
  this.core?.state.set(`perception.timeline.${plan.id}`, timeline)
  await this.core?.eventBus.emit(GlobalEvent.TIMELINE_UPDATED, {
    userId,
    planId: plan.id,
    timeline
  })

  return timeline
}

export async function getTimeline(
  this: PerceptionModule,
  params: { userId: string; planId: string }
): Promise<TimelineNode[]> {
  return planTimelines.get(params.planId) ?? []
}

export async function updateNodeStatus(
  this: PerceptionModule,
  params: { userId: string; planId: string; nodeId: string; status: TimelineNodeStatus }
): Promise<TimelineNode | null> {
  const timeline = planTimelines.get(params.planId)
  if (!timeline) {
    return null
  }

  const node = timeline.find((entry) => entry.id === params.nodeId)
  if (!node) {
    return null
  }

  node.status = params.status
  this.core?.state.set(`perception.timeline.${params.planId}`, timeline)
  await this.core?.eventBus.emit(GlobalEvent.TIMELINE_UPDATED, {
    userId: params.userId,
    planId: params.planId,
    timeline
  })

  syncProgress(this, params.userId, params.planId, timeline)
  return node
}

export async function insertCustomNode(
  this: PerceptionModule,
  params: { userId: string; planId: string; node: Omit<TimelineNode, 'id' | 'planId' | 'status'> }
): Promise<TimelineNode> {
  const timeline = [...(planTimelines.get(params.planId) ?? [])]
  const newNode: TimelineNode = {
    ...params.node,
    id: `timeline_custom_${Date.now()}`,
    planId: params.planId,
    status: TimelineNodeStatus.NOT_STARTED
  }

  timeline.push(newNode)
  timeline.sort(compareTimelineNodes)

  planTimelines.set(params.planId, timeline)
  this.core?.state.set(`perception.timeline.${params.planId}`, timeline)
  await this.core?.eventBus.emit(GlobalEvent.TIMELINE_UPDATED, {
    userId: params.userId,
    planId: params.planId,
    timeline
  })

  return newNode
}

export function getTimelineSnapshot(planId: string): TimelineNode[] {
  return planTimelines.get(planId) ?? []
}

export async function startTimelineScheduler(this: PerceptionModule, userId: string): Promise<void> {
  stopTimelineScheduler(userId)

  const timer = setInterval(async () => {
    const context = this.getContext(userId)
    if (!context) {
      return
    }

    const timeline = planTimelines.get(context.planId)
    if (!timeline || timeline.length === 0) {
      return
    }

    const currentMinutes = currentTimeInMinutes()
    let hasChanges = false

    for (const node of timeline) {
      const startMinutes = timeToMinutes(node.startTime)
      const endMinutes = timeToMinutes(node.endTime)
      const nextStatus =
        currentMinutes >= endMinutes
          ? TimelineNodeStatus.COMPLETED
          : currentMinutes >= startMinutes
            ? TimelineNodeStatus.IN_PROGRESS
            : TimelineNodeStatus.NOT_STARTED

      if (node.status !== nextStatus) {
        node.status = nextStatus
        hasChanges = true
      }
    }

    if (hasChanges) {
      this.core?.state.set(`perception.timeline.${context.planId}`, timeline)
      await this.core?.eventBus.emit(GlobalEvent.TIMELINE_UPDATED, {
        userId,
        planId: context.planId,
        timeline
      })
      syncProgress(this, userId, context.planId, timeline)
    }
  }, 60000)

  timelineUpdateTimers.set(userId, timer)
}

export function stopTimelineScheduler(userId: string): void {
  const timer = timelineUpdateTimers.get(userId)
  if (timer) {
    clearInterval(timer)
    timelineUpdateTimers.delete(userId)
  }
}

function compareTimelineNodes(left: TimelineNode, right: TimelineNode): number {
  if (left.dayIndex !== right.dayIndex) {
    return left.dayIndex - right.dayIndex
  }

  return timeToMinutes(left.startTime) - timeToMinutes(right.startTime)
}

function syncProgress(
  module: PerceptionModule,
  userId: string,
  planId: string,
  timeline: TimelineNode[]
): void {
  const context = module.getContext(userId)
  if (!context || context.planId !== planId) {
    return
  }

  const completedCount = timeline.filter((node) => node.status === TimelineNodeStatus.COMPLETED).length
  const currentDayIndex = Math.max(...timeline.map((node) => node.dayIndex), 0)
  module.setContext(userId, {
    ...context,
    currentDayIndex,
    currentProgress: Math.round((completedCount / timeline.length) * 100),
    updatedAt: Date.now()
  })
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0)
}

function currentTimeInMinutes(): number {
  const now = new Date()
  return now.getHours() * 60 + now.getMinutes()
}
