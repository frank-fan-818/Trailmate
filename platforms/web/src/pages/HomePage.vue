<template>
  <div class="min-h-screen bg-gray-100 relative overflow-hidden">
    <div 
      class="absolute inset-0"
      style="background-image: radial-gradient(#d2d2d7 1px, transparent 1px); background-size: 24px 24px;"
    />
    
    <div class="hidden lg:block absolute inset-0 pointer-events-none">
      <div class="absolute top-20 left-12 w-64 h-44 rounded-apple-xl shadow-apple-lg overflow-hidden animate-float bg-white p-3">
        <div class="w-full h-full bg-gradient-to-br from-apple-blue/10 to-apple-purple/10 rounded-apple-lg flex items-center justify-center">
          <span class="text-title3 font-semibold text-apple-blue">行程规划</span>
        </div>
      </div>
      
      <div class="absolute top-24 right-20 w-52 h-36 rounded-apple-xl shadow-apple-lg overflow-hidden animate-float-delay-1 bg-white p-3">
        <div class="w-full h-full bg-gradient-to-br from-apple-green/10 to-apple-teal/10 rounded-apple-lg flex items-center justify-center">
          <span class="text-title3 font-semibold text-apple-green">情境感知</span>
        </div>
      </div>
      
      <div class="absolute bottom-28 left-20 w-56 h-40 rounded-apple-xl shadow-apple-lg overflow-hidden animate-float-delay-2 bg-white p-3">
        <div class="w-full h-full bg-gradient-to-br from-apple-orange/10 to-apple-red/10 rounded-apple-lg flex items-center justify-center">
          <span class="text-title3 font-semibold text-apple-orange">旅伴匹配</span>
        </div>
      </div>
      
      <div class="absolute bottom-36 right-12 w-44 h-44 rounded-full shadow-apple-lg overflow-hidden animate-float bg-white p-4">
        <div class="w-full h-full bg-gradient-to-br from-apple-purple/10 to-apple-pink/10 rounded-full flex items-center justify-center">
          <span class="text-title3 font-semibold text-apple-purple text-center">AI<br>智能</span>
        </div>
      </div>
    </div>

    <div class="relative container mx-auto px-6 pt-28 pb-36">
      <div class="max-w-5xl mx-auto text-center space-y-14">
        <div class="flex justify-center mb-10">
          <img src="/logo.jpg" alt="伴旅" class="w-20 h-20 rounded-apple-xl shadow-apple-lg object-cover" />
        </div>

        <div class="space-y-8">
          <h1 class="font-semibold text-gray-600 leading-tight tracking-tight text-display">
            伴旅，让每一次旅行
            <br>
            <span class="text-gradient-apple">
              都恰到好处
            </span>
          </h1>
          
          <p class="text-gray-400 text-title2 max-w-2xl mx-auto font-normal">
            AI 智能规划行程，发现旅途中的美好，解决旅行所有痛点
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div class="apple-card-hover p-8">
            <div class="w-14 h-14 bg-apple-blue/10 rounded-apple flex items-center justify-center mb-5">
              <span class="text-apple-blue text-2xl">✨</span>
            </div>
            <h3 class="text-title3 font-semibold text-gray-600 mb-3">智能行程规划</h3>
            <p class="text-callout text-gray-400">AI 驱动，输入目的地一键生成多套行程方案</p>
          </div>
          
          <div class="apple-card-hover p-8">
            <div class="w-14 h-14 bg-apple-green/10 rounded-apple flex items-center justify-center mb-5">
              <span class="text-apple-green text-2xl">⏰</span>
            </div>
            <h3 class="text-title3 font-semibold text-gray-600 mb-3">情境感知服务</h3>
            <p class="text-callout text-gray-400">实时感知环境，主动推送旅行提示和建议</p>
          </div>
          
          <div class="apple-card-hover p-8">
            <div class="w-14 h-14 bg-apple-orange/10 rounded-apple flex items-center justify-center mb-5">
              <span class="text-apple-orange text-2xl">👥</span>
            </div>
            <h3 class="text-title3 font-semibold text-gray-600 mb-3">旅伴匹配系统</h3>
            <p class="text-callout text-gray-400">智能匹配兴趣相投的旅行伙伴，告别独自旅行</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-5 mt-16">
          <button 
            @click="$emit('start')"
            class="apple-button-dark px-10 py-4 text-headline"
          >
            立即开始
          </button>
          
          <button class="apple-button-secondary px-10 py-4 text-headline">
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
@media (max-width: 1023px) {
  .lg\\:block {
    display: none;
  }
}
</style>
