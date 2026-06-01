import { createClient } from '@supabase/supabase-js'
import type { ICore } from '../../../core/interfaces/core.interface.ts'

let supabaseClient: ReturnType<typeof createClient> | null = null

function createSupabaseClient(url: string, anonKey: string): ReturnType<typeof createClient> {
  return createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  })
}

function readEnvConfig(): { url: string; anonKey: string } | null {
  // 必须使用 import.meta.env.VITE_X 直接访问，
  // 否则 Vite 生产构建时无法静态内联环境变量
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  if (!url || !anonKey) return null
  return { url, anonKey }
}

/**
 * 通过 Core 配置初始化（适配器插件加载时调用）
 */
export function initSupabaseClient(core: ICore) {
  const url = core.config.get('SUPABASE_URL')
  const anonKey = core.config.get('SUPABASE_ANON_KEY')

  if (!url || !anonKey) {
    throw new Error('Supabase配置缺失，请检查.env文件中的SUPABASE_URL和SUPABASE_ANON_KEY配置')
  }

  supabaseClient = createSupabaseClient(url, anonKey)
  return supabaseClient
}

/**
 * 获取已初始化的 Supabase 客户端（未初始化时抛错）
 */
export function getSupabaseClient() {
  if (!supabaseClient) {
    throw new Error('Supabase客户端未初始化，请先调用initSupabaseClient')
  }
  return supabaseClient
}

/**
 * 安全获取 Supabase 客户端：
 * - 已初始化时直接返回
 * - 未初始化但环境变量已配置时自动创建
 * - 未配置时返回 null
 */
export function getSupabaseClientSafe(): ReturnType<typeof createClient> | null {
  if (supabaseClient) return supabaseClient

  const config = readEnvConfig()
  if (!config) return null

  supabaseClient = createSupabaseClient(config.url, config.anonKey)
  return supabaseClient
}
