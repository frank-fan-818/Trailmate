<template>
  <div
    class="bg-white border border-gray-200 hover:border-gray-300 hover:shadow transition-all cursor-pointer"
    @click="$emit('viewProfile', companion.id)"
  >
    <div class="p-4 flex gap-4">
      <div class="w-16 h-16 bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 flex-shrink-0">
        {{ companion.name.charAt(0) }}
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <div class="flex items-center gap-2">
            <h3 class="font-bold text-gray-900">{{ companion.name }}</h3>
            <span class="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">{{ creditLabel }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="matchScore !== undefined" class="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
              {{ matchScore }}%匹配
            </span>
            <span class="text-sm text-gray-500">⭐ {{ companion.creditScore }}</span>
          </div>
        </div>

        <div class="flex items-center gap-3 text-sm text-gray-600 mb-2">
          <span class="flex items-center gap-1">
            <MapPin :size="14" class="inline" /> {{ companion.destination }}
          </span>
          <span>{{ companion.departureInfo }}</span>
          <span>{{ companion.travelDays }}天行程</span>
        </div>

        <div class="flex flex-wrap gap-1 mb-3">
          <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{{ companion.budget }}</span>
          <span class="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">{{ companion.personality }}</span>
          <span class="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded">D{{ companion.overlapDays }}重叠</span>
          <span v-if="companion.sameday" class="px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded">同日出发</span>
        </div>

        <p class="text-sm text-gray-500 line-clamp-2">{{ companion.bio }}</p>
      </div>
    </div>

    <div class="border-t border-gray-100 px-4 py-3 flex gap-2">
      <button
        @click.stop="$emit('toggleInterest', companion.id)"
        :class="[
          'flex-1 py-2 text-sm font-medium rounded border transition-colors',
          companion.interested
            ? 'bg-orange-50 border-orange-200 text-orange-600'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        ]"
      >
        <Heart :size="14" class="inline mr-1" :fill="companion.interested ? 'currentColor' : 'none'" />
        {{ companion.interested ? '已感兴趣' : '感兴趣' }}
      </button>
      <button
        @click.stop="$emit('teamRequest', companion.id)"
        class="flex-1 py-2 text-sm font-medium rounded bg-primary text-white hover:bg-primary/90 transition-colors"
      >
        发起组队
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MapPin, Heart } from 'lucide-vue-next'
import type { CompanionProfile } from '@trailmate/companion-matching'

const props = defineProps<{
  companion: CompanionProfile
  matchScore?: number
}>()

defineEmits<{
  viewProfile: [id: string]
  toggleInterest: [id: string]
  teamRequest: [id: string]
}>()

const creditLabel = computed(() => {
  switch (props.companion.creditLevel) {
    case '钻石': return '钻石'
    case '黄金': return '黄金'
    case '白银': return '白银'
    default: return '白银'
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
