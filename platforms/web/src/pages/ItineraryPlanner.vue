<template>
  <div class="min-h-screen bg-white">
    <!-- 顶部导航 -->
    <header class="fixed top-0 w-full z-50 py-6 transition-all duration-300 bg-white/85 backdrop-blur-md shadow-md text-gray-900">
      <div class="max-w-[1100px] mx-auto px-8 flex justify-between items-center relative">
        <div class="flex items-center gap-3">
          <button
            @click="$emit('back')"
            class="flex items-center gap-2 px-2 text-gray-700 hover:text-primary transition-colors"
          >
            <span class="text-xl">←</span>
            <span>返回</span>
          </button>
        </div>

        <h1 class="text-xl font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">智能行程规划</h1>

        <div class="flex items-center gap-6">
          <button
            @click="startNewChat"
            class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition-colors"
          >
            <span class="text-xl">➕</span>
            <span class="hidden sm:inline">新对话</span>
          </button>
          <button
            @click="showHistorySidebar = true"
            class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition-colors"
          >
            <span>📋</span>
            <span class="hidden sm:inline">历史记录</span>
          </button>
        </div>
      </div>
    </header>

    <!-- 历史记录侧边栏 -->
    <Teleport to="body">
      <div
        v-if="showHistorySidebar"
        class="fixed inset-0 z-50"
        @click.self="showHistorySidebar = false"
      >
        <!-- 遮罩层 -->
        <div class="absolute inset-0 bg-black/30" @click="showHistorySidebar = false" />

        <!-- 侧边栏 -->
        <div class="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-hidden flex flex-col">
          <!-- 侧边栏头部 -->
          <div class="h-16 px-4 flex items-center justify-between border-b border-gray-200">
            <h2 class="text-lg font-bold text-gray-900">对话历史</h2>
            <button
              @click="showHistorySidebar = false"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>

          <!-- 清空按钮 -->
          <div class="px-4 py-3 border-b border-gray-100">
            <button
              @click="clearHistory"
              class="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              🗑️ 清空所有历史
            </button>
          </div>

          <!-- 历史列表 -->
          <div class="flex-1 overflow-y-auto">
            <div v-if="chatHistory.length === 0" class="p-4 text-center text-gray-500">
              暂无历史对话
            </div>
            <div
              v-for="(chat, index) in chatHistory"
              :key="chat.id"
              @click="loadChat(chat)"
              class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <div class="font-medium text-gray-900 truncate">{{ chat.title }}</div>
              <div class="text-sm text-gray-500 mt-1">{{ chat.date }}</div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

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
              ✕
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
              <div
                v-for="(food, index) in mockFoods"
                :key="index"
                class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div class="flex items-center gap-3">
                  <span class="text-2xl">{{ food.emoji }}</span>
                  <div class="flex-1">
                    <h4 class="font-medium text-gray-900">{{ food.name }}</h4>
                    <p class="text-sm text-gray-500">{{ food.distance }} | ¥{{ food.price }}</p>
                  </div>
                  <span class="text-yellow-500">⭐ {{ food.rating }}</span>
                </div>
              </div>
            </div>

            <!-- 住宿参考 -->
            <div v-else-if="activePlaceTab === 'hotel'" class="space-y-4">
              <div
                v-for="(hotel, index) in mockHotels"
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
              @click="handlePlaceClick"
            />
            
            <!-- 用户头像 -->
            <div v-if="message.role === 'user'" class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg">👤</span>
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
        <div v-if="plans.length > 0" class="space-y-6">
          <h2 class="text-xl font-bold text-gray-900 mb-6">生成的行程方案</h2>
          
          <div
            v-for="plan in plans"
            :key="plan.id"
            class="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow cursor-pointer border border-gray-200 hover:-translate-y-2 transition-transform"
          >
            <div class="flex justify-between items-start mb-6">
              <div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3">{{ plan.name }}</h3>
                <p class="text-gray-600 leading-relaxed">{{ plan.description }}</p>
              </div>
              <span class="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-semibold">
                {{ plan.days }}天行程
              </span>
            </div>
            
            <div class="flex flex-wrap items-center gap-8 text-sm text-gray-600">
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
import { ref, watch } from 'vue'
import { marked } from 'marked'
import { useSettings } from '../stores/settings'

