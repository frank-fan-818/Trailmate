import { inject, type InjectionKey } from 'vue'
import { Core, type ICore } from '@trailmate/core'
import MockAdapterModule from '../../../../adapters/mock-adapter'
import SupabaseAdapterModule from '../../../../adapters/supabase-adapter'
import PerceptionModule from '../../../../modules/perception'
import type {
  Notification,
  TimelineNode
} from '../../../../modules/perception/src/types'
import ItineraryGeneratorModule from '../../../../modules/trip-tools/itinerary-generator'
import type {
  ItineraryPlan,
  ItineraryRequest
} from '../../../../modules/trip-tools/itinerary-generator/src/types'

interface PlannerSettingsSummary {
  budget?: [number, number]
  travelTypes?: string[]
  transports?: string[]
  accommodations?: string[]
  language?: string
}

interface GenerateItineraryInput {
  userId: string
  content: string
  settings?: PlannerSettingsSummary
}

export interface TrailmateServices {
  core: ICore
  generateItinerary: (input: GenerateItineraryInput) => Promise<ItineraryPlan[]>
  getTimeline: (params: { userId: string; planId: string }) => Promise<TimelineNode[]>
  getNotifications: (params: {
    userId: string
    planId?: string
    unreadOnly?: boolean
  }) => Promise<Notification[]>
  simulateLocation: (params: {
    userId: string
    latitude: number
    longitude: number
    city: string
    address: string
    travelMode?: 'walking' | 'driving' | 'public_transport'
  }) => Promise<void>
  markNotificationAsRead: (params: {
    userId: string
    notificationId: string
  }) => Promise<boolean>
}

export const TRAILMATE_KEY: InjectionKey<TrailmateServices> = Symbol('trailmate-services')

let servicesPromise: Promise<TrailmateServices> | null = null

export async function initializeTrailmate(): Promise<TrailmateServices> {
  if (!servicesPromise) {
    servicesPromise = createTrailmateServices()
  }

  return servicesPromise
}

export function useTrailmateCore(): TrailmateServices {
  const services = inject(TRAILMATE_KEY)
  if (!services) {
    throw new Error('Trailmate services were not provided at app bootstrap.')
  }

  return services
}

async function createTrailmateServices(): Promise<TrailmateServices> {
  const core = new Core({
    NODE_ENV: normalizeNodeEnv(import.meta.env.VITE_NODE_ENV),
    USE_MOCK: toBoolean(import.meta.env.VITE_USE_MOCK, true),
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL ?? '/api',
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
  })

  registerDemoSecurityServices(core)

  await core.pluginManager.install(new MockAdapterModule())

  if (!core.config.get('USE_MOCK', true) && hasSupabaseConfig(core)) {
    try {
      await core.pluginManager.install(new SupabaseAdapterModule())
    } catch (error) {
      console.warn('[trailmate] supabase adapter failed, continuing with mock adapter', error)
    }
  }

  await core.pluginManager.install(new ItineraryGeneratorModule())
  await core.pluginManager.install(new PerceptionModule())
  await core.start()

  return {
    core,
    generateItinerary: async (input) => {
      const request: ItineraryRequest = {
        id: `request_${Date.now()}`,
        userId: input.userId,
        content: buildRequestContent(input.content, input.settings),
        createTime: Date.now()
      }

      return core.service.call<ItineraryPlan[]>('itinerary.generate', request)
    },
    getTimeline: async (params) => {
      return core.service.call<TimelineNode[]>('perception.getTimeline', params)
    },
    getNotifications: async (params) => {
      return core.service.call<Notification[]>('perception.getNotifications', params)
    },
    simulateLocation: async (params) => {
      await core.service.call('perception.simulateLocation', params)
    },
    markNotificationAsRead: async (params) => {
      return core.service.call<boolean>('perception.markNotificationAsRead', params)
    }
  }
}

function registerDemoSecurityServices(core: Core): void {
  core.service.register('user.realname.isVerified', async () => true)
  core.service.register('user.permission.check', async () => true)
}

function buildRequestContent(content: string, settings?: PlannerSettingsSummary): string {
  if (!settings) {
    return content
  }

  const lines = [
    content.trim(),
    settings.budget ? `Budget: ${settings.budget[0]}-${settings.budget[1]}` : '',
    settings.travelTypes?.length ? `Travel style: ${settings.travelTypes.join(', ')}` : '',
    settings.transports?.length ? `Transport: ${settings.transports.join(', ')}` : '',
    settings.accommodations?.length ? `Accommodation: ${settings.accommodations.join(', ')}` : '',
    settings.language ? `Language: ${settings.language}` : ''
  ].filter(Boolean)

  return lines.join('\n')
}

function hasSupabaseConfig(core: Core): boolean {
  return Boolean(core.config.get('SUPABASE_URL') && core.config.get('SUPABASE_ANON_KEY'))
}

function normalizeNodeEnv(value: string | undefined): 'development' | 'demo' | 'production' {
  if (value === 'demo' || value === 'production') {
    return value
  }

  return 'development'
}

function toBoolean(value: string | boolean | undefined, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value
  }

  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return fallback
}
