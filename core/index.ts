import { EventBus } from './event-bus'
import { StateManager } from './state-manager'
import { PluginManager } from './plugin-manager'
import { DIContainer } from './di-container'
import { ConfigCenter } from './config-center'
import type { ICore } from './interfaces/core.interface'
import type { IServiceRegistry, ServiceHandler } from './interfaces/service.interface'

export class Core implements ICore {
  public eventBus: EventBus
  public state: StateManager
  public pluginManager: PluginManager
  public di: DIContainer
  public config: ConfigCenter
  public service: IServiceRegistry

  private serviceRegistry: Map<string, { handler: ServiceHandler; isFallback: boolean }> = new Map()

  constructor(defaultConfig: Record<string, any> = {}) {
    this.di = new DIContainer()
    this.config = new ConfigCenter(defaultConfig)
    this.state = new StateManager()
    this.eventBus = new EventBus(this)
    this.pluginManager = new PluginManager(this)

    this.service = {
      register: (serviceName: string, handler: ServiceHandler, options = {}) => {
        const existing = this.serviceRegistry.get(serviceName)
        if (!existing || !existing.isFallback || options.fallback) {
          this.serviceRegistry.set(serviceName, {
            handler,
            isFallback: !!options.fallback
          })
        }
      },
      call: async <T>(serviceName: string, ...args: any[]): Promise<T> => {
        const service = this.serviceRegistry.get(serviceName)
        if (!service) {
          throw new Error(`服务${serviceName}未注册`)
        }
        return service.handler(...args) as T
      }
    }
  }

  async start(): Promise<void> {
    await this.pluginManager.mount()
  }
}

export * from './interfaces/plugin.interface'
export * from './interfaces/event.types'
export * from './interfaces/service.interface'
export * from './interfaces/state.interface'
