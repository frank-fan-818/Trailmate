<template>
  <div class="min-h-screen bg-white">
    <!-- 顶部导航 -->
    <header class="fixed top-0 w-full z-50 py-6 transition-all duration-300 bg-white/85 backdrop-blur-md shadow-md text-gray-900">
      <div class="max-w-[1100px] mx-auto px-8 flex justify-between items-center relative">
        <div class="flex items-center gap-3">
          <button
            @click="router.back()"
            class="flex items-center gap-2 px-2 text-gray-700 hover:text-primary transition-colors"
          >
            <ArrowLeft :size="20" />
            <span>返回</span>
          </button>
        </div>

        <h1 class="text-xl font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">智能行程规划</h1>

        <div class="flex items-center gap-6">
          <button
            @click="startNewChat"
            class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition-colors"
          >
            <Plus :size="20" />
            <span class="hidden sm:inline">新对话</span>
          </button>
          <button
            @click="showHistorySidebar = true"
            class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition-colors"
          >
            <ClipboardList :size="18" />
            <span class="hidden sm:inline">历史记录</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 历史记录侧边栏 -->
    <ItineraryPlannerSidebar
      v-if="showHistorySidebar"
      :chat-history="chatHistory"
      :current-session-id="currentSessionId"
      @close="showHistorySidebar = false"
      @clear-history="clearHistory(); showHistorySidebar = false"
      @load-chat="(chat) => { loadChat(chat); showHistorySidebar = false; setTimeout(() => extractPlanFromChat(), 300) }"
    />

    <!-- 地点详情抽屉 -->
    <Teleport to="body">
      <div
        v-if="showPlaceDrawer"
        class="fixed inset-0 z-50"
        @click.self="closePlaceDrawer"
      >
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black/30" @click="closePlaceDrawer" />

        <!-- 右侧抽屉 -->
        <div class="absolute right-0 top-0 bottom-0 w-96 bg-white shadow-xl overflow-hidden flex flex-col animate-slide-in">
          <!-- 抽屉头部 -->
          <div class="h-16 px-6 flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ selectedPlace?.icon || '📍' }}</span>
              <div>
                <h2 class="text-lg font-bold text-gray-900">{{ selectedPlace?.name || '地点详情' }}</h2>
                <p class="text-sm text-gray-500">{{ selectedPlace?.category || '景点' }}</p>
              </div>
            </div>
            <button
              @click="closePlaceDrawer"
              class="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X :size="20" />
            </button>
          </div>

          <!-- 标签页 -->
          <div class="flex border-b border-gray-200">
            <button
              v-for="tab in placeTabs"
              :key="tab.id"
              @click="activePlaceTab = tab.id"
              class="flex-1 px-4 py-3 text-sm font-medium transition-colors"
              :class="activePlaceTab === tab.id 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50' 
                : 'text-gray-500 hover:text-gray-700'"
            >
              {{ tab.icon }} {{ tab.label }}
            </button>
          </div>

          <!-- 抽屉内容 -->
          <div class="flex-1 overflow-y-auto p-6">
            <!-- 景点详情 -->
            <div v-if="activePlaceTab === 'detail'" class="space-y-6">
              <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5">
                <div class="flex items-center gap-2 mb-3">
                  <span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    ⭐ {{ selectedPlace?.rating || '4.5' }}
                  </span>
                  <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    📍 {{ selectedPlace?.distance || '市中心' }}
                  </span>
                </div>
                <p class="text-gray-700 leading-relaxed">
                  {{ selectedPlace?.description || selectedPlace?.content || '这是一个非常值得一去的景点，周围配套设施完善，适合各类游客参观游览。' }}
                </p>
              </div>

              <div class="space-y-3">
                <h4 class="font-semibold text-gray-900 flex items-center gap-2">
                  📍 地址信息
                </h4>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-gray-700">{{ selectedPlace?.address || '北京市朝阳区某街道' }}</p>
                  <p class="text-sm text-gray-500 mt-1">距市中心约 {{ selectedPlace?.distance || '5' }} 公里</p>
                </div>
              </div>

              <div class="space-y-3">
                <h4 class="font-semibold text-gray-900 flex items-center gap-2">
                  ⏰ 开放时间
                </h4>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-gray-700">{{ selectedPlace?.openTime || '09:00 - 18:00' }}</p>
                  <p class="text-sm text-orange-500 mt-1">⚠️ 当前可能需要排队，建议提前规划</p>
                </div>
              </div>

              <div class="space-y-3">
                <h4 class="font-semibold text-gray-900 flex items-center gap-2">
                  💰 门票价格
                </h4>
                <div class="bg-gray-50 rounded-lg p-4">
                  <p class="text-xl font-bold text-gray-900">¥{{ selectedPlace?.ticket || '60' }}</p>
                  <p class="text-sm text-gray-500 mt-1">成人票，具体价格以景区当日公示为准</p>
                </div>
              </div>
            </div>

            <!-- 美食推荐 -->
            <div v-else-if="activePlaceTab === 'food'" class="space-y-4">
              <div v-if="foodsLoading" class="text-center py-6 text-gray-500">加载中...</div>
              <div v-else-if="nearbyFoods.length === 0" class="text-center py-6 text-gray-400">暂无美食数据</div>
              <div
                v-for="(food, index) in nearbyFoods"
                :key="index"
                class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{{ food.emoji }}</span>
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ food.name }}</h4>
                    <p class="text-sm text-gray-500">{{ food.distance }} | {{ food.price }}</p>
                  </div>
                  <span class="text-yellow-500">⭐ {{ food.rating }}</span>
                </div>
              </div>
            </div>

            <!-- 住宿参考 -->
            <div v-else-if="activePlaceTab === 'hotel'" class="space-y-4">
              <div v-if="hotelsLoading" class="text-center py-6 text-gray-500">加载中...</div>
              <div v-else-if="nearbyHotels.length === 0" class="text-center py-6 text-gray-400">暂无住宿数据</div>
              <div
                v-for="(hotel, index) in nearbyHotels"
                :key="index"
                class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{{ hotel.icon }}</span>
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ hotel.name }}</h4>
                    <p class="text-sm text-gray-500">{{ hotel.type }} | ¥{{ hotel.price }}/晚</p>
                  </div>
                  <span class="text-yellow-500">⭐ {{ hotel.rating }}</span>
                </div>
              </div>
            </div>

            <!-- 天气信息 -->
            <div v-else-if="activePlaceTab === 'weather'" class="space-y-6">
              <div v-if="weatherLoading" class="text-center py-12">
                <div class="text-3xl animate-spin mb-4">🌪️</div>
                <p class="text-gray-500">正在获取天气信息...</p>
              </div>

              <div v-else-if="weatherInfo" class="space-y-4">
                <!-- 当前天气 -->
                <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
                  <div class="flex items-center justify-between mb-4">
                    <div>
                      <h4 class="text-lg font-bold text-gray-900 mb-1">实时天气</h4>
                      <p class="text-sm text-gray-500">{{ weatherInfo.city }} · 更新于 {{ weatherInfo.updateTime }}</p>
                    </div>
                    <div class="text-5xl">{{ weatherInfo.now.weatherIcon }}</div>
                  </div>
                  
                  <div class="flex items-end gap-4 mb-4">
                    <span class="text-5xl font-bold text-gray-900">{{ weatherInfo.now.temp }}°</span>
                    <span class="text-lg text-gray-600 mb-1">{{ weatherInfo.now.text }}</span>
                  </div>

                  <div class="grid grid-cols-2 gap-3">
                    <div class="bg-white/60 rounded-lg p-3">
                      <div class="text-sm text-gray-500 mb-1">体感温度</div>
                      <div class="text-lg font-semibold text-gray-900">{{ weatherInfo.now.feelsLike }}°</div>
                    </div>
                    <div class="bg-white/60 rounded-lg p-3">
                      <div class="text-sm text-gray-500 mb-1">湿度</div>
                      <div class="text-lg font-semibold text-gray-900">{{ weatherInfo.now.humidity }}%</div>
                    </div>
                    <div class="bg-white/60 rounded-lg p-3">
                      <div class="text-sm text-gray-500 mb-1">风向风力</div>
                      <div class="text-lg font-semibold text-gray-900">{{ weatherInfo.now.windDir }} {{ weatherInfo.now.windClass }}</div>
                    </div>
                    <div class="bg-white/60 rounded-lg p-3">
                      <div class="text-sm text-gray-500 mb-1">能见度</div>
                      <div class="text-lg font-semibold text-gray-900">{{ weatherInfo.now.visibility }}km</div>
                    </div>
                  </div>
                </div>

                <!-- 未来3天预报 -->
                <div>
                  <h4 class="font-semibold text-gray-900 mb-3">未来3天预报</h4>
                  <div class="grid grid-cols-3 gap-3">
                    <div
                      v-for="(forecast, index) in weatherInfo.forecasts"
                      :key="index"
                      class="bg-white rounded-xl p-4 text-center"
                    >
                      <div class="text-sm text-gray-500 mb-2">{{ forecast.week }}</div>
                      <div class="text-2xl mb-2">{{ forecast.weatherIcon }}</div>
                      <div class="text-sm text-gray-600 mb-1">{{ forecast.textDay }}</div>
                      <div class="font-semibold">{{ forecast.low }}° ~ {{ forecast.high }}°</div>
                    </div>
                  </div>
                </div>

                <!-- 生活指数 -->
                <div>
                  <h4 class="font-semibold text-gray-900 mb-3">出行提示</h4>
                  <div class="grid grid-cols-2 gap-3">
                    <div
                      v-for="(index, idx) in weatherInfo.indexes"
                      :key="idx"
                      class="bg-gray-50 rounded-lg p-3"
                    >
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-lg">{{ index.icon }}</span>
                        <span class="text-sm font-medium text-gray-900">{{ index.name }}</span>
                      </div>
                      <div class="text-xs text-gray-600">{{ index.brief }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-else class="text-center py-8 text-gray-500">
                <div class="text-4xl mb-2">🌥️</div>
                <p>暂无天气信息</p>
              </div>
            </div>

            <!-- 注意事项 -->
            <div v-else-if="activePlaceTab === 'tips'" class="space-y-4">
              <div class="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 class="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  ⚠️ 实用提示
                </h4>
                <ul class="text-sm text-amber-700 space-y-2">
                  <li>• 建议提前在官网预约门票</li>
                  <li>• 周末人流量较大，建议早点出发</li>
                  <li>• 周边停车位有限，推荐公共交通</li>
                </ul>
              </div>
              <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 class="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                  💡 游览建议
                </h4>
                <ul class="text-sm text-blue-700 space-y-2">
                  <li>• 建议游览时长：2-3小时</li>
                  <li>• 最佳拍照点：景区东侧观景台</li>
                  <li>• 特色体验：不要错过景区内表演</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 底部操作 -->
          <div class="p-4 border-t border-gray-200 bg-gray-50">
            <button
              @click="closePlaceDrawer"
              class="w-full py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 主内容区 -->
    <div class="max-w-[1100px] mx-auto px-8 py-8 pt-24">
      <div class="max-w-4xl mx-auto">
        <!-- 输入区域 -->
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 class="text-xl font-bold text-gray-900 mb-6">和AI对话规划行程</h2>
          <div class="flex gap-4">
            <input
              v-model="userInput"
              @keyup.enter="handleGenerate"
              placeholder="输入你的问题，例如：北京三日游怎么安排？"
              class="flex-1 px-6 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
              :disabled="isLoading"
            />
            <button
              @click="handleGenerate"
              :disabled="!userInput.trim() || isLoading"
              class="px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? '发送中' : '发送' }}
            </button>
          </div>
        </div>

        <!-- 对话历史展示区 -->
        <div class="space-y-6 mb-8">
          <div
            v-for="message in messages"
            :key="message.id"
            class="flex gap-4"
            :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
          >
            <!-- AI 头像 -->
            <div v-if="message.role === 'assistant'" class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg">🤖</span>
            </div>
            
            <!-- 消息内容 -->
            <div 
              class="max-w-[80%] rounded-2xl p-6"
              :class="message.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-white shadow-md rounded-tl-none border border-gray-100 ai-markdown'"
              v-html="message.role === 'assistant' ? renderAIResponse(message.content) : message.content"
              @click="onPlaceClick"
            />
            
            <!-- 用户头像 -->
            <div v-if="message.role === 'user'" class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User :size="18" class="text-gray-500" />
            </div>
          </div>

          <!-- 加载状态 -->
          <div v-if="isLoading" class="flex gap-4 justify-start">
            <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg">🤖</span>
            </div>
            <div class="bg-white shadow-md rounded-2xl rounded-tl-none p-6 border border-gray-100">
              <div class="flex items-center gap-2">
                <span class="animate-pulse">思考中</span>
                <span class="animate-bounce">...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 行程方案展示区 -->
        <div v-if="plans.length > 0" class="space-y-8">
          <h2 class="text-xl font-bold text-gray-900">生成的行程方案</h2>

          <div
            v-for="(plan, pi) in plans"
            :key="pi"
            class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <!-- 方案头部 -->
            <div
              class="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
              @click="expandedPlanIdx = expandedPlanIdx === pi ? -1 : pi"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 mb-2">{{ plan.name }}</h3>
                  <p class="text-gray-500 text-sm line-clamp-2">{{ plan.description }}</p>
                </div>
                <div class="flex items-center gap-3 flex-shrink-0 ml-4">
                  <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold">
                    {{ dayCount(plan) }}天
                  </span>
                  <span class="text-gray-400 text-lg transition-transform" :class="expandedPlanIdx === pi ? 'rotate-180' : ''">▾</span>
                </div>
              </div>
              <div class="flex flex-wrap gap-2 mt-3">
                <span v-for="tag in plan.tags" :key="tag" class="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">{{ tag }}</span>
                <span class="text-xs text-gray-400 flex items-center gap-1">
                  <DollarSign :size="12" /> ¥{{ formatCost(plan) }}
                </span>
              </div>
            </div>

            <!-- 展开的详细行程 -->
            <div v-if="expandedPlanIdx === pi" class="border-t border-gray-100 p-6">
              <PlanDetail :plan="normalizePlan(plan)" :editable="true" @update="onPlanUpdate(pi, $event)" />
            </div>
          </div>
        </div>

        <!-- 空状态：有对话但无计划 -->
        <div
          v-else-if="!isLoading && messages.length > 0"
          class="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-200"
        >
          <div class="text-6xl mb-6">📋</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">从对话中提取行程</h3>
          <p class="text-gray-600 leading-relaxed max-w-md mx-auto mb-6">
            这段对话可能包含未提取的行程计划。点击下方按钮自动解析。
          </p>
          <button @click="extractPlanFromChat"
            class="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors">
            📤 提取为行程计划
          </button>
        </div>

        <!-- 空状态 -->
        <div
          v-else-if="!isLoading"
          class="bg-white rounded-2xl shadow-lg p-16 text-center border border-gray-200"
        >
          <div class="text-6xl mb-6">🗺️</div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">开始你的智能旅行规划</h3>
          <p class="text-gray-600 leading-relaxed max-w-md mx-auto">
            在上方输入你的旅行计划，AI 将为你生成多套行程方案
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ArrowLeft, Plus, ClipboardList, X, MapPin, DollarSign, User } from 'lucide-vue-next'
import { usePlaceDrawer, useItineraryChat, loadSavedPlans, extractJsonFromText } from '../composables/useItineraryPlanner'
import ItineraryPlannerSidebar from '../components/ItineraryPlannerSidebar.vue'
import PlanDetail from '../components/PlanDetail.vue'

