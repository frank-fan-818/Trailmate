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

      <div class="mt-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 class="font-bold text-gray-900 flex items-center gap-2">
            <span>🤖</span> AI 匹配分析
          </h3>
          <button
            v-if="!aiAnalysis && !isAnalyzing"
            @click="analyzeWithAI"
            class="px-4 py-2 bg-primary/10 text-primary text-sm font-medium rounded-lg hover:bg-primary/20 transition-colors"
          >
            开始分析
          </button>
          <button
            v-if="aiAnalysis && !isAnalyzing"
            @click="analyzeWithAI"
            class="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            重新分析
          </button>
        </div>

        <div class="p-4">
          <div v-if="isAnalyzing" class="text-center py-8">
            <div class="text-4xl mb-4 animate-pulse">🔮</div>
            <p class="text-gray-500">AI 正在分析匹配度...</p>
            <p class="text-sm text-gray-400 mt-2">请稍候</p>
          </div>

          <div v-else-if="aiAnalysis" class="space-y-4">
            <div class="flex items-center gap-4 mb-6">
              <div class="text-center">
                <div class="text-4xl font-bold text-primary">{{ aiAnalysis.matchScore }}%</div>
                <div class="text-sm text-gray-500">匹配度</div>
              </div>
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-sm text-gray-500">推荐指数</span>
                  <div class="flex gap-1">
                    <span v-for="i in 5" :key="i" :class="i <= aiAnalysis.recommendScore ? 'text-yellow-400' : 'text-gray-300'">⭐</span>
                  </div>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-primary h-2 rounded-full transition-all"
                    :style="{ width: aiAnalysis.matchScore + '%' }"
                  ></div>
                </div>
              </div>
            </div>

            <div v-if="aiAnalysis.matchReasons.length > 0">
              <h4 class="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span class="text-green-500">✓</span> 匹配亮点
              </h4>
              <div class="space-y-2">
                <div
                  v-for="(reason, idx) in aiAnalysis.matchReasons"
                  :key="idx"
                  class="px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg"
                >
                  {{ reason }}
                </div>
              </div>
            </div>

            <div v-if="aiAnalysis.travelCompatibility.length > 0">
              <h4 class="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span class="text-blue-500">●</span> 旅行契合度
              </h4>
              <div class="space-y-2">
                <div
                  v-for="(compat, idx) in aiAnalysis.travelCompatibility"
                  :key="idx"
                  class="px-3 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg"
                >
                  {{ compat }}
                </div>
              </div>
            </div>

            <div v-if="aiAnalysis.potentialIssues.length > 0">
              <h4 class="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span class="text-orange-500">!</span> 注意事项
              </h4>
              <div class="space-y-2">
                <div
                  v-for="(issue, idx) in aiAnalysis.potentialIssues"
                  :key="idx"
                  class="px-3 py-2 bg-orange-50 text-orange-700 text-sm rounded-lg"
                >
                  {{ issue }}
                </div>
              </div>
            </div>

            <div>
              <h4 class="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span class="text-purple-500">💬</span> 破冰话题推荐
              </h4>
              <div class="space-y-2">
                <div
                  v-for="(topic, idx) in aiAnalysis.icebreakers"
                  :key="idx"
                  class="px-3 py-2 bg-purple-50 text-purple-700 text-sm rounded-lg"
                >
                  {{ topic }}
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-8">
            <div class="text-4xl mb-4">🔮</div>
            <p class="text-gray-500">点击按钮获取 AI 匹配分析</p>
            <p class="text-sm text-gray-400 mt-2">了解你们的目的地、性格、旅行偏好匹配程度</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

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
  creditBadge: 'diamond' | 'gold' | 'silver'
  totalTrips: number
  completionRate: number
  personalityType: 'planner' | 'spontaneous'
  wakeTime: string
  sleepTime: string
  gender: '男' | '女' | '保密'
  age: number
  matchScore?: number
}

interface AIAnalysis {
  matchScore: number
  matchReasons: string[]
  potentialIssues: string[]
  icebreakers: string[]
  travelCompatibility: string[]
  recommendScore: number
}

const isAnalyzing = ref(false)
const aiAnalysis = ref<AIAnalysis | null>(null)

