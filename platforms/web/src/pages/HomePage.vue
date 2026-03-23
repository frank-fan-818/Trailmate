<template>
  <div class="min-h-screen bg-gray-50 relative overflow-hidden">
    <!-- 背景网格 -->
    <div 
      class="absolute inset-0"
      style="background-image: radial-gradient(#e5e7eb 1px, transparent 1px); background-size: 20px 20px;"
    />
    
    <!-- 浮动图片装饰（仅桌面端显示） -->
    <div class="hidden lg:block absolute inset-0 pointer-events-none">
      <!-- 左上角浮动卡片 -->
      <div class="absolute top-16 left-10 w-60 h-40 rounded-xl shadow-xl overflow-hidden float-animation bg-white p-2">
        <div class="w-full h-full bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
          <span class="text-lg font-bold text-purple-700">行程规划</span>
        </div>
      </div>
      
      <!-- 右上角浮动卡片 -->
      <div class="absolute top-20 right-16 w-48 h-32 rounded-xl shadow-xl overflow-hidden float-animation float-animation-delay-1 bg-white p-2">
        <div class="w-full h-full bg-gradient-to-br from-green-100 to-yellow-100 rounded-lg flex items-center justify-center">
          <span class="text-lg font-bold text-green-700">情境感知</span>
        </div>
      </div>
      
      <!-- 左下角浮动卡片 -->
      <div class="absolute bottom-24 left-16 w-52 h-36 rounded-xl shadow-xl overflow-hidden float-animation float-animation-delay-2 bg-white p-2">
        <div class="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center">
          <span class="text-lg font-bold text-orange-700">旅伴匹配</span>
        </div>
      </div>
      
      <!-- 右下角浮动卡片 -->
      <div class="absolute bottom-32 right-10 w-40 h-40 rounded-full shadow-xl overflow-hidden float-animation bg-white p-3">
        <div class="w-full h-full bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
          <span class="text-lg font-bold text-blue-700 text-center">AI<br>智能</span>
        </div>
      </div>
    </div>

    <!-- 内容区 -->
    <div class="relative container mx-auto px-4 pt-24 pb-32">
      <div class="max-w-4xl mx-auto text-center space-y-12">
        <!-- Logo -->
        <div class="flex justify-center mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
            <span class="text-white text-2xl font-bold">伴</span>
          </div>
        </div>

        <!-- 标题 -->
        <div class="space-y-6">
          <h1 class="font-bold text-gray-900 leading-tight lg:leading-normal text-5xl lg:text-6xl">
            伴旅，让每一次旅行
            <br>
            <span class="bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              都恰到好处
            </span>
          </h1>
          
          <p class="text-gray-600 text-xl lg:text-2xl max-w-2xl mx-auto">
            AI 智能规划行程，发现旅途中的美好，解决旅行所有痛点
          </p>
        </div>

        <!-- 功能特性 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span class="text-blue-600 text-xl">✨</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">智能行程规划</h3>
            <p class="text-gray-600">AI 驱动，输入目的地一键生成多套行程方案</p>
          </div>
          
          <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span class="text-green-600 text-xl">⏰</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">情境感知服务</h3>
            <p class="text-gray-600">实时感知环境，主动推送旅行提示和建议</p>
          </div>
          
          <div class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <span class="text-orange-600 text-xl">👥</span>
            </div>
            <h3 class="text-lg font-bold text-gray-900 mb-2">旅伴匹配系统</h3>
            <p class="text-gray-600">智能匹配兴趣相投的旅行伙伴，告别独自旅行</p>
          </div>
        </div>

        <!-- 行动按钮 -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <button 
            @click="$emit('start')"
            class="px-8 py-4 bg-black text-white rounded-xl font-medium text-lg hover:bg-gray-800 transition-colors shadow-lg"
          >
            立即开始
          </button>
          
          <button class="px-8 py-4 bg-white text-gray-800 rounded-xl font-medium text-lg hover:bg-gray-50 transition-colors shadow-md border border-gray-200">
            了解更多
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'start'): void
}>()
</script>

<style scoped>
/* 移动端隐藏浮动动画 */
@media (max-width: 1023px) {
  .lg\\:block {
    display: none;
  }
}
</style>
