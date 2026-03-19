import { createClient } from '@supabase/supabase-js'
import type { ICore } from '../../../core/interfaces/core.interface.ts'

let supabaseClient: ReturnType<typeof createClient> | null = null

export function initSupabaseClient(core: ICore) {
  const url = core.config.get('SUPABASE_URL')
  const anonKey = core.config.get('SUPABASE_ANON_KEY')

  if (!url || !anonKey) {
    throw new Error('Supabase配置缺失，请检查.env文件中的SUPABASE_URL和SUPABASE_ANON_KEY配置')
  }

  supabaseClient = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  })

  return supabaseClient
}

export function getSupabaseClient() {
  if (!supabaseClient) {
    throw new Error('Supabase客户端未初始化，请先调用initSupabaseClient')
  }
  return supabaseClient
}