const currentUserProfile = {
  destination: '云南大理',
  travelDays: 5,
  budgetType: 'medium',
  personalityType: 'spontaneous',
  travelTypes: ['休闲', '美食', '摄影'],
  wakeTime: '08:00',
  sleepTime: '23:00'
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
    creditBadge: 'gold',
    totalTrips: 12,
    completionRate: 92,
    personalityType: 'planner',
    wakeTime: '07:00',
    sleepTime: '22:00',
    gender: '女',
    age: 26,
    matchScore: 78
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
    creditBadge: 'silver',
    totalTrips: 8,
    completionRate: 88,
    personalityType: 'spontaneous',
    wakeTime: '09:00',
    sleepTime: '00:00',
    gender: '男',
    age: 32,
    matchScore: 50
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
    creditBadge: 'gold',
    totalTrips: 5,
    completionRate: 100,
    personalityType: 'planner',
    wakeTime: '06:30',
    sleepTime: '21:30',
    gender: '男',
    age: 58,
    matchScore: 50
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
    creditBadge: 'diamond',
    totalTrips: 15,
    completionRate: 95,
    personalityType: 'spontaneous',
    wakeTime: '10:00',
    sleepTime: '00:00',
    gender: '女',
    age: 27,
    matchScore: 50
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
    creditBadge: 'gold',
    totalTrips: 30,
    completionRate: 98,
    personalityType: 'planner',
    wakeTime: '07:00',
    sleepTime: '22:00',
    gender: '男',
    age: 35,
    matchScore: 50
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
    creditBadge: 'silver',
    totalTrips: 2,
    completionRate: 80,
    personalityType: 'spontaneous',
    wakeTime: '09:00',
    sleepTime: '23:00',
    gender: '女',
    age: 22,
    matchScore: 50
  },
  '7': {
    id: '7',
    name: '孙海',
    bio: '程序员一枚，利用年假旅行。喜欢自然风光，摄影和爬山是最大的爱好。希望找到体力好的伙伴一起徒步。',
    destination: '云南大理',
    travelDays: 6,
    departureDate: '5天后出发',
    budgetRange: [4000, 8000],
    travelTypes: ['自然', '摄影', '徒步'],
    transports: ['高铁', '包车'],
    accommodations: ['民宿'],
    creditScore: '4.8',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 10,
    completionRate: 90,
    personalityType: 'planner',
    wakeTime: '06:00',
    sleepTime: '22:00',
    gender: '男',
    age: 30,
    matchScore: 88
  },
  '11': {
    id: '11',
    name: '黄大伟',
    bio: '健身教练，体能超级好。旅行中也每天锻炼。喜欢挑战性的活动，徒步、攀岩、潜水都在行。',
    destination: '云南大理',
    travelDays: 5,
    departureDate: '下周出发',
    budgetRange: [3000, 7000],
    travelTypes: ['冒险', '运动', '自然'],
    transports: ['高铁', '包车'],
    accommodations: ['民宿', '露营'],
    creditScore: '4.6',
    creditLevel: '白银',
    creditBadge: 'silver',
    totalTrips: 6,
    completionRate: 85,
    personalityType: 'planner',
    wakeTime: '06:00',
    sleepTime: '22:00',
    gender: '男',
    age: 28,
    matchScore: 85
  },
  '12': {
    id: '12',
    name: '许晴',
    bio: '时尚杂志编辑，对美有极致追求。旅行中不停拍照，品味独特。喜欢小众有设计感的地方，不喜欢大众景点。',
    destination: '云南大理',
    travelDays: 4,
    departureDate: '下周出发',
    budgetRange: [6000, 12000],
    travelTypes: ['休闲', '摄影', '艺术'],
    transports: ['高铁', '包车'],
    accommodations: ['精品酒店'],
    creditScore: '4.8',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 20,
    completionRate: 95,
    personalityType: 'spontaneous',
    wakeTime: '10:00',
    sleepTime: '00:00',
    gender: '女',
    age: 25,
    matchScore: 82
  },
  '14': {
    id: '14',
    name: '丁一',
    bio: '自由插画师，在线接单边旅行边工作。喜欢有故事感的地方，安静的小镇、古老的村落是心头好。',
    destination: '云南大理',
    travelDays: 10,
    departureDate: '随时出发',
    budgetRange: [2000, 5000],
    travelTypes: ['艺术', '小众', '慢节奏'],
    transports: ['高铁', '大巴'],
    accommodations: ['民宿'],
    creditScore: '4.9',
    creditLevel: '黄金',
    creditBadge: 'gold',
    totalTrips: 18,
    completionRate: 94,
    personalityType: 'spontaneous',
    wakeTime: '09:30',
    sleepTime: '23:30',
    gender: '保密',
    age: 27,
    matchScore: 75
  },
  '20': {
    id: '20',
    name: '薛之谦',
    bio: '音乐人，经常各地演出顺便旅行。喜欢livehouse和音乐节，有演出机会都会去看看。随性而为型选手。',
    destination: '云南大理',
    travelDays: 3,
    departureDate: '随时出发',
    budgetRange: [1500, 4000],
    travelTypes: ['音乐', '社交', '夜生活'],
    transports: ['高铁', '飞机'],
    accommodations: ['青旅', '民宿'],
    creditScore: '4.7',
    creditLevel: '白银',
    creditBadge: 'silver',
    totalTrips: 14,
    completionRate: 90,
    personalityType: 'spontaneous',
    wakeTime: '10:00',
    sleepTime: '02:00',
    gender: '男',
    age: 36,
    matchScore: 70
  }
}

