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
    // Vite statically inlines import.meta.env.VITE_* at build time.
    // Must use direct access — no dynamic property access.
    const env: Partial<AppConfig> = {}

    const _nodeEnv = import.meta.env.VITE_NODE_ENV
    const _useMock = import.meta.env.VITE_USE_MOCK
    const _apiBaseUrl = import.meta.env.VITE_API_BASE_URL
    const _mapKey = import.meta.env.VITE_MAP_KEY
    const _aiApiKey = import.meta.env.VITE_AI_API_KEY
    const _supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const _supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    if (_nodeEnv !== undefined) env.NODE_ENV = _nodeEnv as any
    if (_useMock !== undefined) env.USE_MOCK = _useMock === 'true'
    if (_apiBaseUrl !== undefined) env.API_BASE_URL = _apiBaseUrl
    if (_mapKey !== undefined) env.MAP_KEY = _mapKey
    if (_aiApiKey !== undefined) env.AI_API_KEY = _aiApiKey
    if (_supabaseUrl !== undefined) env.SUPABASE_URL = _supabaseUrl
    if (_supabaseAnonKey !== undefined) env.SUPABASE_ANON_KEY = _supabaseAnonKey

    return env
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