const { settings } = useSettings()

// 地点详情抽屉
interface PlaceInfo {
  name: string
  icon?: string
  category?: string
  rating?: string
  distance?: string
  description?: string
  address?: string
  openTime?: string
  ticket?: string
  content?: string
  city?: string // 景点所在城市
  province?: string // 景点所在省份
}

const showPlaceDrawer = ref(false)
const selectedPlace = ref<PlaceInfo | null>(null)
const activePlaceTab = ref('detail')
const weatherLoading = ref(false)
const weatherInfo = ref<any>(null)

const placeTabs = [
  { id: 'detail', label: '详情', icon: '🏛️' },
  { id: 'weather', label: '天气', icon: '🌤️' },
  { id: 'food', label: '美食', icon: '🍜' },
  { id: 'hotel', label: '住宿', icon: '🏨' },
  { id: 'tips', label: '提示', icon: '💡' }
]

const mockFoods = ref([
  { emoji: '🍜', name: '老北京炸酱面', distance: '500m', price: '35', rating: '4.8' },
  { emoji: '🥟', name: '鼎香坊水饺', distance: '800m', price: '45', rating: '4.6' },
  { emoji: '🦆', name: '全聚德烤鸭', distance: '1.2km', price: '180', rating: '4.9' },
  { emoji: '🍲', name: '东来顺火锅', distance: '1.5km', price: '120', rating: '4.7' }
])

const mockHotels = ref([
  { icon: '🏨', name: '格林豪泰酒店', type: '经济型', price: '180', rating: '4.2' },
  { icon: '🏩', name: '如家精选酒店', type: '舒适型', price: '280', rating: '4.5' },
  { icon: '🏨', name: '香格里拉大酒店', type: '豪华型', price: '680', rating: '4.8' }
])

