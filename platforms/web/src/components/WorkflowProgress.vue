<template>
  <div class="workflow-progress">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        <p class="text-sm text-gray-500 mt-1">{{ subtitle }}</p>
      </div>
      <div v-if="totalDuration" class="text-sm text-gray-500">
        总耗时 {{ totalDuration }}
      </div>
    </div>

    <div class="relative">
      <div
        v-for="(step, index) in steps"
        :key="step.name"
        class="flex items-start gap-4"
        :class="{ 'pb-6': index < steps.length - 1 }"
      >
        <div class="flex flex-col items-center">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
            :class="statusDotClass(step.status)"
          >
            <span class="text-sm">{{ statusIcon(step.status) }}</span>
          </div>
          <div
            v-if="index < steps.length - 1"
            class="w-0.5 flex-1 min-h-[24px] mt-1 transition-colors duration-300"
            :class="connectorClass(step.status)"
          />
        </div>

        <div class="flex-1 min-w-0 pt-1">
          <div class="flex items-center gap-3 flex-wrap">
            <span
              class="text-sm font-medium transition-colors duration-300"
              :class="nameClass(step.status)"
            >
              {{ step.label }}
            </span>
            <span
              class="text-xs px-2 py-0.5 rounded-full font-medium"
              :class="badgeClass(step.status)"
            >
              {{ statusLabel(step.status) }}
            </span>
            <span
              v-if="step.controlType"
              class="text-xs px-2 py-0.5 rounded-full"
              :class="controlTypeClass(step.controlType)"
            >
              {{ controlTypeLabel(step.controlType) }}
            </span>
          </div>

          <p v-if="step.description" class="text-xs text-gray-400 mt-1">
            {{ step.description }}
          </p>

          <div v-if="step.durationMs" class="text-xs text-gray-400 mt-1">
            耗时 {{ formatDuration(step.durationMs) }}
          </div>

          <div
            v-if="step.status === 'failed' && step.error"
            class="mt-2 p-3 rounded-lg text-sm"
            :class="errorBgClass"
          >
            <div class="flex items-start gap-2">
              <AlertTriangle :size="16" class="flex-shrink-0 mt-0.5" />
              <div>
                <p class="font-medium" :class="errorTextClass">{{ step.error }}</p>
                <button
                  v-if="resumable"
                  @click="$emit('retry', step.name)"
                  class="mt-2 text-xs font-medium underline underline-offset-2"
                  :class="errorTextClass"
                >
                  从此步骤重试
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="overallStatus === 'running'"
      class="mt-6 flex items-center gap-3 px-4 py-3 rounded-xl"
      :class="progressBgClass"
    >
      <div class="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
        :class="progressSpinnerClass"
      />
      <span class="text-sm" :class="progressTextClass">
        正在执行: {{ currentStepLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'

export interface WorkflowStepDisplay {
  name: string
  label: string
  description?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  controlType?: 'code' | 'llm' | 'tool_calling'
  durationMs?: number
  error?: string
}

const props = defineProps<{
  steps: WorkflowStepDisplay[]
  title?: string
  subtitle?: string
  resumable?: boolean
}>()

defineEmits<{
  retry: [stepName: string]
}>()

const overallStatus = computed(() => {
  if (props.steps.some(s => s.status === 'failed')) return 'failed'
  if (props.steps.some(s => s.status === 'running')) return 'running'
  if (props.steps.every(s => s.status === 'completed')) return 'completed'
  return 'pending'
})

const currentStepLabel = computed(() => {
  const running = props.steps.find(s => s.status === 'running')
  return running?.label || '...'
})

const totalDuration = computed(() => {
  const total = props.steps.reduce((sum, s) => sum + (s.durationMs || 0), 0)
  return total > 0 ? formatDuration(total) : ''
})

function statusDotClass(status: string) {
  switch (status) {
    case 'completed': return 'bg-green-500 text-white'
    case 'running': return 'bg-primary text-white animate-pulse'
    case 'failed': return 'bg-red-500 text-white'
    default: return 'bg-gray-200 text-gray-400'
  }
}

function statusIcon(status: string) {
  switch (status) {
    case 'completed': return '✓'
    case 'running': return '◉'
    case 'failed': return '✕'
    default: return '○'
  }
}

function connectorClass(status: string) {
  return status === 'completed' ? 'bg-green-400' : 'bg-gray-200'
}

function nameClass(status: string) {
  switch (status) {
    case 'completed': return 'text-gray-900'
    case 'running': return 'text-primary font-semibold'
    case 'failed': return 'text-red-600'
    default: return 'text-gray-400'
  }
}

function badgeClass(status: string) {
  switch (status) {
    case 'completed': return 'bg-green-50 text-green-700'
    case 'running': return 'bg-primary/10 text-primary'
    case 'failed': return 'bg-red-50 text-red-600'
    default: return 'bg-gray-100 text-gray-500'
  }
}

function statusLabel(status: string) {
  switch (status) {
    case 'completed': return '已完成'
    case 'running': return '执行中'
    case 'failed': return '失败'
    default: return '等待中'
  }
}

function controlTypeClass(type: string) {
  switch (type) {
    case 'code': return 'bg-blue-50 text-blue-600'
    case 'llm': return 'bg-purple-50 text-purple-600'
    case 'tool_calling': return 'bg-amber-50 text-amber-600'
    default: return 'bg-gray-100 text-gray-500'
  }
}

function controlTypeLabel(type: string) {
  switch (type) {
    case 'code': return '代码控制'
    case 'llm': return 'LLM控制'
    case 'tool_calling': return '工具调用'
    default: return type
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${(ms / 60000).toFixed(1)}min`
}

const errorBgClass = 'bg-red-50 border border-red-100'
const errorTextClass = 'text-red-700'
const progressBgClass = 'bg-primary/5 border border-primary/10'
const progressSpinnerClass = 'border-primary/30 border-t-primary'
const progressTextClass = 'text-primary'
</script>
