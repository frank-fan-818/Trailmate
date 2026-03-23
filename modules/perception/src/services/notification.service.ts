import type PerceptionModule from '../../index'
import { GlobalEvent } from '@trailmate/core'
import type { Notification, NotificationLevel } from '../types'

// 存储用户通知：userId -> Notification[]
const userNotifications = new Map<string, Notification[]>()

/**
 * 推送通知
 */
export async function pushNotification(this: PerceptionModule, params: {
  userId: string
  planId?: string
  content: string
  level: NotificationLevel
  relatedNodeId?: string
  actionUrl?: string
}): Promise<Notification> {
  const { userId, planId, content, level, relatedNodeId, actionUrl } = params

  const notification: Notification = {
    id: `notify_${Date.now()}`,
    userId,
    planId,
    content,
    level,
    triggerTime: Date.now(),
    isRead: false,
    relatedNodeId,
    actionUrl
  }

  // 保存通知
  const notifications = userNotifications.get(userId) || []
  notifications.unshift(notification) // 最新通知放最前面
  userNotifications.set(userId, notifications)

  // 发布通知推送事件
  await this.core?.eventBus.emit(GlobalEvent.NOTIFICATION_PUSHED, notification)

  console.log(`🔔 用户${userId}收到通知：${content}`)

  return notification
}

/**
 * 获取用户通知列表
 */
export async function getNotifications(this: PerceptionModule, params: {
  userId: string
  planId?: string
  unreadOnly?: boolean
}): Promise<Notification[]> {
  const { userId, planId, unreadOnly = false } = params
  let notifications = userNotifications.get(userId) || []

  // 按行程过滤
  if (planId) {
    notifications = notifications.filter(n => n.planId === planId)
  }

  // 仅未读过滤
  if (unreadOnly) {
    notifications = notifications.filter(n => !n.isRead)
  }

  return notifications
}

/**
 * 标记通知为已读
 */
export async function markNotificationAsRead(this: PerceptionModule, params: {
  userId: string
  notificationId: string
}): Promise<boolean> {
  const { userId, notificationId } = params

  const notifications = userNotifications.get(userId)
  if (!notifications) return false

  const notification = notifications.find(n => n.id === notificationId)
  if (!notification) return false

  notification.isRead = true
  userNotifications.set(userId, notifications)

  // 发布通知更新事件
  await this.core?.eventBus.emit(GlobalEvent.NOTIFICATION_UPDATED, notification)

  return true
}

/**
 * 标记所有通知为已读
 */
export async function markAllAsRead(this: PerceptionModule, userId: string): Promise<number> {
  const notifications = userNotifications.get(userId) || []
  const unreadCount = notifications.filter(n => !n.isRead).length

  notifications.forEach(n => {
    n.isRead = true
  })

  userNotifications.set(userId, notifications)

  // 发布通知更新事件
  await this.core?.eventBus.emit('NOTIFICATION_BATCH_UPDATED', {
    userId,
    count: unreadCount
  })

  return unreadCount
}

/**
 * 删除通知
 */
export async function deleteNotification(this: PerceptionModule, params: {
  userId: string
  notificationId: string
}): Promise<boolean> {
  const { userId, notificationId } = params

  const notifications = userNotifications.get(userId)
  if (!notifications) return false

  const index = notifications.findIndex(n => n.id === notificationId)
  if (index === -1) return false

  notifications.splice(index, 1)
  userNotifications.set(userId, notifications)

  return true
}
