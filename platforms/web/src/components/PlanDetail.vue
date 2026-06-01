<template>
  <div class="plan-detail">
    <!-- Day Tabs -->
    <div class="flex gap-2 mb-6 overflow-x-auto pb-2">
      <button
        v-for="day in sortedDays"
        :key="day.day"
        @click="activeDay = day.day"
        :class="[
          'px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all',
          activeDay === day.day ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        ]"
      >
        Day {{ day.day }}
      </button>
    </div>

    <!-- Timeline -->
    <div v-if="currentDay" class="space-y-3">
      <!-- Drag instructions -->
      <p v-if="editable && currentDay.items.length > 1" class="text-xs text-gray-400 mb-2 flex items-center gap-1">
        <GripVertical :size="12" /> 拖拽卡片调整顺序
      </p>

      <div
        v-for="(item, idx) in currentDay.items"
        :key="item._key || idx"
        :draggable="editable"
        @dragstart="onDragStart(idx)"
        @dragover.prevent="onDragOver(idx)"
        @dragend="onDragEnd"
        @drop.prevent="onDrop(idx)"
        :class="[
          'relative flex gap-4 p-4 rounded-xl border transition-all',
          editingIdx === idx ? 'border-primary bg-primary/5 shadow-md' : dragIdx === idx ? 'opacity-50 border-dashed border-primary' : 'border-gray-200 bg-white hover:shadow-sm',
          editable ? 'cursor-grab active:cursor-grabbing' : ''
        ]"
      >
        <!-- Drag handle -->
        <div v-if="editable" class="flex-shrink-0 flex items-center text-gray-300 hover:text-gray-500">
          <GripVertical :size="18" />
        </div>

        <!-- Type icon + timeline dot -->
        <div class="hidden sm:flex flex-col items-center">
          <div class="w-10 h-10 rounded-full flex items-center justify-center text-lg" :class="typeStyle(item.type).bg">
            {{ typeStyle(item.type).icon }}
          </div>
          <div v-if="idx < currentDay.items.length - 1" class="w-px h-full bg-gray-200 my-1"></div>
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <!-- View mode -->
          <template v-if="editingIdx !== idx">
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="text-xs font-medium px-2 py-0.5 rounded-full" :class="typeStyle(item.type).badge">{{ typeStyle(item.type).label }}</span>
                <h4 class="text-base font-semibold text-gray-900 mt-1">{{ item.name }}</h4>
              </div>
              <div v-if="editable" class="flex gap-1 flex-shrink-0">
                <button @click="startEdit(idx)" class="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100" title="编辑">
                  <Pencil :size="14" />
                </button>
                <button @click="removeItem(idx)" class="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50" title="删除">
                  <Trash2 :size="14" />
                </button>
              </div>
            </div>
            <div class="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              <span v-if="item.startTime" class="flex items-center gap-1">
                <Clock :size="13" /> {{ item.startTime }}{{ item.endTime ? ` - ${item.endTime}` : '' }}
              </span>
              <span v-if="item.cost" class="flex items-center gap-1">
                <DollarSign :size="13" /> ¥{{ item.cost }}
              </span>
              <span v-if="item.address" class="flex items-center gap-1 truncate">
                <MapPin :size="13" /> {{ item.address }}
              </span>
            </div>
          </template>

          <!-- Edit mode -->
          <template v-else>
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs text-gray-500">名称</label>
                  <input v-model="editForm.name" class="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label class="text-xs text-gray-500">类型</label>
                  <select v-model="editForm.type" class="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-primary">
                    <option value="attraction">景点</option>
                    <option value="meal">美食</option>
                    <option value="hotel">住宿</option>
                    <option value="transport">交通</option>
                    <option value="flight">航班</option>
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs text-gray-500">开始时间</label>
                  <input v-model="editForm.startTime" placeholder="09:00" class="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label class="text-xs text-gray-500">结束时间</label>
                  <input v-model="editForm.endTime" placeholder="12:00" class="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="text-xs text-gray-500">费用 (¥)</label>
                  <input v-model.number="editForm.cost" type="number" class="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label class="text-xs text-gray-500">地址</label>
                  <input v-model="editForm.address" class="w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div class="flex gap-2">
                <button @click="saveEdit(idx)" class="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90">保存</button>
                <button @click="cancelEdit" class="px-4 py-1.5 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">取消</button>
              </div>
            </div>
          </template>
        </div>
      </div>

      <!-- Add new item -->
      <button
        v-if="editable && editingIdx === null"
        @click="addItem"
        class="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
      >
        <Plus :size="16" /> 添加行程项目
      </button>
    </div>

    <!-- Delete confirm modal -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showDeleteConfirm = false">
        <div class="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4">
          <h3 class="text-lg font-bold text-gray-900 mb-2">确认删除</h3>
          <p class="text-gray-500 text-sm mb-4">确定要删除「{{ deleteTarget?.name }}」吗？此操作不可撤销。</p>
          <div class="flex gap-3 justify-end">
            <button @click="showDeleteConfirm = false" class="px-4 py-2 text-sm bg-gray-100 rounded-lg hover:bg-gray-200">取消</button>
            <button @click="confirmDelete" class="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600">删除</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { Clock, MapPin, DollarSign, GripVertical, Pencil, Trash2, Plus } from 'lucide-vue-next'
