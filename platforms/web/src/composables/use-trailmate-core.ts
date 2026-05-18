import { ref, type InjectionKey, type Ref } from 'vue'
import type { Core } from '@trailmate/core'
import type PerceptionModule from '@trailmate/perception'
import type { Notification, TimelineNode, LocationInfo } from '@trailmate/perception'
import type {
  CompanionProfile,
  CompanionFilters,
  UserProfile,
  MatchResult,
  TeamRequest
} from '@trailmate/companion-matching'

export const TRAILMATE_KEY: InjectionKey<UseTrailmateCoreReturn> = Symbol('trailmate')

export interface UseTrailmateCoreOptions {
  userId?: string
}

export interface Rule {
  id: string
  name: string
  description?: string
  condition: { type: string; params: Record<string, any> }
  action: { type: string; params: Record<string, any> }
  enabled: boolean
  priority: number
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
  getAllRules: () => Promise<Rule[]>
  addCustomRule: (rule: Rule) => Promise<void>
  removeCustomRule: (ruleId: string) => Promise<void>
  setRuleEnabled: (ruleId: string, enabled: boolean) => Promise<boolean>
  // Companion matching
  getCompanions: () => Promise<CompanionProfile[]>
  getCompanionById: (id: string) => Promise<CompanionProfile | undefined>
  calculateMatch: (companion: CompanionProfile, userProfile: UserProfile) => Promise<MatchResult>
  filterCompanions: (filters: CompanionFilters, userProfile: UserProfile) => Promise<MatchResult[]>
  createTeamRequest: (params: {
    fromUserId: string
    toUserId: string
    destination: string
    date: string
    message: string
    splitType: 'aa' | 'host' | 'custom'
  }) => Promise<TeamRequest>
  getTeamRequests: (userId: string) => Promise<TeamRequest[]>
  getPendingTeamRequests: (userId: string) => Promise<TeamRequest[]>
  updateTeamRequestStatus: (requestId: string, status: 'accepted' | 'rejected') => Promise<TeamRequest | undefined>
  queryFlights: (depCity: string, arrCity: string, date?: string) => Promise<any[]>
}

const DEMO_USER_ID = 'demo-user'
let initializedCore: Core | null = null
let initializedModule: PerceptionModule | null = null
let initPromise: Promise<void> | null = null

