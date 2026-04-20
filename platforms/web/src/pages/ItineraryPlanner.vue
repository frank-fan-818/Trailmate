<template>
  <div class="min-h-screen bg-[var(--color-neutral-50)] text-[var(--color-neutral-700)]">
    <header class="fixed top-0 z-50 w-full border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-[1100px] items-center justify-between px-8 py-5">
        <button
          class="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary hover:text-primary"
          @click="$emit('back')"
        >
          Back
        </button>
        <div class="text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Trailmate</p>
          <h1 class="text-xl font-semibold text-[var(--color-neutral-900)]">Planner + Perception MVP</h1>
        </div>
        <button
          class="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:border-primary hover:text-primary"
          @click="resetWorkspace"
        >
          Reset
        </button>
      </div>
    </header>

    <main class="mx-auto flex max-w-[1100px] flex-col gap-8 px-8 pb-12 pt-28">
      <section class="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div class="space-y-6">
          <article class="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div class="mb-5 flex items-start justify-between gap-4">
              <div>
                <p class="text-sm font-medium text-primary">Trip brief</p>
                <h2 class="mt-1 text-2xl font-semibold text-[var(--color-neutral-900)]">
                  Generate itinerary plans through the project service layer
                </h2>
              </div>
              <span class="rounded-full bg-[var(--color-primary-10)] px-3 py-1 text-xs font-semibold text-primary">
                Core -> Adapter -> Module -> UI
              </span>
            </div>

            <label class="mb-2 block text-sm font-medium text-neutral-700" for="planner-input">
              Travel request
            </label>
            <textarea
              id="planner-input"
              v-model="userInput"
              class="min-h-[160px] w-full rounded-2xl border border-neutral-200 bg-[var(--color-neutral-50)] px-4 py-4 text-sm text-neutral-700 outline-none transition-colors focus:border-primary"
              placeholder="Example: Plan a 4-day Qingdao trip for a family that wants beaches, low walking, and a flexible pace."
            />

            <div class="mt-4 flex flex-wrap gap-3">
              <button
                class="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                :disabled="isLoading || !userInput.trim()"
                @click="handleGenerate"
              >
                {{ isLoading ? 'Generating...' : 'Generate plans' }}
              </button>
              <button
                class="rounded-xl border border-neutral-200 px-5 py-3 text-sm font-semibold text-neutral-700 transition-colors hover:border-primary hover:text-primary"
                @click="applyLatestHistory"
              >
                Reuse latest brief
              </button>
            </div>

            <p v-if="successMessage" class="mt-4 rounded-2xl bg-[var(--color-primary-10)] px-4 py-3 text-sm text-primary">
              {{ successMessage }}
            </p>
            <p v-if="errorMessage" class="mt-4 rounded-2xl bg-[var(--color-error-10)] px-4 py-3 text-sm text-[var(--color-error)]">
              {{ errorMessage }}
            </p>
          </article>

          <article class="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-primary">Recent briefs</p>
                <h2 class="mt-1 text-xl font-semibold text-[var(--color-neutral-900)]">Session history</h2>
              </div>
              <button
                class="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-primary hover:text-primary"
                @click="clearHistory"
              >
                Clear history
              </button>
            </div>

            <div v-if="history.length === 0" class="rounded-2xl bg-[var(--color-neutral-50)] px-4 py-5 text-sm text-neutral-500">
              No planner history yet. Generate a plan and it will appear here.
            </div>

            <div v-else class="space-y-3">
              <button
                v-for="entry in history"
                :key="entry.id"
                class="w-full rounded-2xl border border-neutral-200 px-4 py-4 text-left transition-colors hover:border-primary hover:bg-[var(--color-primary-10)]"
                @click="useHistoryEntry(entry)"
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-sm font-semibold text-[var(--color-neutral-900)]">{{ entry.prompt }}</p>
                    <p class="mt-1 text-xs text-neutral-500">
                      {{ entry.planNames.join(' / ') || 'No plans stored' }}
                    </p>
                  </div>
                  <span class="shrink-0 text-xs text-neutral-500">{{ formatDate(entry.createdAt) }}</span>
                </div>
              </button>
            </div>
          </article>

          <article class="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div class="mb-4">
              <p class="text-sm font-medium text-primary">Generated plans</p>
              <h2 class="mt-1 text-xl font-semibold text-[var(--color-neutral-900)]">Choose a plan to inspect</h2>
            </div>

            <div v-if="plans.length === 0" class="rounded-2xl bg-[var(--color-neutral-50)] px-4 py-5 text-sm text-neutral-500">
              The planner has not generated any itinerary yet.
            </div>

            <div v-else class="grid gap-4 lg:grid-cols-2">
              <button
                v-for="plan in plans"
                :key="plan.id"
                class="rounded-2xl border px-5 py-5 text-left transition-all"
                :class="plan.id === selectedPlanId ? 'border-primary bg-[var(--color-primary-10)]' : 'border-neutral-200 bg-white hover:border-primary'"
                @click="selectPlan(plan.id)"
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <h3 class="text-lg font-semibold text-[var(--color-neutral-900)]">{{ plan.name }}</h3>
                    <p class="mt-2 text-sm text-neutral-600">{{ plan.description }}</p>
                  </div>
                  <span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary">
                    {{ formatCurrency(plan.totalCost) }}
                  </span>
                </div>

                <div class="mt-4 flex flex-wrap gap-2">
                  <span
                    v-for="tag in plan.tags"
                    :key="tag"
                    class="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600"
                  >
                    {{ tag }}
                  </span>
                </div>
              </button>
            </div>
          </article>
        </div>

        <div class="space-y-6">
          <article class="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div class="mb-4">
              <p class="text-sm font-medium text-primary">Location simulator</p>
              <h2 class="mt-1 text-xl font-semibold text-[var(--color-neutral-900)]">Trigger perception alerts</h2>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="text-sm font-medium text-neutral-700">
                City
                <input
                  v-model="locationForm.city"
                  class="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none transition-colors focus:border-primary"
                />
              </label>
              <label class="text-sm font-medium text-neutral-700">
                Travel mode
                <select
                  v-model="locationForm.travelMode"
                  class="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none transition-colors focus:border-primary"
                >
                  <option value="driving">Driving</option>
                  <option value="walking">Walking</option>
                  <option value="public_transport">Public transport</option>
                </select>
              </label>
            </div>

            <label class="mt-4 block text-sm font-medium text-neutral-700">
              Address
              <input
                v-model="locationForm.address"
                class="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none transition-colors focus:border-primary"
              />
            </label>

            <div class="mt-4 grid gap-4 sm:grid-cols-2">
              <label class="text-sm font-medium text-neutral-700">
                Latitude
                <input
                  v-model.number="locationForm.latitude"
                  type="number"
                  step="0.0001"
                  class="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none transition-colors focus:border-primary"
                />
              </label>
              <label class="text-sm font-medium text-neutral-700">
                Longitude
                <input
                  v-model.number="locationForm.longitude"
                  type="number"
                  step="0.0001"
                  class="mt-2 w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none transition-colors focus:border-primary"
                />
              </label>
            </div>

            <button
              class="mt-5 w-full rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!selectedPlanId"
              @click="handleSimulateLocation"
            >
              Simulate location update
            </button>

            <p class="mt-4 text-sm text-neutral-500">{{ locationStatus }}</p>
          </article>

          <article class="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div class="mb-4">
              <p class="text-sm font-medium text-primary">Notifications</p>
              <h2 class="mt-1 text-xl font-semibold text-[var(--color-neutral-900)]">Perception alerts</h2>
            </div>

            <div v-if="notifications.length === 0" class="rounded-2xl bg-[var(--color-neutral-50)] px-4 py-5 text-sm text-neutral-500">
              Generate a plan or simulate a location to populate notifications.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="notification in notifications"
                :key="notification.id"
                class="rounded-2xl border border-neutral-200 px-4 py-4"
              >
                <div class="flex items-start justify-between gap-4">
                  <div>
                    <p class="text-sm font-semibold text-[var(--color-neutral-900)]">{{ notification.content }}</p>
                    <p class="mt-1 text-xs text-neutral-500">
                      {{ notification.level }} · {{ formatDate(notification.triggerTime) }}
                    </p>
                  </div>
                  <button
                    v-if="!notification.isRead"
                    class="rounded-lg border border-neutral-200 px-3 py-2 text-xs font-medium text-neutral-700 transition-colors hover:border-primary hover:text-primary"
                    @click="handleMarkAsRead(notification.id)"
                  >
                    Mark read
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section v-if="selectedPlan" class="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div class="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm font-medium text-primary">Selected plan</p>
            <h2 class="mt-1 text-2xl font-semibold text-[var(--color-neutral-900)]">{{ selectedPlan.name }}</h2>
            <p class="mt-2 max-w-3xl text-sm text-neutral-600">{{ selectedPlan.description }}</p>
          </div>
          <div class="rounded-2xl bg-[var(--color-neutral-50)] px-4 py-3 text-sm text-neutral-600">
            {{ selectedPlan.totalDays }} days · {{ formatCurrency(selectedPlan.totalCost) }}
          </div>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <article
            v-for="day in selectedPlan.days"
            :key="day.day"
            class="rounded-2xl border border-neutral-200 bg-[var(--color-neutral-50)] p-5"
          >
            <h3 class="text-lg font-semibold text-[var(--color-neutral-900)]">Day {{ day.day }}</h3>
            <div class="mt-4 space-y-3">
              <div
                v-for="item in day.items"
                :key="item.id"
                class="rounded-xl border border-white bg-white px-4 py-4"
              >
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <p class="text-sm font-semibold text-[var(--color-neutral-900)]">{{ item.name }}</p>
                    <p class="mt-1 text-xs uppercase tracking-[0.14em] text-neutral-500">{{ item.type }}</p>
                  </div>
                  <span class="text-sm font-medium text-primary">{{ item.startTime }} - {{ item.endTime }}</span>
                </div>
                <p class="mt-2 text-sm text-neutral-600">{{ item.description }}</p>
                <p v-if="item.address" class="mt-2 text-xs text-neutral-500">{{ item.address }}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section class="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div class="mb-4">
          <p class="text-sm font-medium text-primary">Timeline</p>
          <h2 class="mt-1 text-xl font-semibold text-[var(--color-neutral-900)]">Perception-ready itinerary timeline</h2>
        </div>

        <div v-if="timeline.length === 0" class="rounded-2xl bg-[var(--color-neutral-50)] px-4 py-5 text-sm text-neutral-500">
          Timeline data will appear here after a plan is generated.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="node in timeline"
            :key="node.id"
            class="grid gap-3 rounded-2xl border border-neutral-200 px-4 py-4 md:grid-cols-[96px_120px_1fr]"
          >
            <div class="text-sm font-semibold text-primary">Day {{ node.dayIndex + 1 }}</div>
            <div class="text-sm text-neutral-600">{{ node.startTime }} - {{ node.endTime }}</div>
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <p class="text-sm font-semibold text-[var(--color-neutral-900)]">{{ node.title }}</p>
                <span class="rounded-full bg-[var(--color-neutral-50)] px-3 py-1 text-xs font-medium text-neutral-600">
                  {{ node.type }}
                </span>
                <span class="rounded-full bg-[var(--color-primary-10)] px-3 py-1 text-xs font-medium text-primary">
                  {{ node.status }}
                </span>
              </div>
              <p class="mt-2 text-sm text-neutral-600">{{ node.description }}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { Notification, TimelineNode } from '../../../../modules/perception/src/types'
