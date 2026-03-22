import type { IPlugin, ICore } from '@trailmate/core'
import { GlobalEvent } from '@trailmate/core'
import type { PerceptionContext } from './src/types'
import { handlePlanGenerated, handlePlanUpdated } from './src/event-handlers/plan-event.handler'
import { handleLocationChanged } from './src/event-handlers/location-event.handler'
import { getTimeline, updateNodeStatus } from './src/services/timeline.service'
import { simulateLocation, getCurrentLocation, toggleAutoSimulate } from './src/services/location.service'
import { getNotifications, markNotificationAsRead } from './src/services/notification.service'

export default class PerceptionModule implements IPlugin {
  pluginId = 'perception-core'
  pluginName = '情境感知核心模块'
  version = '1.0.0'
  dependencies = []

  private core: ICore | null = null
  private contexts: Map<string, PerceptionContext> = new Map() // userId -> context
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
    core.eventBus.on('LOCATION_CHANGED', this.boundHandlers.handleLocationChanged)

    // 注册对外服务
    core.service.register('perception.getTimeline', getTimeline.bind(this))
    core.service.register('perception.simulateLocation', simulateLocation.bind(this))
    core.service.register('perception.getCurrentLocation', getCurrentLocation.bind(this))
    core.service.register('perception.toggleAutoSimulate', toggleAutoSimulate.bind(this))
    core.service.register('perception.getNotifications', getNotifications.bind(this))
    core.service.register('perception.markNotificationAsRead', markNotificationAsRead.bind(this))
  }

  onMount(core: ICore) {
    console.log('✅ 情境感知核心模块启动成功')
  }

  onUnmount(core: ICore) {
    core.eventBus.off(GlobalEvent.PLAN_GENERATED, this.boundHandlers.handlePlanGenerated)
    core.eventBus.off(GlobalEvent.PLAN_UPDATED, this.boundHandlers.handlePlanUpdated)
    core.eventBus.off('LOCATION_CHANGED', this.boundHandlers.handleLocationChanged)
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
