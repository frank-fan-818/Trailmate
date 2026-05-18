<template>
  <div :class="[
    'flex gap-3 mb-2',
    message.role === 'user' ? 'justify-end' : 'justify-start'
  ]">
    <!-- AI avatar -->
    <div v-if="message.role === 'assistant'"
      class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
      <span class="text-primary text-xs font-bold">AI</span>
    </div>

    <div :class="[
      'max-w-[80%] rounded-2xl px-4 py-3 text-sm',
      message.role === 'user'
        ? 'bg-primary text-white rounded-br-md'
        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-md'
    ]">
      <div v-html="renderedContent"></div>
    </div>

    <!-- User avatar -->
    <div v-if="message.role === 'user'"
      class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
      <span class="text-gray-500 text-xs font-bold">我</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import type { ConciergeMessage } from '../../composables/useAiConcierge'

const props = defineProps<{ message: ConciergeMessage }>()

const renderedContent = computed(() => {
  // Use marked to render markdown in assistant messages
  if (props.message.role === 'assistant') {
    return marked(props.message.content) as string
  }
  return props.message.content.replace(/\n/g, '<br>')
})
</script>
