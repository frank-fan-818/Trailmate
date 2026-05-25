import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

const STORAGE_KEY = 'trailmate_user'

// 全局共享状态，确保跨组件响应式
const currentUser = ref<User | null>(loadUserFromStorage())
const isAuthenticated = computed(() => currentUser.value !== null)

function loadUserFromStorage(): User | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveUserToStorage(user: User | null): void {
  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function useAuth() {
  const router = useRouter()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function login(email: string, password: string): Promise<User> {
    isLoading.value = true
    error.value = null

    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 800))

    // 简单验证
    if (!email || !password) {
      error.value = '请输入邮箱和密码'
      isLoading.value = false
      throw new Error(error.value)
    }

    if (password.length < 6) {
      error.value = '密码长度不能少于6位'
      isLoading.value = false
      throw new Error(error.value)
    }

    const user: User = {
      id: 'user-' + Date.now(),
      email,
      name: email.split('@')[0] || '旅行者',
    }

    currentUser.value = user
    saveUserToStorage(user)
    isLoading.value = false
    return user
  }

  async function register(email: string, password: string, name: string): Promise<User> {
    isLoading.value = true
    error.value = null

    await new Promise((r) => setTimeout(r, 800))

    if (!email || !password || !name) {
      error.value = '请填写所有字段'
      isLoading.value = false
      throw new Error(error.value)
    }

    if (password.length < 6) {
      error.value = '密码长度不能少于6位'
      isLoading.value = false
      throw new Error(error.value)
    }

    const user: User = {
      id: 'user-' + Date.now(),
      email,
      name,
    }

    currentUser.value = user
    saveUserToStorage(user)
    isLoading.value = false
    return user
  }

  async function logout(): Promise<void> {
    currentUser.value = null
    saveUserToStorage(null)
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
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
    loginWithRedirect,
  }
}
