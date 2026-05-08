<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <button @click="$emit('back')" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 class="text-lg font-bold text-gray-900">发现旅伴</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <div class="max-w-5xl mx-auto px-4 py-6">
      <div class="bg-white border border-gray-200 mb-6">
        <div class="p-4 border-b border-gray-100">
          <div class="flex flex-wrap gap-3">
            <div class="flex-1 min-w-[200px]">
              <input
                v-model="filters.keyword"
                type="text"
                placeholder="搜索目的地、昵称..."
                class="w-full px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <select v-model="filters.budget" class="px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:border-primary">
              <option value="">全部预算</option>
              <option value="budget">穷游 ¥0-3000</option>
              <option value="medium">经济 ¥3000-8000</option>
              <option value="luxury">品质 ¥8000+</option>
            </select>
            <select v-model="filters.credit" class="px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:border-primary">
              <option value="">全部信用</option>
              <option value="钻石">钻石</option>
              <option value="黄金">黄金</option>
              <option value="白银">白银</option>
            </select>
            <select v-model="filters.departure" class="px-3 py-2 border border-gray-300 text-sm rounded focus:outline-none focus:border-primary">
              <option value="">全部时间</option>
              <option value="week">一周内</option>
              <option value="month">一个月内</option>
              <option value="any">任意时间</option>
            </select>
            <button @click="applyFilters" class="px-4 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90">
              应用筛选
            </button>
            <button @click="resetFilters" class="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50">
              重置
            </button>
          </div>
        </div>

        <div class="p-4 flex items-center justify-between border-b border-gray-100">
          <div class="text-sm text-gray-500">
            共找到 <span class="font-medium text-gray-900">{{ filteredList.length }}</span> 位匹配旅伴
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-500">排序：</span>
            <select v-model="sortBy" class="px-2 py-1 border border-gray-300 text-sm rounded focus:outline-none">
              <option value="match">匹配度</option>
              <option value="credit">信用评分</option>
              <option value="rating">用户评分</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="companion in sortedList"
          :key="companion.id"
          class="bg-white border border-gray-200 hover:border-gray-300 hover:shadow transition-all cursor-pointer"
          @click="viewProfile(companion.id)"
        >
          <div class="p-4 flex gap-4">
            <div class="w-16 h-16 bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 flex-shrink-0">
              {{ companion.name.charAt(0) }}
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <h3 class="font-bold text-gray-900">{{ companion.name }}</h3>
                  <span class="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">{{ getCreditBadgeText(companion.creditLevel) }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span v-if="companion.matchScore" class="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                    {{ companion.matchScore }}%匹配
                  </span>
                  <span class="text-sm text-gray-500">⭐ {{ companion.creditScore }}</span>
                </div>
              </div>

              <div class="flex items-center gap-3 text-sm text-gray-600 mb-2">
                <span class="flex items-center gap-1">
                  <MapPin :size="14" class="inline" /> {{ companion.destination }}
                </span>
                <span>{{ companion.departureInfo }}</span>
                <span>{{ companion.travelDays }}天行程</span>
              </div>

              <div class="flex flex-wrap gap-1 mb-3">
                <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{{ companion.budget }}</span>
                <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{{ companion.personality }}</span>
                <span class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">D{{ companion.overlapDays }}重叠</span>
                <span v-if="companion.sameday" class="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded">同日出发</span>
              </div>

              <p class="text-sm text-gray-500 line-clamp-2">{{ companion.bio }}</p>
            </div>
          </div>

          <div class="border-t border-gray-100 px-4 py-3 flex gap-2">
            <button
              @click.stop="toggleInterest(companion.id)"
              :class="[
                'flex-1 py-2 text-sm font-medium rounded border transition-colors',
                companion.interested
                  ? 'bg-orange-50 border-orange-200 text-orange-600'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              ]"
            >
              <Heart :size="14" class="inline mr-1" :fill="companion.interested ? 'currentColor' : 'none'" /> {{ companion.interested ? '已感兴趣' : '感兴趣' }}
            </button>
            <button
              @click.stop="handleTeamRequest(companion.id)"
              class="flex-1 py-2 text-sm font-medium rounded bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              发起组队
            </button>
          </div>
        </div>
      </div>

      <div v-if="sortedList.length === 0" class="text-center py-16">
        <Search :size="36" class="mx-auto mb-4 text-gray-400" />
        <p class="text-gray-500">暂无符合条件的旅伴</p>
        <button @click="resetFilters" class="mt-4 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50">
          清空筛选条件
        </button>
      </div>
    </div>

    <div v-if="showTeamModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showTeamModal = false">
      <div class="bg-white w-full max-w-md mx-4">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="font-bold text-gray-900">发起组队</h3>
          <button @click="showTeamModal = false" class="text-gray-500 hover:text-gray-700"><X :size="20" /></button>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">目的地</label>
            <input v-model="teamForm.destination" type="text" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">出发日期</label>
            <input v-model="teamForm.date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">组队说明</label>
            <textarea v-model="teamForm.message" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="介绍一下自己，说明组队原因..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">经费分摊方式</label>
            <select v-model="teamForm.splitType" class="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              <option value="aa">AA制</option>
              <option value="host">邀请方请客</option>
              <option value="custom">自定义</option>
            </select>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 flex gap-3">
          <button @click="showTeamModal = false" class="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50">
            取消
          </button>
          <button @click="submitTeamRequest" class="flex-1 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90">
            发送请求
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MapPin, Heart, Search, X } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'viewProfile', id: string): void
}>()