import type { ItineraryPlan } from '../../../../modules/trip-tools/itinerary-generator/src/types'
import { useTrailmateCore } from '../composables/use-trailmate-core'
import { useSettings } from '../stores/settings'

interface PlannerHistoryEntry {
  id: string
  prompt: string
  createdAt: number
  planNames: string[]
}

const HISTORY_STORAGE_KEY = 'trailmate-planner-history'
const DEMO_USER_ID = 'demo-user'

defineEmits<{
  (e: 'back'): void
}>()

const { settings } = useSettings()
const {
  generateItinerary,
  getNotifications,
  getTimeline,
  markNotificationAsRead,
  simulateLocation
} = useTrailmateCore()

const userInput = ref('Plan a 4-day Qingdao family trip focused on beaches, low walking, and a relaxed pace.')
const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const locationStatus = ref('No simulated location yet.')
const plans = ref<ItineraryPlan[]>([])
const selectedPlanId = ref('')
const timeline = ref<TimelineNode[]>([])
const notifications = ref<Notification[]>([])
const history = ref<PlannerHistoryEntry[]>([])

const locationForm = reactive({
  latitude: 36.0671,
  longitude: 120.3826,
  city: 'Qingdao',
  address: 'Qingdao City Center',
  travelMode: 'driving' as 'walking' | 'driving' | 'public_transport'
})

