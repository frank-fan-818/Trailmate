<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-[1100px] mx-auto flex items-center justify-between">
        <button @click="router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 class="text-lg font-bold text-gray-900">我的行程</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <div class="max-w-[1100px] mx-auto px-8 py-8">
      <!-- Empty state -->
      <div v-if="trips.length === 0" class="text-center py-20">
        <div class="text-6xl mb-6">🗺️</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">还没有行程计划</h2>
        <p class="text-gray-500 mb-8">去行程规划页面生成你的第一个旅行计划吧</p>
        <button
          @click="router.push('/planner')"
          class="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
        >
          开始规划
        </button>
      </div>

      <!-- Trip cards -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(trip, idx) in trips"
          :key="idx"
          @click="viewTrip(trip)"
          class="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
        >
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-gray-900">{{ trip.name }}</h3>
              <p class="text-sm text-gray-500 mt-0.5">{{ trip.description }}</p>
            </div>
          </div>

          <div class="flex items-center gap-2 mb-4">
            <span v-for="tag in (trip.tags || [])" :key="tag"
              class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
              {{ tag }}
            </span>
          </div>

          <div class="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
            <span>{{ trip.totalDays }} 天行程</span>
            <span class="font-medium text-primary">¥{{ trip.totalCost?.toLocaleString?.() || trip.totalCost }}</span>
          </div>

          <div class="mt-2 text-xs text-gray-400">
            {{ formatDate(trip.savedAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { loadSavedPlans } from '../composables/useItineraryPlanner'

const router = useRouter()
const trips = ref<any[]>([])

onMounted(() => {
  trips.value = loadSavedPlans()
})

const viewTrip = (_trip: any) => {
  router.push('/planner')
}

const formatDate = (ts: number) => {
  if (!ts) return ''
  const d = new Date(ts)
  return `${d.getMonth() + 1}月${d.getDate()}日 ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>
