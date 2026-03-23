<template>
  <div class="flex items-start gap-3">
    <!-- 状态图标 -->
    <div 
      class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      :class="[
        status === 'done' ? 'bg-green-100' : 
        status === 'in_progress' ? 'bg-blue-100' : 'bg-gray-100'
      ]"
    >
      <span class="text-sm">
        {{ status === 'done' ? '✅' : status === 'in_progress' ? '🔄' : '⏳' }}
      </span>
    </div>
    
    <!-- 内容 -->
    <div class="flex-1">
      <div class="flex items-center gap-2 mb-0.5">
        <h4 class="font-medium text-gray-900">{{ name }}</h4>
        <span 
          class="text-xs px-2 py-0.5 rounded-full font-medium"
          :class="[
            status === 'done' ? 'bg-green-100 text-green-700' :
            status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
          ]"
        >
          {{ statusText }}
        </span>
      </div>
      <p class="text-sm text-gray-500">{{ description }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  status: 'done' | 'in_progress' | 'pending'
  description: string
}>()

const statusText = computed(() => {
  const map = {
    done: '已完成',
    in_progress: '开发中',
    pending: '待开发'
  }
  return map[props.status]
})
</script>
