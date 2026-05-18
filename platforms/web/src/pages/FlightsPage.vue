<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-[1100px] mx-auto flex items-center justify-between">
        <button @click="router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <span>←</span> <span>返回</span>
        </button>
        <h1 class="text-lg font-bold text-gray-900">机票查询</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <div class="max-w-[1100px] mx-auto px-8 py-8">
      <!-- Search Form -->
      <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">出发城市</label>
            <input v-model="depCity" placeholder="例如：北京"
              class="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">到达城市</label>
            <input v-model="arrCity" placeholder="例如：青岛"
              class="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary" />
          </div>
          <div class="flex items-end">
            <button @click="searchFlights" :disabled="loading"
              class="w-full py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {{ loading ? '搜索中...' : '搜索航班' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-if="error" class="text-center py-8 text-red-500">{{ error }}</div>

      <div v-else-if="flights.length > 0" class="space-y-4">
        <p class="text-sm text-gray-500 mb-4">共找到 <strong>{{ flights.length }}</strong> 个航班</p>
        <div v-for="f in flights" :key="f.id"
          class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-6">
              <div class="text-center">
                <p class="text-xl font-bold text-gray-900">{{ f.depTime }}</p>
                <p class="text-xs text-gray-500">{{ f.depCity }}</p>
              </div>
              <div class="flex flex-col items-center text-gray-400">
                <span class="text-xs">✈️ {{ f.flightNo }}</span>
                <div class="w-20 h-px bg-gray-300 my-1"></div>
                <span class="text-xs">{{ f.airline }}</span>
              </div>
              <div class="text-center">
                <p class="text-xl font-bold text-gray-900">{{ f.arrTime }}</p>
                <p class="text-xs text-gray-500">{{ f.arrCity }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-2xl font-bold text-primary">¥{{ f.price }}</p>
              <p class="text-xs text-gray-500">{{ f.discount || '' }}</p>
              <p :class="['text-xs mt-1', f.remainingSeats > 5 ? 'text-green-600' : 'text-red-500']">
                {{ f.remainingSeats > 5 ? `余${f.remainingSeats}座` : f.remainingSeats > 0 ? `仅剩${f.remainingSeats}座` : '已售罄' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="!loading && searched" class="text-center py-16">
        <div class="text-5xl mb-4">🛫</div>
        <p class="text-gray-500">未找到匹配航班，试试其他城市</p>
      </div>

      <div v-else-if="!searched" class="text-center py-16">
        <div class="text-5xl mb-4">✈️</div>
        <p class="text-gray-500">输入出发和到达城市，搜索航班</p>
        <p class="text-xs text-gray-400 mt-2">热门航线：北京 → 青岛、北京 → 上海、北京 → 广州</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTrailmateCore } from '../composables/use-trailmate-core'

const router = useRouter()
const { queryFlights } = useTrailmateCore()

const depCity = ref('')
const arrCity = ref('')
const flights = ref<any[]>([])
const loading = ref(false)
const searched = ref(false)
const error = ref('')

const searchFlights = async () => {
  if (!depCity.value.trim() || !arrCity.value.trim()) return
  loading.value = true
  searched.value = true
  error.value = ''
  try {
    flights.value = await queryFlights(depCity.value.trim(), arrCity.value.trim())
  } catch (e: any) {
    error.value = e.message || '搜索失败'
  } finally {
    loading.value = false
  }
}
</script>
