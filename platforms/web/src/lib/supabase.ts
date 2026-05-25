import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/**
 * 懒初始化 Supabase 客户端（auth + profiles）。
 * 读取 Vite 环境变量 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。
 * 未配置时返回 null，auth 自动降级为 localStorage 模式。
 */
export function getSupabase(): SupabaseClient | null {
  if (client) return client

  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    console.info('[Trailmate] Supabase 环境变量未配置，使用本地存储模式')
    return null
  }

  client = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })

  return client
}
