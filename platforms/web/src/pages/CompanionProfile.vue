<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-2xl mx-auto flex items-center justify-between">
        <button @click="router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 class="text-lg font-bold text-gray-900">查看资料</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <div class="max-w-2xl mx-auto px-4 py-6">
      <!-- Loading -->
      <div v-if="profileLoading" class="text-center py-16">
        <div class="text-4xl mb-4 animate-spin">⏳</div>
        <p class="text-gray-500">加载中...</p>
      </div>

      <!-- Error -->
      <div v-else-if="profileError" class="text-center py-16">
        <div class="text-4xl mb-4">⚠️</div>
        <p class="text-red-500">{{ profileError }}</p>
      </div>

      <!-- Data -->
      <div v-else-if="profile" class="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
                <MapPin :size="14" class="inline" /> 行程信息
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
                  <p class="font-medium text-gray-900">{{ profile.budget }}</p>
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
        <button @click="router.push('/chat/' + profile.id + '?name=' + encodeURIComponent(profile.name))" class="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">
          💬 发消息
        </button>
        <button @click="$emit('open-team-request', profile.id)" class="flex-1 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">
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
                <Check :size="16" class="text-green-500 inline" /> 匹配亮点
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { MapPin, Check } from 'lucide-vue-next'
import { useTrailmateCore } from '../composables/use-trailmate-core'
import type { CompanionProfile, UserProfile, MatchResult } from '@trailmate/companion-matching'

const router = useRouter()

defineEmits<{
  (e: 'open-team-request', id: string): void
}>()

const props = defineProps<{
  companionId: string
}>()

interface AIAnalysis {
  matchScore: number
  matchReasons: string[]
  potentialIssues: string[]
  icebreakers: string[]
  travelCompatibility: string[]
  recommendScore: number
}

const { initialize, getCompanionById, calculateMatch } = useTrailmateCore()

const currentUserProfile: UserProfile = {
  userId: 'demo-user',
  destination: '云南大理',
  travelDays: 5,
  budgetType: 'medium',
  personalityType: 'spontaneous',
  travelTypes: ['休闲', '美食', '摄影'],
  wakeTime: '08:00',
  sleepTime: '23:00',
  gender: '男',
  age: 28
}

const profileLoading = ref(true)
const profileError = ref<string | null>(null)
const profile = ref<CompanionProfile | null>(null)
const matchResult = ref<MatchResult | null>(null)
const isAnalyzing = ref(false)
const aiAnalysis = ref<AIAnalysis | null>(null)

const generateAIAnalysis = async (p: CompanionProfile, mr: MatchResult): Promise<AIAnalysis> => {
  const { matchScore, matchDetails } = mr
  const reasons: string[] = []
  const issues: string[] = []
  const compatibilities: string[] = []
  const icebreakers: string[] = []

  if (matchDetails.destinationMatch) {
    reasons.push(`📍 目的地一致：${p.destination}`)
  }
  if (matchDetails.budgetMatch) {
    reasons.push(`💰 预算匹配：${p.budgetType}`)
  } else {
    issues.push('⚠️ 预算级别不同，分摊费用时需提前沟通')
  }
  if (matchDetails.personalityMatch) {
    compatibilities.push(`🧠 性格相近：都是${p.personalityType === 'planner' ? '计划型' : '随性型'}`)
  } else {
    issues.push(`⚠️ 性格差异：TA是${p.personalityType === 'planner' ? '计划型' : '随性型'}，你是${currentUserProfile.personalityType === 'planner' ? '计划型' : '随性型'}`)
  }
  if (matchDetails.travelTypeOverlap > 0) {
    compatibilities.push(`🎯 旅行偏好契合：有${matchDetails.travelTypeOverlap}个共同类型`)
  }
  if (matchDetails.scheduleCompatibility >= 7) {
    compatibilities.push('⏰ 作息时间非常匹配')
  } else if (matchDetails.scheduleCompatibility >= 4) {
    compatibilities.push('⏰ 作息时间基本兼容')
  }

  if (p.creditBadge === 'diamond') {
    reasons.push(`💎 信用优秀：钻石会员，历史组队${p.totalTrips}次`)
  } else if (p.creditBadge === 'gold') {
    reasons.push(`⭐ 信用良好：黄金会员，完成${p.totalTrips}次组队`)
  }
  if (p.totalTrips >= 10) {
    reasons.push(`✈️ 旅行经验丰富：已去过${p.totalTrips}个目的地`)
  }

  if (p.gender !== '保密') {
    icebreakers.push(`你是${p.gender}吗？我看到你也想去${p.destination}！`)
  }
  if (p.travelTypes.includes('摄影')) {
    icebreakers.push('看到你喜欢摄影！这次去大理打算拍些什么题材？')
  }
  if (p.travelTypes.includes('美食')) {
    icebreakers.push('听说大理有很多特色美食，你有什么推荐的吗？')
  }
  if (p.personalityType === 'spontaneous') {
    icebreakers.push('我看到你喜欢随性旅行，有没有临时发现的好地方想分享？')
  }

  return {
    matchScore,
    matchReasons: reasons.length > 0 ? reasons : ['💡 目的地相同，可以考虑结伴'],
    potentialIssues: issues,
    icebreakers: icebreakers.length > 0 ? icebreakers : ['你好！看到你的行程刚好和我一样，要不组队一起？'],
    travelCompatibility: compatibilities.length > 0 ? compatibilities : ['📍 目的地重叠，可以拼车拼房'],
    recommendScore: matchScore >= 80 ? 5 : matchScore >= 60 ? 4 : 3
  }
}

const analyzeWithAI = async () => {
  isAnalyzing.value = true
  aiAnalysis.value = null

  if (!matchResult.value && profile.value) {
    matchResult.value = await calculateMatch(profile.value, currentUserProfile)
  }

  if (profile.value && matchResult.value) {
    aiAnalysis.value = await generateAIAnalysis(profile.value, matchResult.value)
  }
  isAnalyzing.value = false
}

onMounted(async () => {
  await initialize()

  profileLoading.value = true
  profileError.value = null
  try {
    const data = await getCompanionById(props.companionId)
    if (data) {
      profile.value = data
      matchResult.value = await calculateMatch(data, currentUserProfile)
    } else {
      profileError.value = '未找到该旅伴信息'
    }
  } catch (e) {
    profileError.value = e instanceof Error ? e.message : '加载旅伴信息失败'
  } finally {
    profileLoading.value = false
  }
})
</script>