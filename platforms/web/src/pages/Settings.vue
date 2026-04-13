<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航 - Apple 风格毛玻璃效果 -->
    <header class="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 flex items-center justify-between sticky top-0 z-20">
      <button 
        @click="$emit('back')"
        class="flex items-center gap-2 text-apple-blue hover:brightness-110 transition-all"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="text-body font-medium">返回</span>
      </button>
      
      <h1 class="text-headline font-semibold text-gray-600">设置</h1>
      
      <div class="w-16"></div>
    </header>

    <!-- 主内容区 -->
    <div class="container mx-auto px-6 py-10">
      <div class="max-w-2xl mx-auto space-y-8">
        <!-- 个人资料 - Apple 风格卡片 -->
        <section class="apple-card overflow-hidden">
          <div class="p-6 border-b border-gray-200/50">
            <h2 class="text-title3 font-semibold text-gray-600">个人资料</h2>
          </div>
          
          <div class="p-6 space-y-6">
            <div class="flex items-center gap-5">
              <div class="w-20 h-20 bg-apple-blue/10 rounded-apple-xl flex items-center justify-center">
                <span class="text-4xl">👤</span>
              </div>
              <div>
                <button class="apple-button text-subhead py-2.5 px-5">
                  更换头像
                </button>
                <p class="text-caption1 text-gray-400 mt-2">支持 JPG、PNG 格式，最大 2MB</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <label class="block text-subhead font-medium text-gray-600">昵称</label>
              <input
                type="text"
                v-model="settings.nickname"
                class="apple-input"
                placeholder="请输入昵称"
              />
            </div>
            
            <div class="space-y-2">
              <label class="block text-subhead font-medium text-gray-600">个人简介</label>
              <textarea
                v-model="settings.bio"
                class="apple-input resize-none"
                rows="3"
                placeholder="介绍一下自己..."
              />
            </div>
          </div>
        </section>

        <!-- 行程偏好 -->
        <section class="apple-card overflow-hidden">
          <div class="p-6 border-b border-gray-200/50">
            <h2 class="text-title3 font-semibold text-gray-600">行程偏好</h2>
          </div>
          
          <div class="p-6 space-y-8">
            <div class="space-y-3">
              <label class="block text-subhead font-medium text-gray-600">
                默认预算范围：¥{{ settings.budget[0] }} - ¥{{ settings.budget[1] }}
              </label>
              <div class="flex items-center gap-4">
                <input
                  type="range"
                  v-model="settings.budget[0]"
                  min="1000"
                  max="50000"
                  step="1000"
                  class="flex-1 accent-apple-blue"
                />
                <input
                  type="range"
                  v-model="settings.budget[1]"
                  min="1000"
                  max="50000"
                  step="1000"
                  class="flex-1 accent-apple-blue"
                />
              </div>
            </div>
            
            <div class="space-y-3">
              <label class="block text-subhead font-medium text-gray-600">旅行类型</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="type in travelTypes"
                  :key="type"
                  @click="toggleTravelType(type)"
                  :class="[
                    'px-4 py-2 rounded-full text-subhead font-medium transition-all duration-200',
                    settings.travelTypes.includes(type)
                      ? 'bg-apple-blue text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  ]"
                >
                  {{ type }}
                </button>
              </div>
            </div>
            
            <div class="space-y-3">
              <label class="block text-subhead font-medium text-gray-600">交通方式</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="transport in transportTypes"
                  :key="transport"
                  @click="toggleTransport(transport)"
                  :class="[
                    'px-4 py-2 rounded-full text-subhead font-medium transition-all duration-200',
                    settings.transports.includes(transport)
                      ? 'bg-apple-blue text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  ]"
                >
                  {{ transport }}
                </button>
              </div>
            </div>
            
            <div class="space-y-3">
              <label class="block text-subhead font-medium text-gray-600">住宿类型</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="accommodation in accommodationTypes"
                  :key="accommodation"
                  @click="toggleAccommodation(accommodation)"
                  :class="[
                    'px-4 py-2 rounded-full text-subhead font-medium transition-all duration-200',
                    settings.accommodations.includes(accommodation)
                      ? 'bg-apple-blue text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  ]"
                >
                  {{ accommodation }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 通知设置 - Apple 风格开关列表 -->
        <section class="apple-card overflow-hidden">
          <div class="p-6 border-b border-gray-200/50">
            <h2 class="text-title3 font-semibold text-gray-600">通知设置</h2>
          </div>
          
          <div class="divide-y divide-gray-200/50">
            <div class="p-6 flex items-center justify-between">
              <div>
                <div class="text-body font-medium text-gray-600">行程提醒</div>
                <div class="text-subhead text-gray-400 mt-0.5">接收行程相关的提醒通知</div>
              </div>
              <AppleToggle v-model="settings.notifications.itinerary" />
            </div>
            
            <div class="p-6 flex items-center justify-between">
              <div>
                <div class="text-body font-medium text-gray-600">情境感知推送</div>
                <div class="text-subhead text-gray-400 mt-0.5">接收基于情境的智能推送</div>
              </div>
              <AppleToggle v-model="settings.notifications.context" />
            </div>
            
            <div class="p-6 flex items-center justify-between">
              <div>
                <div class="text-body font-medium text-gray-600">旅伴匹配通知</div>
                <div class="text-subhead text-gray-400 mt-0.5">收到新的旅伴匹配时通知</div>
              </div>
              <AppleToggle v-model="settings.notifications.matching" />
            </div>
          </div>
        </section>

        <!-- 显示设置 -->
        <section class="apple-card overflow-hidden">
          <div class="p-6 border-b border-gray-200/50">
            <h2 class="text-title3 font-semibold text-gray-600">显示设置</h2>
          </div>
          
          <div class="divide-y divide-gray-200/50">
            <div class="p-6 flex items-center justify-between">
              <div>
                <div class="text-body font-medium text-gray-600">深色模式</div>
                <div class="text-subhead text-gray-400 mt-0.5">切换深色主题</div>
              </div>
              <AppleToggle v-model="settings.darkMode" />
            </div>
            
            <div class="p-6">
              <label class="block text-body font-medium text-gray-600 mb-3">语言</label>
              <select
                v-model="settings.language"
                class="apple-input"
              >
                <option value="zh">中文</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </section>

        <!-- 隐私与安全 -->
        <section class="apple-card overflow-hidden">
          <div class="p-6 border-b border-gray-200/50">
            <h2 class="text-title3 font-semibold text-gray-600">隐私与安全</h2>
          </div>
          
          <div class="divide-y divide-gray-200/50">
            <div class="p-6 flex items-center justify-between">
              <div>
                <div class="text-body font-medium text-gray-600">旅伴匹配可见性</div>
                <div class="text-subhead text-gray-400 mt-0.5">是否允许其他用户在旅伴匹配中看到你</div>
              </div>
              <AppleToggle v-model="settings.privacy.visibleInMatching" />
            </div>
            
            <div class="p-6">
              <button class="apple-button-secondary w-full text-subhead">
                导出我的数据
              </button>
            </div>
          </div>
        </section>

        <!-- 关于 -->
        <section class="apple-card overflow-hidden">
          <div class="p-6 border-b border-gray-200/50">
            <h2 class="text-title3 font-semibold text-gray-600">关于</h2>
          </div>
          
          <div class="divide-y divide-gray-200/50">
            <div class="p-6 flex justify-between items-center">
              <span class="text-body text-gray-600">版本</span>
              <span class="text-body font-medium text-gray-600">Trailmate v1.0.0</span>
            </div>
            
            <div class="p-6">
              <button class="apple-button-secondary w-full text-subhead mb-3">
                帮助文档
              </button>
              
              <button class="apple-button-secondary w-full text-subhead mb-3">
                问题反馈
              </button>
              
              <button class="apple-button-secondary w-full text-subhead">
                用户协议与隐私政策
              </button>
            </div>
          </div>
        </section>

        <!-- 保存按钮 -->
        <button
          @click="handleSave"
          class="apple-button-dark w-full text-headline py-4"
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
import AppleToggle from '../components/AppleToggle.vue'

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
