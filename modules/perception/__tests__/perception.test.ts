import { describe, expect, test } from 'vitest'
import { Core } from '../../../core'
import MockAdapterModule from '../../../adapters/mock-adapter'
import PerceptionModule from '../index'
import ItineraryGeneratorModule from '../../trip-tools/itinerary-generator'
import { mapItineraryItemTypeToTimelineType } from '../src/services/timeline.service'
import { TimelineNodeType } from '../src/types'

describe('perception integration', () => {
  test('creates timeline and notifications after itinerary generation', async () => {
    const core = new Core({
      NODE_ENV: 'development',
      USE_MOCK: true,
      API_BASE_URL: '/api'
    })

    core.service.register('user.realname.isVerified', async () => true)
    core.service.register('user.permission.check', async () => true)

    await core.pluginManager.install(new MockAdapterModule())
    await core.pluginManager.install(new ItineraryGeneratorModule())
    await core.pluginManager.install(new PerceptionModule())
    await core.start()

    const plans = await core.service.call<any[]>('itinerary.generate', {
      id: 'integration-request',
      userId: 'demo-user',
      content: 'Plan a Qingdao trip',
      createTime: Date.now()
    })

    const timeline = await core.service.call<any[]>('perception.getTimeline', {
      userId: 'demo-user',
      planId: plans[0].id
    })
    const notifications = await core.service.call<any[]>('perception.getNotifications', {
      userId: 'demo-user',
      planId: plans[0].id
    })

    expect(plans.length).toBeGreaterThan(0)
    expect(timeline.length).toBeGreaterThan(0)
    expect(notifications.length).toBeGreaterThan(0)
    expect(core.state.get('current.plans')).toEqual(plans)
  })

  test('maps itinerary item types into timeline types', () => {
    expect(mapItineraryItemTypeToTimelineType('transport')).toBe(TimelineNodeType.TRANSPORT)
    expect(mapItineraryItemTypeToTimelineType('meal')).toBe(TimelineNodeType.MEAL)
    expect(mapItineraryItemTypeToTimelineType('flight')).toBe(TimelineNodeType.FLIGHT)
  })
})
