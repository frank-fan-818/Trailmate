<template>
  <div class="min-h-screen bg-gray-100 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4 shrink-0">
      <div class="max-w-4xl mx-auto flex items-center justify-between">
        <button @click="router.back()" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <span>←</span>
          <span>返回</span>
        </button>
        <div class="flex items-center gap-3">
          <span class="text-lg font-bold text-gray-900">AI 旅行管家</span>
          <span class="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium">Beta</span>
        </div>
        <button
          v-if="messages.length > 0"
          @click="handleClear"
          class="text-sm text-gray-500 hover:text-red-500 transition-colors"
        >
          清空对话
        </button>
        <div v-else class="w-16"></div>
      </div>
    </header>

    <!-- Chat area -->
    <div class="flex-1 overflow-y-auto" ref="chatContainer">
      <div class="max-w-4xl mx-auto px-4 py-6">
        <!-- Welcome -->
        <WelcomeScreen
          v-if="messages.length === 0"
          @select="sendMessage"
        />

        <!-- Messages -->
        <div v-else class="space-y-1">
          <template v-for="msg in messages" :key="msg.id">
            <!-- Tool call indicator before assistant messages with tool calls -->
            <ToolCallIndicator
              v-if="msg.toolCalls && msg.toolCalls.length > 0"
              :tool-calls="msg.toolCalls"
            />
            <ChatMessage :message="msg" />
          </template>

          <!-- Active tool calls (during processing) -->
          <ToolCallIndicator
            v-if="isProcessing && currentToolCalls.length > 0"
            :tool-calls="currentToolCalls"
          />

          <!-- Typing indicator -->
          <div v-if="isProcessing && currentToolCalls.length === 0" class="flex gap-3 ml-11">
            <div class="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
              <div class="flex gap-1">
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms"></span>
                <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms"></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Input area -->
    <div class="bg-white border-t border-gray-200 px-6 py-4 shrink-0">
      <div class="max-w-4xl mx-auto flex gap-3">
        <textarea
          v-model="input"
          @keydown.enter.exact.prevent="handleSend"
          :disabled="isProcessing"
          placeholder="输入你的旅行问题..."
          rows="1"
          class="flex-1 px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-primary resize-none transition-colors disabled:bg-gray-50"
          style="max-height:120px"
          @input="autoResize"
        ></textarea>
        <button
          @click="handleSend"
          :disabled="isProcessing || !input.trim()"
          class="px-6 py-3 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 shrink-0"
        >
          {{ isProcessing ? '思考中' : '发送' }}
        </button>
      </div>
      <p class="text-xs text-gray-400 text-center mt-2">按 Enter 发送，AI 会调用模块工具为你服务</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAiConcierge } from '../composables/useAiConcierge'
import ChatMessage from '../components/ai-concierge/ChatMessage.vue'
import ToolCallIndicator from '../components/ai-concierge/ToolCallIndicator.vue'
import WelcomeScreen from '../components/ai-concierge/WelcomeScreen.vue'

const router = useRouter()
const { messages, isProcessing, currentToolCalls, sendMessage: conciergeSend, clearHistory } = useAiConcierge()

const input = ref('')
const chatContainer = ref<HTMLDivElement>()

const autoResize = (e: Event) => {
  const el = e.target as HTMLTextAreaElement
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

// Bridge: WelcomeScreen @select calls this directly
const sendMessage = (text: string) => {
  input.value = text
  handleSend()
}

const handleSend = async () => {
  const text = input.value.trim()
  if (!text || isProcessing.value) return
  input.value = ''
  await conciergeSend(text)
  await scrollToBottom()
}

const handleClear = () => {
  clearHistory()
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

// Auto-scroll on new messages
watch(() => messages.value.length, () => {
  scrollToBottom()
})
</script>
