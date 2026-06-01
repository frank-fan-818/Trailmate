<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
    <!-- 顶部导航 -->
    <header class="fixed top-0 w-full z-50 py-5 transition-all duration-300 bg-white/90 backdrop-blur-md shadow-md">
      <div class="max-w-[1100px] mx-auto px-8 flex justify-between items-center">
        <button
          @click="router.back()"
          class="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary transition-colors rounded-lg hover:bg-gray-100"
        >
          <span class="text-lg">←</span>
          <span>返回</span>
        </button>

        <div class="text-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-primary">Trailmate</p>
          <h1 class="text-lg font-bold text-gray-900">情境感知</h1>
        </div>

        <div class="w-24"></div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="max-w-[1100px] mx-auto px-8 pb-12 pt-28">
      <!-- 初始化状态 -->
      <div v-if="!isInitialized" class="text-center py-20">
        <div class="text-6xl mb-6">🧭</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-4">情境感知系统</h2>
        <p class="text-gray-600 mb-8">实时感知您的位置、时间和行程状态</p>
        <button
          v-if="!isLoading"
          @click="initialize"
          class="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors"
        >
          初始化系统
        </button>
        <div v-else class="text-gray-500">初始化中...</div>
        <p v-if="error" class="mt-4 text-red-500">{{ error }}</p>
      </div>

      <!-- 已初始化 -->
      <div v-else class="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <!-- 左侧：位置模拟器 -->
        <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div class="mb-5">
            <p class="text-sm font-medium text-primary">📍 位置模拟器</p>
            <h2 class="mt-1 text-xl font-semibold text-gray-900">触发感知事件</h2>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">城市</label>
              <input
                v-model="locationForm.city"
                class="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors"
                placeholder="例如：北京"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">交通方式</label>
              <select
                v-model="locationForm.travelMode"
                class="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors"
              >
                <option value="driving">🚗 驾车</option>
                <option value="walking">🚶 步行</option>
                <option value="public_transport">🚌 公共交通</option>
              </select>
            </div>
          </div>

          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">地址</label>
            <input
              v-model="locationForm.address"
              class="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors"
              placeholder="例如：北京市朝阳区三里屯"
            />
          </div>

          <div class="grid gap-4 mt-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">纬度</label>
              <input
                v-model.number="locationForm.latitude"
                type="number"
                step="0.0001"
                class="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">经度</label>
              <input
                v-model.number="locationForm.longitude"
                type="number"
                step="0.0001"
                class="w-full px-3 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <button
            @click="handleSimulateLocation"
            :disabled="isLoading"
            class="mt-5 w-full py-3 px-5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
          >
            {{ isLoading ? '模拟中...' : '模拟位置更新' }}
          </button>

          <div class="mt-4 flex gap-3">
            <button
              @click="handleGetRealLocation"
              :disabled="isGettingRealLocation"
              class="flex-1 py-2.5 px-4 bg-green-600 text-white font-medium text-sm rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {{ isGettingRealLocation ? '定位中...' : '📍 获取真实位置' }}
            </button>
            <button
              v-if="isWatchingLocation"
              @click="handleStopWatching"
              class="flex-1 py-2.5 px-4 bg-gray-600 text-white font-medium text-sm rounded-xl hover:bg-gray-700 transition-colors"
            >
              ⏹ 停止跟踪
            </button>
            <button
              v-else
              @click="handleStartWatching"
              :disabled="!currentLocation"
              class="flex-1 py-2.5 px-4 bg-blue-600 text-white font-medium text-sm rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:bg-gray-400"
            >
              👁 持续跟踪
            </button>
          </div>

          <!-- 自动模拟开关 -->
          <div class="mt-4 flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50">
            <div>
              <p class="text-sm font-medium text-gray-900">自动模拟</p>
              <p class="text-xs text-gray-500">开启后每10秒自动更新位置</p>
            </div>
            <button
              @click="handleToggleAutoSim"
              :class="[
                'relative inline-flex h-7 w-12 items-center rounded-full transition-colors',
                autoSimulate ? 'bg-primary' : 'bg-gray-300'
              ]"
            >
              <span
                :class="[
                  'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
                  autoSimulate ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>

          <p class="mt-3 text-sm text-gray-500 text-center">{{ locationStatus }}</p>

          <div class="mt-4 rounded-xl overflow-hidden border border-gray-200">
            <TravelMap
              :user-position="currentLocation"
              :timeline-nodes="timeline"
              :center="mapCenter"
              :zoom="mapZoom"
              height="450px"
            />
          </div>
        </section>

        <!-- 右侧：通知列表 -->
        <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div class="mb-5">
            <p class="text-sm font-medium text-primary">🔔 感知提醒</p>
            <h2 class="mt-1 text-xl font-semibold text-gray-900">通知列表</h2>
          </div>

          <div v-if="notifications.length === 0" class="rounded-xl bg-gray-50 px-4 py-8 text-center">
            <p class="text-gray-500 text-sm">暂无通知</p>
            <p class="text-gray-400 text-xs mt-1">模拟位置或生成行程后将收到提醒</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              class="rounded-xl border px-4 py-4 transition-colors"
              :class="getNotificationClass(notification.level)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1">
                  <p class="text-sm font-medium text-gray-900">{{ notification.content }}</p>
                  <p class="mt-1 text-xs text-gray-500">
                    {{ formatTime(notification.triggerTime) }}
                  </p>
                </div>
                <button
                  v-if="!notification.isRead"
                  @click="handleMarkAsRead(notification.id)"
                  class="shrink-0 px-3 py-1 text-xs font-medium border border-gray-300 rounded-lg hover:border-primary hover:text-primary transition-colors"
                >
                  已读
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 底部：时间线 -->
        <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 xl:col-span-2">
          <div class="mb-5 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p class="text-sm font-medium text-primary">📅 时间线</p>
              <h2 class="mt-1 text-xl font-semibold text-gray-900">行程进度</h2>
            </div>
            <select
              v-if="savedPlans.length > 0"
              v-model="activePlanIdx"
              @change="loadTimelineFromPlan"
              class="px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary"
            >
              <option :value="-1">选择行程方案</option>
              <option v-for="(p, i) in savedPlans" :key="i" :value="i">{{ p.name }}</option>
            </select>
          </div>

          <!-- 进度条 -->
          <div v-if="activePlan && timeline.length > 0" class="mb-4">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs text-gray-500">完成进度</span>
              <span class="text-xs font-semibold" :class="progressPercent >= 100 ? 'text-green-600' : 'text-primary'">{{ completedCount }}/{{ timeline.length }} ({{ progressPercent }}%)</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-primary rounded-full transition-all duration-500" :style="{ width: progressPercent + '%' }"></div>
            </div>
          </div>

          <div v-if="savedPlans.length === 0" class="rounded-xl bg-gray-50 px-4 py-8 text-center">
            <p class="text-gray-500 text-sm">暂无行程数据</p>
            <p class="text-gray-400 text-xs mt-1">在行程规划页面生成计划后将在此显示</p>
            <button @click="router.push('/planner')" class="mt-4 px-4 py-2 text-sm text-primary font-medium border border-primary/30 rounded-lg hover:bg-primary/5">前往规划</button>
          </div>
          <div v-else-if="activePlanIdx < 0" class="rounded-xl bg-gray-50 px-4 py-8 text-center">
            <p class="text-gray-500 text-sm">请选择一个行程方案</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="node in timeline"
              :key="node.id"
              class="grid gap-3 rounded-xl border border-gray-200 px-4 py-4 md:grid-cols-[80px_100px_1fr_auto]"
              :class="getNodeClass(node.status)"
            >
              <div class="text-sm font-semibold text-primary">Day {{ node.dayIndex + 1 }}</div>
              <div class="text-sm text-gray-600">{{ node.startTime }} - {{ node.endTime }}</div>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <p class="text-sm font-semibold text-gray-900">{{ node.title }}</p>
                  <span class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                    {{ node.type }}
                  </span>
                  <span
                    class="px-2 py-0.5 text-xs rounded-full"
                    :class="getStatusBadgeClass(node.status)"
                  >
                    {{ node.status }}
                  </span>
                </div>
                <p v-if="node.description" class="mt-1 text-sm text-gray-600">{{ node.description }}</p>
              </div>
              <select
                :value="node.status"
                @change="handleNodeStatusChange(node.id, ($event.target as HTMLSelectElement).value)"
                class="px-2 py-1 text-sm border border-gray-200 rounded-lg outline-none focus:border-primary"
              >
                <option value="not_started">未开始</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
                <option value="delayed">已延迟</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
          </div>
        </section>

        <!-- 规则列表 -->
        <section class="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 xl:col-span-2">
          <div class="mb-5 flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-primary">📋 规则引擎</p>
              <h2 class="mt-1 text-xl font-semibold text-gray-900">规则列表</h2>
            </div>
            <button
              @click="showAddRuleModal = true"
              class="px-4 py-2 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary/90 transition-colors"
            >
              + 添加规则
            </button>
          </div>

          <div v-if="rules.length === 0" class="rounded-xl bg-gray-50 px-4 py-8 text-center">
            <p class="text-gray-500 text-sm">暂无规则数据</p>
            <p class="text-gray-400 text-xs mt-1">初始化系统后将加载内置规则</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="rule in rules"
              :key="rule.id"
              class="grid gap-3 rounded-xl border border-gray-200 px-4 py-4 items-center"
              :class="rule.enabled ? 'bg-white' : 'bg-gray-50 opacity-60'"
              style="grid-template-columns: 1fr auto auto auto 52px auto"
            >
              <div>
                <div class="flex items-center gap-2">
                  <p class="text-sm font-semibold text-gray-900">{{ rule.name }}</p>
                  <span
                    class="px-2 py-0.5 text-xs rounded-full"
                    :class="rule.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
                  >
                    {{ rule.enabled ? '已启用' : '已禁用' }}
                  </span>
                </div>
                <p class="mt-1 text-xs text-gray-500">{{ rule.description }}</p>
              </div>
              <span class="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600 font-mono">
                {{ rule.condition.type }}
              </span>
              <span class="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 font-mono">
                {{ rule.action.type }}
              </span>
              <span class="text-xs text-gray-400 font-mono">P{{ rule.priority }}</span>
              <!-- Toggle switch -->
              <button
                @click="handleToggleRule(rule.id, !rule.enabled)"
                :class="[
                  'relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0',
                  rule.enabled ? 'bg-primary' : 'bg-gray-300'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-5 w-5 rounded-full bg-white shadow transition-transform',
                    rule.enabled ? 'translate-x-6' : 'translate-x-1'
                  ]"
                />
              </button>
              <!-- Delete (custom rules only) -->
              <button
                v-if="!rule.id.startsWith('rule_')"
                @click="handleDeleteRule(rule.id)"
                class="px-2 py-1 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors shrink-0"
              >
                删除
              </button>
              <span v-else class="w-14" />
            </div>
          </div>
        </section>

        <!-- 添加规则模态框 -->
        <div
          v-if="showAddRuleModal"
          class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          @click.self="showAddRuleModal = false"
        >
          <div class="bg-white w-full max-w-lg mx-4 rounded-2xl shadow-xl">
            <div class="p-5 border-b border-gray-200 flex items-center justify-between">
              <h3 class="text-lg font-bold text-gray-900">添加自定义规则</h3>
              <button
                @click="showAddRuleModal = false"
                class="text-gray-500 hover:text-gray-700 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            <div class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">规则名称 *</label>
                <input
                  v-model="ruleForm.name"
                  type="text"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors"
                  placeholder="例如：我的自定义提醒"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  v-model="ruleForm.description"
                  rows="2"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors"
                  placeholder="规则说明（可选）"
                ></textarea>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">条件类型</label>
                <select
                  v-model="ruleForm.conditionType"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors"
                >
                  <option value="time">时间 (time)</option>
                  <option value="location">位置 (location)</option>
                  <option value="weather">天气 (weather)</option>
                  <option value="event">事件 (event)</option>
                  <option value="congestion">拥堵 (congestion)</option>
                  <option value="closure">关闭 (closure)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">动作类型</label>
                <select
                  v-model="ruleForm.actionType"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors"
                >
                  <option value="push_notification">推送通知 (push_notification)</option>
                  <option value="update_timeline">更新时间线 (update_timeline)</option>
                  <option value="adjust_plan">调整计划 (adjust_plan)</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                <input
                  v-model.number="ruleForm.priority"
                  type="number"
                  min="1"
                  max="10"
                  class="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors"
                />
                <p class="mt-1 text-xs text-gray-400">数字越大优先级越高（1-10）</p>
              </div>
            </div>

            <div class="p-5 border-t border-gray-200 flex gap-3">
              <button
                @click="showAddRuleModal = false"
                class="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                @click="handleSubmitRule"
                :disabled="!ruleForm.name.trim()"
                class="flex-1 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-60"
              >
                添加规则
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTrailmateCore } from '../composables/use-trailmate-core'
import { loadSavedPlans } from '../composables/useItineraryPlanner'
import TravelMap from '../components/TravelMap.vue'
import type { LocationInfo } from '@trailmate/perception'

