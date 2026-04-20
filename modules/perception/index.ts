import { GlobalEvent, type ICore, type IPlugin } from '../../core'
import type { PerceptionContext } from './src/types'
import { handleLocationChanged } from './src/event-handlers/location-event.handler'
import { handlePlanGenerated, handlePlanUpdated } from './src/event-handlers/plan-event.handler'
import {
  getCurrentLocation,
  simulateLocation,
  stopAutoSimulation,
  toggleAutoSimulate
} from './src/services/location.service'
import {
  getNotifications,
  markNotificationAsRead
} from './src/services/notification.service'
import {
  addCustomRule,
  getAllRules,
  removeCustomRule,
  runRulesByType,
  startRuleScheduler,
  stopRuleScheduler
} from './src/services/rule-engine.service'
import {
  getTimeline,
  insertCustomNode,
  stopTimelineScheduler,
  updateNodeStatus
} from './src/services/timeline.service'

export default class PerceptionModule implements IPlugin {
  pluginId = 'perception-core'
  pluginName = 'Perception Core'
  version = '1.1.0'
  dependencies: string[] = []

  public core: ICore | null = null

  private contexts = new Map<string, PerceptionContext>()
  private readonly boundHandlers = {
    handlePlanGenerated: handlePlanGenerated.bind(this),
    handlePlanUpdated: handlePlanUpdated.bind(this),
    handleLocationChanged: handleLocationChanged.bind(this)
  }

  onInstall(core: ICore): void {
    this.core = core

    core.eventBus.on(GlobalEvent.PLAN_GENERATED, this.boundHandlers.handlePlanGenerated)
    core.eventBus.on(GlobalEvent.PLAN_UPDATED, this.boundHandlers.handlePlanUpdated)
    core.eventBus.on(GlobalEvent.LOCATION_CHANGED, this.boundHandlers.handleLocationChanged)

    core.service.register('perception.getTimeline', getTimeline.bind(this))
    core.service.register('perception.simulateLocation', simulateLocation.bind(this))
    core.service.register('perception.getCurrentLocation', getCurrentLocation.bind(this))
    core.service.register('perception.toggleAutoSimulate', toggleAutoSimulate.bind(this))
    core.service.register('perception.getNotifications', getNotifications.bind(this))
    core.service.register('perception.markNotificationAsRead', markNotificationAsRead.bind(this))
    core.service.register('perception.runRulesByType', runRulesByType.bind(this))
    core.service.register('perception.addCustomRule', addCustomRule.bind(this))
    core.service.register('perception.removeCustomRule', removeCustomRule.bind(this))
    core.service.register('perception.getAllRules', getAllRules.bind(this))
    core.service.register('perception.updateNodeStatus', updateNodeStatus.bind(this))
    core.service.register('perception.insertCustomNode', insertCustomNode.bind(this))
  }

  onMount(): void {
    console.log('[trailmate] perception module mounted')
  }

  onUnmount(core: ICore): void {
    core.eventBus.off(GlobalEvent.PLAN_GENERATED, this.boundHandlers.handlePlanGenerated)
    core.eventBus.off(GlobalEvent.PLAN_UPDATED, this.boundHandlers.handlePlanUpdated)
    core.eventBus.off(GlobalEvent.LOCATION_CHANGED, this.boundHandlers.handleLocationChanged)

    this.contexts.forEach((_, userId) => {
      stopRuleScheduler(userId)
      stopTimelineScheduler(userId)
      stopAutoSimulation(userId)
    })
  }

  getContext(userId: string): PerceptionContext | undefined {
    return this.contexts.get(userId)
  }

  setContext(userId: string, context: PerceptionContext): void {
    this.contexts.set(userId, context)
    this.core?.state.set(`perception.context.${userId}`, context)
  }
}