const profile = ref<CompanionProfile>(mockProfile[props.companionId] || mockProfile['1'])

const generateAIAnalysis = async (p: CompanionProfile): Promise<AIAnalysis> => {
  const reasons: string[] = []
  const issues: string[] = []
  const compatibilities: string[] = []
  const icebreakers: string[] = []

  let score = 50

  if (p.destination === currentUserProfile.destination) {
    score += 20
    reasons.push(`📍 目的地一致：${p.destination}`)
  }

  if (p.travelTypes.some(t => currentUserProfile.travelTypes.includes(t))) {
    const overlap = p.travelTypes.filter(t => currentUserProfile.travelTypes.includes(t))
    score += overlap.length * 5
    compatibilities.push(`🎯 旅行偏好契合：都喜欢「${overlap.join('、')}」`)
  }

  if (p.personalityType === currentUserProfile.personalityType) {
    score += 8
    compatibilities.push(`🧠 性格相近：都是${p.personalityType === 'planner' ? '计划型' : '随性型'}`)
  } else {
    issues.push(`⚠️ 性格差异：TA是${p.personalityType === 'planner' ? '计划型' : '随性型'}，你是${currentUserProfile.personalityType === 'planner' ? '计划型' : '随性型'}`)
  }

  const wakeDiff = Math.abs(parseInt(p.wakeTime.split(':')[0]) - parseInt(currentUserProfile.wakeTime.split(':')[0]))
  if (wakeDiff > 2) {
    issues.push(`⏰ 作息差异：TA习惯${p.wakeTime}起床，你习惯${currentUserProfile.wakeTime}起床`)
  } else if (wakeDiff <= 1) {
    compatibilities.push(`⏰ 作息相近：起床时间差不多`)
  }

  const sleepDiff = Math.abs(parseInt(p.sleepTime.split(':')[0]) - parseInt(currentUserProfile.sleepTime.split(':')[0]))
  if (sleepDiff > 2) {
    issues.push(`🌙 睡眠习惯：TA习惯${p.sleepTime}睡觉，你习惯${currentUserProfile.sleepTime}睡觉`)
  }

  if (p.creditBadge === 'diamond') {
    score += 5
    reasons.push(`💎 信用优秀：钻石会员，历史组队${p.totalTrips}次`)
  } else if (p.creditBadge === 'gold') {
    score += 3
    reasons.push(`⭐ 信用良好：黄金会员，完成率${p.completionRate}%`)
  }

  if (p.totalTrips >= 10) {
    score += 3
    reasons.push(`✈️ 旅行经验丰富：已去过${p.totalTrips}个目的地`)
  }

  if (p.completionRate >= 90) {
    score += 3
    reasons.push(`🎯 组队记录良好：完成率${p.completionRate}%`)
  }

  if (p.gender !== '保密') {
    icebreakers.push(`你是${p.gender}吗？我看到你也想去${p.destination}！`)
  }

  if (p.travelTypes.includes('摄影') && currentUserProfile.travelTypes.includes('摄影')) {
    icebreakers.push('看到你喜欢摄影！这次去大理打算拍些什么题材？')
  }

  if (p.travelTypes.includes('美食')) {
    icebreakers.push('听说大理有很多特色美食，你有什么推荐的吗？')
  }

  if (p.personalityType === 'spontaneous') {
    icebreakers.push('我看到你喜欢随性旅行，有没有临时发现的好地方想分享？')
  }

  const finalScore = Math.min(score, 98)

  return {
    matchScore: finalScore,
    matchReasons: reasons.length > 0 ? reasons : ['💡 目的地相同，可以考虑结伴'],
    potentialIssues: issues,
    icebreakers: icebreakers.length > 0 ? icebreakers : ['你好！看到你的行程刚好和我一样，要不组队一起？'],
    travelCompatibility: compatibilities.length > 0 ? compatibilities : ['📍 目的地重叠，可以拼车拼房'],
    recommendScore: finalScore >= 80 ? 5 : finalScore >= 60 ? 4 : 3
  }
}

const analyzeWithAI = async () => {
  isAnalyzing.value = true
  aiAnalysis.value = null

  await new Promise(resolve => setTimeout(resolve, 1500))

  aiAnalysis.value = await generateAIAnalysis(profile.value)
  isAnalyzing.value = false
}

const getMatchScoreClass = (score: number) => {
  if (score >= 80) return 'text-green-600 bg-green-50'
  if (score >= 60) return 'text-orange-600 bg-orange-50'
  return 'text-gray-600 bg-gray-50'
}

onMounted(() => {
  if (profile.value.matchScore) {
    aiAnalysis.value = {
      matchScore: profile.value.matchScore,
      matchReasons: [],
      potentialIssues: [],
      icebreakers: [],
      travelCompatibility: [],
      recommendScore: profile.value.matchScore >= 80 ? 5 : 4
    }
  }
})
</script>