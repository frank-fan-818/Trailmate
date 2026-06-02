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

      <h1 class="text-xl font-semibold text-gray-600">{{ pageTitle }}</h1>

      <div class="w-16"></div>
    </header>

    <!-- 加载中 -->
    <div v-if="isFetching" class="container mx-auto px-6 py-20">
      <div class="flex flex-col items-center justify-center gap-4">
        <div class="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <span class="text-gray-400 text-sm">加载中...</span>
      </div>
    </div>

    <!-- 主内容区 -->
    <div v-else class="container mx-auto px-6 py-10">
      <div class="max-w-2xl mx-auto space-y-8">
        <!-- 全局提示 -->
        <div v-if="successMessage" class="bg-green-50 border border-green-200 text-green-700 rounded-2xl px-6 py-4 text-sm">
          {{ successMessage }}
        </div>

        <div v-if="errorMessage" class="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-6 py-4 text-sm">
          {{ errorMessage }}
        </div>

        <!-- 基础信息 -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div class="p-6 border-b border-gray-200/50">
            <h2 class="text-lg font-semibold text-gray-600">基础信息</h2>
          </div>

          <div class="p-6 space-y-6">
            <!-- 头像上传 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600">头像</label>
              <div class="flex items-center gap-4">
                <!-- 预览 -->
                <div
                  class="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 flex-shrink-0"
                  :class="{ 'border-primary bg-primary/5': form.avatar }"
                >
                  <img v-if="form.avatar" :src="form.avatar" class="w-full h-full object-cover" />
                  <Image v-else :size="28" class="text-gray-300" />
                </div>
                <div class="flex-1">
                  <input
                    ref="avatarInputRef"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    class="hidden"
                    @change="handleAvatarFile"
                  />
                  <button
                    @click="avatarInputRef?.click()"
                    :disabled="avatarUploading"
                    class="bg-white text-primary rounded-lg font-medium border border-primary hover:bg-primary/5 transition-colors text-sm py-2.5 px-5 disabled:opacity-50"
                  >
                    <span v-if="avatarUploading" class="inline-flex items-center gap-2">
                      <div class="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      上传中...
                    </span>
                    <span v-else>{{ form.avatar ? '更换头像' : '选择图片' }}</span>
                  </button>
                  <p class="text-xs text-gray-400 mt-1">支持 JPG、PNG、WebP，最大 5MB</p>
                  <p v-if="avatarError" class="text-xs text-red-500 mt-1">{{ avatarError }}</p>
                </div>
              </div>
            </div>

            <!-- 姓名 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600">
                姓名
                <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.name"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                :class="{ 'border-red-400': validationErrors.name }"
                placeholder="请输入姓名"
              />
              <p v-if="validationErrors.name" class="text-xs text-red-500 mt-1">{{ validationErrors.name }}</p>
            </div>

            <!-- 个人简介 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600">个人简介</label>
              <textarea
                v-model="form.bio"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                rows="3"
                placeholder="介绍一下自己..."
              />
            </div>

            <!-- 性别 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600">性别</label>
              <select
                v-model="form.gender"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">请选择</option>
                <option value="男">男</option>
                <option value="女">女</option>
                <option value="保密">保密</option>
              </select>
            </div>

            <!-- 年龄 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600">年龄</label>
              <input
                v-model.number="form.age"
                type="number"
                min="1"
                max="120"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="请输入年龄"
              />
            </div>
          </div>
        </section>

        <!-- 行程信息 -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div class="p-6 border-b border-gray-200/50">
            <h2 class="text-lg font-semibold text-gray-600">行程信息</h2>
          </div>

          <div class="p-6 space-y-6">
            <!-- 目的地 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600">目的地</label>
              <input
                v-model="form.destination"
                type="text"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="例如：日本东京"
              />
            </div>

            <!-- 行程天数 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600">行程天数</label>
              <input
                v-model.number="form.travelDays"
                type="number"
                min="1"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="请输入天数"
              />
            </div>

            <!-- 出发日期 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600">出发日期</label>
              <input
                v-model="form.departureDate"
                type="date"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <!-- 预算类型 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600">预算类型</label>
              <select
                v-model="form.budgetType"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">请选择</option>
                <option value="budget">经济</option>
                <option value="medium">适中</option>
                <option value="luxury">豪华</option>
              </select>
            </div>

            <!-- 旅行类型 -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-600">旅行类型</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="type in travelTypeOptions"
                  :key="type"
                  @click="toggleTravelType(type)"
                  :class="[
                    'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    form.travelTypes.includes(type)
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  ]"
                >
                  {{ type }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- 生活习惯 -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div class="p-6 border-b border-gray-200/50">
            <h2 class="text-lg font-semibold text-gray-600">生活习惯</h2>
          </div>

          <div class="p-6 space-y-6">
            <!-- 性格类型 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600">性格类型</label>
              <select
                v-model="form.personalityType"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="">请选择</option>
                <option value="planner">计划型</option>
                <option value="spontaneous">随性型</option>
              </select>
            </div>

            <!-- 起床时间 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600">起床时间</label>
              <input
                v-model="form.wakeTime"
                type="time"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <!-- 睡觉时间 -->
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600">睡觉时间</label>
              <input
                v-model="form.sleepTime"
                type="time"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </section>

        <!-- 可见性设置 -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
          <div class="p-6 border-b border-gray-200/50">
            <h2 class="text-lg font-semibold text-gray-600">隐私设置</h2>
          </div>

          <div class="p-6">
            <label class="flex items-center justify-between cursor-pointer">
              <div>
                <div class="text-base font-medium text-gray-600">在匹配中可见</div>
                <div class="text-sm text-gray-400 mt-0.5">允许其他用户在旅伴匹配中看到你的档案</div>
              </div>
              <input
                v-model="form.isVisible"
                type="checkbox"
                class="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </label>
          </div>
        </section>

        <!-- 保存按钮 -->
        <div class="flex justify-center pb-8">
          <button
            @click="handleSave"
            :disabled="isSaving"
            class="w-full bg-primary text-white rounded-xl font-semibold transition-all hover:bg-primary-hover active:bg-primary-active disabled:opacity-50 disabled:cursor-not-allowed text-base py-4 px-8"
          >
            <span v-if="isSaving" class="inline-flex items-center gap-2">
              <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              保存中...
            </span>
            <span v-else>保存档案</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Image } from 'lucide-vue-next'
