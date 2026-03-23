import type PerceptionModule from '../../index'
import { GlobalEvent } from '@trailmate/core'
import type { ItineraryPlan } from '../../../trip-tools/itinerary-generator/src/types'
import type { TimelineNode, TimelineNodeStatus, TimelineNodeType } from '../types'
import { TimelineNodeStatus as Status } from '../types'

// 存储时间线数据：planId -> TimelineNode[]
const planTimelines = new Map<string, TimelineNode[]>()
// 状态更新定时器：userId -> timer
const timelineUpdateTimers = new Map<string, ReturnType<typeof setInterval>>()

/**
 * 根据行程方案生成时间线
 */
export async function generateTimeline(this: PerceptionModule, userId: string, plan: ItineraryPlan): Promise<TimelineNode[]> {
  const timeline: TimelineNode[] = []

  // 遍历行程每一天
  plan.days.forEach((day, dayIndex) => {
    // 生成酒店节点
    if (day.hotel) {
      timeline.push({
        id: `node_${Date.now()}_hotel_${dayIndex}`,
        planId: plan.id,
        dayIndex,
        startTime: '12:00',
        endTime: '次日12:00',
        title: `入住：${day.hotel.name}`,
        description: `${day.hotel.starLevel}星级酒店，评分${day.hotel.rating}`,
        type: TimelineNodeType.HOTEL,
        status: TimelineNodeStatus.NOT_STARTED,
        address: day.hotel.address,
        relatedId: day.hotel.id,
        remindTime: 60 // 提前60分钟提醒入住
      })
    }

    // 生成行程项节点
    day.items.forEach((item, itemIndex) => {
      let nodeType: TimelineNodeType = TimelineNodeType.CUSTOM
      
      if (item.type === 'transport') {
        nodeType = TimelineNodeType.TRANSPORT
      } else if (item.type === 'attraction') {
        nodeType = TimelineNodeType.ATTRACTION
      } else if (item.type === 'meal') {
        nodeType = TimelineNodeType.MEAL
      }

      timeline.push({
        id: `node_${Date.now()}_${dayIndex}_${itemIndex}`,
        planId: plan.id,
        dayIndex,
        startTime: item.startTime,
        endTime: item.endTime,
        title: item.name,
        description: item.description,
        type: nodeType,
        status: TimelineNodeStatus.NOT_STARTED,
        address: item.address,
        relatedId: item.id,
        tags: item.tags,
        remindTime: 30 // 提前30分钟提醒
      })
    })
  })

  // 添加返程交通节点（如果有返程交通）
  if (plan.returnTransport) {
    timeline.push({
      id: `node_${Date.now()}_return`,
      planId: plan.id,
      dayIndex: plan.days.length - 1,
      startTime: plan.returnTransport.depTime,
      endTime: plan.returnTransport.arrTime,
      title: `返程：${plan.returnTransport.depCity} → ${plan.returnTransport.arrCity}`,
      description: `${plan.returnTransport.airline} ${plan.returnTransport.flightNo}`,
      type: TimelineNodeType.FLIGHT,
      status: TimelineNodeStatus.NOT_STARTED,
      relatedId: plan.returnTransport.id,
      remindTime: 120 // 提前2小时提醒登机
    })
  }

  // 按时间排序
  timeline.sort((a, b) => {
    if (a.dayIndex !== b.dayIndex) {
      return a.dayIndex - b.dayIndex
    }
    return a.startTime.localeCompare(b.startTime)
  })

  // 保存时间线
  planTimelines.set(plan.id, timeline)

  // 发布时间线更新事件（这里正确使用传入的userId参数
  await this.core?.eventBus.emit(GlobalEvent.TIMELINE_UPDATED, {
    userId,
    planId: plan.id,
    timeline
  })

  return timeline
}

/**
 * 获取行程时间线
 */
export async function getTimeline(this: PerceptionModule, params: {
  userId: string
  planId: string
}): Promise<TimelineNode[]> {
  const { planId } = params
  return planTimelines.get(planId) || []
}

/**
 * 更新时间线节点状态
 */
