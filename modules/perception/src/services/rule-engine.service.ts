import type PerceptionModule from '../../index'
import { pushNotification } from './notification.service'
import { getTimelineSnapshot } from './timeline.service'
import type { LocationInfo, PerceptionContext, Rule } from '../types'

const builtInRules: Rule[] = [
  {
    id: 'rule_location_arrival',
    name: 'Location update acknowledgement',
    description: 'Push a notification when a simulated location is received.',
    condition: {
      type: 'location',
      params: {}
    },
    action: {
      type: 'push_notification',
      params: {
        level: 'info',
        content: 'Location updated. Review the next timeline stop and nearby reminders.'
      }
    },
    enabled: true,
    priority: 1
  },
  {
    id: 'rule_location_safety',
    name: 'Safety reminder',
    description: 'Warn when the user simulates a location tagged as high-risk.',
    condition: {
      type: 'location',
      params: {
        areas: ['Border Area', 'High Risk Zone']
      }
    },
    action: {
      type: 'push_notification',
      params: {
        level: 'urgent',
        content: 'You entered a special area. Review safety guidance before continuing.'
      }
    },
    enabled: true,
    priority: 5
  },
  {
    id: 'rule_time_reminder',
    name: 'Upcoming stop reminder',
    description: 'Notify the user when the next stop is approaching.',
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
        content: 'Your next itinerary stop starts soon.'
      }
    },
    enabled: true,
    priority: 3
  }
]

const customRules: Rule[] = []
const ruleTimers = new Map<string, ReturnType<typeof setInterval>>()
const executedRuleKeys = new Set<string>()

export async function runRulesByType(
  this: PerceptionModule,
  type: string,
  params: Record<string, any>
): Promise<void> {
  const rules = [...builtInRules, ...customRules]
    .filter((rule) => rule.enabled && rule.condition.type === type)
    .sort((left, right) => right.priority - left.priority)

  for (const rule of rules) {
    const matched = await matchRule.call(this, rule, params)
    if (!matched) {
      continue
    }

    const executionKey = createExecutionKey(rule, params)
    if (executedRuleKeys.has(executionKey)) {
      continue
    }

    executedRuleKeys.add(executionKey)
    await executeRuleAction.call(this, rule, params)
  }
}

export async function startRuleScheduler(this: PerceptionModule, userId: string): Promise<void> {
  stopRuleScheduler(userId)

  const timer = setInterval(async () => {
    const context = this.getContext(userId)
    if (!context) {
      return
    }

    await runRulesByType.call(this, 'time', {
      userId,
      context,
      currentTime: Date.now()
    })
  }, 60000)

  ruleTimers.set(userId, timer)
}

export function stopRuleScheduler(userId: string): void {
  const timer = ruleTimers.get(userId)
  if (timer) {
    clearInterval(timer)
    ruleTimers.delete(userId)
  }
}

export async function addCustomRule(rule: Rule): Promise<void> {
  customRules.push(rule)
}

export async function removeCustomRule(ruleId: string): Promise<void> {
  const index = customRules.findIndex((rule) => rule.id === ruleId)
  if (index >= 0) {
    customRules.splice(index, 1)
  }
}

export async function getAllRules(): Promise<Rule[]> {
  return [...builtInRules, ...customRules]
}

async function matchRule(
  this: PerceptionModule,
  rule: Rule,
  params: Record<string, any>
): Promise<boolean> {
  switch (rule.condition.type) {
    case 'location':
      return matchLocationRule(rule.condition.params, params)
    case 'time':
      return matchTimeRule(rule.condition.params, params)
    case 'weather':
      return false
    case 'event':
      return Boolean(params.eventType && params.eventType === rule.condition.params.eventType)
    default:
      return false
  }
}

function matchLocationRule(
  conditionParams: Record<string, any>,
  params: Record<string, any>
): boolean {
  const location = params.location as LocationInfo | undefined
  if (!location) {
    return false
  }

  const restrictedAreas = conditionParams.areas as string[] | undefined
  if (!restrictedAreas || restrictedAreas.length === 0) {
    return true
  }

  return restrictedAreas.includes(location.city)
}

function matchTimeRule(
  conditionParams: Record<string, any>,
  params: Record<string, any>
): boolean {
  const context = params.context as PerceptionContext | undefined
  if (!context) {
    return false
  }

  const timeline = getTimelineSnapshot(context.planId)
  const nextNode = timeline.find((node) => node.status === 'not_started')
  if (!nextNode) {
    return false
  }

  const beforeMinutes = Number(conditionParams.beforeMinutes ?? 30)
  const currentTime = new Date(params.currentTime ?? Date.now())
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes()
  const nodeStartMinutes = timeToMinutes(nextNode.startTime)
  const delta = nodeStartMinutes - currentMinutes

  return delta >= 0 && delta <= beforeMinutes
}

async function executeRuleAction(
  this: PerceptionModule,
  rule: Rule,
  params: Record<string, any>
): Promise<void> {
  const context = params.context as PerceptionContext | undefined
  await pushNotification.call(this, {
    userId: params.userId,
    planId: context?.planId,
    content: rule.action.params.content,
    level: rule.action.params.level
  })
}

function createExecutionKey(rule: Rule, params: Record<string, any>): string {
  if (rule.condition.type === 'location') {
    return `${params.userId}:${rule.id}:${params.location?.id ?? 'location'}`
  }

  if (rule.condition.type === 'time') {
    const context = params.context as PerceptionContext | undefined
    const nextNode = context ? getTimelineSnapshot(context.planId).find((node) => node.status === 'not_started') : undefined
    return `${params.userId}:${rule.id}:${nextNode?.id ?? 'time'}`
  }

  return `${params.userId}:${rule.id}:${params.eventType ?? 'event'}`
}

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return (Number.isFinite(hours) ? hours : 0) * 60 + (Number.isFinite(minutes) ? minutes : 0)
}
