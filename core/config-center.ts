export class ConfigCenter {
  private config: Map<string, any> = new Map()

  constructor(defaultConfig: Record<string, any> = {}) {
    Object.entries(defaultConfig).forEach(([key, value]) => {
      this.config.set(key, value)
    })
  }

  set(key: string, value: any): void {
    this.config.set(key, value)
  }

  get<T>(key: string, defaultValue?: T): T | undefined {
    return this.config.get(key) ?? defaultValue
  }
}