const router = useRouter()
const route = useRoute()

const {
  showPlaceDrawer, selectedPlace, activePlaceTab,
  weatherLoading, weatherInfo, placeTabs,
  nearbyFoods, nearbyHotels, foodsLoading, hotelsLoading,
  openPlaceDrawer, closePlaceDrawer
} = usePlaceDrawer()

const {
  messages, isLoading, plans, userInput,
  chatHistory, currentSessionId,
  loadChat, clearHistory, startNewChat,
  handleGenerate: doGenerate, renderAIResponse, handlePlaceClick,
  enrichPlanWithCoords
} = useItineraryChat()

const showHistorySidebar = ref(false)
const expandedPlanIdx = ref(-1)

// Plan helpers — normalize AI field names (totalDays/totalCost) to internal format
function dayCount(plan: any) { return plan.totalDays || plan.days?.length || 0 }
function formatCost(plan: any) { return (plan.totalCost || plan.cost || 0).toLocaleString() }
function normalizePlan(plan: any) {
  const days = plan.days || []
  return {
    ...plan,
    totalDays: plan.totalDays || days.length,
    totalCost: plan.totalCost || plan.totalDays,
    days: days.map((d: any) => ({
      ...d,
      items: (d.items || []).map((item: any) => ({
        ...item,
        cost: item.cost ? Number(item.cost) : undefined,
      })),
    })),
  }
}
function onPlanUpdate(idx: number, updatedPlan: any) {
  plans.value[idx] = { ...plans.value[idx], ...updatedPlan }
}

