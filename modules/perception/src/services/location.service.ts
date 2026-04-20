import { GlobalEvent } from '../../../../core'
import type PerceptionModule from '../../index'
import type { LocationInfo } from '../types'

const userLocations = new Map<string, LocationInfo>()
const autoSimulateTimers = new Map<string, ReturnType<typeof setInterval>>()

export async function simulateLocation(
  this: PerceptionModule,
  params: {
    userId: string
    latitude: number
    longitude: number
    city: string
    address: string
    accuracy?: number
    travelMode?: 'walking' | 'driving' | 'public_transport'
  }
): Promise<LocationInfo> {
  const location: LocationInfo = {
    id: `location_${Date.now()}`,
    userId: params.userId,
    latitude: params.latitude,
    longitude: params.longitude,
    city: params.city,
    address: params.address,
    accuracy: params.accuracy ?? 10,
    travelMode: params.travelMode ?? 'driving',
    updateTime: Date.now()
  }

  userLocations.set(params.userId, location)
  await this.core?.eventBus.emit(GlobalEvent.LOCATION_CHANGED, location)
  return location
}

export async function getCurrentLocation(
  this: PerceptionModule,
  userId: string
): Promise<LocationInfo | null> {
  return userLocations.get(userId) ?? null
}

export async function toggleAutoSimulate(
  this: PerceptionModule,
  params: { userId: string; enabled: boolean }
): Promise<boolean> {
  if (!params.enabled) {
    stopAutoSimulation(params.userId)
    return true
  }

  const currentLocation = userLocations.get(params.userId)
  if (!currentLocation) {
    throw new Error('Set a starting location before enabling auto simulation')
  }

  stopAutoSimulation(params.userId)
  const timer = setInterval(async () => {
    await simulateLocation.call(this, {
      ...currentLocation,
      latitude: currentLocation.latitude + 0.001,
      longitude: currentLocation.longitude + 0.001
    })
  }, 15000)

  autoSimulateTimers.set(params.userId, timer)
  return true
}

export function stopAutoSimulation(userId: string): void {
  const timer = autoSimulateTimers.get(userId)
  if (timer) {
    clearInterval(timer)
    autoSimulateTimers.delete(userId)
  }
}
