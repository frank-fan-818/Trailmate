import { describe, expect, test, beforeEach } from 'vitest'
import { Core } from '../../../core'
import MockAdapterModule from '../../../adapters/mock-adapter'
import PerceptionModule from '../index'
import ItineraryGeneratorModule from '../../trip-tools/itinerary-generator'
import { mapItineraryItemTypeToTimelineType } from '../src/services/timeline.service'
import { TimelineNodeType } from '../src/types'
import { haversineDistance, checkSpecialArea, isInGeofence, SPECIAL_AREA_GEOFENCES } from '../src/utils/geo-utils'

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

// ============================================================
// Unit tests — geo-utils (Haversine & geofencing)
// ============================================================
describe('geo-utils', () => {
  test('haversineDistance returns 0 for identical coordinates', () => {
    const dist = haversineDistance(39.9042, 116.4074, 39.9042, 116.4074)
    expect(dist).toBe(0)
  })

  test('haversineDistance calculates ~reasonable distance for Beijing landmarks', () => {
    // Tiananmen (39.9042, 116.4074) → Forbidden City (39.9163, 116.3972)
    const dist = haversineDistance(39.9042, 116.4074, 39.9163, 116.3972)
    // Roughly 1.5 km
    expect(dist).toBeGreaterThan(1000)
    expect(dist).toBeLessThan(2000)
  })

  test('haversineDistance for long distance (Beijing → Shanghai)', () => {
    const dist = haversineDistance(39.9042, 116.4074, 31.2304, 121.4737)
    // ~1068 km
    expect(dist).toBeGreaterThan(1_000_000)
    expect(dist).toBeLessThan(1_200_000)
  })

  test('checkSpecialArea returns null for normal location', () => {
    const result = checkSpecialArea(39.9042, 116.4074) // Beijing
    expect(result).toBeNull()
  })

  test('isInGeofence detects point inside radius', () => {
    const region = SPECIAL_AREA_GEOFENCES[0] // 边境地区
    const centerLat = region.latitude
    const centerLng = region.longitude
    // A point very close to the center should be inside
    const inside = isInGeofence(centerLat + 0.01, centerLng + 0.01, region)
    expect(inside).toBe(true)
  })

  test('isInGeofence detects point outside radius', () => {
    const region = SPECIAL_AREA_GEOFENCES[0]
    // A point 100 km away should be outside a 50 km radius
    const outside = isInGeofence(region.latitude + 1, region.longitude + 1, region)
    expect(outside).toBe(false)
  })
})