const openPlaceDrawer = async (placeName: string) => {
  try {
    // 先显示加载状态
    selectedPlace.value = {
      name: placeName,
      icon: '📍',
      category: '加载中...',
      description: '正在获取景点信息...'
    }
    showPlaceDrawer.value = true
    activePlaceTab.value = 'detail'

    // 调用百度地图POI搜索API
    const apiUrl = `/api/baidumap/place/v2/search?query=${encodeURIComponent(placeName)}&city=全国&ak=a4hhbJ1G59b1ef4itaT1TbIC4w3g3DCi&output=json&scope=2&page_size=1`
    console.log('请求百度API:', apiUrl)
    const response = await fetch(apiUrl)
    const data = await response.json()
    console.log('百度API返回结果:', data)

    if (data.status === 0 && data.results && data.results.length > 0) {
        const poi = data.results[0]
        // 从地址中提取省市
        let city = ''
        let province = ''
        if (poi.city) {
          city = poi.city
        } else if (poi.address) {
          // 从地址中提取省市，格式通常是 "北京市 东城区 xxx"
          const addrParts = poi.address.split(/\s+/)
          if (addrParts.length >= 2) {
            if (/省$/.test(addrParts[0])) {
              province = addrParts[0]
              city = addrParts[1]
            } else if (/市$/.test(addrParts[0])) {
              city = addrParts[0]
            }
          }
        }

        selectedPlace.value = {
          name: poi.name,
          icon: getPlaceIcon(poi.type),
          category: poi.type || '景点',
          rating: poi.detail_info?.overall_rating?.toString() || '4.5',
          distance: poi.address ? poi.address.split(' ')[0] || '市中心' : '市中心',
          description: poi.detail_info?.abstract || poi.address || '这是一个非常值得一去的景点，周围配套设施完善。',
          address: poi.address || '地址信息暂无',
          openTime: poi.detail_info?.opening_hours || '09:00 - 18:00',
          ticket: poi.detail_info?.price?.toString() || '免费',
          city: city,
          province: province
        }
    } else {
      // 搜索失败，使用预设景点信息
      const mockPlaces: Record<string, any> = {
        '故宫': {
          icon: '🏯',
          category: '历史古迹',
          rating: '4.9',
          distance: '北京市东城区',
          description: '北京故宫是中国明清两代的皇家宫殿，旧称紫禁城，位于北京中轴线的中心。北京故宫以三大殿为中心，占地面积约72万平方米，建筑面积约15万平方米，有大小宫殿七十多座，房屋九千余间。',
          address: '北京市东城区景山前街4号',
          openTime: '08:30 - 17:00（周一闭馆）',
          ticket: '60',
          city: '北京市'
        },
        '颐和园': {
          icon: '🏞️',
          category: '皇家园林',
          rating: '4.8',
          distance: '北京市海淀区',
          description: '颐和园是中国清朝时期皇家园林，坐落在北京西郊，占地3.009平方公里，水面约占四分之三，与圆明园毗邻。它是以昆明湖、万寿山为基址，以杭州西湖为蓝本，汲取江南园林的设计手法而建成的一座大型山水园林。',
          address: '北京市海淀区新建宫门路19号',
          openTime: '06:30 - 18:00',
          ticket: '30',
          city: '北京市'
        },
        '天安门广场': {
          icon: '🇨🇳',
          category: '城市广场',
          rating: '4.7',
          distance: '北京市东城区',
          description: '天安门广场位于北京市中心，南北长880米，东西宽500米，面积达44万平方米，可容纳100万人举行盛大集会，是世界上最大的城市广场。',
          address: '北京市东城区天安门广场',
          openTime: '全天开放',
          ticket: '免费',
          city: '北京市'
        },
        '八达岭长城': {
          icon: '🗼',
          category: '世界文化遗产',
          rating: '4.8',
          distance: '北京市延庆区',
          description: '八达岭长城，位于北京市延庆区军都山关沟古道北口。是中国古代伟大的防御工程万里长城的重要组成部分，是明长城的一个隘口。',
          address: '北京市延庆区八达岭镇',
          openTime: '07:30 - 17:30',
          ticket: '40',
          city: '北京市'
        },
        '天坛': {
          icon: '⛩️',
          category: '祭祀场所',
          rating: '4.7',
          distance: '北京市东城区',
          description: '天坛公园在北京市南部，东城区永定门内大街东侧。占地约273万平方米。天坛始建于明永乐十八年（1420年），清乾隆、光绪时曾重修改建。为明、清两代帝王祭祀皇天、祈五谷丰登之场所。',
          address: '北京市东城区天坛东里甲1号',
          openTime: '06:00 - 22:00',
          ticket: '15',
          city: '北京市'
        },
        '南锣鼓巷': {
          icon: '🏮',
          category: '特色街区',
          rating: '4.6',
          distance: '北京市东城区',
          description: '南锣鼓巷是北京最古老的街区之一，是我国唯一完整保存着元代胡同院落肌理、规模最大、品级最高、资源最丰富的棋盘式传统民居区，也是最赋有老北京风情的街巷。',
          address: '北京市东城区南锣鼓巷胡同',
          openTime: '全天开放',
          ticket: '免费',
          city: '北京市'
        },
        '西湖': {
          icon: '🏞️',
          category: '自然风光',
          rating: '4.9',
          distance: '浙江省杭州市',
          description: '西湖，位于浙江省杭州市西湖区龙井路1号，杭州市区西部，景区总面积49平方千米，汇水面积为21.22平方千米，湖面面积为6.38平方千米。有100多处公园景点，有"西湖十景"之说。',
          address: '浙江省杭州市西湖区龙井路1号',
          openTime: '全天开放',
          ticket: '免费',
          city: '杭州市'
        },
        '东方明珠': {
          icon: '🗼',
          category: '现代建筑',
          rating: '4.7',
          distance: '上海市浦东新区',
          description: '东方明珠广播电视塔，位于上海市浦东新区陆家嘴世纪大道1号，地处黄浦江畔，背拥陆家嘴地区现代化建筑楼群，与隔江的外滩万国建筑博览群交相辉映，是上海标志性文化景观之一。',
          address: '上海市浦东新区世纪大道1号',
          openTime: '09:00 - 21:30',
          ticket: '199',
          city: '上海市'
        }
      }

      if (mockPlaces[placeName]) {
        selectedPlace.value = {
          name: placeName,
          ...mockPlaces[placeName]
        }
      } else {
        // 没有匹配到预设数据，使用通用信息，尝试提取城市
        let extractedCity = ''
        const cityMatch = placeName.match(/([\u4e00-\u9fa5]+(?:市|州|盟|地区))/)
        if (cityMatch) {
          extractedCity = cityMatch[1]
        } else if (placeName.includes('北京')) {
          extractedCity = '北京市'
        } else if (placeName.includes('上海')) {
          extractedCity = '上海市'
        } else if (placeName.includes('广州')) {
          extractedCity = '广州市'
        } else if (placeName.includes('深圳')) {
          extractedCity = '深圳市'
        } else if (placeName.includes('杭州')) {
          extractedCity = '杭州市'
        } else if (placeName.includes('成都')) {
          extractedCity = '成都市'
        } else if (placeName.includes('重庆')) {
          extractedCity = '重庆市'
        } else if (placeName.includes('西安')) {
          extractedCity = '西安市'
        }

        selectedPlace.value = {
          name: placeName,
          icon: '📍',
          category: '景点',
          rating: '4.5',
          distance: '市中心',
          description: '这是一个非常值得一去的景点，周围配套设施完善，适合各类游客参观游览。',
          address: '当地',
          openTime: '09:00 - 18:00',
          ticket: '60',
          city: extractedCity
        }
      }
    }
  } catch (error) {
    console.error('获取景点信息失败:', error)
    selectedPlace.value = {
      name: placeName,
      icon: '📍',
      category: '景点',
      rating: '暂无评分',
      distance: '市中心',
      description: '获取景点信息失败，请稍后重试',
      address: '地址信息暂无',
      openTime: '开放时间暂无',
      ticket: '门票信息暂无'
    }
  }
}

