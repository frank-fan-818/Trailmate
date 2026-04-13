<template>
  <div class="flex items-start gap-4 p-4 rounded-apple-lg hover:bg-gray-50 transition-colors duration-200">
    <!-- 状态图标 - Apple 风格 -->
    <div 
      class="w-10 h-10 rounded-apple flex items-center justify-center flex-shrink-0"
      :class="[
        status === 'done' ? 'bg-apple-green/10' : 
        status === 'in_progress' ? 'bg-apple-blue/10' : 'bg-gray-100'
      ]"
    >
      <span class="text-lg">
        {{ status === 'done' ? '✓' : status === 'in_progress' ? '◐' : '○' }}
      </span>
    </div>
    
    <!-- 内容 -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-3 mb-1">
        <h4 class="text-body font-semibold text-gray-600 truncate">{{ name }}</h4>
        <span 
          class="apple-badge flex-shrink-0"
          :class="[
            status === 'done' ? 'apple-badge-green' :
            status === 'in_progress' ? 'apple-badge-blue' : 'bg-gray-100 text-gray-500'
          ]"
        >
          {{ statusText }}
        </span>
      </div>
      <p class="text-subhead text-gray-400">{{ description }}</p>
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
