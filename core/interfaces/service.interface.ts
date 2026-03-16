export type ServiceHandler = (...args: any[]) => any | Promise<any>

export interface IServiceRegistry {
  register(serviceName: string, handler: ServiceHandler, options?: { fallback?: boolean }): void
  call<T = any>(serviceName: string, ...args: any[]): Promise<T>
}