// Load specific chat or plan from MyTrips query param
onMounted(() => {
  const chatId = route.query.chatId as string
  if (chatId) {
    const chat = chatHistory.value.find(c => c.id === chatId)
    if (chat) {
      loadChat(chat)
      // 自动尝试从对话中提取行程计划
      setTimeout(() => extractPlanFromChat(), 500)
    }
  }
  const planName = route.query.planName as string
  if (planName) {
    const allPlans = loadSavedPlans()
    const found = allPlans.find((p: any) => p.name === planName)
    if (found) {
      plans.value = [found]
      expandedPlanIdx.value = 0
    }
  }
})

const handleGenerate = () => {
  const input = userInput.value.trim()
  if (!input) return
  doGenerate(input)
  userInput.value = ''
}

// 从对话历史中提取行程计划
function extractPlanFromChat() {
  for (const msg of messages.value) {
    if (msg.role !== 'assistant') continue
    const { plans: result } = extractJsonFromText(msg.content)
    if (result?.plans && Array.isArray(result.plans)) {
      plans.value = result.plans
      expandedPlanIdx.value = 0
      const allPlans = loadSavedPlans()
      for (const plan of result.plans) {
        const idx = allPlans.findIndex((p: any) => p.name === plan.name)
        if (idx >= 0) allPlans[idx] = { ...plan, savedAt: Date.now() }
        else allPlans.unshift({ ...plan, savedAt: Date.now() })
      }
      localStorage.setItem('trailmate-saved-plans', JSON.stringify(allPlans.slice(0, 10)))
      // Enrich with coordinates from Baidu asynchronously
      for (const plan of result.plans) { enrichPlanWithCoords(plan) }
      return
    }
  }
}

