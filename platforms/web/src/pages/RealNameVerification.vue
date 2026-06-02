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

      <h1 class="text-xl font-semibold text-gray-600">实名认证</h1>

      <div class="w-16"></div>
    </header>

    <!-- 加载中 -->
    <div v-if="isLoading" class="container mx-auto px-6 py-20">
      <div class="flex flex-col items-center justify-center gap-4">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span class="text-gray-400 text-sm">加载中...</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div v-else class="container mx-auto px-6 py-10">
      <div class="max-w-2xl mx-auto space-y-8">
        <!-- 错误提示 -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 text-sm">
          {{ errorMessage }}
        </div>

        <!-- ===== State: 审核中 ===== -->
        <div v-if="currentState === 'pending'" class="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <Clock :size="32" class="text-amber-600" />
          </div>
          <h2 class="text-xl font-semibold text-amber-800 mb-2">认证审核中</h2>
          <p class="text-amber-600 text-sm mb-6">你的实名认证申请正在审核中，请耐心等待</p>

          <div class="bg-white rounded-xl p-6 text-left max-w-sm mx-auto space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-400 text-sm">真实姓名</span>
              <span class="text-gray-700 text-sm font-medium">{{ verification?.realName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400 text-sm">身份证号</span>
              <span class="text-gray-700 text-sm font-medium">{{ maskedIdNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400 text-sm">提交时间</span>
              <span class="text-gray-700 text-sm font-medium">{{ formattedDate }}</span>
            </div>
          </div>
        </div>

        <!-- ===== State: 已通过 ===== -->
        <div v-else-if="currentState === 'approved'" class="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Check :size="32" class="text-green-600" />
          </div>
          <h2 class="text-xl font-semibold text-green-800 mb-2">实名认证已通过</h2>
          <p class="text-green-600 text-sm mb-6">你的身份信息已通过认证</p>

          <div class="bg-white rounded-xl p-6 text-left max-w-sm mx-auto space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-400 text-sm">真实姓名</span>
              <span class="text-gray-700 text-sm font-medium">{{ verification?.realName }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400 text-sm">认证状态</span>
              <VerificationBadge status="approved" />
            </div>
          </div>
        </div>

        <!-- ===== State: 已拒绝 ===== -->
        <div v-else-if="currentState === 'rejected'" class="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <X :size="32" class="text-red-600" />
          </div>
          <h2 class="text-xl font-semibold text-red-800 mb-2">认证未通过</h2>
          <p v-if="verification?.adminRemark" class="text-red-600 text-sm mb-2">
            原因：{{ verification.adminRemark }}
          </p>
          <p v-else class="text-red-600 text-sm mb-6">
            你的实名认证申请未通过审核
          </p>

          <button
            @click="switchToForm()"
            class="mt-4 bg-primary text-white rounded-lg font-medium transition-colors hover:bg-primary-hover active:bg-primary-active text-sm py-2.5 px-6"
          >
            重新提交
          </button>
        </div>

        <!-- ===== State: 未提交 / 重新提交表单 ===== -->
        <div v-if="currentState === 'none' || currentState === 'rejected'">
          <!-- 仅重新提交时显示提示 -->
          <div v-if="currentState === 'rejected'" class="bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl px-6 py-4 text-sm">
            请修改信息后重新提交认证申请
          </div>

          <!-- 认证表单 -->
          <section class="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
            <div class="p-6 border-b border-gray-200/50">
              <h2 class="text-lg font-semibold text-gray-600">
                {{ currentState === 'rejected' ? '重新提交认证' : '提交认证信息' }}
              </h2>
            </div>

            <div class="p-6 space-y-6">
              <!-- 真实姓名 -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-600">
                  真实姓名
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.realName"
                  type="text"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  :class="{ 'border-red-400': validationErrors.realName }"
                  placeholder="请输入与身份证一致的姓名"
                />
                <p v-if="validationErrors.realName" class="text-xs text-red-500 mt-1">{{ validationErrors.realName }}</p>
              </div>

              <!-- 身份证号 -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-600">
                  身份证号
                  <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="form.idNumber"
                  type="text"
                  maxlength="18"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  :class="{ 'border-red-400': validationErrors.idNumber }"
                  placeholder="请输入18位身份证号码"
                />
                <p v-if="validationErrors.idNumber" class="text-xs text-red-500 mt-1">{{ validationErrors.idNumber }}</p>
              </div>

              <!-- 身份证正面照 -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-600">身份证正面照</label>
                <input
                  ref="frontInputRef"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="hidden"
                  @change="(e) => handleIdCardFile(e, 'front')"
                />
                <div
                  v-if="form.idCardFrontUrl"
                  class="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                >
                  <img :src="form.idCardFrontUrl" class="w-full h-48 object-contain" />
                  <button
                    @click="form.idCardFrontUrl = ''"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600"
                  >&times;</button>
                </div>
                <button
                  v-else
                  @click="frontInputRef?.click()"
                  :disabled="uploadingFront"
                  class="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-primary hover:text-primary transition-colors text-sm flex flex-col items-center gap-2 disabled:opacity-50"
                >
                  <div v-if="uploadingFront" class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <Upload v-else :size="28" />
                  <span>{{ uploadingFront ? '上传中...' : '点击上传身份证正面' }}</span>
                </button>
                <p v-if="uploadError" class="text-xs text-red-500">{{ uploadError }}</p>
              </div>

              <!-- 身份证背面照 -->
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-600">身份证背面照</label>
                <input
                  ref="backInputRef"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  class="hidden"
                  @change="(e) => handleIdCardFile(e, 'back')"
                />
                <div
                  v-if="form.idCardBackUrl"
                  class="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
                >
                  <img :src="form.idCardBackUrl" class="w-full h-48 object-contain" />
                  <button
                    @click="form.idCardBackUrl = ''"
                    class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-red-600"
                  >&times;</button>
                </div>
                <button
                  v-else
                  @click="backInputRef?.click()"
                  :disabled="uploadingBack"
                  class="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-primary hover:text-primary transition-colors text-sm flex flex-col items-center gap-2 disabled:opacity-50"
                >
                  <div v-if="uploadingBack" class="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <Upload v-else :size="28" />
                  <span>{{ uploadingBack ? '上传中...' : '点击上传身份证背面' }}</span>
                </button>
              </div>
            </div>
          </section>

          <!-- 提交按钮 -->
          <div class="flex justify-center pb-8">
            <button
              @click="handleSubmit"
              :disabled="isSubmitting"
              class="w-full bg-primary text-white rounded-xl font-semibold transition-all hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 disabled:cursor-not-allowed text-base py-4 px-8"
            >
              <span v-if="isSubmitting" class="inline-flex items-center gap-2">
                <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                提交中...
              </span>
              <span v-else>{{ currentState === 'rejected' ? '重新提交认证' : '提交认证' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Clock, Check, X, Upload } from 'lucide-vue-next'
import VerificationBadge from '../components/VerificationBadge.vue'
import { useRealNameVerification } from '../composables/useRealNameVerification'
import { useSupabaseUpload } from '../composables/useSupabaseUpload'
import { useAuth } from '../composables/useAuth'
import type { RealNameVerification } from '@trailmate/companion-matching'

const router = useRouter()

const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const verification = ref<RealNameVerification | null>(null)

type PageState = 'none' | 'pending' | 'approved' | 'rejected'
const currentState = ref<PageState>('none')

const form = reactive({
  realName: '',
  idNumber: '',
  idCardFrontUrl: '',
  idCardBackUrl: '',
})

const validationErrors = reactive<Record<string, string>>({})

// 文件上传
const { uploadFile } = useSupabaseUpload()
const { currentUser } = useAuth()
const uploadError = ref('')
const uploadingFront = ref(false)
const uploadingBack = ref(false)
const frontInputRef = ref<HTMLInputElement | null>(null)
const backInputRef = ref<HTMLInputElement | null>(null)

async function handleIdCardFile(e: Event, side: 'front' | 'back') {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  if (file.size > 5 * 1024 * 1024) {
    uploadError.value = '文件大小不能超过 5MB'
    return
  }

  uploadError.value = ''
  if (side === 'front') uploadingFront.value = true
  else uploadingBack.value = true

  const userId = currentUser.value?.id || 'anonymous'
  const url = await uploadFile(file, 'id-cards', `${userId}/verification`)

  if (side === 'front') {
    uploadingFront.value = false
    if (url) form.idCardFrontUrl = url
    else uploadError.value = '上传失败，请重试'
  } else {
    uploadingBack.value = false
    if (url) form.idCardBackUrl = url
    else uploadError.value = '上传失败，请重试'
  }

  input.value = ''
}

const maskedIdNumber = computed(() => {
  if (!verification.value?.idNumber) return ''
  const id = verification.value.idNumber
  return id.slice(0, 3) + '***********' + id.slice(-4)
})

const formattedDate = computed(() => {
  if (!verification.value?.submittedAt) return ''
  const d = new Date(verification.value.submittedAt)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
})

function switchToForm() {
  // Pre-fill form with previous data
  if (verification.value) {
    form.realName = verification.value.realName || ''
    form.idNumber = verification.value.idNumber || ''
    form.idCardFrontUrl = verification.value.idCardFrontUrl || ''
    form.idCardBackUrl = verification.value.idCardBackUrl || ''
  }
  currentState.value = 'none'
}

function validate(): boolean {
  Object.keys(validationErrors).forEach(key => delete validationErrors[key])
  let valid = true

  if (!form.realName.trim()) {
    validationErrors.realName = '请输入真实姓名'
    valid = false
  }

  if (!form.idNumber.trim()) {
    validationErrors.idNumber = '请输入身份证号'
    valid = false
  } else if (form.idNumber.trim().length !== 18) {
    validationErrors.idNumber = '身份证号必须为18位'
    valid = false
  } else if (!/^\d{17}[\dXx]$/.test(form.idNumber.trim())) {
    validationErrors.idNumber = '身份证号格式不正确'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  errorMessage.value = ''
  if (!validate()) return

  isSubmitting.value = true
  try {
    const { submitVerification } = useRealNameVerification()
    await submitVerification({
      realName: form.realName.trim(),
      idNumber: form.idNumber.trim(),
      idCardFrontUrl: form.idCardFrontUrl || undefined,
      idCardBackUrl: form.idCardBackUrl || undefined,
    })
    currentState.value = 'pending'
    // Update the verification data
    verification.value = {
      id: '',
      realName: form.realName.trim(),
      idNumber: form.idNumber.trim(),
      idCardFrontUrl: form.idCardFrontUrl || undefined,
      idCardBackUrl: form.idCardBackUrl || undefined,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    }
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : '提交失败，请重试'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(async () => {
  try {
    const { getMyVerification } = useRealNameVerification()
    const result = await getMyVerification()
    if (result) {
      verification.value = result
      currentState.value = result.status as PageState
    } else {
      currentState.value = 'none'
    }
  } catch (e) {
    console.error('获取认证信息失败:', e)
    currentState.value = 'none'
  } finally {
    isLoading.value = false
  }
})
</script>
