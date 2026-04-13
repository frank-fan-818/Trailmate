<template>
  <div class="min-h-screen bg-gray-100 flex">
    <aside class="w-72 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 flex flex-col h-screen sticky top-0">
      <div class="p-6 border-b border-gray-200/50">
        <div class="flex items-center gap-4">
          <img src="/logo.jpg" alt="伴旅" class="w-12 h-12 rounded-apple shadow-apple object-cover" />
          <span class="text-title1 font-semibold text-gray-600">伴旅</span>
        </div>
      </div>

      <nav class="flex-1 p-5 space-y-2 overflow-y-auto">
        <div class="text-caption1 font-semibold text-gray-400 uppercase tracking-wider mb-4 px-4">
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

        <div class="text-caption1 font-semibold text-gray-400 uppercase tracking-wider mt-10 mb-4 px-4">
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

      <div class="p-5 border-t border-gray-200/50">
        <div class="flex items-center gap-4 p-3 rounded-apple hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
          <div class="w-11 h-11 bg-apple-blue/10 rounded-full flex items-center justify-center">
            <span class="text-apple-blue font-medium text-headline">游</span>
          </div>
          <div class="flex-1 text-left">
            <div class="text-subhead font-medium text-gray-600">旅行者</div>
            <div class="text-caption1 text-gray-400">Personal</div>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 min-h-screen">
      <header class="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10 px-10 flex items-center justify-between">
        <div class="flex items-center gap-3 text-subhead text-gray-400">
          <span>Pages</span>
          <span class="text-gray-300">/</span>
          <span class="text-gray-600 font-medium">概览</span>
        </div>
        
        <div class="flex items-center gap-5">
          <div class="flex items-center gap-2 px-4 py-2 bg-apple-green/10 rounded-full">
            <span class="w-2.5 h-2.5 bg-apple-green rounded-full"></span>
            <span class="text-subhead text-apple-green font-medium">系统正常</span>
          </div>
          
          <button class="p-2.5 hover:bg-gray-100 rounded-apple transition-colors duration-200">
            <span class="text-xl">🔔</span>
          </button>
          <button class="p-2.5 hover:bg-gray-100 rounded-apple transition-colors duration-200">
            <span class="text-xl">🌙</span>
          </button>
        </div>
      </header>

      <div class="p-10">
        <div class="bg-apple-blue/5 border border-apple-blue/20 rounded-apple-xl p-5 mb-10">
          <p class="text-body text-apple-blue">
            <span class="font-semibold">提示：</span>
            您可以在左侧选择「行程规划」开始您的第一次智能旅行规划体验！
          </p>
        </div>

        <div class="bg-gradient-to-br from-apple-blue/5 to-apple-purple/5 rounded-apple-2xl p-10 mb-10 shadow-apple-sm">
          <div class="flex justify-between items-start mb-8">
            <div>
              <h2 class="text-display font-semibold text-gray-600 mb-3">欢迎使用伴旅</h2>
              <p class="text-title3 text-gray-400">让每一次旅行都恰到好处</p>
            </div>
            <button 
              @click="$emit('startPlanning')"
              class="apple-button-dark px-6 py-3.5 text-subhead"
            >
              开始规划
            </button>
          </div>
          
          <div class="space-y-4">
            <div class="flex items-center gap-4 text-body text-gray-500">
              <span class="text-2xl">✨</span>
              <span>AI 智能规划，一键生成多套行程方案</span>
            </div>
            <div class="flex items-center gap-4 text-body text-gray-500">
              <span class="text-2xl">⏰</span>
              <span>情境感知服务，实时推送旅行提示</span>
            </div>
            <div class="flex items-center gap-4 text-body text-gray-500">
              <span class="text-2xl">👥</span>
              <span>旅伴匹配系统，找到合适的旅行伙伴</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div class="apple-card p-8">
            <h3 class="text-title2 font-semibold text-gray-600 mb-8">🎯 核心功能</h3>
            
            <div class="space-y-5">
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-apple-blue/10 rounded-apple flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">✈️</span>
                </div>
                <div class="flex-1">
                  <h4 class="text-headline font-medium text-gray-600">智能行程规划</h4>
                  <p class="text-subhead text-gray-400 mt-1">AI 驱动，一键生成多套行程方案</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-apple-green/10 rounded-apple flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">⏰</span>
                </div>
                <div class="flex-1">
                  <h4 class="text-headline font-medium text-gray-600">情境感知服务</h4>
                  <p class="text-subhead text-gray-400 mt-1">实时感知环境，主动推送旅行提示</p>
                </div>
              </div>
              
              <div class="flex items-start gap-4">
                <div class="w-12 h-12 bg-apple-orange/10 rounded-apple flex items-center justify-center flex-shrink-0">
                  <span class="text-2xl">👥</span>
                </div>
                <div class="flex-1">
                  <h4 class="text-headline font-medium text-gray-600">旅伴匹配系统</h4>
                  <p class="text-subhead text-gray-400 mt-1">智能匹配兴趣相投的旅行伙伴</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="apple-card p-8">
            <h3 class="text-title2 font-semibold text-gray-600 mb-8">📊 使用统计</h3>
            
            <div class="space-y-5">
              <div class="flex items-center justify-between p-4 bg-gray-100 rounded-apple">
                <span class="text-subhead text-gray-500">已生成行程</span>
                <span class="text-title2 font-bold text-gray-600">0</span>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-gray-100 rounded-apple">
                <span class="text-subhead text-gray-500">已匹配旅伴</span>
                <span class="text-title2 font-bold text-gray-600">0</span>
              </div>
              
              <div class="flex items-center justify-between p-4 bg-gray-100 rounded-apple">
                <span class="text-subhead text-gray-500">收到提醒</span>
                <span class="text-title2 font-bold text-gray-600">0</span>
              </div>
              
              <div class="mt-6 p-5 bg-apple-blue/5 rounded-apple">
                <p class="text-subhead text-apple-blue">
                  <span class="font-semibold">开始使用：</span>
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
@media (max-width: 1023px) {
  aside {
    display: none;
  }
}
</style>