const router = useRouter()

interface Notification {
  id: string
  userId: string
  planId?: string
  content: string
  level: 'info' | 'warning' | 'error' | 'urgent'
  triggerTime: number
  isRead: boolean
  relatedNodeId?: string
}

interface TimelineNode {
  id: string
  planId: string
  dayIndex: number
  startTime: string
  endTime: string
  title: string
  description?: string
  type: string
  status: string
  address?: string
}

const {
  isInitialized,
  isLoading,
  error,
  initialize,
  getNotifications,
  markNotificationAsRead,
  getTimeline,
  updateNodeStatus,
  simulateLocation,
  toggleAutoSimulate,
  getRealLocation,
  startRealLocationWatcher,
  stopRealLocationWatcher,
  getAllRules,
  addCustomRule,
  removeCustomRule,
  setRuleEnabled
} = useTrailmateCore()

const locationForm = reactive({
  latitude: 39.9042,
  longitude: 116.4074,
  city: '北京',
  address: '北京市朝阳区天安门广场',
  travelMode: 'driving' as 'walking' | 'driving' | 'public_transport'
})

const locationStatus = ref('暂无模拟位置')
const notifications = ref<Notification[]>([])
const timeline = ref<TimelineNode[]>([])
const isGettingRealLocation = ref(false)
const isWatchingLocation = ref(false)
const currentLocation = ref<LocationInfo | null>(null)
const stopWatcher = ref<(() => void) | null>(null)
const autoSimulate = ref(false)
const rules = ref<Array<{ id: string; name: string; description?: string; enabled: boolean; priority: number; condition: { type: string; params: Record<string, any> }; action: { type: string; params: Record<string, any> } }>>([])
const showAddRuleModal = ref(false)
const ruleForm = reactive({
  name: '',
  description: '',
  conditionType: 'time' as string,
  actionType: 'push_notification' as string,
  priority: 1
})