import { useCompanionProfile } from '../composables/useCompanionProfile'
import { useSupabaseUpload } from '../composables/useSupabaseUpload'
import { useAuth } from '../composables/useAuth'

const router = useRouter()

interface CompanionProfileForm {
  avatar: string
  name: string
  bio: string
  destination: string
  travelDays: number | undefined
  departureDate: string
  budgetType: string
  personalityType: string
  travelTypes: string[]
  wakeTime: string
  sleepTime: string
  gender: string
  age: number | undefined
  isVisible: boolean
}

const form = reactive<CompanionProfileForm>({
  avatar: '',
  name: '',
  bio: '',
  destination: '',
  travelDays: undefined,
  departureDate: '',
  budgetType: '',
  personalityType: '',
  travelTypes: [],
  wakeTime: '',
  sleepTime: '',
  gender: '',
  age: undefined,
  isVisible: true,
})

const travelTypeOptions = ['休闲', '文化', '冒险', '美食', '购物', '自然', '摄影', '徒步', '夜生活']

const { uploadFile } = useSupabaseUpload()
const { currentUser } = useAuth()
const avatarInputRef = ref<HTMLInputElement | null>(null)
const avatarUploading = ref(false)
const avatarError = ref('')

async function handleAvatarFile(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Validate
  if (file.size > 5 * 1024 * 1024) {
    avatarError.value = '文件大小不能超过 5MB'
    return
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    avatarError.value = '仅支持 JPG、PNG、WebP 格式'
    return
  }

  avatarError.value = ''
  avatarUploading.value = true
  const userId = currentUser.value?.id || 'anonymous'
  const url = await uploadFile(file, 'avatars', userId)
  avatarUploading.value = false

  if (url) {
    form.avatar = url
  } else {
    avatarError.value = '上传失败，请重试'
  }
  // Reset input so same file can be re-selected
  input.value = ''
}

const isFetching = ref(true)
const isSaving = ref(false)
const isEditing = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const validationErrors = reactive<Record<string, string>>({})

const pageTitle = computed(() => isEditing.value ? '编辑旅伴档案' : '创建旅伴档案')

function toggleTravelType(type: string) {
  const index = form.travelTypes.indexOf(type)
  if (index > -1) {
    form.travelTypes.splice(index, 1)
  } else {
    form.travelTypes.push(type)
  }
}

function validate(): boolean {
  // Clear previous errors
  Object.keys(validationErrors).forEach(key => delete validationErrors[key])

  let valid = true

  if (!form.name.trim()) {
    validationErrors.name = '请输入姓名'
    valid = false
  }

  return valid
}

async function handleSave() {
  successMessage.value = ''
  errorMessage.value = ''

  if (!validate()) return

  isSaving.value = true
  try {
    const { saveMyProfile } = useCompanionProfile()
    await saveMyProfile({
      avatar: form.avatar || undefined,
      name: form.name.trim(),
      bio: form.bio || undefined,
      destination: form.destination || undefined,
      travelDays: form.travelDays || undefined,
      departureDate: form.departureDate || undefined,
      budgetType: (form.budgetType || undefined) as any,
      personalityType: (form.personalityType || undefined) as any,
      travelTypes: form.travelTypes.length > 0 ? form.travelTypes : undefined,
      wakeTime: form.wakeTime || undefined,
      sleepTime: form.sleepTime || undefined,
      gender: form.gender || undefined,
      age: form.age || undefined,
      isVisible: form.isVisible,
    })
    successMessage.value = '档案保存成功！'
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : '保存失败，请重试'
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  try {
    const { fetchMyProfile } = useCompanionProfile()
    const profile = await fetchMyProfile()
    if (profile) {
      isEditing.value = true
      form.avatar = profile.avatar || ''
      form.name = profile.name || ''
      form.bio = profile.bio || ''
      form.destination = profile.destination || ''
      form.travelDays = profile.travelDays || undefined
      form.departureDate = profile.departureDate || ''
      form.budgetType = profile.budgetType || ''
      form.personalityType = profile.personalityType || ''
      form.travelTypes = profile.travelTypes || []
      form.wakeTime = profile.wakeTime || ''
      form.sleepTime = profile.sleepTime || ''
      form.gender = profile.gender || ''
      form.age = profile.age || undefined
      form.isVisible = profile.isVisible !== false
    }
  } catch (e) {
    console.error('获取旅伴档案失败:', e)
  } finally {
    isFetching.value = false
  }
})
</script>
