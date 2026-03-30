<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- 左侧侧边栏 -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <!-- Logo -->
      <div class="p-6 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <img src="/logo.jpg" alt="伴旅" class="w-10 h-10 rounded-xl shadow object-cover" />
          <span class="text-xl font-bold text-gray-900">伴旅</span>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
          主菜单
        </div>
        
        <NavItem 
          icon="🏠" 
          title="概览"
          active
        />
        <NavItem 
          icon="✈️" 
          title="行程规划"
          @click="$emit('startPlanning')"
        />
        <NavItem 
          icon="📅" 
          title="我的行程"
        />
        <NavItem 
          icon="🔔" 
          title="行程提醒"
        />
        <NavItem 
          icon="👥" 
          title="旅伴匹配"
        />

        <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-8 mb-3 px-3">
          系统
        </div>

        <NavItem 
          icon="⚙️" 
          title="设置"
          @click="$emit('openSettings')"
        />
        <NavItem 
          icon="❓" 
          title="帮助与反馈"
        />
      </nav>

      <!-- 用户信息 -->
      <div class="p-4 border-t border-gray-100">
        <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <span class="text-blue-600 font-medium">游</span>
          </div>
          <div class="flex-1 text-left">
            <div class="text-sm font-medium text-gray-900">旅行者</div>
            <div class="text-xs text-gray-500">Personal</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 min-h-screen">
      <!-- 顶部导航栏 -->
      <header class="h-16 bg-white border-b border-gray-200 sticky top-0 z-10 px-8 flex items-center justify-between">
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span>Pages</span>
          <span>/</span>
          <span class="text-gray-900 font-medium">概览</span>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- 状态指示器 -->
          <div class="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
            <span class="w-2 h-2 bg-green-500 rounded-full"></span>
            <span class="text-sm text-green-700 font-medium">系统正常</span>
          </div>
          
          <!-- 快捷按钮 -->
          <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="text-lg">🔔</span>
          </button>
          <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <span class="text-lg">🌙</span>
          </button>
        </div>
      </header>

      <!-- 内容区域 -->
      <div class="p-8">
        <!-- 通知横幅 -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <p class="text-blue-800">
            <span class="font-medium">提示：</span>
            您可以在左侧选择「行程规划」开始您的第一次智能旅行规划体验！
          </p>
        </div>

        <!-- 欢迎卡片 -->
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8 shadow-sm">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-4xl font-bold text-gray-900 mb-2">欢迎使用伴旅</h2>
              <p class="text-gray-600">让每一次旅行都恰到好处</p>
            </div>
            <button 
              @click="$emit('startPlanning')"
              class="px-5 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              开始规划
            </button>
          </div>
          
          <div class="space-y-3">
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <span class="text-xl">✨</span>
              <span>AI 智能规划，一键生成多套行程方案</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <span class="text-xl">⏰</span>
              <span>情境感知服务，实时推送旅行提示</span>
            </div>
            <div class="flex items-center gap-3 text-sm text-gray-600">
              <span class="text-xl">👥</span>
              <span>旅伴匹配系统，找到合适的旅行伙伴</span>
            </div>
          </div>
        </div>

        <!-- 功能概览卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-6">🎯 核心功能</h3>
            
            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-xl">✈️</span>
                </div>
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">智能行程规划</h4>
                  <p class="text-sm text-gray-500">AI 驱动，一键生成多套行程方案</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-xl">⏰</span>
                </div>
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">情境感知服务</h4>
                  <p class="text-sm text-gray-500">实时感知环境，主动推送旅行提示</p>
                </div>
              </div>
              
              <div class="flex items-start gap-3">
                <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-xl">👥</span>
                </div>
                <div class="flex-1">
                  <h4 class="font-medium text-gray-900">旅伴匹配系统</h4>
                  <p class="text-sm text-gray-500">智能匹配兴趣相投的旅行伙伴</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-6">📊 使用统计</h3>
            
            <div class="space-y-4">
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">已生成行程</span>
                <span class="text-lg font-bold text-gray-900">0</span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">已匹配旅伴</span>
                <span class="text-lg font-bold text-gray-900">0</span>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span class="text-sm text-gray-600">收到提醒</span>
                <span class="text-lg font-bold text-gray-900">0</span>
              </div>
              
              <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                <p class="text-sm text-blue-800">
                  <span class="font-medium">开始使用：</span>
                  点击左侧「行程规划」开始你的第一次智能旅行规划体验！
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import NavItem from '@/components/NavItem.vue'

const emit = defineEmits<{
  (e: 'startPlanning'): void
  (e: 'openSettings'): void
}>()
</script>

<style scoped>
/* 响应式调整，移动端隐藏侧边栏 */
@media (max-width: 1023px) {
  aside {
    display: none;
  }
}
</style>