// Plan-based timeline
const savedPlans = ref<any[]>([])
const activePlanIdx = ref(-1)
const timelineStatuses = ref<Record<string, string>>({})
const STATUS_STORAGE_KEY = 'trailmate-timeline-statuses'
const geocodeCache = ref<Record<string, { lat: number; lng: number } | null>>({})

const activePlan = computed(() => {
  if (activePlanIdx.value < 0 || activePlanIdx.value >= savedPlans.value.length) return null
  return savedPlans.value[activePlanIdx.value]
})

const completedCount = computed(() => timeline.value.filter(n => n.status === 'completed').length)
const progressPercent = computed(() => {
  if (timeline.value.length === 0) return 0
  return Math.round((completedCount.value / timeline.value.length) * 100)
})
const mapCenter = computed<[number, number]>(() => {
  const first = timeline.value.find(n => n.latitude != null)
  if (first) return [first.latitude!, first.longitude!]
  if (currentLocation.value) return [currentLocation.value.latitude, currentLocation.value.longitude]
  return [39.9042, 116.4074] // default Beijing
})
const mapZoom = computed(() => {
  // If only city-level coords (all items share same coords), zoom out
  const coords = timeline.value.filter(n => n.latitude != null)
  if (coords.length < 2) return 13
  // Check spread: if all within ~10km, use city zoom; else country zoom
  const lats = coords.map(n => n.latitude!)
  const lngs = coords.map(n => n.longitude!)
  const spread = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs))
  return spread < 0.1 ? 14 : spread < 1 ? 10 : 5
})