// 包装 openPlaceDrawer 以便 place-click handler 调用
const onPlaceClick = (event: MouseEvent) => {
  handlePlaceClick(event, (placeName: string) => openPlaceDrawer(placeName))
}
</script>

<style scoped>
.ai-markdown :deep(h1) {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem 0;
  color: #1f2937;
}

.ai-markdown :deep(h2) {
  font-size: 1.25rem;
  font-weight: bold;
  margin: 0.75rem 0 0.5rem 0;
  color: #1f2937;
}

.ai-markdown :deep(h3) {
  font-size: 1.125rem;
  font-weight: bold;
  margin: 0.5rem 0 0.25rem 0;
  color: #1f2937;
}

.ai-markdown :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.75;
}

.ai-markdown :deep(ul), .ai-markdown :deep(ol) {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.ai-markdown :deep(li) {
  margin: 0.25rem 0;
}

.ai-markdown :deep(code) {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.875rem;
}

.ai-markdown :deep(pre) {
  background: #1f2937;
  color: #f3f4f6;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 8px 0;
}

.ai-markdown :deep(pre code) {
  background: none;
  padding: 0;
  color: inherit;
}

.ai-markdown :deep(strong) {
  font-weight: 600;
}

.ai-markdown :deep(.place-name) {
  display: inline-block;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.ai-markdown :deep(.place-name:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.ai-markdown :deep(.ai-tip) {
  display: block;
  background: #fef3c7;
  border-left: 3px solid #f59e0b;
  padding: 8px 12px;
  margin: 8px 0;
  border-radius: 0 6px 6px 0;
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideIn 0.3s ease-out;
}
</style>
