import type { IPlugin, ICore } from '@trailmate/core'
import { GlobalEvent } from '@trailmate/core'
import type { PerceptionContext } from './src/types'
export type { LocationInfo, TimelineNode, Notification, NotificationLevel, PerceptionContext } from './src/types'
import { handlePlanGenerated, handlePlanUpdated } from './src/event-handlers/plan-event.handler'
import { handleLocationChanged } from './src/event-handlers/location-event.handler'
import { getTimeline, updateNodeStatus, insertCustomNode, stopTimelineScheduler, generateTimeline, startTimelineScheduler } from './src/services/timeline.service'
import { simulateLocation, getCurrentLocation, toggleAutoSimulate, getRealLocation, startRealLocationWatcher, stopRealLocationWatcher } from './src/services/location.service'
import { getNotifications, markNotificationAsRead } from './src/services/notification.service'
import { stopRuleScheduler, startRuleScheduler, runRulesByType, addCustomRule, removeCustomRule, setRuleEnabled, getAllRules } from './src/services/rule-engine.service'
import { runPerceptionWorkflow, type PerceptionWorkflowRequest } from './src/workflow/perception-workflow'

export default class PerceptionModule implements IPlugin {
  pluginId = 'perception-core'
  pluginName = '情境感知核心模块'
  version = '1.0.0'
  dependencies = []

  protected core: ICore | null = null
  protected contexts: Map<string, PerceptionContext> = new Map() // userId -> context
  // 保存绑定后的事件处理函数引用，保证订阅/取消订阅使用同一个实例
  private boundHandlers = {
    handlePlanGenerated: handlePlanGenerated.bind(this),
    handlePlanUpdated: handlePlanUpdated.bind(this),
    handleLocationChanged: handleLocationChanged.bind(this)
  }

  onInstall(core: ICore) {
    this.core = core

    // 订阅核心事件
    core.eventBus.on(GlobalEvent.PLAN_GENERATED, this.boundHandlers.handlePlanGenerated)
    core.eventBus.on(GlobalEvent.PLAN_UPDATED, this.boundHandlers.handlePlanUpdated)
    core.eventBus.on(GlobalEvent.LOCATION_CHANGED, this.boundHandlers.handleLocationChanged)

    // 注册对外服务
    core.service.register('perception.getTimeline', getTimeline.bind(this))
    core.service.register('perception.simulateLocation', simulateLocation.bind(this))
    core.service.register('perception.getCurrentLocation', getCurrentLocation.bind(this))
    core.service.register('perception.toggleAutoSimulate', toggleAutoSimulate.bind(this))
    core.service.register('perception.getNotifications', getNotifications.bind(this))
    core.service.register('perception.markNotificationAsRead', markNotificationAsRead.bind(this))
    core.service.register('perception.runRulesByType', runRulesByType.bind(this))
    core.service.register('perception.addCustomRule', addCustomRule.bind(this))
    core.service.register('perception.removeCustomRule', removeCustomRule.bind(this))
    core.service.register('perception.setRuleEnabled', setRuleEnabled.bind(this))
    core.service.register('perception.getAllRules', getAllRules.bind(this))
    core.service.register('perception.updateNodeStatus', updateNodeStatus.bind(this))
    core.service.register('perception.insertCustomNode', insertCustomNode.bind(this))
    core.service.register('perception.getRealLocation', getRealLocation.bind(this))
    core.service.register('perception.startRealLocationWatcher', startRealLocationWatcher.bind(this))
    core.service.register('perception.stopRealLocationWatcher', stopRealLocationWatcher.bind(this))
    core.service.register('perception.runWorkflow', (request: PerceptionWorkflowRequest) => runPerceptionWorkflow(request))
    core.service.register('perception.startRuleScheduler', startRuleScheduler.bind(this))
    core.service.register('perception.generateTimeline', generateTimeline.bind(this))
    core.service.register('perception.startTimelineScheduler', startTimelineScheduler.bind(this))
  }

  onMount(_core: ICore) {
    console.log('✅ 情境感知核心模块启动成功')
  }

  onUnmount(core: ICore) {
    core.eventBus.off(GlobalEvent.PLAN_GENERATED, this.boundHandlers.handlePlanGenerated)
    core.eventBus.off(GlobalEvent.PLAN_UPDATED, this.boundHandlers.handlePlanUpdated)
    core.eventBus.off(GlobalEvent.LOCATION_CHANGED, this.boundHandlers.handleLocationChanged)

    // 停止所有用户的调度器
    this.contexts.forEach((_, userId) => {
      stopRuleScheduler(userId)
      stopTimelineScheduler(userId)
      // 停止自动位置模拟
      toggleAutoSimulate.call(this, { userId, enabled: false })
    })

    console.log('🛑 情境感知核心模块已卸载')
  }

  /**
   * 内部使用：获取用户情境上下文
   */
  public getContext(userId: string): PerceptionContext | undefined {
    return this.contexts.get(userId)
  }

  /**
   * 内部使用：保存用户情境上下文
   */
  public setContext(userId: string, context: PerceptionContext): void {
    this.contexts.set(userId, context)
  }
}
