<template>
  <div id="app">
    <RouterView v-slot="{ Component }">
      <component :is="Component" @open-team-request="handleOpenTeamRequest" />
    </RouterView>

    <!-- 发起组队模态框 -->
    <div v-if="showTeamModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="showTeamModal = false">
      <div class="bg-white w-full max-w-md mx-4 rounded-lg">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 class="font-bold text-gray-900">发起组队</h3>
          <button @click="showTeamModal = false" class="text-gray-500 hover:text-gray-700"><X :size="20" /></button>
        </div>
        <div class="p-4 space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">目的地</label>
            <input v-model="teamForm.destination" type="text" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">出发日期</label>
            <input v-model="teamForm.date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">组队说明</label>
            <textarea v-model="teamForm.message" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded text-sm" placeholder="介绍一下自己，说明组队原因..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">经费分摊方式</label>
            <select v-model="teamForm.splitType" class="w-full px-3 py-2 border border-gray-300 rounded text-sm">
              <option value="aa">AA制</option>
              <option value="host">邀请方请客</option>
              <option value="custom">自定义</option>
            </select>
          </div>
        </div>
        <div class="p-4 border-t border-gray-200 flex gap-3">
          <button @click="showTeamModal = false" class="flex-1 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50">
            取消
          </button>
          <button @click="submitTeamRequest" class="flex-1 py-2 bg-primary text-white text-sm font-medium rounded hover:bg-primary/90">
            发送请求
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { X } from 'lucide-vue-next'
import { RouterView } from 'vue-router'

const showTeamModal = ref(false)
const teamForm = ref({
  destination: '',
  date: '',
  message: '',
  splitType: 'aa'
})

const mockCompanions: Record<string, any> = {
  '1': { destination: '云南大理', departureDate: '2026-05-01' },
  '2': { destination: '西藏拉萨', departureDate: '2026-05-03' },
  '3': { destination: '四川成都', departureDate: '2026-05-02' },
  '4': { destination: '日本东京', departureDate: '2026-05-20' },
  '5': { destination: '泰国清迈', departureDate: '2026-05-10' },
  '6': { destination: '厦门鼓浪屿', departureDate: '2026-05-04' }
}

const handleOpenTeamRequest = (id: string) => {
  const companion = mockCompanions[id]
  if (companion) {
    teamForm.value.destination = companion.destination
    teamForm.value.date = companion.departureDate
    teamForm.value.message = `你好，我想和你一起去${companion.destination}...`
  }
  showTeamModal.value = true
}

const submitTeamRequest = () => {
  alert('组队请求已发送！对方确认后你会收到通知。')
  showTeamModal.value = false
}
</script>

<style scoped>
#app {
  min-height: 100vh;
}
</style>