const selectedPlan = computed(() => {
  return plans.value.find((plan) => plan.id === selectedPlanId.value) ?? null
})

onMounted(() => {
  history.value = loadHistory()
})

async function handleGenerate(): Promise<void> {
  if (!userInput.value.trim()) {
    errorMessage.value = 'Enter a travel brief before generating plans.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const generatedPlans = await generateItinerary({
      userId: DEMO_USER_ID,
      content: userInput.value,
      settings: settings.value
    })

    plans.value = generatedPlans
    selectedPlanId.value = generatedPlans[0]?.id ?? ''
    successMessage.value = `Generated ${generatedPlans.length} plans through the itinerary service.`

    await refreshPerceptionData()
    persistHistory({
      id: `history_${Date.now()}`,
      prompt: userInput.value.trim(),
      createdAt: Date.now(),
      planNames: generatedPlans.map((plan) => plan.name)
    })
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to generate itinerary plans.'
  } finally {
    isLoading.value = false
  }
}

async function handleSimulateLocation(): Promise<void> {
  if (!selectedPlanId.value) {
    errorMessage.value = 'Generate a plan before simulating location updates.'
    return
  }

  await simulateLocation({
    userId: DEMO_USER_ID,
    latitude: locationForm.latitude,
    longitude: locationForm.longitude,
    city: locationForm.city,
    address: locationForm.address,
    travelMode: locationForm.travelMode
  })

  locationStatus.value = `${locationForm.city} · ${locationForm.address}`
  await refreshPerceptionData()
}

