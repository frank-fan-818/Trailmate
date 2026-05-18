export interface LocationInfo {
  id: string
  userId: string
  latitude: number
  longitude: number
  city: string
  address: string
  accuracy: number
  travelMode: 'walking' | 'driving' | 'public_transport'
  updateTime: number
}

export enum TimelineNodeStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DELAYED = 'delayed',
  CANCELLED = 'cancelled'
}

export enum TimelineNodeType {
  FLIGHT = 'flight',
  HOTEL = 'hotel',
  ATTRACTION = 'attraction',
  MEAL = 'meal',
  TRANSPORT = 'transport',
  NOTIFICATION = 'notification',
  CUSTOM = 'custom'
}

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
  relatedId?: string
  tags?: string[]
  remindTime?: number
  latitude?: number
  longitude?: number
}

export enum NotificationLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  URGENT = 'urgent'
}

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

export interface PerceptionContext {
  id: string
  userId: string
  planId: string
  currentLocation?: LocationInfo
  currentDayIndex: number
  currentProgress: number
  travelMode: 'walking' | 'driving' | 'public_transport'
  isAutoSimulate: boolean
  createdAt: number
  updatedAt: number
}

export interface RuleCondition {
  type: 'time' | 'location' | 'weather' | 'event' | 'congestion' | 'closure'
  params: Record<string, any>
}

export interface RuleAction {
  type: 'push_notification' | 'update_timeline' | 'adjust_plan'
  params: Record<string, any>
}

export interface Rule {
  id: string
  name: string
  description?: string
  condition: RuleCondition
  action: RuleAction
  enabled: boolean
  priority: number
}
