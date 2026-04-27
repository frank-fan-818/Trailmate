<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-2xl mx-auto flex items-center justify-between">
        <button @click="$emit('back')" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 class="text-lg font-bold text-gray-900">查看资料</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <div class="max-w-2xl mx-auto px-4 py-6">
      <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="h-24 bg-gradient-to-r from-blue-500 to-orange-400"></div>

        <div class="px-6 pb-6">
          <div class="flex items-start gap-4 -mt-12 mb-4">
            <div class="w-24 h-24 bg-white rounded-lg border-4 border-white shadow-md flex items-center justify-center text-4xl font-bold text-gray-700 flex-shrink-0">
              {{ profile.name.charAt(0) }}
            </div>
            <div class="pt-14">
              <h2 class="text-xl font-bold text-gray-900">{{ profile.name }}</h2>
              <div class="flex items-center gap-2 text-sm text-gray-500">
                <span class="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">{{ profile.creditLevel }}</span>
                <span>⭐ {{ profile.creditScore }}分</span>
              </div>
            </div>
          </div>

          <p class="text-gray-600 text-sm mb-6">{{ profile.bio }}</p>

          <div class="border-t border-gray-100 pt-6 space-y-6">
            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📍</span> 行程信息
              </h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span class="text-gray-500">目的地</span>
                  <p class="font-medium text-gray-900">{{ profile.destination }}</p>
                </div>
                <div>
                  <span class="text-gray-500">行程天数</span>
                  <p class="font-medium text-gray-900">{{ profile.travelDays }}天</p>
                </div>
                <div>
                  <span class="text-gray-500">出发时间</span>
                  <p class="font-medium text-gray-900">{{ profile.departureDate }}</p>
                </div>
                <div>
                  <span class="text-gray-500">预算范围</span>
                  <p class="font-medium text-gray-900">¥{{ profile.budgetRange[0] }} - ¥{{ profile.budgetRange[1] }}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>🎯</span> 旅行偏好
              </h3>
              <div class="space-y-3">
                <div>
                  <span class="text-sm text-gray-500">旅行类型</span>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span v-for="type in profile.travelTypes" :key="type" class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">{{ type }}</span>
                  </div>
                </div>
                <div>
                  <span class="text-sm text-gray-500">交通方式</span>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span v-for="t in profile.transports" :key="t" class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">{{ t }}</span>
                  </div>
                </div>
                <div>
                  <span class="text-sm text-gray-500">住宿类型</span>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span v-for="a in profile.accommodations" :key="a" class="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">{{ a }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📊</span> 信用档案
              </h3>
              <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">信用评分</span>
                  <span class="font-medium text-gray-900">{{ profile.creditScore }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">信用等级</span>
                  <span class="font-medium text-gray-900">{{ profile.creditLevel }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">历史组队</span>
                  <span class="font-medium text-gray-900">{{ profile.totalTrips }}次</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">完成率</span>
                  <span class="font-medium text-gray-900">{{ profile.completionRate }}%</span>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>💬</span> 关于TA
              </h3>
              <p class="text-gray-600 text-sm">{{ profile.bio }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-4 flex gap-3">
        <button @click="$emit('openChat', profile.id, profile.name)" class="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          💬 发消息
        </button>
        <button @click="$emit('openTeamRequest', profile.id)" class="flex-1 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">
          🤝 发起组队
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits<{
  (e: 'back'): void
  (e: 'openChat', id: string, name: string): void
  (e: 'openTeamRequest', id: string): void
}>()

const props = defineProps<{
  companionId: string
}>()

interface CompanionProfile {
  id: string
  name: string
  bio: string
  destination: string
  travelDays: number
  departureDate: string
  budgetRange: [number, number]
  travelTypes: string[]
  transports: string[]
  accommodations: string[]
  creditScore: string
  creditLevel: string
  totalTrips: number
  completionRate: number
}

const mockProfile: Record<string, CompanionProfile> = {
  '1': {
    id: '1',
    name: '林小夏',
    bio: '热爱旅行，喜欢探索小众目的地。计划型选手，擅长做详细攻略，但也愿意根据情况调整。摄影爱好者，喜欢记录旅途中的美好瞬间。',
    destination: '云南大理',
    travelDays: 5,
    departureDate: '3天后出发',
    budgetRange: [5000, 10000],
    travelTypes: ['休闲', '自然', '美食'],
    transports: ['高铁', '大巴'],
    accommodations: ['民宿', '酒店'],
    creditScore: '4.9',
    creditLevel: '黄金',
    totalTrips: 12,
    completionRate: 92
  },
  '2': {
    id: '2',
    name: '张明',
    bio: '自由摄影师，四处漂泊。随性而为，享受旅途中的意外惊喜。希望找到志同道合的伙伴一起探索世界。',
    destination: '西藏拉萨',
    travelDays: 7,
    departureDate: '下周出发',
    budgetRange: [3000, 8000],
    travelTypes: ['冒险', '文化', '自然'],
    transports: ['飞机', '自驾'],
    accommodations: ['青旅', '民宿'],
    creditScore: '4.7',
    creditLevel: '白银',
    totalTrips: 8,
    completionRate: 88
  },
  '3': {
    id: '3',
    name: '王建国',
    bio: '退休教师，热爱大自然。喜欢慢节奏旅行，享受每一个地方的风景和文化。正在寻找同样喜欢慢旅行的伴友。',
    destination: '四川成都',
    travelDays: 4,
    departureDate: '5天后出发',
    budgetRange: [2000, 5000],
    travelTypes: ['休闲', '文化'],
    transports: ['高铁'],
    accommodations: ['酒店'],
    creditScore: '4.8',
    creditLevel: '黄金',
    totalTrips: 5,
    completionRate: 100
  },
  '4': {
    id: '4',
    name: '陈思思',
    bio: '互联网从业者，利用假期旅行。喜欢购物和美食，对日本文化很感兴趣。希望找到行程相似的伙伴同行。',
    destination: '日本东京',
    travelDays: 6,
    departureDate: '本月底出发',
    budgetRange: [8000, 15000],
    travelTypes: ['购物', '美食', '文化'],
    transports: ['飞机'],
    accommodations: ['酒店', '民宿'],
    creditScore: '5.0',
    creditLevel: '钻石',
    totalTrips: 15,
    completionRate: 95
  },
  '5': {
    id: '5',
    name: '刘德华',
    bio: '背包客，已经走过30多个国家。喜欢深度游而非打卡式旅行。善于规划行程，可以照顾同行伙伴。',
    destination: '泰国清迈',
    travelDays: 8,
    departureDate: '2周后出发',
    budgetRange: [3000, 8000],
    travelTypes: ['自然', '探险', '人文'],
    transports: ['飞机', '大巴', '摩托'],
    accommodations: ['青旅', '民宿'],
    creditScore: '4.8',
    creditLevel: '黄金',
    totalTrips: 30,
    completionRate: 98
  },
  '6': {
    id: '6',
    name: '赵小雨',
    bio: '学生党，预算有限但热情满满。第一次独自旅行，希望找到有经验的伙伴带一带。很好相处，不矫情。',
    destination: '厦门鼓浪屿',
    travelDays: 3,
    departureDate: '下周出发',
    budgetRange: [1000, 3000],
    travelTypes: ['休闲', '美食', '拍照'],
    transports: ['高铁', '公交'],
    accommodations: ['青旅'],
    creditScore: '4.6',
    creditLevel: '白银',
    totalTrips: 2,
    completionRate: 80
  }
}

const profile = ref<CompanionProfile>(mockProfile[props.companionId] || mockProfile['1'])
</script>