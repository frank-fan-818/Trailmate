<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <button @click="$emit('back')" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 class="text-lg font-bold text-gray-900">发现旅伴</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-4 py-6">
      <div class="bg-white border border-gray-200 mb-6">
        <div class="p-4 border-b border-gray-100">
          <div class="flex flex-wrap gap-3">
            <div class="flex-1 min-w-[200px]">
              <input
                v-model="filters.keyword"
                type="text"
                placeholder="搜索目的地、昵称..."
                class="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <select v-model="filters.budget" class="px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:border-primary">
              <option value="">全部预算</option>
              <option value="budget">穷游 ¥0-3000</option>
              <option value="medium">经济 ¥3000-8000</option>
              <option value="luxury">品质 ¥8000+</option>
            </select>
            <select v-model="filters.credit" class="px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:border-primary">
              <option value="">全部信用</option>
              <option value="钻石">钻石</option>
              <option value="黄金">黄金</option>
              <option value="白银">白银</option>
            </select>
            <select v-model="filters.departure" class="px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:border-primary">
              <option value="">全部时间</option>
              <option value="week">一周内</option>
              <option value="month">一个月内</option>
              <option value="any">任意时间</option>
            </select>
            <button @click="applyFilters" class="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90">
              应用筛选
            </button>
            <button @click="resetFilters" class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50">
              重置
            </button>
          </div>
        </div>

        <div class="p-4 flex items-center justify-between border-b border-gray-100">
          <div class="text-sm text-gray-500">
            共找到 <span class="font-medium text-gray-900">{{ filteredList.length }}</span> 位匹配旅伴
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">排序：</span>
            <select v-model="sortBy" class="px-2 py-1 border border-gray-300 text-sm rounded focus:outline-none">
              <option value="match">匹配度</option>
              <option value="credit">信用评分</option>
              <option value="rating">用户评分</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="companion in sortedList"
          :key="companion.id"
          class="bg-white border border-gray-200 hover:border-gray-300 hover:shadow transition-all cursor-pointer"
          @click="viewProfile(companion.id)"
        >
          <div class="p-4 flex gap-4">
            <div class="w-16 h-16 bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 flex-shrink-0">
              {{ companion.name.charAt(0) }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-gray-900">{{ companion.name }}</h3>
                  <span class="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">{{ getCreditBadgeText(companion.creditLevel) }}</span>
                </div>
                <span class="text-sm text-gray-500">⭐ {{ companion.creditScore }}</span>
              </div>

              <div class="flex items-center gap-3 text-sm text-gray-600 mb-2">
                <span class="flex items-center gap-1">
                  <span>📍</span> {{ companion.destination }}
                </span>
                <span>{{ companion.departureInfo }}</span>
                <span>{{ companion.travelDays }}天行程</span>
              </div>

              <div class="flex flex-wrap gap-1 mb-3">
                <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{{ companion.budget }}</span>
                <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{{ companion.personality }}</span>
                <span class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">D{{ companion.overlapDays }}重叠</span>
                <span v-if="companion.sameday" class="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded">同日出发</span>
              </div>

              <p class="text-sm text-gray-500 line-clamp-2">{{ companion.bio }}</p>
            </div>
          </div>

          <div class="border-t border-gray-100 px-4 py-3 flex gap-2">
            <button
              @click.stop="toggleInterest(companion.id)"
              :class="[
                'flex-1 py-2 text-sm font-medium rounded border transition-colors',
                companion.interested
                  ? 'bg-orange-50 border-orange-200 text-orange-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              {{ companion.interested ? '❤️ 已感兴趣' : '🤍 感兴趣' }}
            </button>
            <button
              @click.stop="handleTeamRequest(companion.id)"
              class="flex-1 py-2 text-sm font-medium rounded bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              发起组队
            </button>
          </div>
        </div>
      </div>

      <div v-if="sortedList.length === 0" class="text-center py-16">
        <div class="text-4xl mb-4">🔍</div>
        <p class="text-gray-500">暂无符合条件的旅伴</p>
        <button @click="resetFilters" class="mt-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
          清空筛选条件
        </button>
      </div>
    </div>

    <div v-if="showTeamModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showTeamModal = false">
      <div class="bg-white w-full max-w-md mx-4">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="font-bold text-gray-900">发起组队</h3>
          <button @click="showTeamModal = false" class="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">目的地</label>
            <input v-model="teamForm.destination" type="text" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">出发日期</label>
            <input v-model="teamForm.date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">组队说明</label>
            <textarea v-model="teamForm.message" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="介绍一下自己，说明组队原因..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">经费分摊方式</label>
            <select v-model="teamForm.splitType" class="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              <option value="aa">AA制</option>
              <option value="host">邀请方请客</option>
              <option value="custom">自定义</option>
            </select>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 flex gap-3">
          <button @click="showTeamModal = false" class="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50">
            取消
          </button>
          <button @click="submitTeamRequest" class="flex-1 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90">
            发送请求
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'viewProfile', id: string): void
}>()

interface Companion {
  id: string
  name: string
  bio: string
  destination: string
  travelDays: number
  departureInfo: string
  departureDate: string
  budget: string
  budgetType: 'budget' | 'medium' | 'luxury'
  personality: string
  overlapDays: number
  rating: number
  creditScore: string
  creditLevel: '钻石' | '黄金' | '白银'
  totalTrips: number
  interested: boolean
  sameday: boolean
}

const filters = ref({
  keyword: '',
  budget: '',
  credit: '',
  departure: ''
})

const sortBy = ref('match')

