import type PerceptionModule from '../../index'
import type { Rule, LocationInfo, PerceptionContext, TimelineNode, TimelineNodeStatus } from '../types'
import { pushNotification } from './notification.service'
import { updateNodeStatus, getTimelineSnapshot } from './timeline.service'
import { haversineDistance, checkSpecialArea } from '../utils/geo-utils'

// 内置规则库
const builtInRules: Rule[] = [
  // 时间提醒规则：行程节点前30分钟提醒
  {
    id: 'rule_time_remind',
    name: '行程时间提醒',
    description: '行程节点开始前30分钟发送提醒',
    condition: {
      type: 'time',
      params: {
        beforeMinutes: 30
      }
    },
    action: {
      type: 'push_notification',
      params: {
        level: 'info',
        content: '您有一个行程即将开始，请做好准备'
      }
    },
    enabled: true,
    priority: 2
  },
  // 位置推荐规则：3公里内推荐景点
  {
    id: 'rule_location_attraction',
    name: '附近景点推荐',
    description: '当前位置3公里内有景点时推送推荐',
    condition: {
      type: 'location',
      params: {
        distance: 3000 // 3000米
      }
    },
    action: {
      type: 'push_notification',
      params: {
        level: 'info',
        content: '发现您附近有不错的景点，要不要去看看？'
      }
    },
    enabled: true,
    priority: 1
  },
  // 天气预警规则：恶劣天气提醒
  {
    id: 'rule_weather_warning',
    name: '恶劣天气预警',
    description: '遇到恶劣天气时推送提醒',
    condition: {
      type: 'weather',
      params: {
        conditions: ['小雨', '中雨', '大雨', '雪']
      }
    },
    action: {
      type: 'push_notification',
      params: {
        level: 'warning',
        content: '请注意天气变化，合理调整行程'
      }
    },
    enabled: true,
    priority: 3
  },
  // 高风险地区提示规则
  {
    id: 'rule_safety_remind',
    name: '安全提醒',
    description: '进入特殊地区时推送安全提示',
    condition: {
      type: 'location',
      params: {
        areas: ['边境地区', '高风险地区']
      }
    },
    action: {
      type: 'push_notification',
      params: {
        level: 'urgent',
        content: '您已进入特殊地区，请注意人身财产安全'
      }
    },
    enabled: true,
    priority: 5
  },
  // 拥堵提醒规则：大城市高峰时段提醒
  {
    id: 'rule_congestion_warning',
    name: '拥堵提醒',
    description: '大城市高峰时段(7-9/17-19)推送交通拥堵提醒',
    condition: {
      type: 'congestion',
      params: {
        peakHours: [[7, 9], [17, 19]],
        bigCities: ['北京', '上海', '广州', '深圳', '成都', '杭州', '重庆', '武汉']
      }
    },
    action: {
      type: 'push_notification',
      params: {
        level: 'warning',
        content: '当前处于交通高峰时段，请注意拥堵，建议错峰出行'
      }
    },
    enabled: true,
    priority: 4
  },
  // 景区关闭提醒规则
  {
    id: 'rule_closure_reminder',
    name: '景区关闭提醒',
    description: '接近景区营业结束时间时发送提醒',
    condition: {
      type: 'closure',
      params: {
        beforeMinutes: 60,
        closingHour: 17
      }
    },
    action: {
      type: 'push_notification',
      params: {
        level: 'info',
        content: '附近景区即将关闭，请合理安排游览时间，注意返程'
      }
    },
    enabled: true,
    priority: 3
  }
]

// 自定义规则库
const customRules: Rule[] = []

/**
 * 根据规则类型执行匹配
 */
export async function runRulesByType(this: PerceptionModule, type: string, params: Record<string, any>): Promise<void> {
  // 合并内置规则和自定义规则，按优先级排序
  const allRules = [...builtInRules, ...customRules]
    .filter(rule => rule.enabled && rule.condition.type === type)
    .sort((a, b) => b.priority - a.priority)

  for (const rule of allRules) {
    const matched = await matchRule(rule, params)
    if (matched) {
      await executeRuleAction.call(this, rule, params)
    }
  }
}

/**
 * 规则匹配逻辑
 */