// 根据类型返回对应图标
const getPlaceIcon = (type: string) => {
  if (!type) return '📍'
  if (type.includes('公园') || type.includes('景区') || type.includes('景点')) return '🏞️'
  if (type.includes('博物馆') || type.includes('纪念馆') || type.includes('展览')) return '🏛️'
  if (type.includes('寺庙') || type.includes('宫') || type.includes('殿') || type.includes('塔')) return '⛩️'
  if (type.includes('购物') || type.includes('商场')) return '🛍️'
  if (type.includes('美食') || type.includes('餐厅') || type.includes('餐馆')) return '🍜'
  if (type.includes('酒店') || type.includes('住宿') || type.includes('宾馆')) return '🏨'
  if (type.includes('大学') || type.includes('学校')) return '🏫'
  if (type.includes('医院')) return '🏥'
  if (type.includes('车站') || type.includes('机场')) return '🚉'
  return '📍'
}

const closePlaceDrawer = () => {
  showPlaceDrawer.value = false
  selectedPlace.value = null
  weatherInfo.value = null
  weatherLoading.value = false
}

// 监听标签页切换，切换到天气时自动加载
watch(activePlaceTab, async (newTab) => {
  if (newTab === 'weather' && selectedPlace.value && !weatherInfo.value) {
    await loadWeatherInfo(selectedPlace.value.name, selectedPlace.value.city)
  }
})

