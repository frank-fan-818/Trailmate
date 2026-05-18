<template>
  <div v-if="toolCalls.length > 0" class="flex flex-col gap-1.5 mb-3 ml-11">
    <div
      v-for="tc in toolCalls"
      :key="tc.id"
      :class="[
        'flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-colors',
        tc.status === 'running' ? 'bg-blue-50 border-blue-200 text-blue-700' :
        tc.status === 'success' ? 'bg-green-50 border-green-200 text-green-700' :
        'bg-red-50 border-red-200 text-red-700'
      ]"
    >
      <!-- Icon -->
      <span v-if="tc.status === 'running'" class="inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></span>
      <span v-else-if="tc.status === 'success'">✅</span>
      <span v-else>❌</span>

      <!-- Display name -->
      <span class="font-medium">{{ tc.displayName }}</span>

      <!-- Status text -->
      <span class="text-gray-400 ml-auto">
        {{ tc.status === 'running' ? '执行中...' : tc.status === 'success' ? '完成' : '失败' }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ToolCallState } from '../../composables/useAiConcierge'
defineProps<{ toolCalls: ToolCallState[] }>()
</script>