async function handleMarkAsRead(notificationId: string): Promise<void> {
  await markNotificationAsRead({
    userId: DEMO_USER_ID,
    notificationId
  })
  await refreshPerceptionData()
}

async function selectPlan(planId: string): Promise<void> {
  selectedPlanId.value = planId
  await refreshPerceptionData()
}

async function refreshPerceptionData(): Promise<void> {
  if (!selectedPlanId.value) {
    timeline.value = []
    notifications.value = []
    return
  }

  timeline.value = await getTimeline({
    userId: DEMO_USER_ID,
    planId: selectedPlanId.value
  })
  notifications.value = await getNotifications({
    userId: DEMO_USER_ID,
    planId: selectedPlanId.value
  })
}

function resetWorkspace(): void {
  plans.value = []
  selectedPlanId.value = ''
  timeline.value = []
  notifications.value = []
  successMessage.value = ''
  errorMessage.value = ''
  locationStatus.value = 'No simulated location yet.'
}

function applyLatestHistory(): void {
  if (history.value[0]) {
    userInput.value = history.value[0].prompt
  }
}

function useHistoryEntry(entry: PlannerHistoryEntry): void {
  userInput.value = entry.prompt
}

function clearHistory(): void {
  history.value = []
  localStorage.removeItem(HISTORY_STORAGE_KEY)
}

function persistHistory(entry: PlannerHistoryEntry): void {
  history.value = [entry, ...history.value.filter((item) => item.prompt !== entry.prompt)].slice(0, 10)
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.value))
}

function loadHistory(): PlannerHistoryEntry[] {
  const rawValue = localStorage.getItem(HISTORY_STORAGE_KEY)
  if (!rawValue) {
    return []
  }

  try {
    return JSON.parse(rawValue) as PlannerHistoryEntry[]
  } catch {
    return []
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(value)
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp))
}
</script>
