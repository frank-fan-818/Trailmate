<template>
  <button
    @click="toggle"
    :class="[
      'relative w-12 h-7 rounded-full transition-colors duration-200 ease-apple focus:outline-none focus-visible:ring-2 focus-visible:ring-apple-blue focus-visible:ring-offset-2',
      modelValue ? 'bg-apple-green' : 'bg-gray-300'
    ]"
    role="switch"
    :aria-checked="modelValue"
  >
    <span
      :class="[
        'absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-apple-sm transition-transform duration-200 ease-apple',
        modelValue ? 'translate-x-5' : 'translate-x-0'
      ]"
    />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>