// 加载天气信息
const loadWeatherInfo = async (placeName: string, city?: string) => {
  weatherLoading.value = true
  weatherInfo.value = null

  try {
    // 优先使用景点的city字段，没有的话再从地名中提取
    let cityName = ''
    if (city) {
      cityName = city
    } else {
      // 从景点名中提取城市
      const cityMatch = placeName.match(/([\u4e00-\u9fa5]+(?:市|州|盟|地区))/)
      if (cityMatch) {
        cityName = cityMatch[1]
      } else {
        // 常见热门城市匹配
        if (placeName.includes('北京') || placeName.includes('故宫') || placeName.includes('八达岭') || placeName.includes('天安门') || placeName.includes('南锣鼓巷') || placeName.includes('天坛') || placeName.includes('颐和园')) {
          cityName = '北京市'
        } else if (placeName.includes('上海') || placeName.includes('东方明珠') || placeName.includes('外滩')) {
          cityName = '上海市'
        } else if (placeName.includes('杭州') || placeName.includes('西湖') || placeName.includes('灵隐寺')) {
          cityName = '杭州市'
        } else if (placeName.includes('成都') || placeName.includes('宽窄巷子') || placeName.includes('锦里')) {
          cityName = '成都市'
        } else if (placeName.includes('西安') || placeName.includes('兵马俑') || placeName.includes('大雁塔')) {
          cityName = '西安市'
        } else if (placeName.includes('重庆') || placeName.includes('洪崖洞') || placeName.includes('解放碑')) {
          cityName = '重庆市'
        } else if (placeName.includes('广州') || placeName.includes('广州塔') || placeName.includes('白云山')) {
          cityName = '广州市'
        } else if (placeName.includes('深圳') || placeName.includes('世界之窗') || placeName.includes('欢乐谷')) {
          cityName = '深圳市'
        } else {
          // 实在提取不到默认北京
          cityName = '北京市'
        }
      }
    }
    
    const searchUrl = `/api/baidumap/weather/v1/?district=${encodeURIComponent(cityName)}&data_type=all&ak=a4hhbJ1G59b1ef4itaT1TbIC4w3g3DCi`
    console.log('请求天气API:', searchUrl)
    
    const response = await fetch(searchUrl)
    const data = await response.json()
    console.log('天气API返回:', data)

    if (data.status === 0 && data.result) {
      const { location, now, forecasts, indexes } = data.result
      
      // 处理天气图标映射
      const getWeatherIcon = (text: string) => {
        if (/晴/.test(text)) return '☀️'
        if (/多云/.test(text)) return '☁️'
        if (/阴/.test(text)) return '☁️'
        if (/小雨|中雨|大雨|暴雨|雨/.test(text)) return '🌧️'
        if (/雷阵雨/.test(text)) return '⛈️'
        if (/雪/.test(text)) return '❄️'
        if (/雾|霾/.test(text)) return '🌫️'
        if (/风/.test(text)) return '💨'
        if (/沙/.test(text)) return '🌪️'
        return '🌤️'
      }

      // 处理生活指数图标
      const getIndexIcon = (name: string) => {
        if (/穿衣/.test(name)) return '👕'
        if (/感冒/.test(name)) return '🤧'
        if (/运动/.test(name)) return '🏃'
        if (/洗车/.test(name)) return '🚗'
        if (/紫外线/.test(name)) return '🧴'
        if (/晨练/.test(name)) return '🏋️'
        if (/旅游/.test(name)) return '🎒'
        return '💡'
      }

      weatherInfo.value = {
        city: location.city || location.name,
        updateTime: now.uptime ? now.uptime.replace(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$2-$3 $4:$5') : '最近更新',
        now: {
          temp: now.temp,
          feelsLike: now.feels_like,
          text: now.text,
          weatherIcon: getWeatherIcon(now.text),
          humidity: now.rh,
          windDir: now.wind_dir,
          windClass: now.wind_class,
          visibility: now.vis ? (parseInt(now.vis) / 1000).toFixed(1) : '未知'
        },
        forecasts: forecasts?.slice(0, 3).map((item: any) => ({
          date: item.date,
          week: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][parseInt(item.week)],
          textDay: item.text_day,
          textNight: item.text_night,
          high: item.high,
          low: item.low,
          weatherIcon: getWeatherIcon(item.text_day)
        })) || [],
        indexes: indexes?.slice(0, 4).map((item: any) => ({
          name: item.name,
          brief: item.brief,
          detail: item.detail,
          icon: getIndexIcon(item.name)
        })) || []
      }
    } else {
      // 搜索失败，显示模拟天气
      weatherInfo.value = {
        city: cityName,
        updateTime: new Date().toLocaleTimeString(),
        now: {
          temp: '20',
          feelsLike: '18',
          text: '多云',
          weatherIcon: '☁️',
          humidity: '60',
          windDir: '东风',
          windClass: '2级',
          visibility: '10'
        },
        forecasts: [
          { week: '今天', textDay: '多云', high: '25', low: '18', weatherIcon: '☁️' },
          { week: '明天', textDay: '晴', high: '28', low: '20', weatherIcon: '☀️' },
          { week: '后天', textDay: '小雨', high: '22', low: '16', weatherIcon: '🌧️' }
        ],
        indexes: [
          { name: '穿衣指数', brief: '舒适', icon: '👕' },
          { name: '感冒指数', brief: '少发', icon: '🤧' },
          { name: '运动指数', brief: '适宜', icon: '🏃' },
          { name: '洗车指数', brief: '适宜', icon: '🚗' }
        ]
      }
    }
  } catch (error) {
    console.error('获取天气失败:', error)
    // 失败时显示模拟数据
    weatherInfo.value = {
      city: city || placeName,
      updateTime: new Date().toLocaleTimeString(),
      now: {
        temp: '20',
        feelsLike: '18',
        text: '多云',
        weatherIcon: '☁️',
        humidity: '60',
        windDir: '东风',
        windClass: '2级',
        visibility: '10'
      },
      forecasts: [
        { week: '今天', textDay: '多云', high: '25', low: '18', weatherIcon: '☁️' },
        { week: '明天', textDay: '晴', high: '28', low: '20', weatherIcon: '☀️' },
        { week: '后天', textDay: '小雨', high: '22', low: '16', weatherIcon: '🌧️' }
      ],
      indexes: [
        { name: '穿衣指数', brief: '舒适', icon: '👕' },
        { name: '感冒指数', brief: '少发', icon: '🤧' },
        { name: '运动指数', brief: '适宜', icon: '🏃' },
        { name: '洗车指数', brief: '适宜', icon: '🚗' }
      ]
    }
  } finally {
    weatherLoading.value = false
  }
}

