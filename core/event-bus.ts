import EventEmitter from 'eventemitter3'
import type { GlobalEvent, EventCallback } from './interfaces/event.types'
import { SecurityInterceptor } from './security-interceptor'
import type { ICore } from './interfaces/core.interface'

export class EventBus {
  private emitter = new EventEmitter()
  private securityInterceptor: SecurityInterceptor

  constructor(core: ICore) {
    this.securityInterceptor = new SecurityInterceptor(core)
  }

  async emit<T>(event: GlobalEvent, data: T): Promise<void> {
    const securityCheck = await this.securityInterceptor.intercept(event, data)
    if (!securityCheck.pass) {
      throw new Error(securityCheck.message ?? '安全校验未通过')
    }
    this.emitter.emit(event as string, data)
  }

  on<T>(event: GlobalEvent, callback: EventCallback<T>): void {
    this.emitter.on(event as string, callback)
  }

  off<T>(event: GlobalEvent, callback: EventCallback<T>): void {
    this.emitter.off(event as string, callback)
  }

  once<T>(event: GlobalEvent, callback: EventCallback<T>): void {
    this.emitter.once(event as string, callback)
  }
}