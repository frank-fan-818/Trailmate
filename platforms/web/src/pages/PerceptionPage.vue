<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-50 to-orange-50">
    <!-- 顶部导航 -->
    <header class="fixed top-0 w-full z-50 py-5 transition-all duration-300 bg-white/90 backdrop-blur-md shadow-md">
      <div class="max-w-[1100px] mx-auto px-8 flex justify-between items-center">
        <button
          @click="$emit('back')"
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

          <p class="mt-3 text-sm text-gray-500 text-center">{{ locationStatus }}</p>
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
          <div class="mb-5">
            <p class="text-sm font-medium text-primary">📅 时间线</p>
            <h2 class="mt-1 text-xl font-semibold text-gray-900">行程进度</h2>
          </div>

          <div v-if="timeline.length === 0" class="rounded-xl bg-gray-50 px-4 py-8 text-center">
            <p class="text-gray-500 text-sm">暂无时间线数据</p>
            <p class="text-gray-400 text-xs mt-1">生成行程后将自动生成时间线</p>
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
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useTrailmateCore } from '../composables/use-trailmate-core'
import type { LocationInfo } from '@trailmate/perception'

defineEmits<{
  (e: 'back'): void
}>()

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
  getRealLocation,
  startRealLocationWatcher,
  stopRealLocationWatcher
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

onMounted(async () => {
  await initialize()
  await loadNotifications()
})

const loadNotifications = async () => {
  try {
    notifications.value = await getNotifications({})
  } catch (e) {
    console.error('获取通知失败:', e)
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
  if (timeline.value.length === 0) return
  const planId = timeline.value[0].planId
  try {
    await updateNodeStatus({ planId, nodeId, status })
    const updated = await getTimeline(planId)
    timeline.value = updated
  } catch (e) {
    console.error('更新节点状态失败:', e)
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