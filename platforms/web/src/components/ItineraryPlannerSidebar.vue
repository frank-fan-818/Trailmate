<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50" @click.self="$emit('close')">
      <div class="absolute inset-0 bg-black/30" @click="$emit('close')" />

      <div class="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-xl overflow-hidden flex flex-col">
        <!-- 头部 -->
        <div class="h-16 px-4 flex items-center justify-between border-b border-gray-200">
          <h2 class="text-lg font-bold text-gray-900">对话历史</h2>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X :size="20" />
          </button>
        </div>

        <!-- 清空按钮 -->
        <div class="px-4 py-3 border-b border-gray-100">
          <button
            @click="$emit('clearHistory')"
            class="w-full py-2 border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            清空全部历史
          </button>
        </div>

        <!-- 对话列表 -->
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          <div v-if="chatHistory.length === 0" class="text-center text-gray-400 py-8">
            <p class="text-sm">暂无历史对话</p>
          </div>

          <div
            v-for="chat in chatHistory"
            :key="chat.id"
            @click="$emit('loadChat', chat)"
            class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-primary hover:shadow-sm transition-all"
            :class="{ 'border-primary bg-primary/5': chat.id === currentSessionId }"
          >
            <div class="text-sm font-medium text-gray-900 truncate mb-1">{{ chat.title }}</div>
            <div class="text-xs text-gray-400">{{ chat.date }} · {{ chat.messages.length }}条消息</div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'
import type { ChatSession } from '../composables/useItineraryPlanner'

defineProps<{
  chatHistory: ChatSession[]
  currentSessionId: string
}>()

defineEmits<{
  close: []
  clearHistory: []
  loadChat: [chat: ChatSession]
}>()
</script>