async function matchRule(rule: Rule, params: Record<string, any>): Promise<boolean> {
  const { type, params: conditionParams } = rule.condition

  switch (type) {
    case 'location':
      return matchLocationRule(conditionParams, params)
    case 'time':
      return matchTimeRule(conditionParams, params)
    case 'weather':
      return matchWeatherRule(conditionParams, params)
    case 'event':
      return matchEventRule(conditionParams, params)
    case 'congestion':
      return matchCongestionRule(conditionParams, params)
    case 'closure':
      return matchClosureRule(conditionParams, params)
    default:
      return false
  }
}

/**
 * 位置规则匹配
 */
function matchLocationRule(conditionParams: Record<string, any>, params: Record<string, any>): boolean {
  const { location, context } = params as { location: LocationInfo; context: PerceptionContext }
  const { distance, areas } = conditionParams

  // 距离匹配：使用 Haversine 公式计算真实距离
  if (distance && context?.planId) {
    const timeline: TimelineNode[] = params.timeline || []
    const currentLat = location.latitude
    const currentLng = location.longitude

    // 从上下文获取附近景点坐标 (可通过 params.attractions 传入外部坐标)
    const attractions: Array<{ name: string; latitude: number; longitude: number }> =
      params.attractions || []

    // 检查 timeline 中 attraction 类型节点：如果传入了对应坐标则匹配距离
    for (const node of timeline) {
      const nodeCoords = attractions.find(
        (a) => a.name === node.title || a.name === node.address
      )
      if (nodeCoords) {
        const dist = haversineDistance(
          currentLat, currentLng,
          nodeCoords.latitude, nodeCoords.longitude
        )
        if (dist <= distance) {
          return true
        }
      }
    }

    // 如果 attractions 为空但有 timeline 节点，进行同城匹配（数据不足时的优雅降级）
    if (attractions.length === 0 && timeline.length > 0) {
      const cityNodes = timeline.filter(
        (node) =>
          node.address &&
          location.city &&
          (node.address.includes(location.city) || location.city.includes(node.address.replace(/市$/, '')))
      )
      if (cityNodes.length > 0) {
        return true
      }
    }
  }

  // 特殊地区匹配：优先使用地理围栏，回退到城市名匹配
  if (areas && Array.isArray(areas)) {
    const geoArea = checkSpecialArea(location.latitude, location.longitude)
    if (geoArea && areas.includes(geoArea)) {
      return true
    }
    // 回退：城市名模糊匹配
    if (areas.some((area: string) => location.city.includes(area) || location.address.includes(area))) {
      return true
    }
  }

  return false
}

/**
 * 时间规则匹配——基于真实的当前时间与 timeline 节点 startTime 比较
 */
function matchTimeRule(conditionParams: Record<string, any>, params: Record<string, any>): boolean {
  const { beforeMinutes = 30 } = conditionParams
  const timeline: TimelineNode[] = params.timeline || []
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  for (const node of timeline) {
    // 只检查尚未开始的节点
    if (node.status !== 'not_started') continue
    const parts = node.startTime.split(':').map(Number)
    const nodeMinutes = parts[0] * 60 + (parts[1] || 0)
    if (isNaN(nodeMinutes)) continue

    const diff = nodeMinutes - currentMinutes
    // 节点在 beforeMinutes 窗口内且还未开始
    if (diff > 0 && diff <= beforeMinutes) {
      return true
    }
  }

  return false
}

/**
 * 天气规则匹配
 */
function matchWeatherRule(conditionParams: Record<string, any>, params: Record<string, any>): boolean {
  const { conditions } = conditionParams
  const { weather } = params
  return conditions.includes(weather?.condition)
}

/**
 * 事件规则匹配
 */
function matchEventRule(conditionParams: Record<string, any>, params: Record<string, any>): boolean {
  const { eventType } = conditionParams
  return params.eventType === eventType
}

/**
 * 拥堵规则匹配——高峰时段在大城市触发
 */
function matchCongestionRule(conditionParams: Record<string, any>, params: Record<string, any>): boolean {
  const { peakHours = [], bigCities = [] } = conditionParams
  const { location } = params as { location?: LocationInfo }

  // 检查当前是否在高峰时段
  const now = new Date()
  const currentHour = now.getHours()
  const inPeak = peakHours.some(
    ([start, end]: [number, number]) => currentHour >= start && currentHour < end
  )
  if (!inPeak) return false

  // 检查是否在大城市
  if (location && bigCities.length > 0) {
    const cityName = location.city.replace(/市$/, '')
    return bigCities.some((city: string) => cityName.includes(city) || city.includes(cityName))
  }

  // 没有位置信息时，仅按时间判断
  return true
}