interface Companion {
  id: string
  name: string
  avatar?: string
  bio: string
  destination: string
  travelDays: number
  departureInfo: string
  departureDate: string
  budget: string
  budgetType: 'budget' | 'medium' | 'luxury'
  personality: string
  personalityType: 'planner' | 'spontaneous'
  overlapDays: number
  rating: number
  creditScore: string
  creditLevel: '钻石' | '黄金' | '白银'
  creditBadge: 'diamond' | 'gold' | 'silver'
  totalTrips: number
  interested: boolean
  sameday: boolean
  matchScore?: number
  travelTypes: string[]
  wakeTime: string
  sleepTime: string
  gender: '男' | '女' | '保密'
  age: number
}

const currentUserProfile = {
  destination: '云南大理',
  travelDays: 5,
  budgetType: 'medium' as const,
  personalityType: 'spontaneous' as const,
  travelTypes: ['休闲', '美食', '摄影'],
  wakeTime: '08:00',
  sleepTime: '23:00',
  gender: '男' as const,
  age: 28
}

const calculateMatchScore = (companion: Companion): number => {
  let score = 50

  if (companion.destination === currentUserProfile.destination) {
    score += 20
  } else {
    return score
  }

  if (companion.budgetType === currentUserProfile.budgetType) {
    score += 10
  } else if (
    (companion.budgetType as string === 'medium' && currentUserProfile.budgetType !== 'medium') ||
    (currentUserProfile.budgetType === 'medium')
  ) {
    score += 5
  }

  const dayOverlap = Math.min(companion.overlapDays, currentUserProfile.travelDays)
  score += dayOverlap * 3

  if (companion.personalityType === currentUserProfile.personalityType) {
    score += 8
  }

  const typeOverlap = companion.travelTypes.filter(t => currentUserProfile.travelTypes.includes(t)).length
  score += typeOverlap * 3

  if (companion.sameday) {
    score += 5
  }

  const creditBonus = companion.creditBadge === 'diamond' ? 5 : companion.creditBadge === 'gold' ? 3 : 0
  score += creditBonus

  return Math.min(score, 98)
}

