import { ref, onUnmounted, type InjectionKey, type Ref } from 'vue'
import type { Core } from '@trailmate/core'
import type PerceptionModule from '@trailmate/perception'
import type { Notification, TimelineNode, LocationInfo } from '@trailmate/perception'

export const TRAILMATE_KEY: InjectionKey<UseTrailmateCoreReturn> = Symbol('trailmate')

export interface UseTrailmateCoreOptions {
  userId?: string
}

export interface UseTrailmateCoreReturn {
  isInitialized: Ref<boolean>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  initialize: () => Promise<void>
  cleanup: () => void
  getNotifications: (params?: { planId?: string; unreadOnly?: boolean }) => Promise<Notification[]>
  markNotificationAsRead: (notificationId: string) => Promise<boolean>
  getTimeline: (planId: string) => Promise<TimelineNode[]>
  updateNodeStatus: (params: { planId: string; nodeId: string; status: string }) => Promise<boolean>
  simulateLocation: (params: {
    latitude: number
    longitude: number
    city: string
    address: string
    travelMode?: 'walking' | 'driving' | 'public_transport'
  }) => Promise<LocationInfo>
  getCurrentLocation: () => Promise<LocationInfo | null>
  toggleAutoSimulate: (enabled: boolean, speed?: number) => Promise<boolean>
  getRealLocation: () => Promise<LocationInfo | null>
  startRealLocationWatcher: (onUpdate: (loc: LocationInfo) => void) => Promise<() => void>
  stopRealLocationWatcher: () => Promise<void>
}

const DEMO_USER_ID = 'demo-user'
let initializedCore: Core | null = null
let initializedModule: PerceptionModule | null = null

export function useTrailmateCore(options: UseTrailmateCoreOptions = {}): UseTrailmateCoreReturn {
  const userId = options.userId || DEMO_USER_ID
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const cleanup = () => {
    initializedCore = null
    initializedModule = null
    isInitialized.value = false
  }

  const initialize = async () => {
    if (initializedCore && initializedModule) {
      isInitialized.value = true
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const { Core } = await import('@trailmate/core')
      const { default: PerceptionPlugin } = await import('@trailmate/perception')

      const coreInstance = new Core()
      const perceptionModule = new PerceptionPlugin()

      await coreInstance.pluginManager.install(perceptionModule)
      await coreInstance.pluginManager.mount()

      initializedCore = coreInstance
      initializedModule = perceptionModule
      isInitialized.value = true
    } catch (err) {
      error.value = err instanceof Error ? err.message : '初始化失败'
      console.error('Trailmate Core初始化失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  const getNotifications = async (params?: {
    planId?: string
    unreadOnly?: boolean
  }): Promise<Notification[]> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<Notification[]>('perception.getNotifications', {
      userId,
      ...params
    })
  }

  const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<boolean>('perception.markNotificationAsRead', {
      userId,
      notificationId
    })
  }

  const getTimeline = async (planId: string): Promise<TimelineNode[]> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<TimelineNode[]>('perception.getTimeline', {
      userId,
      planId
    })
  }

  const updateNodeStatus = async (params: {
    planId: string
    nodeId: string
    status: string
  }): Promise<boolean> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<boolean>('perception.updateNodeStatus', {
      userId,
      ...params
    })
  }

  const simulateLocation = async (params: {
    latitude: number
    longitude: number
    city: string
    address: string
    travelMode?: 'walking' | 'driving' | 'public_transport'
  }): Promise<LocationInfo> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<LocationInfo>('perception.simulateLocation', {
      userId,
      ...params
    })
  }

  const getCurrentLocation = async (): Promise<LocationInfo | null> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<LocationInfo | null>('perception.getCurrentLocation', userId)
  }

  const toggleAutoSimulate = async (enabled: boolean, speed?: number): Promise<boolean> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<boolean>('perception.toggleAutoSimulate', {
      userId,
      enabled,
      speed
    })
  }

  const getRealLocation = async (): Promise<LocationInfo | null> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<LocationInfo | null>('perception.getRealLocation', userId)
  }

  const startRealLocationWatcher = async (onUpdate: (loc: LocationInfo) => void): Promise<() => void> => {
    if (!initializedCore) {
      console.warn('Core未初始化')
      return () => { }
    }
    const stopFn = await initializedCore.service.call<() => void>('perception.startRealLocationWatcher', userId, onUpdate)
    return stopFn || (() => { })
  }

  const stopRealLocationWatcher = async (): Promise<void> => {
    if (!initializedCore) {
      console.warn('Core未初始化')
      return
    }
    await initializedCore.service.call('perception.stopRealLocationWatcher', userId)
  }

  onUnmounted(() => {
  })

  return {
    isInitialized,
    isLoading,
    error,
    initialize,
    cleanup,
    getNotifications,
    markNotificationAsRead,
    getTimeline,
    updateNodeStatus,
    simulateLocation,
    getCurrentLocation,
    toggleAutoSimulate,
    getRealLocation,
    startRealLocationWatcher,
    stopRealLocationWatcher
  }
}

export async function initializeTrailmate(): Promise<{
  core: Core
  module: PerceptionModule
}> {
  const { Core } = await import('@trailmate/core')
  const { default: PerceptionPlugin } = await import('@trailmate/perception')

  const coreInstance = new Core()
  const perceptionModule = new PerceptionPlugin()

  await coreInstance.pluginManager.install(perceptionModule)
  await coreInstance.pluginManager.mount()

  return {
    core: coreInstance,
    module: perceptionModule
  }
}