// Geocode address using free Nominatim API (OpenStreetMap, global coverage)
async function geocodeAddress(address: string, cityHint?: string): Promise<{ lat: number; lng: number } | null> {
  if (!address) return null
  const key = address.toLowerCase().trim()
  if (geocodeCache.value[key] !== undefined) return geocodeCache.value[key]

  // Try localStorage cache first
  try {
    const raw = localStorage.getItem('trailmate-geocode-cache')
    if (raw) {
      const cached = JSON.parse(raw)
      if (cached[key] !== undefined) {
        geocodeCache.value[key] = cached[key]
        return cached[key]
      }
    }
  } catch {}

  // Nominatim geocoding (free, global, 1 req/sec limit)
  const query = cityHint ? `${address}, ${cityHint}` : address
  try {
    await new Promise(r => setTimeout(r, 1100)) // rate limit
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    const res = await fetch(url, { headers: { 'User-Agent': 'Trailmate/1.0' } })
    const data = await res.json()
    if (data.length > 0) {
      const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      geocodeCache.value[key] = result
      // Persist to localStorage
      try {
        const existing = JSON.parse(localStorage.getItem('trailmate-geocode-cache') || '{}')
        existing[key] = result
        localStorage.setItem('trailmate-geocode-cache', JSON.stringify(existing))
      } catch {}
      return result
    }
  } catch {}

  geocodeCache.value[key] = null
  return null
}

