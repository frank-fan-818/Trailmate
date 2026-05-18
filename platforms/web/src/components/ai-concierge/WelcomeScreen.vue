<template>
  <div class="flex-1 flex flex-col items-center justify-center px-4 py-12">
    <div class="text-center mb-10">
      <div class="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <span class="text-4xl">🧭</span>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">AI 旅行管家</h1>
      <p class="text-gray-500 text-sm max-w-sm mx-auto">
        用自然语言规划行程、查找旅伴、管理通知。<br>试试下面的例子：
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
      <button
        v-for="suggestion in suggestions"
        :key="suggestion"
        @click="$emit('select', suggestion)"
        class="text-left px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 hover:border-primary hover:bg-primary/5 transition-colors"
      >
        {{ suggestion }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{ select: [text: string] }>()

const suggestions = [
  '帮我规划一次云南大理3日游',
  '帮我找去大理的旅伴',
  '我现在在哪里？',
  '查看我的规则列表',
  '查看我的通知',
  '帮我找预算中等、喜欢美食的旅伴'
]
</script>
