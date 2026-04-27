import type PerceptionModule from '../../index'
import type { Rule, LocationInfo, PerceptionContext } from '../types'
import { pushNotification } from './notification.service'

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
    default:
      return false
  }
}

/**
 * 位置规则匹配
 */
function matchLocationRule(conditionParams: Record<string, any>, params: Record<string, any>): boolean {
  const { location } = params as { location: LocationInfo; context: PerceptionContext }
  const { distance, areas } = conditionParams

  // 距离匹配（简化实现，真实场景需要计算两点距离）
  if (distance && Math.random() > 0.7) { // 模拟30%概率匹配到附近景点
    return true
  }

  // 特殊地区匹配
  if (areas && areas.includes(location.city)) {
    return true
  }

  return false
}

/**
 * 时间规则匹配
 */
function matchTimeRule(conditionParams: Record<string, any>, params: Record<string, any>): boolean {
  const { beforeMinutes } = conditionParams
  // 简化实现，真实场景需要计算当前时间与节点时间的差值
  return Math.random() > 0.8 // 模拟20%概率匹配到即将开始的行程
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
    case 'update_timeline':
      // 待实现：更新时间线节点
      break
    case 'adjust_plan':
      // 待实现：自动调整行程
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

  // 每分钟执行一次时间类规则检查
  const timer = setInterval(async () => {
    const context = this.getContext(userId)
    if (!context) return

    await runRulesByType.call(this, 'time', {
      userId,
      context,
      currentTime: Date.now()
    })
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
 * 获取所有规则
 */
export async function getAllRules(): Promise<Rule[]> {
  return [...builtInRules, ...customRules]
}
