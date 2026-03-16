import type { IStateManager, StateCallback } from './interfaces/state.interface'

export class StateManager implements IStateManager {
  private state: Map<string, any> = new Map()
  private subscribers: Map<string, Set<StateCallback>> = new Map()

  set<T>(key: string, value: T): void {
    const oldVal = this.state.get(key)
    if (oldVal === value) return
    
    this.state.set(key, value)
    this.notifySubscribers(key, value, oldVal)
  }

  get<T>(key: string): T | undefined {
    return this.state.get(key)
  }

  subscribe<T>(key: string, callback: StateCallback<T>): () => void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    this.subscribers.get(key)!.add(callback as StateCallback)

    return () => this.unsubscribe(key, callback as StateCallback)
  }

  unsubscribe(key: string, callback: StateCallback): void {
    const callbacks = this.subscribers.get(key)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.subscribers.delete(key)
      }
    }
  }

  private notifySubscribers<T>(key: string, newVal: T, oldVal: T | undefined): void {
    const callbacks = this.subscribers.get(key)
    if (callbacks) {
      callbacks.forEach(cb => cb(newVal, oldVal))
    }
  }
}