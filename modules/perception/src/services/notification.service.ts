import { GlobalEvent } from '../../../../core'
import type PerceptionModule from '../../index'
import type { Notification, NotificationLevel } from '../types'

const userNotifications = new Map<string, Notification[]>()

// ============================================================
// localStorage persistence helpers
// ============================================================
const STORAGE_KEY_PREFIX = 'trailmate-notifications-'

function loadFromStorage(userId: string): Notification[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`)
    if (!raw) return []
    return JSON.parse(raw) as Notification[]
  } catch {
    // localStorage unavailable (SSR/Node) or corrupted data — graceful fallback
    return []
  }
}

function saveToStorage(userId: string, notifications: Notification[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(notifications))
  } catch {
    // localStorage unavailable or quota exceeded — silent fail
  }
}

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
  saveToStorage(params.userId, nextNotifications)
  this.core?.state.set(`perception.notifications.${params.userId}`, nextNotifications)
  await this.core?.eventBus.emit(GlobalEvent.NOTIFICATION_PUSHED, notification)

  return notification
}

export async function getNotifications(
  this: PerceptionModule,
  params: { userId: string; planId?: string; unreadOnly?: boolean }
): Promise<Notification[]> {
  let notifications = userNotifications.get(params.userId)

  // Hydrate from localStorage if in-memory Map is empty for this user
  if (!notifications) {
    notifications = loadFromStorage(params.userId)
    if (notifications.length > 0) {
      userNotifications.set(params.userId, notifications)
    }
  }

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
  saveToStorage(params.userId, notifications)
  this.core?.state.set(`perception.notifications.${params.userId}`, notifications)
  await this.core?.eventBus.emit(GlobalEvent.NOTIFICATION_UPDATED, notification)

  return true
}