export function useTrailmateCore(options: UseTrailmateCoreOptions = {}): UseTrailmateCoreReturn {
  const userId = options.userId || DEMO_USER_ID
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const cleanup = () => {
    initializedCore = null
    initializedModule = null
    initPromise = null
    isInitialized.value = false
  }

  const initialize = async () => {
    if (initializedCore && initializedModule) {
      isInitialized.value = true
      return
    }

    // 防止竞态：多个调用者共享同一个初始化Promise
    if (initPromise) {
      await initPromise
      isInitialized.value = true
      return
    }

    isLoading.value = true
    error.value = null

    initPromise = (async () => {
      try {
        const { Core } = await import('@trailmate/core')
        const { default: PerceptionPlugin } = await import('@trailmate/perception')
        const { default: CompanionMatchingPlugin } = await import('@trailmate/companion-matching')
        const { default: MockAdapterPlugin } = await import('@trailmate/adapters/mock-adapter')

        const coreInstance = new Core()
        const perceptionModule = new PerceptionPlugin()
        const companionMatchingModule = new CompanionMatchingPlugin()
        const mockAdapterModule = new MockAdapterPlugin()

        await coreInstance.pluginManager.install(perceptionModule)
        await coreInstance.pluginManager.install(companionMatchingModule)
        await coreInstance.pluginManager.install(mockAdapterModule)
        await coreInstance.pluginManager.mount()

        initializedCore = coreInstance
        initializedModule = perceptionModule
        isInitialized.value = true
      } catch (err) {
        error.value = err instanceof Error ? err.message : '初始化失败'
        console.error('Trailmate Core初始化失败:', err)
        throw err
      } finally {
        isLoading.value = false
      }
    })()

    await initPromise
  }

  const getAllRules = async (): Promise<Rule[]> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<Rule[]>('perception.getAllRules')
  }

  const addCustomRule = async (rule: Rule): Promise<void> => {
    if (!initializedCore) throw new Error('Core未初始化')
    await initializedCore.service.call('perception.addCustomRule', rule)
  }

  const removeCustomRule = async (ruleId: string): Promise<void> => {
    if (!initializedCore) throw new Error('Core未初始化')
    await initializedCore.service.call('perception.removeCustomRule', ruleId)
  }

  const setRuleEnabled = async (ruleId: string, enabled: boolean): Promise<boolean> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<boolean>('perception.setRuleEnabled', {
      ruleId,
      enabled
    })
  }

  // ---- companion matching methods ----

  const getCompanions = async (): Promise<CompanionProfile[]> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<CompanionProfile[]>('companion.getCompanions')
  }

  const getCompanionById = async (id: string): Promise<CompanionProfile | undefined> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<CompanionProfile | undefined>('companion.getCompanionById', id)
  }

  const calculateMatch = async (companion: CompanionProfile, userProfile: UserProfile): Promise<MatchResult> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<MatchResult>('companion.calculateMatch', companion, userProfile)
  }

  const filterCompanions = async (filters: CompanionFilters, userProfile: UserProfile): Promise<MatchResult[]> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<MatchResult[]>('companion.filterCompanions', filters, userProfile)
  }

  const createTeamRequest = async (params: {
    fromUserId: string
    toUserId: string
    destination: string
    date: string
    message: string
    splitType: 'aa' | 'host' | 'custom'
  }): Promise<TeamRequest> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<TeamRequest>('companion.createTeamRequest', params)
  }

  const getTeamRequests = async (userId: string): Promise<TeamRequest[]> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<TeamRequest[]>('companion.getTeamRequests', userId)
  }

  const getPendingTeamRequests = async (userId: string): Promise<TeamRequest[]> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<TeamRequest[]>('companion.getPendingTeamRequests', userId)
  }

  const updateTeamRequestStatus = async (requestId: string, status: 'accepted' | 'rejected'): Promise<TeamRequest | undefined> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<TeamRequest | undefined>('companion.updateTeamRequestStatus', requestId, status)
  }

  const queryFlights = async (depCity: string, arrCity: string, date?: string): Promise<any[]> => {
    if (!initializedCore) throw new Error('Core未初始化')
    return await initializedCore.service.call<any[]>('flight.query', { depCity, arrCity, date })
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
    stopRealLocationWatcher,
    getAllRules,
    addCustomRule,
    removeCustomRule,
    setRuleEnabled,
    getCompanions,
    getCompanionById,
    calculateMatch,
    filterCompanions,
    createTeamRequest,
    getTeamRequests,
    getPendingTeamRequests,
    updateTeamRequestStatus,
    queryFlights
  }
}

export async function initializeTrailmate(): Promise<{
  core: Core
  module: PerceptionModule
}> {
  const { Core } = await import('@trailmate/core')
  const { default: PerceptionPlugin } = await import('@trailmate/perception')
  const { default: CompanionMatchingPlugin } = await import('@trailmate/companion-matching')
  const { default: MockAdapterPlugin } = await import('@trailmate/adapters/mock-adapter')

  const coreInstance = new Core()
  const perceptionModule = new PerceptionPlugin()
  const companionMatchingModule = new CompanionMatchingPlugin()
  const mockAdapterModule = new MockAdapterPlugin()

  await coreInstance.pluginManager.install(perceptionModule)
  await coreInstance.pluginManager.install(companionMatchingModule)
  await coreInstance.pluginManager.install(mockAdapterModule)
  await coreInstance.pluginManager.mount()

  return {
    core: coreInstance,
    module: perceptionModule
  }
}