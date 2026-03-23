/**
 * 位置信息类型
 */
export interface LocationInfo {
  id: string
  userId: string
  latitude: number
  longitude: number
  city: string
  address: string
  accuracy: number // 定位精度，单位米
  travelMode: 'walking' | 'driving' | 'public_transport'
  updateTime: number
}

/**
 * 时间线节点状态枚举
 */
export enum TimelineNodeStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled'
}

/**
 * 时间线节点类型枚举
 */
export enum TimelineNodeType {
  FLIGHT = 'flight',
  HOTEL = 'hotel',
  ATTRACTION = 'attraction',
  MEAL = 'meal',
  TRANSPORT = 'transport',
  NOTIFICATION = 'notification',
  CUSTOM = 'custom'
}

/**
 * 时间线节点类型
 */
export interface TimelineNode {
  id: string
  planId: string
  dayIndex: number
  startTime: string
  endTime: string
  title: string
  description?: string
  type: TimelineNodeType
  status: TimelineNodeStatus
  address?: string
  relatedId?: string // 关联的航班/酒店/景点ID
  tags?: string[]
  remindTime?: number // 提醒时间，提前多少分钟
}

/**
 * 通知等级枚举
 */
export enum NotificationLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  URGENT = 'urgent'
}

/**
 * 通知消息类型
 */
export interface Notification {
  id: string
  userId: string
  planId?: string
  content: string
  level: NotificationLevel
  triggerTime: number
  isRead: boolean
  relatedNodeId?: string
  actionUrl?: string
}

/**
 * 情境感知上下文类型
 */
export interface PerceptionContext {
  id: string
  userId: string
  planId: string
  currentLocation?: LocationInfo
  currentDayIndex: number
  currentProgress: number // 行程完成进度0-100
  travelMode: 'walking' | 'driving' | 'public_transport'
  isAutoSimulate: boolean
  createdAt: number
  updatedAt: number
}

/**
 * 规则触发条件类型
 */
export interface RuleCondition {
  type: 'time' | 'location' | 'weather' | 'event'
  params: Record<string, any>
}

/**
 * 规则执行动作类型
 */
export interface RuleAction {
  type: 'push_notification' | 'update_timeline' | 'adjust_plan'
  params: Record<string, any>
}

/**
 * 规则类型
 */
export interface Rule {
  id: string
  name: string
  description?: string
  condition: RuleCondition
  action: RuleAction
  enabled: boolean
  priority: number
}
