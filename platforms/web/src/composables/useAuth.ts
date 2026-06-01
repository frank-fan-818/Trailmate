import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getSupabaseClientSafe } from '@trailmate/adapters/supabase-adapter/src/client'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

const supabase = getSupabaseClientSafe()

// ── 全局共享响应式状态 ──
const currentUser = ref<User | null>(null)
const isAuthReady = ref(false)
const isAuthenticated = computed(() => currentUser.value !== null)

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
    // Supabase 未配置，跳过认证恢复
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

  function validateCredentials(email: string, password: string, name?: string): string | null {
    if (!email || !password) return '请输入邮箱和密码'
    if (name !== undefined && !name) return '请填写用户名'

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return '请输入有效的邮箱地址'

    // Password strength: min 8 chars, at least 1 letter and 1 number
    if (password.length < 8) return '密码长度不能少于8位'
    if (!/[a-zA-Z]/.test(password)) return '密码必须包含至少一个字母'
    if (!/[0-9]/.test(password)) return '密码必须包含至少一个数字'

    return null // no error
  }

  async function login(email: string, password: string): Promise<User> {
    isLoading.value = true
    error.value = null

    try {
      const loginError = validateCredentials(email, password)
      if (loginError) throw new Error(loginError)

      if (!supabase) {
        throw new Error('认证服务未配置，请联系管理员')
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

  async function register(email: string, password: string, name: string): Promise<User | null> {
    isLoading.value = true
    error.value = null

    try {
      const registerError = validateCredentials(email, password, name)
      if (registerError) throw new Error(registerError)

      if (!supabase) {
        throw new Error('认证服务未配置，请联系管理员')
      }

      // ── Supabase 注册 ──
      // 将 name 写入 user_metadata，数据库触发器会自动创建 profiles 记录
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      })
      if (signUpError) throw new Error(signUpError.message)

      // 开启了邮箱确认：用户已创建（auth.users + profiles 由触发器自动写入），
      // 但无 session，用户需去邮箱点击确认链接
      if (!data.session) {
        error.value = '注册成功！请检查邮箱并点击确认链接完成验证。'
        isLoading.value = false
        return null
      }

      // 无需邮箱确认：直接登录
      const supabaseUser = data.user!
      const profile = await fetchProfile(supabaseUser.id)
      const user = buildUser(supabaseUser, profile)

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
