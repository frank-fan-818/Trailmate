import type { EventBus } from '../event-bus'
import type { StateManager } from '../state-manager'
import type { PluginManager } from '../plugin-manager'
import type { DIContainer } from '../di-container'
import type { ConfigCenter } from '../config-center'
import type { IServiceRegistry } from './service.interface'

export interface ICore {
  eventBus: EventBus
  state: StateManager
  pluginManager: PluginManager
  di: DIContainer
  config: ConfigCenter
  service: IServiceRegistry
}
