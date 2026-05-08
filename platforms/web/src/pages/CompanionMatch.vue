<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <button @click="router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 class="text-lg font-bold text-gray-900">发现旅伴</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-4 py-6">
      <!-- 筛选栏 -->
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

      <!-- 旅伴卡片列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CompanionMatchCard
          v-for="companion in sortedList"
          :key="companion.id"
          :companion="companion"
          @view-profile="viewProfile"
          @toggle-interest="toggleInterest"
          @team-request="handleTeamRequest"
        />
      </div>

      <div v-if="sortedList.length === 0" class="text-center py-16">
        <Search :size="36" class="mx-auto mb-4 text-gray-400" />
        <p class="text-gray-500">暂无符合条件的旅伴</p>
        <button @click="resetFilters" class="mt-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
          清空筛选条件
        </button>
      </div>
    </div>

    <!-- 发起组队模态框 -->
    <div v-if="showTeamModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showTeamModal = false">
      <div class="bg-white w-full max-w-md mx-4 rounded-lg">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="font-bold text-gray-900">发起组队</h3>
          <button @click="showTeamModal = false" class="text-gray-500 hover:text-gray-700"><X :size="20" /></button>
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
import { useRouter } from 'vue-router'
import { Search, X } from 'lucide-vue-next'
import { companions } from '../data/companionMockData'
import CompanionMatchCard from '../components/CompanionMatchCard.vue'

const router = useRouter()

const filters = ref({
  keyword: '',
  budget: '',
  credit: '',
  departure: ''
})

const sortBy = ref('match')

const filteredList = computed(() => {
  return companions.filter(c => {
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
    case 'match':
    default:
      return list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  }
})

const showTeamModal = ref(false)
const teamForm = ref({
  destination: '',
  date: '',
  message: '',
  splitType: 'aa'
})

const resetFilters = () => {
  filters.value = { keyword: '', budget: '', credit: '', departure: '' }
}

const viewProfile = (id: string) => {
  router.push('/companion-profile/' + id)
}

const toggleInterest = (id: string) => {
  const companion = companions.find(c => c.id === id)
  if (companion) {
    companion.interested = !companion.interested
  }
}

const handleTeamRequest = (id: string) => {
  const companion = companions.find(c => c.id === id)
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
