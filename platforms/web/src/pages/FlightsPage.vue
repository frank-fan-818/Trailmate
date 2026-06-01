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
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">出发日期</label>
            <input v-model="depDate" type="date"
              class="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary" />
          </div>
          <div class="flex items-end">
            <button @click="searchFlights" :disabled="loading"
              class="w-full py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 disabled:opacity-60 transition-colors">
              {{ loading ? '搜索中...' : '搜索航班' }}
            </button>
          </div>
        </div>

        <!-- Recent searches -->
        <div v-if="recentSearches.length > 0" class="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
          <span class="text-xs text-gray-500 self-center">最近搜索：</span>
          <button v-for="(s, i) in recentSearches" :key="i"
            @click="applyRecentSearch(s)"
            class="px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-600 hover:bg-gray-200 transition-colors">
            {{ s.dep }} → {{ s.arr }}<span v-if="s.date"> ({{ s.date }})</span>
          </button>
          <button @click="clearRecentSearches" class="px-3 py-1 text-xs text-gray-400 hover:text-gray-600">
            清除
          </button>
        </div>

        <!-- Data source toggle -->
        <div class="flex items-center gap-2 mt-4">
          <span class="text-xs text-gray-500">数据源：</span>
          <button @click="useRealApi = !useRealApi"
            :class="['px-3 py-1 rounded-full text-xs font-medium transition-colors',
              useRealApi ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600']">
            {{ useRealApi ? '实时API' : '模拟数据' }}
          </button>
        </div>
      </div>

      <!-- Results -->
      <div v-if="error" class="text-center py-8 text-red-500">{{ error }}</div>

      <template v-else-if="sortedFlights.length > 0">
        <!-- Sort/Filter bar -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <span class="text-xs text-gray-500">共 <strong>{{ sortedFlights.length }}</strong> 个航班</span>
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-500">排序：</span>
              <select v-model="sortBy"
                class="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-primary">
                <option value="price">价格</option>
                <option value="depTime">出发时间</option>
              </select>
              <button @click="sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'"
                class="px-2 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                {{ sortOrder === 'asc' ? '↑ 升序' : '↓ 降序' }}
              </button>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500">价格：</span>
            <input v-model.number="minPrice" type="number" placeholder="最低"
              class="w-20 px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-primary" />
            <span class="text-xs text-gray-400">-</span>
            <input v-model.number="maxPrice" type="number" placeholder="最高"
              class="w-20 px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-primary" />
            <span class="text-xs text-gray-400">元</span>
          </div>
        </div>

        <div class="space-y-4">
          <div v-for="f in sortedFlights" :key="f.id"
            class="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-6">
                <div class="text-center">
                  <p class="text-xl font-bold text-gray-900">{{ f.depTime }}</p>
                  <p class="text-xs text-gray-500">{{ f.depCity }}</p>
                  <p v-if="f.depDate" class="text-xs text-gray-400 mt-0.5">{{ f.depDate }}</p>
                </div>
                <div class="flex flex-col items-center text-gray-400">
                  <span class="text-xs">✈️ {{ f.flightNo }}</span>
                  <div class="w-20 h-px bg-gray-300 my-1"></div>
                  <span class="text-xs">{{ f.airline }}</span>
                  <span class="text-xs text-gray-500 mt-1">{{ flightDuration(f.depTime, f.arrTime) }}</span>
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
      </template>

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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTrailmateCore } from '../composables/use-trailmate-core'

const router = useRouter()
const { queryFlights, queryFlightsReal } = useTrailmateCore()

const useRealApi = ref(false)
const depCity = ref('')
const arrCity = ref('')
const depDate = ref('')
const flights = ref<any[]>([])
const loading = ref(false)
const searched = ref(false)
const error = ref('')

// Sort/Filter
const sortBy = ref<'price' | 'depTime'>('price')
const sortOrder = ref<'asc' | 'desc'>('asc')
const minPrice = ref<number | null>(null)
const maxPrice = ref<number | null>(null)

// Recent searches
interface RecentSearch { dep: string; arr: string; date?: string }
const recentSearches = ref<RecentSearch[]>([])

const loadRecentSearches = () => {
  try {
    const saved = localStorage.getItem('trailmate_recent_searches')
    if (saved) recentSearches.value = JSON.parse(saved)
  } catch { /* ignore */ }
}

const saveRecentSearch = (dep: string, arr: string, date?: string) => {
  const entry: RecentSearch = { dep, arr, date }
  recentSearches.value = [entry, ...recentSearches.value.filter(s => s.dep !== dep || s.arr !== arr)].slice(0, 5)
  localStorage.setItem('trailmate_recent_searches', JSON.stringify(recentSearches.value))
}

const clearRecentSearches = () => {
  recentSearches.value = []
  localStorage.removeItem('trailmate_recent_searches')
}

const applyRecentSearch = (s: RecentSearch) => {
  depCity.value = s.dep
  arrCity.value = s.arr
  depDate.value = s.date || ''
  searchFlights()
}

// Computed
const sortedFlights = computed(() => {
  let result = [...flights.value]

  // Price filter
  if (minPrice.value !== null && !isNaN(minPrice.value)) {
    result = result.filter(f => f.price >= minPrice.value!)
  }
  if (maxPrice.value !== null && !isNaN(maxPrice.value)) {
    result = result.filter(f => f.price <= maxPrice.value!)
  }

  // Sort
  result.sort((a, b) => {
    let cmp = 0
    if (sortBy.value === 'price') {
      cmp = a.price - b.price
    } else {
      cmp = a.depTime.localeCompare(b.depTime)
    }
    return sortOrder.value === 'asc' ? cmp : -cmp
  })

  return result
})

const flightDuration = (dep: string, arr: string) => {
  const [depH, depM] = dep.split(':').map(Number)
  const [arrH, arrM] = arr.split(':').map(Number)
  let minutes = (arrH * 60 + arrM) - (depH * 60 + depM)
  if (minutes < 0) minutes += 24 * 60
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}小时${m}分钟`
}

const searchFlights = async () => {
  if (!depCity.value.trim() || !arrCity.value.trim()) return
  loading.value = true
  searched.value = true
  error.value = ''
  try {
    const api = useRealApi.value ? queryFlightsReal : queryFlights
    flights.value = await api(depCity.value.trim(), arrCity.value.trim(), depDate.value || undefined)
    if (flights.value.length > 0) {
      saveRecentSearch(depCity.value.trim(), arrCity.value.trim(), depDate.value || undefined)
    }
  } catch (e: any) {
    error.value = e.message || '搜索失败'
  } finally {
    loading.value = false
  }
}

loadRecentSearches()
</script>
