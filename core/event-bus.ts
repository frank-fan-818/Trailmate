import type { GlobalEvent, EventCallback } from './interfaces/event.types'
import { SecurityInterceptor } from './security-interceptor'
import type { ICore } from './interfaces/core.interface'

export class EventBus {
  private subscribers = new Map<string, Set<EventCallback<any>>>()
  private securityInterceptor: SecurityInterceptor

  constructor(core: ICore) {
    this.securityInterceptor = new SecurityInterceptor(core)
  }

  async emit<T>(event: GlobalEvent, data: T): Promise<void> {
    const securityCheck = await this.securityInterceptor.intercept(event, data)
    if (!securityCheck.pass) {
      throw new Error(securityCheck.message ?? 'Security validation failed')
    }

    const callbacks = Array.from(this.subscribers.get(event as string) ?? [])
    for (const callback of callbacks) {
      await callback(data)
    }
  }

  on<T>(event: GlobalEvent, callback: EventCallback<T>): void {
    const key = event as string
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }

    this.subscribers.get(key)!.add(callback as EventCallback<any>)
  }

  off<T>(event: GlobalEvent, callback: EventCallback<T>): void {
    const key = event as string
    const callbacks = this.subscribers.get(key)
    if (!callbacks) {
      return
    }

    callbacks.delete(callback as EventCallback<any>)
    if (callbacks.size === 0) {
      this.subscribers.delete(key)
    }
  }

  once<T>(event: GlobalEvent, callback: EventCallback<T>): void {
    const wrappedCallback: EventCallback<T> = async (data: T) => {
      this.off(event, wrappedCallback)
      await callback(data)
    }

    this.on(event, wrappedCallback)
  }
}