// 处理Markdown内容，使地点名称可点击
const renderAIResponse = (content: string) => {
  // 1. 先处理自定义格式（这些格式优先级最高）
  // 处理 [[景点名]] 格式 -> 可点击的紫色标签
  content = content.replace(/\[\[([^\]]+)\]\]/g, (match, placeName) => {
    return `<span class="place-name" data-place="${placeName.trim()}">📍 ${placeName.trim()}</span>`
  })

  // 处理 【提示内容】 格式 -> 醒目的提示框
  content = content.replace(/【([^】]+)】/g, (match, tipContent) => {
    return `<span class="ai-tip">💡 ${tipContent}</span>`
  })

  // 2. 再用 marked 渲染剩余的 Markdown
  let html = marked(content) as string

  return html
}

const handlePlaceClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (target.classList.contains('place-name')) {
    const placeName = target.dataset.place
    if (placeName) {
      openPlaceDrawer(placeName)
    }
  }
}

// 历史记录侧边栏
const showHistorySidebar = ref(false)

// 对话历史类型
interface ChatSession {
  id: string
  title: string
  date: string
  messages: Message[]
}

// 所有对话历史（持久化存储）
const chatHistory = ref<ChatSession[]>([])

// 当前会话ID
const currentSessionId = ref<string>('')

// 加载历史记录
const loadHistoryFromStorage = () => {
  const saved = localStorage.getItem('trailmate-chat-history')
  if (saved) {
    try {
      chatHistory.value = JSON.parse(saved)
    } catch (e) {
      console.error('加载历史记录失败:', e)
    }
  }
}

// 保存历史记录
const saveHistoryToStorage = () => {
  localStorage.setItem('trailmate-chat-history', JSON.stringify(chatHistory.value))
}

// 清空历史
const clearHistory = () => {
  if (confirm('确定要清空所有历史对话吗？')) {
    chatHistory.value = []
    messages.value = []
    currentSessionId.value = ''
    saveHistoryToStorage()
    showHistorySidebar.value = false
  }
}

// 加载某个历史会话
const loadChat = (chat: ChatSession) => {
  messages.value = chat.messages
  currentSessionId.value = chat.id
  showHistorySidebar.value = false
}