const companions = ref<Companion[]>([
  {
    id: '1',
    name: '林小夏',
    bio: '热爱旅行，喜欢探索小众目的地。计划型选手，擅长做详细攻略。摄影爱好者，喜欢记录旅途中的美好瞬间。',
    destination: '云南大理',
    travelDays: 5,
    departureInfo: '3天后出发',
    departureDate: '2026-05-01',
    budget: '品质游',
    budgetType: 'medium',
    personality: '计划型',
    personalityType: 'planner',
    overlapDays: 4,
    rating: 4.9,
    creditScore: '4.9',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 12,
    interested: false,
    sameday: false,
    travelTypes: ['休闲', '自然', '摄影'],
    wakeTime: '07:00',
    sleepTime: '22:00',
    gender: '女',
    age: 26
  },
  {
    id: '2',
    name: '张明',
    bio: '自由摄影师，四处漂泊。随性而为，享受旅途中的意外惊喜。希望找到志同道合的伙伴一起探索世界。',
    destination: '西藏拉萨',
    travelDays: 7,
    departureInfo: '下周出发',
    departureDate: '2026-05-03',
    budget: '经济游',
    budgetType: 'medium',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 3,
    rating: 4.7,
    creditScore: '4.7',
    creditLevel: '白银',
    creditBadge: 'silver',
    totalTrips: 8,
    interested: false,
    sameday: false,
    travelTypes: ['冒险', '人文', '摄影'],
    wakeTime: '09:00',
    sleepTime: '00:00',
    gender: '男',
    age: 32
  },
  {
    id: '3',
    name: '王建国',
    bio: '退休教师，热爱大自然。喜欢慢节奏旅行，享受每一个地方的风景和文化。正在寻找同样喜欢慢旅行的伴友。',
    destination: '四川成都',
    travelDays: 4,
    departureInfo: '5天后出发',
    departureDate: '2026-05-02',
    budget: '穷游',
    budgetType: 'budget',
    personality: '计划型',
    personalityType: 'planner',
    overlapDays: 2,
    rating: 4.8,
    creditScore: '4.8',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 5,
    interested: false,
    sameday: true,
    travelTypes: ['休闲', '文化', '美食'],
    wakeTime: '06:30',
    sleepTime: '21:30',
    gender: '男',
    age: 58
  },
  {
    id: '4',
    name: '陈思思',
    bio: '互联网从业者，利用假期旅行。喜欢购物和美食，对日本文化很感兴趣。希望找到行程相似的伙伴同行。',
    destination: '日本东京',
    travelDays: 6,
    departureInfo: '本月底出发',
    departureDate: '2026-05-20',
    budget: '品质游',
    budgetType: 'luxury',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 5,
    rating: 5.0,
    creditScore: '5.0',
    creditLevel: '钻石',
    creditBadge: 'diamond',
    totalTrips: 15,
    interested: false,
    sameday: false,
    travelTypes: ['购物', '美食', '文化'],
    wakeTime: '10:00',
    sleepTime: '00:00',
    gender: '女',
    age: 27
  },
  {
    id: '5',
    name: '刘德华',
    bio: '背包客，已经走过30多个国家。喜欢深度游而非打卡式旅行。善于规划行程，可以照顾同行伙伴。',
    destination: '泰国清迈',
    travelDays: 8,
    departureInfo: '2周后出发',
    departureDate: '2026-05-10',
    budget: '经济游',
    budgetType: 'medium',
    personality: '计划型',
    personalityType: 'planner',
    overlapDays: 6,
    rating: 4.6,
    creditScore: '4.6',
    creditLevel: '白银',
    creditBadge: 'silver',
    totalTrips: 30,
    interested: false,
    sameday: false,
    travelTypes: ['冒险', '人文', '自然'],
    wakeTime: '07:00',
    sleepTime: '22:00',
    gender: '男',
    age: 35
  },
  {
    id: '6',
    name: '赵小雨',
    bio: '学生党，预算有限但热情满满。第一次独自旅行，希望找到有经验的伙伴带一带。很好相处，不矫情。',
    destination: '厦门鼓浪屿',
    travelDays: 3,
    departureInfo: '下周出发',
    departureDate: '2026-05-04',
    budget: '穷游',
    budgetType: 'budget',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 3,
    rating: 4.5,
    creditScore: '4.5',
    creditLevel: '白银',
    creditBadge: 'silver',
    totalTrips: 3,
    interested: false,
    sameday: false,
    travelTypes: ['休闲', '美食', '拍照打卡'],
    wakeTime: '09:00',
    sleepTime: '23:00',
    gender: '女',
    age: 22
  },
  {
    id: '7',
    name: '孙海',
    bio: '程序员一枚，利用年假旅行。喜欢自然风光，摄影和爬山是最大的爱好。希望找到体力好的伙伴一起徒步。',
    destination: '云南大理',
    travelDays: 6,
    departureInfo: '5天后出发',
    departureDate: '2026-05-01',
    budget: '经济游',
    budgetType: 'medium',
    personality: '计划型',
    personalityType: 'planner',
    overlapDays: 5,
    rating: 4.8,
    creditScore: '4.8',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 10,
    interested: false,
    sameday: true,
    travelTypes: ['自然', '摄影', '徒步'],
    wakeTime: '06:00',
    sleepTime: '22:00',
    gender: '男',
    age: 30
  },
  {
    id: '8',
    name: '周莉',
    bio: '瑜伽教练，热爱健康生活方式。旅行中也会坚持每日练习。喜欢宁静的地方，适合放松身心的目的地。',
    destination: '云南大理',
    travelDays: 7,
    departureInfo: '10天后出发',
    departureDate: '2026-05-05',
    budget: '品质游',
    budgetType: 'luxury',
    personality: '计划型',
    personalityType: 'planner',
    overlapDays: 5,
    rating: 4.9,
    creditScore: '4.9',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 8,
    interested: false,
    sameday: false,
    travelTypes: ['休闲', '自然', '养生'],
    wakeTime: '06:00',
    sleepTime: '21:00',
    gender: '女',
    age: 34
  },
  {
    id: '9',
    name: '吴斌',
    bio: '销售达人，能说会道。旅行中喜欢结交新朋友，善于活跃气氛。喜欢吃吃喝喝，探寻当地美食是必做之事。',
    destination: '四川成都',
    travelDays: 4,
    departureInfo: '下周出发',
    departureDate: '2026-05-03',
    budget: '品质游',
    budgetType: 'luxury',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 3,
    rating: 4.7,
    creditScore: '4.7',
    creditLevel: '白银',
    creditBadge: 'silver',
    totalTrips: 12,
    interested: false,
    sameday: false,
    travelTypes: ['美食', '夜生活', '社交'],
    wakeTime: '08:00',
    sleepTime: '01:00',
    gender: '男',
    age: 29
  },
  {
    id: '10',
    name: '郑小芳',
    bio: '小学老师有两个月暑假。喜欢和文化相关的东西，历史古迹博物馆是首选。安静型选手，不喜欢太吵的地方。',
    destination: '陕西西安',
    travelDays: 5,
    departureInfo: '3周后出发',
    departureDate: '2026-05-15',
    budget: '经济游',
    budgetType: 'medium',
    personality: '计划型',
    personalityType: 'planner',
    overlapDays: 4,
    rating: 4.9,
    creditScore: '4.9',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 7,
    interested: false,
    sameday: false,
    travelTypes: ['文化', '历史', '慢节奏'],
    wakeTime: '07:30',
    sleepTime: '22:00',
    gender: '女',
    age: 42
  },
  {
    id: '11',
    name: '黄大伟',
    bio: '健身教练，体能超级好。旅行中也每天锻炼。喜欢挑战性的活动，徒步、攀岩、潜水都在行。',
    destination: '云南大理',
    travelDays: 5,
    departureInfo: '下周出发',
    departureDate: '2026-05-01',
    budget: '经济游',
    budgetType: 'medium',
    personality: '计划型',
    personalityType: 'planner',
    overlapDays: 5,
    rating: 4.6,
    creditScore: '4.6',
    creditLevel: '白银',
    creditBadge: 'silver',
    totalTrips: 6,
    interested: false,
    sameday: true,
    travelTypes: ['冒险', '运动', '自然'],
    wakeTime: '06:00',
    sleepTime: '22:00',
    gender: '男',
    age: 28
  },
  {
    id: '12',
    name: '许晴',
    bio: '时尚杂志编辑，对美有极致追求。旅行中不停拍照，品味独特。喜欢小众有设计感的地方，不喜欢大众景点。',
    destination: '云南大理',
    travelDays: 4,
    departureInfo: '下周出发',
    departureDate: '2026-05-02',
    budget: '品质游',
    budgetType: 'luxury',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 4,
    rating: 4.8,
    creditScore: '4.8',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 20,
    interested: false,
    sameday: false,
    travelTypes: ['休闲', '摄影', '艺术'],
    wakeTime: '10:00',
    sleepTime: '00:00',
    gender: '女',
    age: 25
  },
  {
    id: '13',
    name: '冯小刚',
    bio: '退休军官，体力充沛。喜欢红色旅游和历史景点。做事雷厉风行，旅行中喜欢把一切都安排妥当。',
    destination: '北京',
    travelDays: 5,
    departureInfo: '本月出发',
    departureDate: '2026-05-08',
    budget: '经济游',
    budgetType: 'medium',
    personality: '计划型',
    personalityType: 'planner',
    overlapDays: 3,
    rating: 4.7,
    creditScore: '4.7',
    creditLevel: '白银',
    creditBadge: 'silver',
    totalTrips: 15,
    interested: false,
    sameday: false,
    travelTypes: ['历史', '红色旅游', '文化'],
    wakeTime: '06:00',
    sleepTime: '21:30',
    gender: '男',
    age: 62
  },
  {
    id: '14',
    name: '丁一',
    bio: '自由插画师，在线接单边旅行边工作。喜欢有故事感的地方，安静的小镇、古老的村落是心头好。',
    destination: '云南大理',
    travelDays: 10,
    departureInfo: '随时出发',
    departureDate: '2026-05-01',
    budget: '穷游',
    budgetType: 'budget',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 5,
    rating: 4.9,
    creditScore: '4.9',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 18,
    interested: false,
    sameday: true,
    travelTypes: ['艺术', '小众', '慢节奏'],
    wakeTime: '09:30',
    sleepTime: '23:30',
    gender: '保密',
    age: 27
  },
  {
    id: '15',
    name: '蒋薇薇',
    bio: '护士小姐姐，利用调休旅行。喜欢体验当地生活，去菜市场逛逛、和当地人聊聊天是最大的乐趣。',
    destination: '云南大理',
    travelDays: 5,
    departureInfo: '下下周出发',
    departureDate: '2026-05-07',
    budget: '经济游',
    budgetType: 'medium',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 4,
    rating: 4.8,
    creditScore: '4.8',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 9,
    interested: false,
    sameday: false,
    travelTypes: ['休闲', '美食', '人文'],
    wakeTime: '07:00',
    sleepTime: '22:30',
    gender: '女',
    age: 31
  },
  {
    id: '16',
    name: '韩寒',
    bio: '作家，经常需要换个环境写作。喜欢有文化氛围的地方，咖啡馆、书店、文创园是必去之处。',
    destination: '福建厦门',
    travelDays: 6,
    departureInfo: '2周后出发',
    departureDate: '2026-05-12',
    budget: '品质游',
    budgetType: 'luxury',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 4,
    rating: 4.7,
    creditScore: '4.7',
    creditLevel: '白银',
    creditBadge: 'silver',
    totalTrips: 11,
    interested: false,
    sameday: false,
    travelTypes: ['文艺', '美食', '慢节奏'],
    wakeTime: '10:00',
    sleepTime: '01:00',
    gender: '男',
    age: 38
  },
  {
    id: '17',
    name: '谢娜',
    bio: '舞蹈老师，活泼开朗。喜欢有活力的目的地，夜生活、表演、节庆活动都想参与。',
    destination: '云南大理',
    travelDays: 4,
    departureInfo: '本周出发',
    departureDate: '2026-05-01',
    budget: '经济游',
    budgetType: 'medium',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 4,
    rating: 4.6,
    creditScore: '4.6',
    creditLevel: '白银',
    creditBadge: 'silver',
    totalTrips: 6,
    interested: false,
    sameday: true,
    travelTypes: ['夜生活', '社交', '表演'],
    wakeTime: '09:00',
    sleepTime: '00:00',
    gender: '女',
    age: 26
  },
  {
    id: '18',
    name: '杜海涛',
    bio: '美食博主，到处找好吃的。旅行目的就是吃遍当地美食，自带吃货基因，探店是核心行程。',
    destination: '四川成都',
    travelDays: 4,
    departureInfo: '下周出发',
    departureDate: '2026-05-04',
    budget: '品质游',
    budgetType: 'luxury',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 3,
    rating: 4.9,
    creditScore: '4.9',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 25,
    interested: false,
    sameday: false,
    travelTypes: ['美食', '探店', '夜市'],
    wakeTime: '08:00',
    sleepTime: '23:00',
    gender: '男',
    age: 33
  },
  {
    id: '19',
    name: '彭于晏',
    bio: '咖啡师，对咖啡有研究。旅行中必去当地咖啡馆，也喜欢探索有特色的小店。喜欢简约有设计感的东西。',
    destination: '云南大理',
    travelDays: 5,
    departureInfo: '下周出发',
    departureDate: '2026-05-02',
    budget: '经济游',
    budgetType: 'medium',
    personality: '计划型',
    personalityType: 'planner',
    overlapDays: 4,
    rating: 4.8,
    creditScore: '4.8',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 8,
    interested: false,
    sameday: false,
    travelTypes: ['文艺', '咖啡', '小众'],
    wakeTime: '08:00',
    sleepTime: '22:00',
    gender: '男',
    age: 29
  },
  {
    id: '20',
    name: '薛之谦',
    bio: '音乐人，经常各地演出顺便旅行。喜欢livehouse和音乐节，有演出机会都会去看看。随性而为型选手。',
    destination: '云南大理',
    travelDays: 3,
    departureInfo: '随时出发',
    departureDate: '2026-05-01',
    budget: '穷游',
    budgetType: 'budget',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 3,
    rating: 4.7,
    creditScore: '4.7',
    creditLevel: '白银',
    creditBadge: 'silver',
    totalTrips: 14,
    interested: false,
    sameday: true,
    travelTypes: ['音乐', '社交', '夜生活'],
    wakeTime: '10:00',
    sleepTime: '02:00',
    gender: '男',
    age: 36
  },
  {
    id: '21',
    name: '叶子',
    bio: '植物学研究生，喜欢大自然。旅行中关注当地植被和花卉，偶尔做植物标本。喜欢徒步和露营。',
    destination: '云南大理',
    travelDays: 7,
    departureInfo: '下周出发',
    departureDate: '2026-05-03',
    budget: '穷游',
    budgetType: 'budget',
    personality: '计划型',
    personalityType: 'planner',
    overlapDays: 5,
    rating: 4.9,
    creditScore: '4.9',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 5,
    interested: false,
    sameday: false,
    travelTypes: ['自然', '徒步', '露营'],
    wakeTime: '06:00',
    sleepTime: '21:00',
    gender: '女',
    age: 25
  },
  {
    id: '22',
    name: '林俊杰',
    bio: '游戏主播，边旅行边直播。粉丝众多，旅途中会偶尔开播分享见闻。喜欢有趣的地方和事物。',
    destination: '重庆',
    travelDays: 4,
    departureInfo: '2周后出发',
    departureDate: '2026-05-10',
    budget: '品质游',
    budgetType: 'luxury',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 3,
    rating: 4.8,
    creditScore: '4.8',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 16,
    interested: false,
    sameday: false,
    travelTypes: ['网红打卡', '美食', '夜生活'],
    wakeTime: '12:00',
    sleepTime: '03:00',
    gender: '男',
    age: 24
  },
  {
    id: '23',
    name: '唐老鸭',
    bio: '心理咨询师，需要放松心情。喜欢安静疗愈型的目的地，温泉、SPA、冥想都是最爱。',
    destination: '云南大理',
    travelDays: 5,
    departureInfo: '下周出发',
    departureDate: '2026-05-01',
    budget: '品质游',
    budgetType: 'luxury',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 4,
    rating: 4.9,
    creditScore: '4.9',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 10,
    interested: false,
    sameday: true,
    travelTypes: ['休闲', '养生', '自然'],
    wakeTime: '08:00',
    sleepTime: '22:00',
    gender: '女',
    age: 35
  },
  {
    id: '24',
    name: '董小姐',
    bio: '律师，逻辑清晰做事严谨。旅行前会做详尽的攻略，每小时行程都安排好。喜欢高效的旅行方式。',
    destination: '上海',
    travelDays: 4,
    departureInfo: '本月出发',
    departureDate: '2026-05-18',
    budget: '品质游',
    budgetType: 'luxury',
    personality: '计划型',
    personalityType: 'planner',
    overlapDays: 2,
    rating: 4.8,
    creditScore: '4.8',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 12,
    interested: false,
    sameday: false,
    travelTypes: ['都市', '购物', '美食'],
    wakeTime: '07:00',
    sleepTime: '23:00',
    gender: '女',
    age: 40
  },
  {
    id: '25',
    name: '白落梅',
    bio: '茶艺师，喜欢慢生活。旅行中会找当地茶馆坐坐，感受茶文化。喜欢有历史底蕴的古城古镇。',
    destination: '云南大理',
    travelDays: 6,
    departureInfo: '下周出发',
    departureDate: '2026-05-04',
    budget: '经济游',
    budgetType: 'medium',
    personality: '随性型',
    personalityType: 'spontaneous',
    overlapDays: 4,
    rating: 4.9,
    creditScore: '4.9',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 7,
    interested: false,
    sameday: false,
    travelTypes: ['文化', '休闲', '慢节奏'],
    wakeTime: '08:00',
    sleepTime: '21:00',
    gender: '女',
    age: 45
  }
].map(c => ({ ...c, matchScore: calculateMatchScore(c as Companion) } as Companion)))