async function loadTimelineFromPlan() {
  const plan = activePlan.value
  if (!plan || !plan.days) { timeline.value = []; return }
  const statuses = loadStatuses()

  // Extract city/country from plan metadata
  const cityHint = extractCityFromPlan(plan)

  // Geocode the city first for accurate map center
  let cityCoords: { lat: number; lng: number } | null = null
  if (cityHint) {
    cityCoords = await geocodeAddress(cityHint)
  }

  const nodes: TimelineNode[] = []
  for (const day of plan.days) {
    for (const item of (day.items || [])) {
      const id = `${plan.name}_day${day.day}_${item.name}`
      let latitude: number | undefined
      let longitude: number | undefined
      if (item.address) {
        // Use full context: "Street, City, Country"
        const fullQuery = cityHint ? `${item.address}, ${cityHint}` : item.address
        const coords = await geocodeAddress(fullQuery)
        if (coords) {
          latitude = coords.lat
          longitude = coords.lng
        }
      }
      // Fallback: use city coords for items without address
      if (latitude == null && cityCoords) {
        latitude = cityCoords.lat
        longitude = cityCoords.lng
      }
      nodes.push({
        id,
        planId: plan.name,
        dayIndex: (day.day || 1) - 1,
        startTime: item.startTime || '09:00',
        endTime: item.endTime || '10:00',
        title: item.name,
        description: item.address || '',
        type: item.type || 'attraction',
        status: statuses[id] || 'not_started',
        address: item.address,
        latitude,
        longitude,
      })
    }
  }
  timeline.value = nodes
}

