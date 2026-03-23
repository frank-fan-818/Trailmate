<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between">
      <button 
        @click="$emit('back')"
        class="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span>←</span>
        <span>返回</span>
      </button>
      
      <h1 class="text-xl font-bold text-gray-900">智能行程规划</h1>
    </header>

    <!-- 主内容区 -->
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <!-- 输入区域 -->
        <div class="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">描述你的旅行计划</h2>
          <textarea
            v-model="userInput"
            placeholder="例如：我想去青岛玩 4 天，带孩子，预算 5000 元..."
            class="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            @click="handleGenerate"
            :disabled="!userInput.trim() || isLoading"
            class="mt-4 w-full px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isLoading ? '生成中...' : '生成行程方案' }}
          </button>
        </div>

        <!-- 结果展示区 -->
        <div v-if="plans.length > 0" class="space-y-4">
          <h2 class="text-lg font-bold text-gray-900 mb-4">生成的行程方案</h2>
          
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">{{ plan.name }}</h3>
                <p class="text-gray-600">{{ plan.description }}</p>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {{ plan.days }}天行程
              </span>
            </div>
            
            <div class="flex items-center gap-6 text-sm text-gray-600">
              <div class="flex items-center gap-2">
                <span>💰</span>
                <span>预计花费 ¥{{ plan.cost }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span>📍</span>
                <span>{{ plan.destinations.join('、') }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div
          v-else-if="!isLoading"
          class="bg-white rounded-xl shadow-md p-12 text-center"
        >
          <div class="text-6xl mb-4">🗺️</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">开始你的智能旅行规划</h3>
          <p class="text-gray-600">
            在上方输入你的旅行计划，AI 将为你生成多套行程方案
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'back'): void
}>()

const userInput = ref('')
const isLoading = ref(false)
const plans = ref<any[]>([])

const handleGenerate = async () => {
  if (!userInput.value.trim()) return
  
  isLoading.value = true
  
  // 模拟生成行程
  setTimeout(() => {
    plans.value = [
      {
        id: '1',
        name: '青岛海滨休闲游',
        description: '适合家庭出游，包含主要景点和美食体验',
        days: 4,
        cost: 4500,
        destinations: ['栈桥', '八大关', '崂山', '啤酒博物馆']
      },
      {
        id: '2',
        name: '青岛深度文化游',
        description: '深度体验青岛历史文化，包含博物馆和古建筑',
        days: 4,
        cost: 3800,
        destinations: ['德国风情街', '小鱼山', '信号山', '海军博物馆']
      }
    ]
    isLoading.value = false
  }, 2000)
}
</script>