import { loadSavedPlans } from '../composables/useItineraryPlanner'

interface PlanItem {
  type: string
  name: string
  startTime?: string
  endTime?: string
  cost?: number
  address?: string
  _key?: string
}

interface PlanDay {
  day: number
  items: PlanItem[]
}

interface Plan {
  name: string
  description: string
  totalDays: number
  totalCost: number
  tags: string[]
  days: PlanDay[]
}

const props = defineProps<{
  plan: Plan
  editable?: boolean
}>()

const emit = defineEmits<{
  (e: 'update', plan: Plan): void
}>()

// Day management
const activeDay = ref(1)
const sortedDays = computed(() =>
  [...props.plan.days].sort((a, b) => a.day - b.day)
)
const currentDay = computed(() =>
  sortedDays.value.find(d => d.day === activeDay.value)
)

// Drag state
const dragIdx = ref<number | null>(null)

// Edit state
const editingIdx = ref<number | null>(null)
const editForm = reactive({ name: '', type: 'attraction', startTime: '', endTime: '', cost: 0, address: '' })

// Delete state
const showDeleteConfirm = ref(false)
const deleteTarget = ref<{ day: number; idx: number; name: string } | null>(null)

// Save to localStorage helper
function savePlan() {
  const allPlans = loadSavedPlans()
  const idx = allPlans.findIndex((p: Plan) => p.name === props.plan.name)
  if (idx >= 0) {
    allPlans[idx] = { ...props.plan, savedAt: Date.now() }
  } else {
    allPlans.unshift({ ...props.plan, savedAt: Date.now() })
  }
  localStorage.setItem('trailmate-saved-plans', JSON.stringify(allPlans))
  emit('update', { ...props.plan })
}

// Type styling
function typeStyle(type: string) {
  const map: Record<string, { icon: string; label: string; bg: string; badge: string }> = {
    attraction: { icon: '🏛️', label: '景点', bg: 'bg-blue-100', badge: 'bg-blue-50 text-blue-600' },
    meal: { icon: '🍜', label: '美食', bg: 'bg-orange-100', badge: 'bg-orange-50 text-orange-600' },
    hotel: { icon: '🏨', label: '住宿', bg: 'bg-purple-100', badge: 'bg-purple-50 text-purple-600' },
    transport: { icon: '🚗', label: '交通', bg: 'bg-green-100', badge: 'bg-green-50 text-green-600' },
    flight: { icon: '✈️', label: '航班', bg: 'bg-sky-100', badge: 'bg-sky-50 text-sky-600' },
  }
  return map[type] || { icon: '📍', label: '其他', bg: 'bg-gray-100', badge: 'bg-gray-50 text-gray-600' }
}

// Edit operations
function startEdit(idx: number) {
  const item = currentDay.value!.items[idx]
  editForm.name = item.name
  editForm.type = item.type || 'attraction'
  editForm.startTime = item.startTime || ''
  editForm.endTime = item.endTime || ''
  editForm.cost = item.cost || 0
  editForm.address = item.address || ''
  editingIdx.value = idx
}

function saveEdit(idx: number) {
  const item = currentDay.value!.items[idx]
  item.name = editForm.name
  item.type = editForm.type
  item.startTime = editForm.startTime || undefined
  item.endTime = editForm.endTime || undefined
  item.cost = editForm.cost || undefined
  item.address = editForm.address || undefined
  editingIdx.value = null
  savePlan()
}

function cancelEdit() {
  editingIdx.value = null
}

// Delete operations
function removeItem(idx: number) {
  const day = currentDay.value!
  deleteTarget.value = { day: activeDay.value, idx, name: day.items[idx].name }
  showDeleteConfirm.value = true
}

function confirmDelete() {
  if (!deleteTarget.value) return
  const { day: dayNum, idx } = deleteTarget.value
  const day = props.plan.days.find(d => d.day === dayNum)
  if (day) {
    day.items.splice(idx, 1)
    savePlan()
  }
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

// Add operation
function addItem() {
  const day = currentDay.value!
  day.items.push({
    type: 'attraction',
    name: '新项目',
    startTime: '09:00',
    endTime: '10:00',
    cost: 0,
    address: '',
    _key: `item-${Date.now()}`
  })
  editingIdx.value = day.items.length - 1
  const item = day.items[day.items.length - 1]
  editForm.name = item.name
  editForm.type = item.type
  editForm.startTime = item.startTime || ''
  editForm.endTime = item.endTime || ''
  editForm.cost = item.cost || 0
  editForm.address = item.address || ''
  savePlan()
}

// Drag & Drop
function onDragStart(idx: number) { dragIdx.value = idx }
function onDragOver(_idx: number) {}
function onDragEnd() { dragIdx.value = null }
function onDrop(toIdx: number) {
  if (dragIdx.value === null || dragIdx.value === toIdx) return
  const items = currentDay.value!.items
  const [moved] = items.splice(dragIdx.value, 1)
  items.splice(toIdx, 0, moved)
  dragIdx.value = null
  savePlan()
}
</script>
