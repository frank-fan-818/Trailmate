import type PerceptionModule from '../../index'
import type { LocationInfo } from '../types'
import { GlobalEvent } from '@trailmate/core'

const userLocations = new Map<string, LocationInfo>()
const autoSimulateTimers = new Map<string, ReturnType<typeof setInterval>>()

/**
 * 手动设置用户位置
 */
export async function simulateLocation(this: PerceptionModule, params: {
  userId: string
  latitude: number
  longitude: number
  city: string
  address: string
  accuracy?: number
  travelMode?: 'walking' | 'driving' | 'public_transport'
}): Promise<LocationInfo> {
  const { userId, latitude, longitude, city, address, accuracy = 10, travelMode = 'driving' } = params

  const location: LocationInfo = {
    id: `loc_${Date.now()}`,
    userId,
    latitude,
    longitude,
    city,
    address,
    accuracy,
    travelMode,
    updateTime: Date.now()
  }

  userLocations.set(userId, location)

  // 更新上下文
  const context = this.getContext(userId)
  if (context) {
    context.currentLocation = location
    context.travelMode = travelMode
    context.updatedAt = Date.now()
    this.setContext(userId, context)
  }

  // 发布位置变更事件
  await this.core?.eventBus.emit(GlobalEvent.LOCATION_CHANGED, location)

  return location
}

/**
 * 获取用户当前位置
 */
export async function getCurrentLocation(this: PerceptionModule, userId: string): Promise<LocationInfo | null> {
  return userLocations.get(userId) || null
}

/**
 * 开启/关闭自动位置模拟
 */
export async function toggleAutoSimulate(this: PerceptionModule, params: {
  userId: string
  enabled: boolean
  speed?: number // 模拟移动速度，单位km/h
}): Promise<boolean> {
  const { userId, enabled, speed = 60 } = params

  if (!enabled) {
    // 停止自动模拟
    const timer = autoSimulateTimers.get(userId)
    if (timer) {
      clearInterval(timer)
      autoSimulateTimers.delete(userId)
    }

    const context = this.getContext(userId)
    if (context) {
      context.isAutoSimulate = false
      this.setContext(userId, context)
    }

    return true
  }

  // 开启自动模拟
  const context = this.getContext(userId)
  if (!context?.currentLocation) {
    throw new Error('请先设置初始位置')
  }

  // 停止现有定时器
  const existingTimer = autoSimulateTimers.get(userId)
  if (existingTimer) {
    clearInterval(existingTimer)
  }

  // 更新上下文状态
  context.isAutoSimulate = true
  this.setContext(userId, context)

  // 简单模拟：每10秒更新一次位置，模拟位置移动
  const timer = setInterval(async () => {
    const currentLocation = userLocations.get(userId)
    if (!currentLocation) return

    // 模拟微小的位置偏移
    const newLocation: LocationInfo = {
      ...currentLocation,
      id: `loc_${Date.now()}`,
      latitude: currentLocation.latitude + (Math.random() - 0.5) * 0.001,
      longitude: currentLocation.longitude + (Math.random() - 0.5) * 0.001,
      updateTime: Date.now()
    }

    userLocations.set(userId, newLocation)

    // 更新上下文
    const context = this.getContext(userId)
    if (context) {
      context.currentLocation = newLocation
      context.updatedAt = Date.now()
      this.setContext(userId, context)
    }

    // 发布位置变更事件
    await this.core?.eventBus.emit(GlobalEvent.LOCATION_CHANGED, newLocation)
  }, 10000)

  autoSimulateTimers.set(userId, timer)

  return true
}