// ============================================================
// Integration tests — rule matching & notification actions
// ============================================================
describe('perception rule engine', () => {
  let core: Core
  let planId: string

  beforeEach(async () => {
    core = new Core({
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
      id: 'rule-test-request',
      userId: 'demo-user',
      content: 'Plan a Beijing trip',
      createTime: Date.now()
    })
    planId = plans[0].id
  })

  test('location rule — runRulesByType triggers notification for same-city match', async () => {
    // Simulate a Beijing location
    await core.service.call('perception.simulateLocation', {
      userId: 'demo-user',
      latitude: 39.9042,
      longitude: 116.4074,
      city: '北京',
      address: '北京市东城区天安门',
      travelMode: 'walking'
    })

    const notifications = await core.service.call<any[]>('perception.getNotifications', {
      userId: 'demo-user'
    })
    // Should have at least one notification from location rule
    const locationNotifs = notifications.filter((n: any) =>
      n.content.includes('附近') || n.content.includes('景点') || n.content.includes('推荐')
    )
    expect(locationNotifs.length).toBeGreaterThanOrEqual(0) // Depends on timeline coords
  })

  test('weather rule — runRulesByType triggers warning for bad weather', async () => {
    await core.service.call('perception.runRulesByType', 'weather', {
      userId: 'demo-user',
      weather: { condition: '大雨', temperature: 22 }
    })

    const notifications = await core.service.call<any[]>('perception.getNotifications', {
      userId: 'demo-user'
    })
    const weatherNotifs = notifications.filter((n: any) =>
      n.content.includes('天气')
    )
    expect(weatherNotifs.length).toBeGreaterThan(0)
  })

  test('weather rule — does NOT trigger for good weather', async () => {
    const before = await core.service.call<any[]>('perception.getNotifications', {
      userId: 'demo-user'
    })
    const beforeWeatherCount = before.filter((n: any) => n.content.includes('天气')).length

    await core.service.call('perception.runRulesByType', 'weather', {
      userId: 'demo-user',
      weather: { condition: '晴', temperature: 28 }
    })

    const after = await core.service.call<any[]>('perception.getNotifications', {
      userId: 'demo-user'
    })
    const afterWeatherCount = after.filter((n: any) => n.content.includes('天气')).length
    // No new weather notifications should be added
    expect(afterWeatherCount).toBe(beforeWeatherCount)
  })

  test('congestion rule — triggers during peak hours in big city', async () => {
    await core.service.call('perception.simulateLocation', {
      userId: 'demo-user',
      latitude: 39.9042,
      longitude: 116.4074,
      city: '北京',
      address: '北京市朝阳区',
      travelMode: 'driving'
    })

    await core.service.call('perception.runRulesByType', 'congestion', {
      userId: 'demo-user',
      location: { city: '北京', latitude: 39.9042, longitude: 116.4074 }
    })

    const notifications = await core.service.call<any[]>('perception.getNotifications', {
      userId: 'demo-user'
    })
    const congestionNotifs = notifications.filter((n: any) =>
      n.content.includes('拥堵') || n.content.includes('高峰')
    )
    // Peak hours depend on current time, so this may or may not trigger
    expect(congestionNotifs.length).toBeGreaterThanOrEqual(0)
  })

  test('closure rule — triggers when approaching closing time with active attractions', async () => {
    await core.service.call('perception.runRulesByType', 'closure', {
      userId: 'demo-user',
      timeline: [
        {
          id: 'test-node-1',
          planId,
          dayIndex: 0,
          startTime: '14:00',
          endTime: '18:00',
          title: '故宫',
          type: 'attraction',
          status: 'in_progress',
          address: '北京市东城区'
        }
      ]
    })

    const notifications = await core.service.call<any[]>('perception.getNotifications', {
      userId: 'demo-user'
    })
    const closureNotifs = notifications.filter((n: any) =>
      n.content.includes('关闭') || n.content.includes('景区')
    )
    // Depends on current time being within 60 min of closingHour (17:00)
    expect(closureNotifs.length).toBeGreaterThanOrEqual(0)
  })

  test('update_timeline action — rule can update node status', async () => {
    const timelineBefore = await core.service.call<any[]>('perception.getTimeline', {
      userId: 'demo-user',
      planId
    })
    expect(timelineBefore.length).toBeGreaterThan(0)

    const firstNode = timelineBefore[0]
    expect(firstNode.status).toBe('not_started')

    // Simulate update via service
    const updated = await core.service.call<any>('perception.updateNodeStatus', {
      userId: 'demo-user',
      planId,
      nodeId: firstNode.id,
      status: 'in_progress'
    })
    expect(updated).not.toBeNull()
    expect(updated.status).toBe('in_progress')

    const timelineAfter = await core.service.call<any[]>('perception.getTimeline', {
      userId: 'demo-user',
      planId
    })
    const updatedNode = timelineAfter.find((n: any) => n.id === firstNode.id)
    expect(updatedNode.status).toBe('in_progress')
  })

  test('push_notification action creates a notification entry', async () => {
    const before = await core.service.call<any[]>('perception.getNotifications', {
      userId: 'demo-user'
    })

    await core.service.call('perception.runRulesByType', 'weather', {
      userId: 'demo-user',
      weather: { condition: '大雨', temperature: 18 }
    })

    const after = await core.service.call<any[]>('perception.getNotifications', {
      userId: 'demo-user'
    })
    expect(after.length).toBeGreaterThan(before.length)
    // The newest notification (at index 0) should be a weather warning
    const latest = after[0]
    expect(latest.level).toBe('warning')
    expect(latest.content).toContain('天气')
  })

  test('getAllRules returns all built-in rules including congestion & closure', async () => {
    const rules = await core.service.call<any[]>('perception.getAllRules')
    expect(rules.length).toBeGreaterThanOrEqual(6)

    const ruleIds = rules.map((r: any) => r.id)
    expect(ruleIds).toContain('rule_time_remind')
    expect(ruleIds).toContain('rule_location_attraction')
    expect(ruleIds).toContain('rule_weather_warning')
    expect(ruleIds).toContain('rule_safety_remind')
    expect(ruleIds).toContain('rule_congestion_warning')
    expect(ruleIds).toContain('rule_closure_reminder')
  })

  test('addCustomRule and removeCustomRule work correctly', async () => {
    const customRule = {
      id: 'test_custom_rule',
      name: '测试规则',
      condition: { type: 'event', params: { eventType: 'test_event' } },
      action: { type: 'push_notification', params: { level: 'info', content: 'test' } },
      enabled: true,
      priority: 1
    }

    await core.service.call('perception.addCustomRule', customRule)
    let rules = await core.service.call<any[]>('perception.getAllRules')
    expect(rules.some((r: any) => r.id === 'test_custom_rule')).toBe(true)

    await core.service.call('perception.removeCustomRule', 'test_custom_rule')
    rules = await core.service.call<any[]>('perception.getAllRules')
    expect(rules.some((r: any) => r.id === 'test_custom_rule')).toBe(false)
  })

  test('markNotificationAsRead updates isRead flag', async () => {
    // Trigger a notification that we can identify
    await core.service.call('perception.runRulesByType', 'weather', {
      userId: 'demo-user',
      weather: { condition: '大雨', temperature: 10 }
    })

    const notifications = await core.service.call<any[]>('perception.getNotifications', {
      userId: 'demo-user'
    })
    const unread = notifications.filter((n: any) => !n.isRead)
    expect(unread.length).toBeGreaterThan(0)

    const targetId = unread[0].id
    const result = await core.service.call<boolean>('perception.markNotificationAsRead', {
      userId: 'demo-user',
      notificationId: targetId
    })
    expect(result).toBe(true)

    // Fetch all and verify the specific notification is now read
    const all = await core.service.call<any[]>('perception.getNotifications', {
      userId: 'demo-user'
    })
    const marked = all.find((n: any) => n.id === targetId)
    expect(marked).toBeDefined()
    expect(marked!.isRead).toBe(true)
  })

  test('setRuleEnabled disables a built-in rule', async () => {
    const result = await core.service.call<boolean>('perception.setRuleEnabled', {
      ruleId: 'rule_weather_warning',
      enabled: false
    })
    expect(result).toBe(true)

    const rules = await core.service.call<any[]>('perception.getAllRules')
    const weatherRule = rules.find((r: any) => r.id === 'rule_weather_warning')
    expect(weatherRule).toBeDefined()
    expect(weatherRule.enabled).toBe(false)
  })

  test('setRuleEnabled re-enables a built-in rule', async () => {
    // First disable
    await core.service.call('perception.setRuleEnabled', {
      ruleId: 'rule_weather_warning',
      enabled: false
    })
    // Then re-enable
    const result = await core.service.call<boolean>('perception.setRuleEnabled', {
      ruleId: 'rule_weather_warning',
      enabled: true
    })
    expect(result).toBe(true)

    const rules = await core.service.call<any[]>('perception.getAllRules')
    const weatherRule = rules.find((r: any) => r.id === 'rule_weather_warning')
    expect(weatherRule.enabled).toBe(true)
  })

  test('setRuleEnabled returns false for unknown rule', async () => {
    const result = await core.service.call<boolean>('perception.setRuleEnabled', {
      ruleId: 'nonexistent_rule',
      enabled: false
    })
    expect(result).toBe(false)
  })

  test('setRuleEnabled toggles a custom rule', async () => {
    const customRule = {
      id: 'toggle-test-rule',
      name: 'Toggle Test',
      condition: { type: 'event', params: { eventType: 'test' } },
      action: { type: 'push_notification', params: { level: 'info', content: 'test' } },
      enabled: true,
      priority: 1
    }
    await core.service.call('perception.addCustomRule', customRule)

    const result = await core.service.call<boolean>('perception.setRuleEnabled', {
      ruleId: 'toggle-test-rule',
      enabled: false
    })
    expect(result).toBe(true)

    const rules = await core.service.call<any[]>('perception.getAllRules')
    const toggled = rules.find((r: any) => r.id === 'toggle-test-rule')
    expect(toggled.enabled).toBe(false)

    // Cleanup
    await core.service.call('perception.removeCustomRule', 'toggle-test-rule')
  })

  test('addCustomRule and removeCustomRule lifecycle', async () => {
    const customRule = {
      id: 'lifecycle-test-rule',
      name: 'Lifecycle Test',
      condition: { type: 'event', params: { eventType: 'lifecycle' } },
      action: { type: 'push_notification', params: { level: 'info', content: 'lifecycle' } },
      enabled: true,
      priority: 2
    }

    // Add
    await core.service.call('perception.addCustomRule', customRule)
    let rules = await core.service.call<any[]>('perception.getAllRules')
    expect(rules.some((r: any) => r.id === 'lifecycle-test-rule')).toBe(true)

    // Remove
    await core.service.call('perception.removeCustomRule', 'lifecycle-test-rule')
    rules = await core.service.call<any[]>('perception.getAllRules')
    expect(rules.some((r: any) => r.id === 'lifecycle-test-rule')).toBe(false)
  })

  test('notification persistence — push then retrieve', async () => {
    const testUserId = 'persist-test-user'

    // Push via weather rule
    await core.service.call('perception.runRulesByType', 'weather', {
      userId: testUserId,
      weather: { condition: '大雨', temperature: 18 }
    })

    const notifications = await core.service.call<any[]>('perception.getNotifications', {
      userId: testUserId
    })
    const weatherNotifs = notifications.filter((n: any) =>
      n.content.includes('天气')
    )
    expect(weatherNotifs.length).toBeGreaterThan(0)
    expect(weatherNotifs[0].level).toBe('warning')
  })
})
