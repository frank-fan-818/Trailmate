export class DIContainer {
  private services: Map<string, any> = new Map()

  register<T>(token: string, instance: T): void {
    this.services.set(token, instance)
  }

  resolve<T>(token: string): T {
    const instance = this.services.get(token)
    if (!instance) {
      throw new Error(`服务${token}未注册`)
    }
    return instance as T
  }
}