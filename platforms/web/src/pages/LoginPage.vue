<template>
  <div class="login-page">
    <!-- Hero 背景 -->
    <div
      class="fixed top-0 left-0 w-full h-screen -z-10"
      :style="{
        background: `linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.5) 100%), url(${bgImage}) center/cover no-repeat`
      }"
    ></div>

    <!-- 导航栏 -->
    <header class="fixed top-0 w-full z-50 py-6">
      <div class="max-w-[1100px] mx-auto px-8">
        <router-link to="/" class="inline-flex items-center gap-3 -ml-4 group">
          <img src="/logo.jpg" alt="Trailmate" class="w-10 h-10 rounded-lg object-cover" />
          <span class="text-xl font-bold text-white">Trailmate<span class="text-primary">.</span></span>
        </router-link>
      </div>
    </header>

    <!-- 登录卡片 -->
    <div class="min-h-screen flex items-center justify-center px-4 py-20">
      <div class="w-full max-w-[420px] bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10">
        <!-- Logo / 标题 -->
        <div class="text-center mb-8">
          <h1 class="text-2xl font-extrabold text-gray-900">
            {{ isLoginMode ? '欢迎回来' : '加入 Trailmate' }}
          </h1>
          <p class="text-gray-500 text-sm mt-2">
            {{ isLoginMode ? '登录你的账号，继续探索世界' : '创建账号，开启你的智能旅行' }}
          </p>
        </div>

        <!-- 登录/注册 切换 -->
        <div class="flex bg-gray-100 rounded-lg p-1 mb-8">
          <button
            class="flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-200"
            :class="isLoginMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            @click="switchMode('login')"
          >
            登录
          </button>
          <button
            class="flex-1 py-2.5 text-sm font-semibold rounded-md transition-all duration-200"
            :class="!isLoginMode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'"
            @click="switchMode('register')"
          >
            注册
          </button>
        </div>

        <!-- 错误提示 -->
        <div
          v-if="auth.error.value"
          class="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-start gap-2"
        >
          <AlertCircle :size="16" class="flex-shrink-0 mt-0.5" />
          <span>{{ auth.error.value }}</span>
        </div>

        <!-- 登录表单 -->
        <form v-if="isLoginMode" @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
            <div class="relative">
              <Mail :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="loginForm.email"
                type="email"
                placeholder="your@email.com"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <div class="relative">
              <Lock :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="loginForm.password"
                :type="showLoginPwd ? 'text' : 'password'"
                placeholder="输入密码"
                class="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
              <button type="button" @click="showLoginPwd = !showLoginPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Eye v-if="!showLoginPwd" :size="18" />
                <EyeOff v-else :size="18" />
              </button>
            </div>
          </div>
          <button
            type="submit"
            :disabled="auth.isLoading.value"
            class="btn-login w-full py-3 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="auth.isLoading.value" :size="18" class="inline animate-spin mr-2" />
            {{ auth.isLoading.value ? '登录中...' : '登录' }}
          </button>
        </form>

        <!-- 注册表单 -->
        <form v-else @submit.prevent="handleRegister" class="space-y-5">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">用户名</label>
            <div class="relative">
              <User :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="registerForm.name"
                type="text"
                placeholder="你的旅行昵称"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">邮箱</label>
            <div class="relative">
              <Mail :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="registerForm.email"
                type="email"
                placeholder="your@email.com"
                class="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
            <div class="relative">
              <Lock :size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                v-model="registerForm.password"
                :type="showRegPwd ? 'text' : 'password'"
                placeholder="至少6位密码"
                class="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
              />
              <button type="button" @click="showRegPwd = !showRegPwd" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <Eye v-if="!showRegPwd" :size="18" />
                <EyeOff v-else :size="18" />
              </button>
            </div>
          </div>
          <button
            type="submit"
            :disabled="auth.isLoading.value"
            class="btn-login w-full py-3 text-white font-semibold rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Loader2 v-if="auth.isLoading.value" :size="18" class="inline animate-spin mr-2" />
            {{ auth.isLoading.value ? '注册中...' : '创建账号' }}
          </button>
        </form>

        <!-- 分割线 -->
        <div class="relative my-8">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center">
            <span class="bg-white px-3 text-xs text-gray-400">或</span>
          </div>
        </div>

        <!-- 游客模式 -->
        <button
          @click="continueAsGuest"
          class="w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-lg hover:border-primary hover:text-primary transition-all duration-200"
        >
          以游客身份浏览
        </button>

        <p class="text-center text-xs text-gray-400 mt-6">
          登录即表示你同意 Trailmate 的
          <a href="#" class="text-primary hover:underline">服务条款</a>
          和
          <a href="#" class="text-primary hover:underline">隐私政策</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Mail, Lock, Eye, EyeOff, User, AlertCircle, Loader2 } from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const router = useRouter()
const auth = useAuth()

const isLoginMode = ref(true)
const showLoginPwd = ref(false)
const showRegPwd = ref(false)

const bgImage = 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80'

const loginForm = reactive({ email: '', password: '' })
const registerForm = reactive({ name: '', email: '', password: '' })

function switchMode(mode: 'login' | 'register') {
  isLoginMode.value = mode === 'login'
  auth.clearError()
}

async function handleLogin() {
  try {
    await auth.login(loginForm.email, loginForm.password)
    redirectAfterLogin()
  } catch {
    // 错误已由 useAuth 处理
  }
}

async function handleRegister() {
  try {
    await auth.register(registerForm.email, registerForm.password, registerForm.name)
    // 新用户引导：进入 dashboard
    router.replace('/dashboard')
  } catch {
    // 错误已由 useAuth 处理
  }
}

function continueAsGuest() {
  redirectAfterLogin()
}

function redirectAfterLogin() {
  const redirect = route.query.redirect as string
  router.replace(redirect || '/dashboard')
}

onMounted(() => {
  // 如果已登录，直接跳转
  if (auth.isAuthenticated.value) {
    redirectAfterLogin()
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
}

.btn-login {
  background: #FF6B4A;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-login:hover:not(:disabled) {
  background: #E55A3D;
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(255, 107, 74, 0.35);
}

.btn-login:active:not(:disabled) {
  background: #D04A2D;
  transform: translateY(0);
}

/* 输入框聚焦光效 */
input:focus {
  box-shadow: 0 0 0 3px rgba(255, 107, 74, 0.12);
}
</style>
