<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-[1100px] mx-auto flex items-center justify-between">
        <button @click="router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <span>←</span> <span>返回</span>
        </button>
        <h1 class="text-lg font-bold text-gray-900">我的行程</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <div class="max-w-[1100px] mx-auto px-8 py-8">
      <!-- Tab switcher -->
      <div class="flex gap-2 mb-6">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-5 py-2.5 text-sm font-medium rounded-xl transition-colors',
            activeTab === tab.id
              ? 'bg-primary text-white'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- ===== Tab 1: 行程计划 ===== -->
      <template v-if="activeTab === 'plans'">
        <div v-if="trips.length === 0" class="text-center py-20">
          <div class="text-6xl mb-6">🗺️</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">还没有行程计划</h2>
          <p class="text-gray-500 mb-8">去行程规划页面生成你的第一个旅行计划吧</p>
          <button @click="router.push('/planner')" class="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors">
            开始规划
          </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(trip, idx) in trips" :key="idx" @click="viewTrip(trip)"
            class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer">
            <h3 class="text-lg font-bold text-gray-900 mb-1">{{ trip.name }}</h3>
            <p class="text-sm text-gray-500 mb-3">{{ trip.description }}</p>
            <div class="flex items-center gap-2 mb-3">
              <span v-for="tag in (trip.tags || [])" :key="tag" class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">{{ tag }}</span>
            </div>
            <div class="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
              <span>{{ trip.totalDays }} 天行程</span>
              <span class="font-medium text-primary">¥{{ trip.totalCost?.toLocaleString?.() || trip.totalCost }}</span>
            </div>
            <div class="mt-2 text-xs text-gray-400">{{ formatDate(trip.savedAt) }}</div>
          </div>
        </div>
      </template>

      <!-- ===== Tab 2: 对话历史 ===== -->
      <template v-if="activeTab === 'chats'">
        <div v-if="chatHistory.length === 0" class="text-center py-20">
          <div class="text-6xl mb-6">💬</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-4">还没有对话记录</h2>
          <p class="text-gray-500 mb-8">去 AI 管家或行程规划页面开始对话吧</p>
          <div class="flex gap-3 justify-center">
            <button @click="router.push('/concierge')" class="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors">
              AI 管家
            </button>
            <button @click="router.push('/planner')" class="px-6 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              行程规划
            </button>
          </div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="chat in chatHistory" :key="chat.id" @click="openChat(chat)"
            class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer">
            <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{{ chat.title }}</h3>
            <p class="text-sm text-gray-500 mb-1">{{ chat.messages[1]?.content?.slice(0, 60) || '（无内容）' }}...</p>
            <div class="flex items-center justify-between text-sm text-gray-400 border-t border-gray-100 pt-3 mt-3">
              <span>{{ chat.date }}</span>
              <span>{{ chat.messages.length }} 条消息</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loadSavedPlans } from '../composables/useItineraryPlanner'
import type { ChatSession } from '../composables/useItineraryPlanner'

const router = useRouter()
const activeTab = ref('plans')
const trips = ref<any[]>([])
const chatHistory = ref<ChatSession[]>([])

const tabs = [
  { id: 'plans', label: '行程计划' },
  { id: 'chats', label: '对话历史' }
]

onMounted(() => {
  trips.value = loadSavedPlans()
  loadChatHistory()
})

const loadChatHistory = () => {
  try {
    const raw = localStorage.getItem('trailmate-chat-history')
    if (raw) chatHistory.value = JSON.parse(raw)
  } catch { /* silent */ }
}

const viewTrip = (trip: any) => router.push({ path: '/planner', query: { planName: trip.name } })

const openChat = (chat: ChatSession) => {
  router.push({ path: '/planner', query: { chatId: chat.id } })
}

const formatDate = (ts: number) => {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>
