<template>
  <button
    class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left"
    :class="[
      active
        ? 'bg-blue-50 text-blue-600 font-medium'
        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
    ]"
    @click="$emit('click')"
  >
    <span class="text-lg">{{ icon }}</span>
    <span>{{ title }}</span>
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  icon: string
  title: string
  active?: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()
</script>
