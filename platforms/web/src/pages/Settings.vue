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
      
      <h1 class="text-xl font-bold text-gray-900">设置</h1>
    </header>

    <!-- 主内容区 -->
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- 个人资料 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-6">个人资料</h2>
          
          <div class="space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-3xl">👤</span>
              </div>
              <div>
                <button class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  更换头像
                </button>
                <p class="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式，最大 2MB</p>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">昵称</label>
              <input
                type="text"
                v-model="settings.nickname"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入昵称"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">个人简介</label>
              <textarea
                v-model="settings.bio"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows="3"
                placeholder="介绍一下自己..."
              />
            </div>
          </div>
        </div>

        <!-- 行程偏好 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-6">行程偏好</h2>
          
          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                默认预算范围：¥{{ settings.budget[0] }} - ¥{{ settings.budget[1] }}
              </label>
              <div class="flex items-center gap-4">
                <input
                  type="range"
                  v-model="settings.budget[0]"
                  min="1000"
                  max="50000"
                  step="1000"
                  class="flex-1"
                />
                <input
                  type="range"
                  v-model="settings.budget[1]"
                  min="1000"
                  max="50000"
                  step="1000"
                  class="flex-1"
                />
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">旅行类型</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="type in travelTypes"
                  :key="type"
                  @click="toggleTravelType(type)"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    settings.travelTypes.includes(type)
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ type }}
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">交通方式</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="transport in transportTypes"
                  :key="transport"
                  @click="toggleTransport(transport)"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    settings.transports.includes(transport)
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ transport }}
                </button>
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">住宿类型</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="accommodation in accommodationTypes"
                  :key="accommodation"
                  @click="toggleAccommodation(accommodation)"
                  :class="[
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    settings.accommodations.includes(accommodation)
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  ]"
                >
                  {{ accommodation }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 通知设置 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-6">通知设置</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">行程提醒</div>
                <div class="text-sm text-gray-500">接收行程相关的提醒通知</div>
              </div>
              <button
                @click="settings.notifications.itinerary = !settings.notifications.itinerary"
                :class="[
                  'w-12 h-6 rounded-full transition-colors relative',
                  settings.notifications.itinerary ? 'bg-blue-600' : 'bg-gray-300'
                ]"
              >
                <div
                  :class="[
                    'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                    settings.notifications.itinerary ? 'translate-x-6' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">情境感知推送</div>
                <div class="text-sm text-gray-500">接收基于情境的智能推送</div>
              </div>
              <button
                @click="settings.notifications.context = !settings.notifications.context"
                :class="[
                  'w-12 h-6 rounded-full transition-colors relative',
                  settings.notifications.context ? 'bg-blue-600' : 'bg-gray-300'
                ]"
              >
                <div
                  :class="[
                    'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                    settings.notifications.context ? 'translate-x-6' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>
            
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">旅伴匹配通知</div>
                <div class="text-sm text-gray-500">收到新的旅伴匹配时通知</div>
              </div>
              <button
                @click="settings.notifications.matching = !settings.notifications.matching"
                :class="[
                  'w-12 h-6 rounded-full transition-colors relative',
                  settings.notifications.matching ? 'bg-blue-600' : 'bg-gray-300'
                ]"
              >
                <div
                  :class="[
                    'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                    settings.notifications.matching ? 'translate-x-6' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>
          </div>
        </div>

        <!-- 显示设置 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-6">显示设置</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">深色模式</div>
                <div class="text-sm text-gray-500">切换深色主题</div>
              </div>
              <button
                @click="settings.darkMode = !settings.darkMode"
                :class="[
                  'w-12 h-6 rounded-full transition-colors relative',
                  settings.darkMode ? 'bg-blue-600' : 'bg-gray-300'
                ]"
              >
                <div
                  :class="[
                    'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                    settings.darkMode ? 'translate-x-6' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">语言</label>
              <select
                v-model="settings.language"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        <!-- 隐私与安全 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-6">隐私与安全</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">旅伴匹配可见性</div>
                <div class="text-sm text-gray-500">是否允许其他用户在旅伴匹配中看到你</div>
              </div>
              <button
                @click="settings.privacy.visibleInMatching = !settings.privacy.visibleInMatching"
                :class="[
                  'w-12 h-6 rounded-full transition-colors relative',
                  settings.privacy.visibleInMatching ? 'bg-blue-600' : 'bg-gray-300'
                ]"
              >
                <div
                  :class="[
                    'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                    settings.privacy.visibleInMatching ? 'translate-x-6' : 'translate-x-0.5'
                  ]"
                />
              </button>
            </div>
            
            <button class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
              导出我的数据
            </button>
          </div>
        </div>

        <!-- 关于 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-6">关于</h2>
          
          <div class="space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">版本</span>
              <span class="text-gray-900">Trailmate v1.0.0</span>
            </div>
            
            <button class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
              帮助文档
            </button>
            
            <button class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
              问题反馈
            </button>
            
            <button class="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium">
              用户协议与隐私政策
            </button>
          </div>
        </div>

        <!-- 保存按钮 -->
        <button
          @click="handleSave"
          class="w-full px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
        >
          保存设置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettings } from '../stores/settings'

const { settings, saveSettings } = useSettings()

const emit = defineEmits<{
  (e: 'back'): void
}>()

const travelTypes = ['休闲', '文化', '冒险', '美食', '购物', '自然']
const transportTypes = ['飞机', '高铁', '自驾', '大巴']
const accommodationTypes = ['酒店', '民宿', '青旅', '度假村']

// 监听设置变化，自动保存
watch(settings, () => {
  saveSettings()
}, { deep: true })

const toggleTravelType = (type: string) => {
  const index = settings.value.travelTypes.indexOf(type)
  if (index > -1) {
    settings.value.travelTypes.splice(index, 1)
  } else {
    settings.value.travelTypes.push(type)
  }
}

const toggleTransport = (transport: string) => {
  const index = settings.value.transports.indexOf(transport)
  if (index > -1) {
    settings.value.transports.splice(index, 1)
  } else {
    settings.value.transports.push(transport)
  }
}

const toggleAccommodation = (accommodation: string) => {
  const index = settings.value.accommodations.indexOf(accommodation)
  if (index > -1) {
    settings.value.accommodations.splice(index, 1)
  } else {
    settings.value.accommodations.push(accommodation)
  }
}

const handleSave = () => {
  alert('设置已保存！')
}
</script>
