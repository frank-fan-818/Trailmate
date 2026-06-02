<template>
  <div
    :class="[
      'inline-flex items-center gap-1 font-medium rounded-full',
      size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
      badgeStyles,
    ]"
  >
    <component :is="iconComponent" :size="size === 'sm' ? 12 : 14" />
    <span>{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, Clock, X, Shield } from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  status: 'approved' | 'pending' | 'rejected' | 'none'
  size?: 'sm' | 'md'
}>(), {
  size: 'md',
})

const badgeStyles = computed(() => {
  switch (props.status) {
    case 'approved':
      return 'bg-green-50 text-green-700 border border-green-200'
    case 'pending':
      return 'bg-amber-50 text-amber-700 border border-amber-200'
    case 'rejected':
      return 'bg-red-50 text-red-700 border border-red-200'
    case 'none':
      return 'bg-gray-50 text-gray-500 border border-gray-200'
  }
})

const iconComponent = computed(() => {
  switch (props.status) {
    case 'approved':
      return Check
    case 'pending':
      return Clock
    case 'rejected':
      return X
    case 'none':
      return Shield
  }
})

const label = computed(() => {
  switch (props.status) {
    case 'approved':
      return '已认证'
    case 'pending':
      return '审核中'
    case 'rejected':
      return '未通过'
    case 'none':
      return '未认证'
  }
})
</script>
