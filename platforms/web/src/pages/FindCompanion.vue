<template>
  <div class="min-h-screen">
    <div class="fixed top-0 left-0 w-full h-screen -z-10">
      <div class="absolute inset-0 bg-gradient-to-b from-blue-400/30 to-orange-300/30"></div>
      <div class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20"></div>
    </div>

    <header class="fixed top-0 w-full z-50 py-6 bg-white/85 backdrop-blur-md shadow-md text-gray-900">
      <div class="max-w-[1100px] mx-auto px-8 flex justify-between items-center">
        <div class="flex items-center gap-3 -ml-4">
          <img src="/logo.jpg" alt="Trailmate" class="w-10 h-10 rounded-lg object-cover" />
          <span class="text-xl font-bold">Trailmate<span class="text-primary">.</span></span>
        </div>
        <button @click="router.back()" class="text-gray-700 hover:text-primary transition-colors font-semibold">
          ← 返回
        </button>
      </div>
    </header>

    <div class="max-w-[1100px] mx-auto px-8 py-32">
      <div class="text-center mb-16">
        <h1 class="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">寻找你的伴友</h1>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">基于多维性格画像与旅行习惯的智能撮合，让每一段路都有温暖回响</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl"><Brain :size="24" /></div>
          <h3 class="text-xl font-bold mb-2">性格匹配</h3>
          <p class="text-gray-600 text-sm">基于旅行偏好和性格标签，匹配志趣相投的伴友</p>
        </div>
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl"><DollarSign :size="24" /></div>
          <h3 class="text-xl font-bold mb-2">经费预算</h3>
          <p class="text-gray-600 text-sm">穷游、经济、品质三种预算模式自动匹配</p>
        </div>
        <div class="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl"><Star :size="24" /></div>
          <h3 class="text-xl font-bold mb-2">信用评价</h3>
          <p class="text-gray-600 text-sm">完善的信用体系，保障每一次组队安全可靠</p>
        </div>
      </div>

      <div class="text-center">
        <button @click="router.push('/companion-match')" class="btn-main text-lg px-12 py-4">
          开始寻找伴友
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Brain, DollarSign, Star } from 'lucide-vue-next'

const router = useRouter()
</script>

<style scoped>
.btn-main {
  background: #FF6B4A;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}
.btn-main:hover {
  background: #E55A3D;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 107, 74, 0.2);
}
</style>