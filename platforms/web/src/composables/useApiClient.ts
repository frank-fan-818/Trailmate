import { getSupabaseClientSafe } from '@trailmate/adapters/supabase-adapter/src/client'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3456'

// Cache the access token to avoid calling supabase.auth.getSession() on every API request.
// Tokens are stable within a session (refreshed automatically by the Supabase SDK),
// so a 5-minute TTL is safe and sufficient.
let cachedToken: string | null = null
let cachedTokenExpiry: number = 0

/**
 * 带认证的 API 客户端
 * 自动从 Supabase session 获取 access_token 并附加到 Authorization 头
 */
export function useApiClient() {
  const supabase = getSupabaseClientSafe()

  async function getToken(): Promise<string | null> {
    if (!supabase) return null

    // Return cached token if still within the 5-minute TTL
    if (cachedToken && Date.now() < cachedTokenExpiry) {
      return cachedToken
    }

    const { data: { session } } = await supabase.auth.getSession()
    cachedToken = session?.access_token ?? null
    cachedTokenExpiry = cachedToken ? Date.now() + 5 * 60 * 1000 : 0
    return cachedToken
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

  async function put<T = any>(path: string, body?: unknown): Promise<T> {
    const url = `${API_BASE}${path}`
    const res = await fetch(url, {
      method: 'PUT',
      headers: await authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '请求失败' }))
      throw new Error(err.error || `请求失败 (${res.status})`)
    }

    return res.json()
  }

  async function del<T = any>(path: string): Promise<T> {
    const url = `${API_BASE}${path}`
    const res = await fetch(url, {
      method: 'DELETE',
      headers: await authHeaders(),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '请求失败' }))
      throw new Error(err.error || `请求失败 (${res.status})`)
    }

    return res.json()
  }

  async function upload<T = any>(path: string, formData: FormData): Promise<T> {
    const url = `${API_BASE}${path}`
    const headers = await authHeaders()
    delete headers['Content-Type']
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: '请求失败' }))
      throw new Error(err.error || `请求失败 (${res.status})`)
    }

    return res.json()
  }

  return { post, get, getToken, put, del, upload }
}
