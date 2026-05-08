<template>
  <div class="min-h-screen">
    <!-- 背景 -->
    <div class="fixed top-0 left-0 w-full h-screen -z-10">
      <div class="absolute inset-0 bg-gradient-to-b from-blue-400/30 to-orange-300/30"></div>
      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-30"></div>
    </div>

    <!-- 导航栏 -->
    <header class="fixed top-0 w-full z-50 py-6 transition-all duration-300 bg-white/85 backdrop-blur-md shadow-md text-gray-900">
      <div class="max-w-[1100px] mx-auto px-8 flex justify-between items-center">
        <div class="flex items-center gap-3 -ml-4">
          <img src="/logo.jpg" alt="Trailmate" class="w-10 h-10 rounded-lg object-cover" />
          <span class="text-xl font-bold">Trailmate<span class="text-primary">.</span></span>
        </div>
        <div class="flex gap-8 font-semibold text-sm">
          <button class="text-gray-700 hover:text-primary transition-colors">概览</button>
          <button @click="router.push('/planner')" class="text-gray-700 hover:text-primary transition-colors">行程规划</button>
          <button @click="router.push('/perception')" class="text-gray-700 hover:text-primary transition-colors">情境感知</button>
          <button class="text-gray-700 hover:text-primary transition-colors">我的行程</button>
          <button @click="router.push('/find-companion')" class="text-gray-700 hover:text-primary transition-colors">伴友社区</button>
        </div>
        <div class="flex items-center gap-4">
          <button @click="router.push('/settings')" class="text-gray-700 hover:text-primary transition-colors">设置</button>
          <button class="text-gray-700 hover:text-primary transition-colors">帮助</button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="max-w-[1100px] mx-auto px-8 py-32">
      <!-- 欢迎区域 -->
      <section class="text-center mb-24">
        <h1 class="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">欢迎回来，旅行者</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">让我们一起探索世界的美好，创造难忘的旅行记忆</p>
      </section>

      <!-- 快速操作卡片 -->
      <section class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        <div class="bg-white rounded-md shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow hover:-translate-y-1 transition-transform">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-orange-400 rounded-md flex items-center justify-center mb-6 text-white">
            <Plane :size="24" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">开始规划</h3>
          <p class="text-gray-600 mb-6">定制你的专属旅行剧本</p>
          <button 
            @click="router.push('/planner')"
            class="w-full py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary/90 transition-colors"
          >
            立即开始
          </button>
        </div>

        <div class="bg-white rounded-md shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow hover:-translate-y-1 transition-transform">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-orange-400 rounded-md flex items-center justify-center mb-6 text-white">
            <Calendar :size="24" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">我的行程</h3>
          <p class="text-gray-600 mb-6">查看和管理你的旅行计划</p>
          <button class="w-full py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary/90 transition-colors">
            查看行程
          </button>
        </div>

        <div class="bg-white rounded-md shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow hover:-translate-y-1 transition-transform">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-orange-400 rounded-md flex items-center justify-center mb-6 text-white">
            <Users :size="24" />
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-3">旅伴匹配</h3>
          <p class="text-gray-600 mb-6">找到志同道合的旅行伙伴</p>
          <button @click="router.push('/find-companion')" class="w-full py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary/90 transition-colors">
            寻找旅伴
          </button>
        </div>
      </section>

      <!-- 旅行灵感 -->
      <section class="mb-24">
        <h2 class="text-2xl font-bold text-gray-900 mb-8">旅行灵感</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="rounded-md overflow-hidden border border-gray-200 shadow-sm aspect-[4/3] group relative">
            <img 
              src="/beach-sunset.jpg" 
              alt="海边日落" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
              <h3 class="text-white text-xl font-bold mb-2">海边日落之旅</h3>
              <p class="text-white/90 text-sm">探索最美海岸线</p>
            </div>
          </div>

          <div class="rounded-md overflow-hidden border border-gray-200 shadow-sm aspect-[4/3] group relative">
            <img 
              src="/mountain-peak.jpg" 
              alt="山景" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
              <h3 class="text-white text-xl font-bold mb-2">山地探险</h3>
              <p class="text-white/90 text-sm">征服壮丽山峰</p>
            </div>
          </div>

          <div class="rounded-md overflow-hidden border border-gray-200 shadow-sm aspect-[4/3] group relative">
            <img 
              src="/modern-city.jpg" 
              alt="城市探索" 
              class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
              <h3 class="text-white text-xl font-bold mb-2">城市探索</h3>
              <p class="text-white/90 text-sm">发现都市魅力</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 旅行提示 -->
      <section>
        <h2 class="text-2xl font-bold text-gray-900 mb-8">旅行提示</h2>
        <div class="bg-white rounded-md shadow-sm border border-gray-200 p-8">
          <div class="space-y-6">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-400 rounded-md flex items-center justify-center flex-shrink-0 text-white">
                <CloudSun :size="20" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 mb-2">天气准备</h3>
                <p class="text-gray-600">根据目的地的天气情况，提前准备合适的衣物和装备</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-400 rounded-md flex items-center justify-center flex-shrink-0 text-white">
                <Briefcase :size="20" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 mb-2">行李打包</h3>
                <p class="text-gray-600">合理打包行李，不要携带过多物品，确保旅行轻松愉快</p>
              </div>
            </div>

            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-orange-400 rounded-md flex items-center justify-center flex-shrink-0 text-white">
                <Smartphone :size="20" />
              </div>
              <div class="flex-1">
                <h3 class="text-lg font-bold text-gray-900 mb-2">旅行应用</h3>
                <p class="text-gray-600">下载必要的旅行应用，如地图、翻译、天气等</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Plane, Calendar, Users, CloudSun, Briefcase, Smartphone } from 'lucide-vue-next'

const router = useRouter()
</script>

<style scoped>
/* 响应式调整 */
@media (max-width: 768px) {
  .grid-cols-3 {
    grid-template-columns: 1fr;
  }
}
</style>
