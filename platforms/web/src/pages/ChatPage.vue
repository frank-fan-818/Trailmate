<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="max-w-2xl mx-auto flex items-center justify-between">
        <button @click="$emit('back')" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <span>←</span>
          <span>返回</span>
        </button>
        <h1 class="text-lg font-bold text-gray-900">与 {{ companionName }} 的对话</h1>
        <div class="w-16"></div>
      </div>
    </header>

    <div class="max-w-2xl mx-auto">
      <div class="p-4 space-y-4 h-[calc(100vh-180px)] overflow-y-auto">
        <div v-for="(msg, index) in messages" :key="index" :class="msg.isMe ? 'flex justify-end' : 'flex justify-start'">
          <div :class="[
            'max-w-[75%] px-4 py-3 rounded-lg',
            msg.isMe ? 'bg-primary text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-900 rounded-bl-none'
          ]">
            <p class="text-sm">{{ msg.content }}</p>
            <p :class="['text-xs mt-1', msg.isMe ? 'text-white/70' : 'text-gray-400']">{{ msg.time }}</p>
          </div>
        </div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div class="max-w-2xl mx-auto flex gap-3">
          <input
            v-model="newMessage"
            type="text"
            placeholder="输入消息..."
            class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
            @keyup.enter="sendMessage"
          />
          <button
            @click="sendMessage"
            :disabled="!newMessage.trim()"
            class="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineEmits<{
  (e: 'back'): void
}>()

defineProps<{
  companionId: string
  companionName: string
}>()

interface Message {
  content: string
  time: string
  isMe: boolean
}

const newMessage = ref('')

const messages = ref<Message[]>([
  {
    content: '你好！看到你想去云南大理，我也是！',
    time: '10:30',
    isMe: false
  },
  {
    content: '你好！很高兴认识你！你的行程是怎么安排的？',
    time: '10:32',
    isMe: true
  },
  {
    content: '我计划5月1号出发，大概待5天左右。想找个伴一起拼房吃饭，互相拍照什么的。',
    time: '10:33',
    isMe: false
  }
])

const sendMessage = () => {
  if (!newMessage.value.trim()) return

  messages.value.push({
    content: newMessage.value,
    time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    isMe: true
  })

  newMessage.value = ''
}
</script>