export async function updateNodeStatus(this: PerceptionModule, params: {
  userId: string
  planId: string
  nodeId: string
  status: TimelineNodeStatus
}): Promise<TimelineNode | null> {
  const { planId, nodeId, status, userId } = params

  const timeline = planTimelines.get(planId)
  if (!timeline) return null

  const node = timeline.find(n => n.id === nodeId)
  if (!node) return null

  node.status = status
  planTimelines.set(planId, timeline)

  // 发布时间线更新事件
  await this.core?.eventBus.emit(GlobalEvent.TIMELINE_UPDATED, {
    userId,
    planId,
    timeline
  })

  // 计算行程整体进度
  const completedCount = timeline.filter(n => n.status === TimelineNodeStatus.COMPLETED).length
  const progress = Math.round((completedCount / timeline.length) * 100)
  
  // 更新上下文进度
  const context = this.getContext(userId)
  if (context) {
    context.currentProgress = progress
    context.updatedAt = Date.now()
    this.setContext(userId, context)
  }

  return node
}

/**
 * 向时间线插入自定义节点
 */
export async function insertCustomNode(this: PerceptionModule, params: {
  userId: string
  planId: string
  node: Omit<TimelineNode, 'id' | 'planId' | 'status'>
}): Promise<TimelineNode> {
  const { planId, node, userId } = params

  const timeline = planTimelines.get(planId) || []

  const newNode: TimelineNode = {
    ...node,
    id: `node_${Date.now()}_custom`,
    planId,
    status: TimelineNodeStatus.NOT_STARTED
  }

  timeline.push(newNode)
  
  // 重新排序
  timeline.sort((a, b) => {
    if (a.dayIndex !== b.dayIndex) {
      return a.dayIndex - b.dayIndex
    }
    return a.startTime.localeCompare(b.startTime)
  })

  planTimelines.set(planId, timeline)

  // 发布时间线更新事件
  await this.core?.eventBus.emit(GlobalEvent.TIMELINE_UPDATED, {
    userId,
    planId,
    timeline
  })

  return newNode
}

/**
 * 自动更新时间线节点状态
 */
async function updateTimelineStatuses(this: PerceptionModule, userId: string): Promise<void> {
  const context = this.getContext(userId)
  if (!context) return

  const timeline = planTimelines.get(context.planId)
  if (!timeline) return

  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  let updated = false

  for (const node of timeline) {
    // 只处理当天节点
    if (node.dayIndex !== context.currentDayIndex) continue

    if (node.status === Status.NOT_STARTED && currentTime >= node.startTime) {
      // 到了开始时间，更新为进行中
      node.status = Status.IN_PROGRESS
      updated = true
    } else if (node.status === Status.IN_PROGRESS && currentTime >= node.endTime) {
      // 到了结束时间，更新为已完成
      node.status = Status.COMPLETED
      updated = true
    } else if (node.status === Status.NOT_STARTED && currentTime > node.startTime && currentTime < node.endTime) {
      // 开始时间已过但还没结束，标记为延迟
      node.status = Status.DELAYED
      updated = true
    }
  }

  if (updated) {
    // 保存更新后的时间线
    planTimelines.set(context.planId, timeline)

    // 计算行程进度
    const completedCount = timeline.filter(n => n.status === Status.COMPLETED).length
    const progress = Math.round((completedCount / timeline.length) * 100)
    
    // 更新上下文进度
    context.currentProgress = progress
    context.updatedAt = Date.now()
    this.setContext(userId, context)

    // 发布时间线更新事件
    await this.core?.eventBus.emit(GlobalEvent.TIMELINE_UPDATED, {
      userId,
      planId: context.planId,
      timeline
    })
  }
}

/**
 * 启动时间线状态自动更新调度器
 */
export async function startTimelineScheduler(this: PerceptionModule, userId: string): Promise<void> {
  stopTimelineScheduler(userId)

  // 每分钟更新一次时间线状态
  const timer = setInterval(async () => {
    await updateTimelineStatuses.call(this, userId)
  }, 60000)

  timelineUpdateTimers.set(userId, timer)
}

/**
 * 停止时间线状态自动更新调度器
 */
export function stopTimelineScheduler(userId: string): void {
  const timer = timelineUpdateTimers.get(userId)
  if (timer) {
    clearInterval(timer)
    timelineUpdateTimers.delete(userId)
  }
}
