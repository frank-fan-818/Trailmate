import { GlobalEvent } from '../../../../core'
import type PerceptionModule from '../../index'
import type { Notification, NotificationLevel } from '../types'

const userNotifications = new Map<string, Notification[]>()

export async function pushNotification(
  this: PerceptionModule,
  params: {
    userId: string
    planId?: string
    content: string
    level: NotificationLevel | `${NotificationLevel}`
    relatedNodeId?: string
    actionUrl?: string
  }
): Promise<Notification> {
  const notification: Notification = {
    id: `notification_${Date.now()}`,
    userId: params.userId,
    planId: params.planId,
    content: params.content,
    level: params.level as NotificationLevel,
    triggerTime: Date.now(),
    isRead: false,
    relatedNodeId: params.relatedNodeId,
    actionUrl: params.actionUrl
  }

  const nextNotifications = [notification, ...(userNotifications.get(params.userId) ?? [])]
  userNotifications.set(params.userId, nextNotifications)
  this.core?.state.set(`perception.notifications.${params.userId}`, nextNotifications)
  await this.core?.eventBus.emit(GlobalEvent.NOTIFICATION_PUSHED, notification)

  return notification
}

export async function getNotifications(
  this: PerceptionModule,
  params: { userId: string; planId?: string; unreadOnly?: boolean }
): Promise<Notification[]> {
  let notifications = userNotifications.get(params.userId) ?? []

  if (params.planId) {
    notifications = notifications.filter((notification) => notification.planId === params.planId)
  }

  if (params.unreadOnly) {
    notifications = notifications.filter((notification) => !notification.isRead)
  }

  return notifications
}

export async function markNotificationAsRead(
  this: PerceptionModule,
  params: { userId: string; notificationId: string }
): Promise<boolean> {
  const notifications = userNotifications.get(params.userId) ?? []
  const notification = notifications.find((entry) => entry.id === params.notificationId)

  if (!notification) {
    return false
  }

  notification.isRead = true
  this.core?.state.set(`perception.notifications.${params.userId}`, notifications)
  await this.core?.eventBus.emit(GlobalEvent.NOTIFICATION_UPDATED, notification)

  return true
}
