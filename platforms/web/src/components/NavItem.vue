<template>
  <button
    class="w-full flex items-center gap-3.5 px-4 py-3 rounded-apple transition-all duration-200 text-left"
    :class="[
      active
        ? 'bg-apple-blue/10 text-apple-blue font-medium'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-600'
    ]"
    @click="$emit('click')"
  >
    <span class="text-xl">{{ icon }}</span>
    <span class="text-subhead">{{ title }}</span>
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
