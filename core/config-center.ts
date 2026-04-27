export interface AppConfig {
  NODE_ENV: 'development' | 'demo' | 'production'
  USE_MOCK: boolean
  API_BASE_URL: string
  MAP_KEY?: string
  AI_API_KEY?: string
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
}

export class ConfigCenter {
  private config: Map<keyof AppConfig, any> = new Map()
  private requiredKeys: Array<keyof AppConfig> = ['NODE_ENV', 'API_BASE_URL']

  constructor(defaultConfig: Partial<AppConfig> = {}) {
    const env = this.loadEnv()
    const mergedConfig = {
      NODE_ENV: 'development',
      USE_MOCK: true,
      API_BASE_URL: 'https://api.trailmate.example.com',
      ...env,
      ...defaultConfig
    } as AppConfig
    this.validateConfig(mergedConfig)

    Object.entries(mergedConfig).forEach(([key, value]) => {
      this.config.set(key as keyof AppConfig, value)
    })
  }

  /**
   * 加载环境变量，兼容Node.js和浏览器双环境
   * 核心层不处理dotenv加载，由外层调用方负责加载.env文件
   */
  private loadEnv(): Partial<AppConfig> {
    let env: Record<string, any> = {}

    if (typeof import.meta !== 'undefined' && 'env' in import.meta) {
      env = (import.meta as any).env as Record<string, any>
    } else if (typeof process !== 'undefined' && process.env) {
      env = process.env
    }

    // 统一去除VITE_前缀，自动转换类型
    return Object.entries(env).reduce((acc, [key, value]) => {
      const cleanKey = key.replace(/^VITE_/, '') as keyof AppConfig

      // 自动转换布尔类型
      if (value === 'true') value = true
      if (value === 'false') value = false
      // 自动转换数字类型
      if (!isNaN(Number(value))) value = Number(value)

      acc[cleanKey] = value
      return acc
    }, {} as Partial<AppConfig>)
  }

  /**
   * 校验必填配置项
   */
  private validateConfig(config: AppConfig): void {
    const missingKeys = this.requiredKeys.filter(key => config[key] === undefined)
    if (missingKeys.length > 0) {
      throw new Error(`配置错误，缺少必填配置项：${missingKeys.join(', ')}`)
    }
  }

  set(key: keyof AppConfig, value: any): void {
    this.config.set(key, value)
  }

  get<T extends keyof AppConfig>(key: T, defaultValue?: AppConfig[T]): AppConfig[T] | undefined {
    return this.config.get(key) ?? defaultValue
  }
}