// Extract city/country from plan name, description, and tags
function extractCityFromPlan(plan: any): string {
  const sources = [plan.name, plan.description, ...(plan.tags || [])].filter(Boolean)
  const combined = sources.join(' ')

  // Common Chinese city patterns: XX市, XX省, XX国
  const cnCityMatch = combined.match(/([\u4e00-\u9fa5]{2,5})(?:市|省|国)/)
  if (cnCityMatch) return cnCityMatch[0]

  // Common European city names (from the AI-generated content)
  const knownCities = [
    'Munich', 'Berlin', 'Paris', 'London', 'Rome', 'Barcelona', 'Amsterdam',
    'Vienna', 'Prague', 'Budapest', 'Milan', 'Venice', 'Florence',
    'Tokyo', 'Kyoto', 'Osaka', 'Seoul', 'Bangkok', 'Singapore',
    'New York', 'Los Angeles', 'San Francisco', 'Chicago', 'Sydney',
    '慕尼黑', '柏林', '巴黎', '伦敦', '罗马', '巴塞罗那', '阿姆斯特丹',
    '维也纳', '布拉格', '布达佩斯', '米兰', '威尼斯', '佛罗伦萨',
    '东京', '京都', '大阪', '首尔', '曼谷', '新加坡',
    '纽约', '洛杉矶', '旧金山', '芝加哥', '悉尼',
  ]
  for (const city of knownCities) {
    if (combined.includes(city)) return city
  }

  // Fallback: return first address from first day
  const firstAddr = plan.days?.[0]?.items?.[0]?.address
  return firstAddr || ''
}

function loadStatuses(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STATUS_STORAGE_KEY) || '{}')
  } catch { return {} }
}

function saveStatuses() {
  const s: Record<string, string> = {}
  for (const n of timeline.value) s[n.id] = n.status
  localStorage.setItem(STATUS_STORAGE_KEY, JSON.stringify(s))
}

onMounted(async () => {
  await initialize()
  await Promise.all([loadNotifications(), loadRules()])
  savedPlans.value = loadSavedPlans()
  if (savedPlans.value.length > 0) {
    activePlanIdx.value = 0
    loadTimelineFromPlan()
  }
})

const loadNotifications = async () => {
  try {
    notifications.value = await getNotifications({})
  } catch (e) {
    console.error('获取通知失败:', e)
  }
}

const loadRules = async () => {
  try {
    rules.value = await getAllRules()
  } catch (e) {
    console.error('获取规则列表失败:', e)
  }
}

const handleToggleAutoSim = async () => {
  try {
    autoSimulate.value = !autoSimulate.value
    await toggleAutoSimulate(autoSimulate.value)
    locationStatus.value = autoSimulate.value ? '自动模拟已开启，每10秒更新位置' : '自动模拟已关闭'
  } catch (e) {
    console.error('切换自动模拟失败:', e)
    autoSimulate.value = !autoSimulate.value
  }
}

const handleToggleRule = async (ruleId: string, enabled: boolean) => {
  try {
    await setRuleEnabled(ruleId, enabled)
    await loadRules()
  } catch (e) {
    console.error('切换规则状态失败:', e)
  }
}

const handleDeleteRule = async (ruleId: string) => {
  try {
    await removeCustomRule(ruleId)
    await loadRules()
  } catch (e) {
    console.error('删除规则失败:', e)
  }
}

