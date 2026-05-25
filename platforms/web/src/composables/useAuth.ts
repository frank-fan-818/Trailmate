import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getSupabase } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

const STORAGE_KEY = 'trailmate_user'

const supabase: SupabaseClient | null = getSupabase()

// ── 全局共享响应式状态 ──
const currentUser = ref<User | null>(null)
const isAuthReady = ref(false)
const isAuthenticated = computed(() => currentUser.value !== null)

// ── localStorage fallback ──
function loadFromStorage(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveToStorage(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

// ── Supabase: 获取 profile ──
async function fetchProfile(userId: string): Promise<{ name: string; avatar?: string } | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('name, avatar')
      .eq('id', userId)
      .single()

    if (error) {
      // PGRST116: 无数据; 42P01: 表不存在
      if (error.code === 'PGRST116' || error.code === '42P01') return null
      console.warn('[Trailmate] 获取用户档案失败:', error.message)
      return null
    }
    return data
  } catch {
    return null
  }
}

function buildUser(supabaseUser: { id: string; email?: string }, profile?: { name?: string; avatar?: string } | null): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: profile?.name || (supabaseUser.email ? supabaseUser.email.split('@')[0] : '旅行者'),
    avatar: profile?.avatar,
  }
}

// ── 初始化：恢复会话 + 监听变更 ──
async function initAuth(): Promise<void> {
  if (!supabase) {
    currentUser.value = loadFromStorage()
    isAuthReady.value = true
    return
  }

  try {
    // 恢复已有的 Supabase 会话
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const profile = await fetchProfile(session.user.id)
      currentUser.value = buildUser(session.user, profile)
    }
  } catch (e) {
    console.warn('[Trailmate] 恢复认证会话失败:', e)
  }

  // 监听后续的登录/登出事件
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const profile = await fetchProfile(session.user.id)
      currentUser.value = buildUser(session.user, profile)
    } else {
      currentUser.value = null
    }
  })

  isAuthReady.value = true
}

// 模块加载时立即开始初始化
initAuth()

// ── composable ──
export function useAuth() {
  const router = useRouter()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function login(email: string, password: string): Promise<User> {
    isLoading.value = true
    error.value = null

    try {
      if (!email || !password) throw new Error('请输入邮箱和密码')
      if (password.length < 6) throw new Error('密码长度不能少于6位')

      if (!supabase) {
        // ── 本地 fallback ──
        await new Promise((r) => setTimeout(r, 800))
        const user: User = { id: 'user-' + Date.now(), email, name: email.split('@')[0] }
        currentUser.value = user
        saveToStorage(user)
        isLoading.value = false
        return user
      }

      // ── Supabase 登录 ──
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        const msg = signInError.message
        if (msg.includes('Invalid login') || msg.includes('invalid')) {
          throw new Error('邮箱或密码错误')
        }
        throw new Error(msg)
      }

      const supabaseUser = data.user!
      const profile = await fetchProfile(supabaseUser.id)
      const user = buildUser(supabaseUser, profile)

      currentUser.value = user
      isLoading.value = false
      return user
    } catch (e) {
      error.value = e instanceof Error ? e.message : '登录失败'
      isLoading.value = false
      throw e
    }
  }

  async function register(email: string, password: string, name: string): Promise<User> {
    isLoading.value = true
    error.value = null

    try {
      if (!email || !password || !name) throw new Error('请填写所有字段')
      if (password.length < 6) throw new Error('密码长度不能少于6位')

      if (!supabase) {
        // ── 本地 fallback ──
        await new Promise((r) => setTimeout(r, 800))
        const user: User = { id: 'user-' + Date.now(), email, name }
        currentUser.value = user
        saveToStorage(user)
        isLoading.value = false
        return user
      }

      // ── Supabase 注册 ──
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) throw new Error(signUpError.message)

      if (!data.session) {
        throw new Error('注册成功！请检查邮箱并点击确认链接完成验证。')
      }

      const supabaseUser = data.user!

      // 写入 profile 表
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({ id: supabaseUser.id, name })

      if (profileError) {
        // 42P01: profiles 表不存在（迁移未执行）
        if (profileError.code !== '42P01') {
          console.warn('[Trailmate] 创建用户档案失败:', profileError.message)
        }
      }

      const user: User = { id: supabaseUser.id, email: supabaseUser.email!, name }

      currentUser.value = user
      isLoading.value = false
      return user
    } catch (e) {
      error.value = e instanceof Error ? e.message : '注册失败'
      isLoading.value = false
      throw e
    }
  }

  async function logout(): Promise<void> {
    if (supabase) {
      await supabase.auth.signOut().catch(() => {})
    }
    currentUser.value = null
    saveToStorage(null)
    await router.push('/')
  }

  function clearError(): void {
    error.value = null
  }

  function loginWithRedirect(redirectTo?: string): void {
    const target = redirectTo || router.currentRoute.value.fullPath
    router.push({ path: '/login', query: { redirect: target } })
  }

  return {
    user: currentUser,
    isAuthenticated,
    isAuthReady,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    loginWithRedirect,
  }
}
