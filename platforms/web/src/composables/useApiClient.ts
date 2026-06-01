import { getSupabaseClientSafe } from '@trailmate/adapters/supabase-adapter/src/client'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3456'

/**
 * 带认证的 API 客户端
 * 自动从 Supabase session 获取 access_token 并附加到 Authorization 头
 */
export function useApiClient() {
  const supabase = getSupabaseClientSafe()

  async function getToken(): Promise<string | null> {
    if (!supabase) return null
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token ?? null
  }

  async function authHeaders(): Promise<Record<string, string>> {
    const token = await getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  async function post<T = any>(path: string, body?: unknown): Promise<T> {
    const url = `${API_BASE}${path}`
    const res = await fetch(url, {
      method: 'POST',
      headers: await authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '请求失败' }))
      throw new Error(err.error || `请求失败 (${res.status})`)
    }

    return res.json()
  }

  async function get<T = any>(path: string): Promise<T> {
    const url = `${API_BASE}${path}`
    const res = await fetch(url, {
      method: 'GET',
      headers: await authHeaders(),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '请求失败' }))
      throw new Error(err.error || `请求失败 (${res.status})`)
    }

    return res.json()
  }

  return { post, get, getToken }
}
