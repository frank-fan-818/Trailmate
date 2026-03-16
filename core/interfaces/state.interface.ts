export type StateCallback<T = any> = (newVal: T, oldVal: T | undefined) => void

export interface IStateManager {
  set<T>(key: string, value: T): void
  get<T>(key: string): T | undefined
  subscribe<T>(key: string, callback: StateCallback<T>): () => void
  unsubscribe(key: string, callback: StateCallback): void
}