const handleSubmitRule = async () => {
  if (!ruleForm.name.trim()) return

  const newRule = {
    id: `custom_${Date.now()}`,
    name: ruleForm.name.trim(),
    description: ruleForm.description.trim() || undefined,
    condition: {
      type: ruleForm.conditionType,
      params: {}
    },
    action: {
      type: ruleForm.actionType,
      params: {}
    },
    enabled: true,
    priority: ruleForm.priority
  }

  try {
    await addCustomRule(newRule as any)
    showAddRuleModal.value = false
    ruleForm.name = ''
    ruleForm.description = ''
    ruleForm.conditionType = 'time'
    ruleForm.actionType = 'push_notification'
    ruleForm.priority = 1
    await loadRules()
  } catch (e) {
    console.error('添加自定义规则失败:', e)
  }
}

const handleMarkAsRead = async (notificationId: string) => {
  await markNotificationAsRead(notificationId)
  await loadNotifications()
}

const handleSimulateLocation = async () => {
  try {
    await simulateLocation({
      latitude: locationForm.latitude,
      longitude: locationForm.longitude,
      city: locationForm.city,
      address: locationForm.address,
      travelMode: locationForm.travelMode
    })
    locationStatus.value = `已模拟：${locationForm.city} ${locationForm.address}`
    currentLocation.value = {
      latitude: locationForm.latitude,
      longitude: locationForm.longitude,
      city: locationForm.city,
      address: locationForm.address
    } as LocationInfo
    await loadNotifications()
  } catch (e) {
    console.error('位置模拟失败:', e)
    locationStatus.value = '位置模拟失败，请先初始化'
  }
}

const handleGetRealLocation = async () => {
  isGettingRealLocation.value = true
  locationStatus.value = '正在获取位置...'
  try {
    const location = await getRealLocation()
    if (location) {
      currentLocation.value = location
      locationStatus.value = `真实位置：${location.city} ${location.address}`
      locationForm.latitude = location.latitude
      locationForm.longitude = location.longitude
      locationForm.city = location.city
      locationForm.address = location.address
      await loadNotifications()
    } else {
      locationStatus.value = '获取位置失败，请检查定位权限'
    }
  } catch (e) {
    console.error('获取真实位置失败:', e)
    locationStatus.value = '获取位置异常'
  } finally {
    isGettingRealLocation.value = false
  }
}

const handleStartWatching = async () => {
  if (!currentLocation.value) return
  isWatchingLocation.value = true
  const stopFn = await startRealLocationWatcher((location) => {
    currentLocation.value = location
    locationStatus.value = `跟踪中：${location.city} ${location.address}`
    locationForm.latitude = location.latitude
    locationForm.longitude = location.longitude
    locationForm.city = location.city
    locationForm.address = location.address
  })
  stopWatcher.value = stopFn
  locationStatus.value = '开始持续跟踪位置...'
}

const handleStopWatching = async () => {
  if (stopWatcher.value) {
    stopWatcher.value()
    stopWatcher.value = null
  }
  await stopRealLocationWatcher()
  isWatchingLocation.value = false
  locationStatus.value = '已停止位置跟踪'
}

const handleNodeStatusChange = async (nodeId: string, status: string) => {
  const node = timeline.value.find(n => n.id === nodeId)
  if (node) {
    node.status = status
    saveStatuses()
  }
}

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN')
}

const getNotificationClass = (level: string) => {
  switch (level) {
    case 'urgent':
      return 'border-red-200 bg-red-50'
    case 'error':
      return 'border-orange-200 bg-orange-50'
    case 'warning':
      return 'border-yellow-200 bg-yellow-50'
    default:
      return 'border-blue-200 bg-blue-50'
  }
}

const getNodeClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'border-green-200 bg-green-50'
    case 'in_progress':
      return 'border-blue-200 bg-blue-50'
    case 'delayed':
      return 'border-yellow-200 bg-yellow-50'
    case 'cancelled':
      return 'border-gray-200 bg-gray-50 opacity-60'
    default:
      return 'border-gray-200 bg-white'
  }
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700'
    case 'in_progress':
      return 'bg-blue-100 text-blue-700'
    case 'delayed':
      return 'bg-yellow-100 text-yellow-700'
    case 'cancelled':
      return 'bg-gray-100 text-gray-500'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}
</script>