const filters = ref({
  keyword: '',
  budget: '',
  credit: '',
  departure: ''
})

const sortBy = ref('match')

const filteredList = computed(() => {
  return companions.value.filter(c => {
    if (filters.value.keyword) {
      const kw = filters.value.keyword.toLowerCase()
      if (!c.name.toLowerCase().includes(kw) && !c.destination.toLowerCase().includes(kw)) {
        return false
      }
    }
    if (filters.value.budget && c.budgetType !== filters.value.budget) {
      return false
    }
    if (filters.value.credit && c.creditLevel !== filters.value.credit) {
      return false
    }
    return true
  })
})

const sortedList = computed(() => {
  const list = [...filteredList.value]
  switch (sortBy.value) {
    case 'credit':
      return list.sort((a, b) => parseFloat(b.creditScore) - parseFloat(a.creditScore))
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating)
    case 'match':
    default:
      return list.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
  }
})

const showTeamModal = ref(false)
const teamForm = ref({
  destination: '',
  date: '',
  message: '',
  splitType: 'aa'
})

const getCreditBadgeText = (level: string) => {
  switch (level) {
    case '钻石':
      return '钻石'
    case '黄金':
      return '黄金'
    case '白银':
      return '白银'
    default:
      return '白银'
  }
}

const applyFilters = () => {
  // Filters are reactive, just triggering a re-render
}

const resetFilters = () => {
  filters.value = { keyword: '', budget: '', credit: '', departure: '' }
}

const viewProfile = (id: string) => {
  emit('viewProfile', id)
}

const toggleInterest = (id: string) => {
  const companion = companions.value.find(c => c.id === id)
  if (companion) {
    companion.interested = !companion.interested
  }
}

const handleTeamRequest = (id: string) => {
  const companion = companions.value.find(c => c.id === id)
  if (companion) {
    teamForm.value.destination = companion.destination
    teamForm.value.date = companion.departureDate
    teamForm.value.message = `你好，我想和你一起去${companion.destination}...`
    showTeamModal.value = true
  }
}

const submitTeamRequest = () => {
  alert('组队请求已发送！对方确认后你会收到通知。')
  showTeamModal.value = false
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>