/**
 * 景区关闭规则匹配——接近景区营业结束时间
 */
function matchClosureRule(conditionParams: Record<string, any>, params: Record<string, any>): boolean {
  const { beforeMinutes = 60, closingHour = 17 } = conditionParams
  const timeline: TimelineNode[] = params.timeline || []
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const closingMinutes = closingHour * 60

  // 检查当前时间是否在关闭前 beforeMinutes 窗口内
  if (currentMinutes < closingMinutes - beforeMinutes || currentMinutes >= closingMinutes) {
    return false
  }

  // 检查 timeline 中是否有 attraction 类型且尚未完成的节点
  return timeline.some(
    (node) =>
      node.type === 'attraction' &&
      node.status !== 'completed' &&
      node.status !== 'cancelled'
  )
}

/**
 * 执行规则动作
 */
async function executeRuleAction(this: PerceptionModule, rule: Rule, params: Record<string, any>): Promise<void> {
  const { type, params: actionParams } = rule.action
  const { userId, context } = params

  switch (type) {
    case 'push_notification':
      await pushNotification.call(this, {
        userId,
        planId: context?.planId,
        content: actionParams.content,
        level: actionParams.level
      })
      break
    case 'update_timeline': {
      const { nodeId, status } = actionParams
      if (nodeId && status && context?.planId) {
        await updateNodeStatus.call(this, {
          userId,
          planId: context.planId,
          nodeId,
          status: status as TimelineNodeStatus
        })
      }
      break
    }
    case 'adjust_plan':
      await pushNotification.call(this, {
        userId,
        planId: context?.planId,
        content: actionParams.content || '系统根据当前情况建议您调整行程安排',
        level: actionParams.level || 'info'
      })
      break
  }
}

// 定时任务定时器，userId -> timer
const ruleTimers = new Map<string, ReturnType<typeof setInterval>>()

/**
 * 启动用户规则定时检查
 */
export async function startRuleScheduler(this: PerceptionModule, userId: string): Promise<void> {
  // 停止现有定时器
  stopRuleScheduler(userId)

  // 每分钟执行一次时间/拥堵/关闭类规则检查
  const timer = setInterval(async () => {
    const context = this.getContext(userId)
    if (!context) return

    const baseParams = {
      userId,
      context,
      currentTime: Date.now(),
      location: context.currentLocation
    }

    await Promise.all([
      runRulesByType.call(this, 'time', { ...baseParams, timeline: getTimelineSnapshot(context.planId) }),
      runRulesByType.call(this, 'congestion', baseParams),
      runRulesByType.call(this, 'closure', { ...baseParams, timeline: getTimelineSnapshot(context.planId) })
    ])
  }, 60000) // 1分钟

  ruleTimers.set(userId, timer)
}

/**
 * 停止用户规则定时检查
 */
export function stopRuleScheduler(userId: string): void {
  const timer = ruleTimers.get(userId)
  if (timer) {
    clearInterval(timer)
    ruleTimers.delete(userId)
  }
}

/**
 * 添加自定义规则
 */
export async function addCustomRule(rule: Rule): Promise<void> {
  customRules.push(rule)
}

/**
 * 删除自定义规则
 */
export async function removeCustomRule(ruleId: string): Promise<void> {
  const index = customRules.findIndex(r => r.id === ruleId)
  if (index > -1) {
    customRules.splice(index, 1)
  }
}

/**
 * 启用或禁用指定规则（同时搜索内置规则和自定义规则）
 * @returns true 表示找到并更新，false 表示未找到
 */
export async function setRuleEnabled(this: PerceptionModule, params: {
  ruleId: string
  enabled: boolean
}): Promise<boolean> {
  const builtIn = builtInRules.find(r => r.id === params.ruleId)
  if (builtIn) {
    builtIn.enabled = params.enabled
    return true
  }

  const custom = customRules.find(r => r.id === params.ruleId)
  if (custom) {
    custom.enabled = params.enabled
    return true
  }

  return false
}

/**
 * 获取所有规则
 */
export async function getAllRules(): Promise<Rule[]> {
  return [...builtInRules, ...customRules]
}