// 保存当前会话到历史
const saveCurrentChat = () => {
  if (messages.value.length === 0) return

  const title = messages.value[0]?.content?.slice(0, 30) || '新对话'
  const now = new Date()
  const dateStr = `${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`

  if (currentSessionId.value) {
    // 更新现有会话
    const existingChat = chatHistory.value.find(c => c.id === currentSessionId.value)
    if (existingChat) {
      existingChat.messages = [...messages.value]
      existingChat.title = title
    }
  } else {
    // 创建新会话
    const newChat: ChatSession = {
      id: `chat-${Date.now()}`,
      title,
      date: dateStr,
      messages: [...messages.value]
    }
    chatHistory.value.unshift(newChat)
    currentSessionId.value = newChat.id

    // 只保留最近20条会话
    if (chatHistory.value.length > 20) {
      chatHistory.value = chatHistory.value.slice(0, 20)
    }
  }

  saveHistoryToStorage()
}

// 初始化加载历史
loadHistoryFromStorage()

// 开始新对话
const startNewChat = () => {
  // 先保存当前对话到历史
  if (messages.value.length > 0) {
    saveCurrentChat()
  }
  // 清空当前消息，开始新对话
  messages.value = []
  currentSessionId.value = ''
  plans.value = []
  aiResponse.value = ''
}

const emit = defineEmits<{
  (e: 'back'): void
}>()

const userInput = ref('')
const isLoading = ref(false)
const plans = ref<any[]>([])
const aiResponse = ref('')

// 对话历史
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
const messages = ref<Message[]>([])

