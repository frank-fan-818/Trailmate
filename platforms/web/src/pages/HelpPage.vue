<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <button @click="router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <span>←</span> <span>返回</span>
        </button>
        <h1 class="text-lg font-bold text-gray-900">帮助中心</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-8 py-8 space-y-8">
      <!-- Quick Start -->
      <section class="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">快速入门</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="p-4 rounded-xl bg-gray-50">
            <div class="text-2xl mb-2">1️⃣</div>
            <h3 class="font-semibold text-gray-900 mb-1">规划行程</h3>
            <p class="text-sm text-gray-500">在行程规划页面用自然语言描述你的旅行需求，AI 将自动生成多套方案。</p>
          </div>
          <div class="p-4 rounded-xl bg-gray-50">
            <div class="text-2xl mb-2">2️⃣</div>
            <h3 class="font-semibold text-gray-900 mb-1">发现旅伴</h3>
            <p class="text-sm text-gray-500">在伴友社区设置你的偏好，系统会自动匹配志同道合的旅行伙伴。</p>
          </div>
          <div class="p-4 rounded-xl bg-gray-50">
            <div class="text-2xl mb-2">3️⃣</div>
            <h3 class="font-semibold text-gray-900 mb-1">情境感知</h3>
            <p class="text-sm text-gray-500">模拟位置变化，系统会根据时间、位置、天气自动推送提醒和建议。</p>
          </div>
        </div>
      </section>

      <!-- Feature Guide -->
      <section class="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">功能指南</h2>
        <div class="space-y-4">
          <div v-for="item in guideItems" :key="item.title" class="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
            <h3 class="font-semibold text-gray-900">{{ item.title }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ item.desc }}</p>
            <button @click="router.push(item.link)" class="mt-2 text-sm text-primary hover:underline">
              {{ item.action }} →
            </button>
          </div>
        </div>
      </section>

      <!-- FAQ -->
      <section class="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">常见问题</h2>
        <div class="space-y-3">
          <details v-for="faq in faqs" :key="faq.q" class="border border-gray-200 rounded-xl">
            <summary class="px-4 py-3 text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-50 rounded-xl">
              {{ faq.q }}
            </summary>
            <p class="px-4 pb-3 text-sm text-gray-600">{{ faq.a }}</p>
          </details>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const guideItems = [
  { title: 'AI 旅行管家', desc: '用自然语言对话完成行程规划、旅伴搜索、通知管理等所有操作。', action: '打开管家', link: '/concierge' },
  { title: '行程规划器', desc: '用中文描述你的旅行需求，AI 自动生成完整行程方案（含航班、酒店、景点）。', action: '开始规划', link: '/planner' },
  { title: '情境感知系统', desc: '模拟位置变化、查看实时天气、管理感知规则、接收智能通知。', action: '进入感知', link: '/perception' },
  { title: '旅伴匹配', desc: '根据目的地、预算、性格等多维度匹配最适合的旅行伙伴。', action: '寻找旅伴', link: '/companion-match' },
  { title: '我的行程', desc: '查看和管理已保存的所有行程计划。', action: '查看行程', link: '/my-trips' },
]

const faqs = [
  { q: '如何生成一个行程计划？', a: '前往「行程规划」页面，用中文描述你的旅行需求（如「帮我规划北京3日游，喜欢历史文化」），AI 将自动生成完整方案并保存到「我的行程」。' },
  { q: 'AI 管家可以做什么？', a: 'AI 管家可以搜索旅伴、查看位置和通知、生成行程、管理规则——全部通过自然语言对话完成。点击 Dashboard 的「AI 管家」进入。' },
  { q: '如何模拟位置变化？', a: '进入「情境感知」页面，填写城市、地址和坐标，点击「模拟位置」。开启「自动模拟」后每10秒自动更新位置并触发规则。' },
  { q: '通知会丢失吗？', a: '不会。所有通知自动保存在浏览器本地存储中，刷新页面或重新打开不会丢失。' },
  { q: '地图上的标记代表什么？', a: '红色=景点、橙色=餐饮、蓝色=酒店、绿色=交通、紫色=航班。蓝色脉冲点是你的当前位置。点击标记查看详情。' },
]
</script>
