<template>
  <div class="min-h-screen">
    <!-- Hero 背景 -->
    <div
      class="fixed top-0 left-0 w-full h-screen -z-10"
      :style="{
        background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 85%, #ffffff 100%), url(${heroImages[0]}) center/cover no-repeat`,
        opacity: currentIndex === 0 ? 1 : 0,
        transition: 'opacity 1s ease-in-out'
      }"
    ></div>
    <div
      class="fixed top-0 left-0 w-full h-screen -z-10"
      :style="{
        background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 85%, #ffffff 100%), url(${heroImages[1]}) center/cover no-repeat`,
        opacity: currentIndex === 1 ? 1 : 0,
        transition: 'opacity 1s ease-in-out'
      }"
    ></div>
    <div class="fixed top-0 left-0 w-full h-screen -z-10 bg-black/0"></div>

    <!-- 导航栏 -->
    <header
      id="mainHeader"
      class="fixed top-0 w-full z-50 py-6 transition-all duration-300"
      :class="scrolled ? 'bg-white/85 backdrop-blur-md shadow-md text-gray-900' : 'bg-transparent text-white'"
    >
      <div class="max-w-[1100px] mx-auto px-8 flex justify-between items-center">
        <div class="flex items-center gap-3 -ml-4">
          <img src="/logo.jpg" alt="Trailmate" class="w-10 h-10 rounded-lg object-cover" />
          <span class="text-xl font-bold">Trailmate<span class="text-primary">.</span></span>
        </div>
        <div class="flex gap-8 font-semibold text-sm">
          <button @click="scrollToSection('feature')" :class="scrolled ? 'text-gray-700 hover:text-primary' : 'text-white'">发现剧本</button>
          <button @click="scrollToSection('feature')" :class="scrolled ? 'text-gray-700 hover:text-primary' : 'text-white'">智能核心</button>
          <button @click="scrollToSection('feature')" :class="scrolled ? 'text-gray-700 hover:text-primary' : 'text-white'">伴友社区</button>
        </div>
      </div>
    </header>

    <!-- Hero 全屏 -->
    <section class="h-screen flex flex-col justify-center items-center text-center text-white px-12">
      <h1 class="text-5xl lg:text-6xl font-extrabold leading-normal tracking-wider" style="text-shadow: 0 10px 30px rgba(0,0,0,0.4); line-height: 1.3;">
        探索未知，<br>不代表要独自<span class="text-primary">冒险</span>。
      </h1>
      <p class="mt-12 text-lg opacity-90">Trailmate 伴旅：全球首个智能旅行剧本社交平台</p>
    </section>

    <!-- 内容区域 -->
    <div class="bg-white relative z-10 rounded-t-[40px]" style="box-shadow: 0 -30px 60px rgba(0,0,0,0.1);">

      <!-- 功能特性 -->
      <section id="feature" class="max-w-[1100px] mx-auto px-8 py-24">
        <!-- 特性 1 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32 items-center">
          <div>
            <p class="text-primary font-extrabold text-xs tracking-widest uppercase">CORE 01</p>
            <h2 class="text-3xl font-bold mt-4 mb-4">智能行程规划</h2>
            <p class="text-gray-500 leading-relaxed">
              不再被琐碎的攻略所困。输入你的偏好，AI 会从千万条真实剧本中为你萃取最佳路线，每一秒都值得记录。
            </p>
            <button
              @click="goToPlanner"
              class="btn-main mt-8"
            >
              开始定制剧本
            </button>
          </div>
          <div class="rounded-3xl overflow-hidden border border-gray-200 shadow-lg aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800"
              alt="智能行程规划"
              class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>

        <!-- 特性 2 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32 items-center reverse">
          <div class="lg:order-2">
            <p class="text-primary font-extrabold text-xs tracking-widest uppercase">CORE 02</p>
            <h2 class="text-3xl font-bold mt-4 mb-4">情境感知服务</h2>
            <p class="text-gray-500 leading-relaxed">
              你的随身伴旅。根据你当前的位置、天气及实时情绪，动态推荐周边的宝藏机位与深度体验点。
            </p>
            <button class="btn-main mt-8">
              体验动态推荐
            </button>
          </div>
          <div class="rounded-3xl overflow-hidden border border-gray-200 shadow-lg aspect-[4/3] lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800"
              alt="情境感知服务"
              class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>

        <!-- 特性 3 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <p class="text-primary font-extrabold text-xs tracking-widest uppercase">CORE 03</p>
            <h2 class="text-3xl font-bold mt-4 mb-4">伴旅匹配系统</h2>
            <p class="text-gray-500 leading-relaxed">
              在风景里，遇见同频的有趣伴友。基于多维性格画像与旅行习惯的智能撮合，让每一段路都有温暖回响。
            </p>
            <button @click="router.push('/dashboard')" class="btn-main mt-8">
              寻找你的伴友
            </button>
          </div>
          <div class="rounded-3xl overflow-hidden border border-gray-200 shadow-lg aspect-[4/3]">
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800"
              alt="伴旅匹配系统"
              class="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
        </div>
      </section>

      <!-- 剧本推荐轮播 -->
      <section id="community" class="py-24 bg-gray-50">
        <div class="max-w-[1100px] mx-auto px-8">
          <div class="flex justify-between items-end mb-8">
            <h2 class="text-2xl font-bold">为你推荐的旅行剧本</h2>
            <span class="text-primary font-bold cursor-pointer hover:underline">查看全部 →</span>
          </div>
          <div class="overflow-hidden mt-12">
            <div class="flex gap-8 w-max" :style="{ transform: `translateX(${sliderPos}px)` }">
              <div
                v-for="(card, index) in allCards"
                :key="index"
                class="w-80 bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
              >
                <div class="h-44 bg-gray-200">
                  <img :src="card.image" :alt="card.title" class="w-full h-full object-cover" />
                </div>
                <div class="p-6">
                  <span class="text-primary font-extrabold text-xs"># {{ card.tag }}</span>
                  <h4 class="font-bold mt-2 mb-1">{{ card.title }}</h4>
                  <p class="text-gray-500 text-sm">{{ card.desc }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 支持机构 -->
      <section class="py-12 text-center border-b border-gray-200 bg-white">
        <div class="max-w-[1100px] mx-auto px-8">
          <p class="text-xs text-gray-400 uppercase tracking-widest mb-8">得到了以下机构的支持</p>
          <div class="flex justify-center items-center gap-24 grayscale opacity-30">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>
      </section>

      <!-- 页脚 -->
      <footer class="bg-gray-900 text-white py-24">
        <div class="max-w-[1100px] mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-16">
          <div>
            <div class="text-xl font-bold mb-4">Trailmate<span class="text-primary">.</span></div>
            <p class="text-gray-500 text-xs leading-relaxed">智能旅行社交新标准</p>
          </div>
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider mb-4">产品</h4>
            <a href="#" class="block text-gray-400 text-sm mb-2 hover:text-primary transition-colors">智能规划</a>
            <a href="#" class="block text-gray-400 text-sm mb-2 hover:text-primary transition-colors">伴友招募</a>
            <a href="#" class="block text-gray-400 text-sm hover:text-primary transition-colors">独家机位</a>
          </div>
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider mb-4">关于伴旅</h4>
            <a href="#" class="block text-gray-400 text-sm mb-2 hover:text-primary transition-colors">关于我们</a>
            <a href="#" class="block text-gray-400 text-sm mb-2 hover:text-primary transition-colors">联系我们</a>
            <a href="#" class="block text-gray-400 text-sm hover:text-primary transition-colors">隐私政策</a>
          </div>
          <div>
            <h4 class="text-xs font-bold uppercase tracking-wider mb-4">联系</h4>
            <a href="#" class="block text-gray-400 text-sm mb-2 hover:text-primary transition-colors">hi@trailmate.com</a>
            <a href="#" class="block text-gray-400 text-sm hover:text-primary transition-colors">商务合作</a>
          </div>
        </div>
        <div class="max-w-[1100px] mx-auto px-8 mt-16 pt-8 border-t border-gray-800 text-gray-600 text-xs text-center">
          © 2026 Trailmate. 与你一同探索世界。
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const scrolled = ref(false)
const sliderPos = ref(0)

const heroImages = [
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
  'https://picsum.photos/seed/mountain/1920/1080'
]
const currentIndex = ref(0)

function switchHeroImage() {
  currentIndex.value = (currentIndex.value + 1) % heroImages.length
}

const sliderCards = [
  { image: 'https://picsum.photos/seed/travel1/500/300', tag: '咖啡', title: '埃塞俄比亚：耶加雪菲', desc: '咖啡发源地的风味探索' },
  { image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=500', tag: '慢生活', title: '巴黎左岸：寻找海明威', desc: '高敏个体的慢行漫游计划' },
  { image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=500', tag: '招募', title: '纽约曼哈顿：消失的傍晚', desc: '硬核社交：寻找伴友' },
]

const allCards = ref([...sliderCards, ...sliderCards, ...sliderCards])
const cardWidth = 320
const gap = 32

let animationFrameId: number

function animateSlider() {
  sliderPos.value -= 1
  const totalWidth = (allCards.value.length * cardWidth) + ((allCards.value.length - 1) * gap)
  if (Math.abs(sliderPos.value) >= totalWidth / 2) {
    sliderPos.value = 0
  }
  animationFrameId = requestAnimationFrame(animateSlider)
}

function handleScroll() {
  scrolled.value = window.scrollY > window.innerHeight * 0.5
}

function scrollToSection(id: string) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}

function goToPlanner() {
  router.push('/dashboard')
}

let heroIntervalId: ReturnType<typeof setInterval>

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  animateSlider()
  heroIntervalId = setInterval(switchHeroImage, 5000)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  cancelAnimationFrame(animationFrameId)
  clearInterval(heroIntervalId)
})
</script>

<style scoped>
.btn-main {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-main:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(255, 107, 74, 0.2);
}

@media (max-width: 1023px) {
  .reverse {
    direction: ltr;
  }
}
</style>