// 调用 OpenRouter API
const callOpenRouterAPI = async (messagesHistory: Array<{role: 'user' | 'assistant', content: string}>) => {
  const apiKey = 'OPENROUTER_KEY_PLACEHOLDER'

  if (!apiKey) {
    throw new Error('OpenRouter API Key 未配置')
  }

  console.log('开始调用OpenRouter API...')
  console.log('历史消息:', messagesHistory)

  try {
      // 构建完整消息：系统提示 + 用户偏好 + 历史对话
      const userPreference = `用户偏好：
- 预算范围：¥${settings.value.budget[0]} - ¥${settings.value.budget[1]}
- 喜欢的旅行类型：${settings.value.travelTypes.join('、') || '无特别偏好'}
- 偏好的交通方式：${settings.value.transports.join('、') || '无特别偏好'}
- 偏好的住宿类型：${settings.value.accommodations.join('、') || '无特别偏好'}
- 语言：${settings.value.language === 'zh' ? '中文' : '英文'}

请严格按照用户偏好生成内容。`

      const isChinese = settings.value.language === 'zh'
      const currentLanguage = isChinese ? 'Chinese' : 'English'
      
      const systemPrompt = isChinese 
        ? `【重要】你必须用中文回复所有内容。

你是伴旅智能旅行助手，擅长规划旅行行程。
          
【强制输出规则 - 必须严格遵守】：
1. 所有景点、地标、酒店、餐厅等地点名称必须使用 [[地点名]] 格式包裹
   - ✅ 正确：去 [[故宫]] 参观，住在 [[如家酒店]]
   - ❌ 错误：去故宫参观，住在如家酒店
2. 所有注意事项必须使用 【提示内容】 格式
3. 不要使用其他格式来标注地点`
        : `【Important】You must respond in English for all content.

You are TrailMate, an intelligent travel assistant, expert at planning travel itineraries.
          
【Mandatory Output Rules】：
1. All place names (attractions, landmarks, hotels, restaurants, etc.) must be wrapped in [[Place Name]] format
   - ✅ Correct: Visit [[Forbidden City]], stay at [[Home Inn]]
   - ❌ Wrong: Visit Forbidden City, stay at Home Inn
2. All tips must use 【Tip Content】 format
3. Do not use other formats for place names`

      const fullMessages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userPreference
        },
        ...messagesHistory
      ]

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "minimax/minimax-m2.5:free",
        "messages": fullMessages,
        "reasoning": {"enabled": true}
      })
    })

    console.log('Response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('API错误响应:', errorText)
      throw new Error(`API请求失败: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('API响应数据:', data)
    
    // 处理OpenRouter响应格式
    if (data.choices && Array.isArray(data.choices)) {
      const assistantMessage = data.choices[0]?.message
      return assistantMessage?.content || '抱歉，我暂时无法回答这个问题'
    } else {
      console.error('无法解析API响应:', data)
      return JSON.stringify(data, null, 2)
    }
  } catch (error) {
    console.error('调用OpenRouter API失败:', error)
    const err = error as any
    const errorMsg = err.message || err.toString() || '未知错误'
    alert(`API调用失败: ${errorMsg}\n请检查网络连接`)
    throw error
  }
}

const handleGenerate = async () => {
  const input = userInput.value.trim()
  if (!input) return

  isLoading.value = true
  plans.value = []

  try {
    // 添加用户消息到历史
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    }
    messages.value.push(userMsg)
    userInput.value = '' // 清空输入框

    // 转换消息格式供API使用
    const historyForApi = messages.value.map(msg => ({
      role: msg.role,
      content: msg.content
    }))

    // 调用API（带重试机制）
    let response = ''
    let retryCount = 0
    const maxRetries = 2

    while (retryCount <= maxRetries) {
      try {
        response = await callOpenRouterAPI(historyForApi)
        break
      } catch (apiError) {
        retryCount++
        if (retryCount > maxRetries) {
          throw apiError
        }
        console.log(`API调用失败，${retryCount}秒后重试...`)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // 添加AI回复到历史
    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }
    messages.value.push(aiMsg)
    aiResponse.value = response

    // 保存当前会话到历史
    saveCurrentChat()

    // 尝试解析行程方案
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        if (result.plans && Array.isArray(result.plans)) {
          plans.value = result.plans
          return
        }
      }
    } catch (parseError) {
      // 解析失败就直接展示文本回复
    }
  } catch (error) {
    const err = error as any
    const errorMsg = err.message || '生成行程失败，请稍后重试'
    
    // 添加错误提示到历史
    const aiMsg: Message = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: `抱歉，${errorMsg}`,
      timestamp: new Date()
    }
    messages.value.push(aiMsg)
    aiResponse.value = errorMsg
  } finally {
    isLoading.value = false
  }
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
  margin: 0.8rem 0 0.4rem 0;
  color: #1f2937;
}

.ai-markdown :deep(h3) {
  font-size: 1.1rem;
  font-weight: bold;
  margin: 0.6rem 0 0.3rem 0;
  color: #1f2937;
}

.ai-markdown :deep(p) {
  margin: 0.5rem 0;
  line-height: 1.6;
}

.ai-markdown :deep(ul), .ai-markdown :deep(ol) {
  margin: 0.5rem 0 0.5rem 1.5rem;
  padding-left: 0;
}

.ai-markdown :deep(li) {
  margin: 0.25rem 0;
  line-height: 1.6;
}

.ai-markdown :deep(strong) {
  font-weight: 600;
  color: #1f2937;
}

.ai-markdown :deep(em) {
  font-style: italic;
}

.ai-markdown :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.ai-markdown :deep(pre) {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 0.75rem 0;
}

.ai-markdown :deep(pre code) {
  background: none;
  padding: 0;
}

.ai-markdown :deep(blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  margin: 0.75rem 0;
  color: #6b7280;
}

.ai-markdown :deep(a) {
  color: #3b82f6;
  text-decoration: underline;
}

.ai-markdown :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
}

.ai-markdown :deep(th), .ai-markdown :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.5rem;
  text-align: left;
}

.ai-markdown :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
}

.ai-markdown :deep(.place-name) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-block;
  margin: 0.125rem;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.ai-markdown :deep(.place-name:hover) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #7c8ff8 0%, #8a5cb8 100%);
}

.ai-markdown :deep(.ai-tip) {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: #78350f;
  padding: 0.25rem 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  display: inline-block;
  margin: 0.25rem 0.125rem;
  box-shadow: 0 2px 4px rgba(251, 191, 36, 0.3);
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