const companions = ref<Companion[]>([
  {
    id: '1',
    name: '林小夏',
    bio: '热爱旅行，喜欢探索小众目的地。计划型选手，擅长做详细攻略。摄影爱好者，喜欢记录旅途中的美好瞬间。',
    destination: '云南大理',
    travelDays: 5,
    departureInfo: '3天后出发',
    departureDate: '2026-05-01',
    budget: '品质游',
    budgetType: 'luxury',
    personality: '计划型',
    overlapDays: 4,
    rating: 4.9,
    creditScore: '4.9',
    creditLevel: '黄金',
    totalTrips: 12,
    interested: false,
    sameday: false
  },
  {
    id: '2',
    name: '张明',
    bio: '自由摄影师，四处漂泊。随性而为，享受旅途中的意外惊喜。希望找到志同道合的伙伴一起探索世界。',
    destination: '西藏拉萨',
    travelDays: 7,
    departureInfo: '下周出发',
    departureDate: '2026-05-03',
    budget: '经济游',
    budgetType: 'medium',
    personality: '随性型',
    overlapDays: 3,
    rating: 4.7,
    creditScore: '4.7',
    creditLevel: '白银',
    totalTrips: 8,
    interested: false,
    sameday: false
  },
  {
    id: '3',
    name: '王建国',
    bio: '退休教师，热爱大自然。喜欢慢节奏旅行，享受每一个地方的风景和文化。正在寻找同样喜欢慢旅行的伴友。',
    destination: '四川成都',
    travelDays: 4,
    departureInfo: '5天后出发',
    departureDate: '2026-05-02',
    budget: '穷游',
    budgetType: 'budget',
    personality: '计划型',
    overlapDays: 2,
    rating: 4.8,
    creditScore: '4.8',
    creditLevel: '黄金',
    totalTrips: 5,
    interested: false,
    sameday: true
  },
  {
    id: '4',
    name: '陈思思',
    bio: '互联网从业者，利用假期旅行。喜欢购物和美食，对日本文化很感兴趣。希望找到行程相似的伙伴同行。',
    destination: '日本东京',
    travelDays: 6,
    departureInfo: '本月底出发',
    departureDate: '2026-05-20',
    budget: '品质游',
    budgetType: 'luxury',
    personality: '随性型',
    overlapDays: 5,
    rating: 5.0,
    creditScore: '5.0',
    creditLevel: '钻石',
    totalTrips: 15,
    interested: false,
    sameday: false
  },
  {
    id: '5',
    name: '刘德华',
    bio: '背包客，已经走过30多个国家。喜欢深度游而非打卡式旅行。善于规划行程，可以照顾同行伙伴。',
    destination: '泰国清迈',
    travelDays: 8,
    departureInfo: '2周后出发',
    departureDate: '2026-05-10',
    budget: '经济游',
    budgetType: 'medium',
    personality: '计划型',
    overlapDays: 6,
    rating: 4.6,
    creditScore: '4.6',
    creditLevel: 'silver',
    totalTrips: 30,
    interested: false,
    sameday: false
  },
  {
    id: '6',
    name: '赵小雨',
    bio: '学生党，预算有限但热情满满。第一次独自旅行，希望找到有经验的伙伴带一带。很好相处，不矫情。',
    destination: '厦门鼓浪屿',
    travelDays: 3,
    departureInfo: '下周出发',
    departureDate: '2026-05-04',
    budget: '穷游',
    budgetType: 'budget',
    personality: '随性型',
    overlapDays: 3,
    rating: 4.5,
    creditScore: '4.5',
    creditLevel: 'silver',
    totalTrips: 3,
    interested: false,
    sameday: false
  }
])

const filteredList = computed(() => {
  return companions.value.filter(c => {
    if (filters.value.keyword) {
      const kw = filters.value.keyword.toLowerCase()
      if (!c.name.toLowerCase().includes(kw) && !c.destination.toLowerCase().includes(kw)) {
        return false
      }
    }
    if (filters.value.budget && c.budgetType !== filters.value.budget) {
      return false
    }
    if (filters.value.credit && c.creditLevel !== filters.value.credit) {
      return false
    }
    return true
  })
})

const sortedList = computed(() => {
  const list = [...filteredList.value]
  switch (sortBy.value) {
    case 'credit':
      return list.sort((a, b) => parseFloat(b.creditScore) - parseFloat(a.creditScore))
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating)
    default:
      return list.sort((a, b) => b.overlapDays - a.overlapDays)
  }
})

const showTeamModal = ref(false)
const teamForm = ref({
  destination: '',
  date: '',
  message: '',
  splitType: 'aa'
})

const getCreditBadgeText = (level: string) => {
  switch (level) {
    case '钻石':
      return '钻石'
    case '黄金':
      return '黄金'
    case '白银':
      return '白银'
    default:
      return '白银'
  }
}

const getCreditBadgeClass = (level: string) => {
  switch (level) {
    case '钻石':
      return 'bg-purple-100 text-purple-700'
    case '黄金':
      return 'bg-yellow-100 text-yellow-700'
    case '白银':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

const applyFilters = () => {
  // Filters are reactive, just triggering a re-render
}

const resetFilters = () => {
  filters.value = { keyword: '', budget: '', credit: '', departure: '' }
}

const viewProfile = (id: string) => {
  emit('viewProfile', id)
}

const toggleInterest = (id: string) => {
  const companion = companions.value.find(c => c.id === id)
  if (companion) {
    companion.interested = !companion.interested
  }
}

const handleTeamRequest = (id: string) => {
  const companion = companions.value.find(c => c.id === id)
  if (companion) {
    teamForm.value.destination = companion.destination
    teamForm.value.date = companion.departureDate
    teamForm.value.message = `你好，我想和你一起去${companion.destination}...`
    showTeamModal.value = true
  }
}

const submitTeamRequest = () => {
  alert('组队请求已发送！对方确认后你会收到通知。')
  showTeamModal.value = false
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>