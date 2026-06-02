<template>
  <div class="min-h-screen bg-gray-100">
    <!-- 顶部导航 -->
    <header class="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-8 flex items-center justify-between sticky top-0 z-20">
      <button
        @click="router.back()"
        class="flex items-center gap-2 text-primary hover:brightness-110 transition-all"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        <span class="text-base font-medium">返回</span>
      </button>

      <h1 class="text-xl font-semibold text-gray-600">认证审核</h1>

      <div class="w-16"></div>
    </header>

    <div class="container mx-auto px-6 py-10">
      <div class="max-w-4xl mx-auto">
        <!-- 权限错误 -->
        <div v-if="isForbidden" class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <ShieldAlert :size="32" class="text-red-600" />
          </div>
          <h2 class="text-xl font-semibold text-red-800 mb-2">没有管理员权限</h2>
          <p class="text-red-600 text-sm">您没有管理员权限，无法访问此页面</p>
          <button
            @click="router.push('/dashboard')"
            class="mt-6 bg-primary text-white rounded-lg font-medium transition-colors hover:bg-primary-hover active:bg-primary-active text-sm py-2.5 px-6"
          >
            返回首页
          </button>
        </div>

        <!-- 加载中 -->
        <div v-else-if="isLoading" class="flex flex-col items-center justify-center gap-4 py-20">
          <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span class="text-gray-400 text-sm">加载中...</span>
        </div>

        <!-- 主内容 -->
        <template v-else>
          <!-- 错误提示 -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 text-sm mb-6">
            {{ errorMessage }}
          </div>

          <!-- 成功提示 -->
          <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-6 py-4 text-sm mb-6">
            {{ successMessage }}
          </div>

          <!-- 筛选标签 -->
          <div class="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden mb-6">
            <div class="p-4 flex gap-2">
              <button
                v-for="tab in filterTabs"
                :key="tab.key"
                @click="activeFilter = tab.key; fetchData()"
                :class="[
                  'px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
                  activeFilter === tab.key
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                ]"
              >
                {{ tab.label }}
              </button>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="verifications.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-12 text-center">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search :size="28" class="text-gray-400" />
            </div>
            <p class="text-gray-400 text-base">暂无认证记录</p>
          </div>

          <!-- 认证列表 -->
          <div v-else class="space-y-4">
            <div
              v-for="item in verifications"
              :key="item.id"
              class="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden"
            >
              <!-- 列表行（可点击展开） -->
              <div
                @click="toggleExpand(item.id)"
                class="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div class="flex items-center gap-6 flex-1">
                  <div class="flex-1 min-w-0">
                    <div class="text-base font-medium text-gray-700">{{ item.realName }}</div>
                    <div class="text-sm text-gray-400 mt-0.5">{{ maskIdNumber(item.idNumber) }}</div>
                  </div>
                  <div class="text-sm text-gray-400 whitespace-nowrap">{{ formatDate(item.submittedAt) }}</div>
                  <VerificationBadge :status="item.status as 'approved' | 'pending' | 'rejected'" size="sm" />
                </div>
                <ChevronDown
                  :size="20"
                  class="text-gray-400 transition-transform duration-200"
                  :class="{ 'rotate-180': expandedId === item.id }"
                />
              </div>

              <!-- 展开详情 -->
              <div
                v-if="expandedId === item.id"
                class="border-t border-gray-200/50 px-6 py-6 space-y-6"
              >
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs text-gray-400 mb-1">真实姓名</label>
                    <div class="text-sm text-gray-700">{{ item.realName }}</div>
                  </div>
                  <div>
                    <label class="block text-xs text-gray-400 mb-1">身份证号</label>
                    <div class="text-sm text-gray-700">{{ item.idNumber }}</div>
                  </div>
                  <div v-if="item.idCardFrontUrl">
                    <label class="block text-xs text-gray-400 mb-1">身份证正面</label>
                    <a
                      :href="item.idCardFrontUrl"
                      target="_blank"
                      class="text-sm text-primary hover:underline"
                    >查看图片</a>
                  </div>
                  <div v-if="item.idCardBackUrl">
                    <label class="block text-xs text-gray-400 mb-1">身份证背面</label>
                    <a
                      :href="item.idCardBackUrl"
                      target="_blank"
                      class="text-sm text-primary hover:underline"
                    >查看图片</a>
                  </div>
                  <div v-if="item.adminRemark">
                    <label class="block text-xs text-gray-400 mb-1">审核备注</label>
                    <div class="text-sm text-gray-700">{{ item.adminRemark }}</div>
                  </div>
                </div>

                <!-- 操作区（仅待审核） -->
                <div v-if="item.status === 'pending'" class="space-y-4 pt-4 border-t border-gray-200/50">
                  <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-600">审核备注（可选）</label>
                    <textarea
                      v-model="actionRemark"
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                      rows="2"
                      placeholder="输入审核备注..."
                    />
                  </div>
                  <div class="flex items-center gap-3">
                    <button
                      @click="handleApprove(item.id)"
                      :disabled="actionLoading"
                      class="bg-green-600 text-white rounded-lg font-medium transition-colors hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2.5 px-6"
                    >
                      <span v-if="actionLoading" class="inline-flex items-center gap-2">
                        <div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        处理中...
                      </span>
                      <span v-else>通过</span>
                    </button>
                    <button
                      @click="handleReject(item.id)"
                      :disabled="actionLoading"
                      class="bg-red-600 text-white rounded-lg font-medium transition-colors hover:bg-red-700 active:bg-red-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2.5 px-6"
                    >
                      <span v-if="actionLoading" class="inline-flex items-center gap-2">
                        <div class="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        处理中...
                      </span>
                      <span v-else>拒绝</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronDown, Search, ShieldAlert } from 'lucide-vue-next'
import VerificationBadge from '../components/VerificationBadge.vue'
import { useAdmin } from '../composables/useAdmin'

interface VerificationItem {
  id: string
  realName: string
  idNumber: string
  idCardFrontUrl?: string
  idCardBackUrl?: string
  status: string
  adminRemark?: string
  submittedAt: string
}

const router = useRouter()

const isForbidden = ref(false)
const isLoading = ref(true)
const errorMessage = ref('')
const successMessage = ref('')
const verifications = ref<VerificationItem[]>([])
const expandedId = ref<string | null>(null)
const actionRemark = ref('')
const actionLoading = ref(false)

const activeFilter = ref('all')

const filterTabs = [
  { key: 'all', label: '全部' },
  { key: 'pending', label: '待审核' },
  { key: 'approved', label: '已通过' },
  { key: 'rejected', label: '已拒绝' },
]

function maskIdNumber(id: string): string {
  if (!id || id.length < 7) return id
  return id.slice(0, 3) + '***********' + id.slice(-4)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function toggleExpand(id: string) {
  expandedId.value = expandedId.value === id ? null : id
  actionRemark.value = ''
}

async function fetchData() {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { fetchVerifications } = useAdmin()
    const filter = activeFilter.value === 'all' ? undefined : activeFilter.value
    verifications.value = await fetchVerifications(filter)
  } catch (e) {
    if (e instanceof Error && (e.message.includes('403') || e.message.includes('Forbidden') || e.message.includes('权限'))) {
      isForbidden.value = true
    } else {
      errorMessage.value = e instanceof Error ? e.message : '获取认证列表失败'
    }
  } finally {
    isLoading.value = false
  }
}

async function handleApprove(id: string) {
  if (!confirm('确认通过该认证申请？')) return

  actionLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { reviewVerification } = useAdmin()
    await reviewVerification(id, 'approved', actionRemark.value || undefined)
    successMessage.value = '已通过认证'

    // Update the local item status
    const item = verifications.value.find(v => v.id === id)
    if (item) {
      item.status = 'approved'
      if (actionRemark.value) item.adminRemark = actionRemark.value
    }
    expandedId.value = null
    actionRemark.value = ''
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : '操作失败'
  } finally {
    actionLoading.value = false
  }
}

async function handleReject(id: string) {
  if (!confirm('确认拒绝该认证申请？')) return

  actionLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { reviewVerification } = useAdmin()
    await reviewVerification(id, 'rejected', actionRemark.value || undefined)
    successMessage.value = '已拒绝认证'

    // Update the local item status
    const item = verifications.value.find(v => v.id === id)
    if (item) {
      item.status = 'rejected'
      if (actionRemark.value) item.adminRemark = actionRemark.value
    }
    expandedId.value = null
    actionRemark.value = ''
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : '操作失败'
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
