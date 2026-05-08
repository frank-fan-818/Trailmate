import { ref, computed } from 'vue'
import type { WorkflowStepDisplay } from '../components/WorkflowProgress.vue'

export interface WorkflowStepConfig {
  name: string
  label: string
  description?: string
  controlType?: 'code' | 'llm' | 'tool_calling'
}

export function useWorkflowProgress(stepConfigs: WorkflowStepConfig[]) {
  const steps = ref<WorkflowStepDisplay[]>(
    stepConfigs.map(config => ({
      name: config.name,
      label: config.label,
      description: config.description,
      controlType: config.controlType,
      status: 'pending' as const
    }))
  )

  const isRunning = ref(false)
  const isCompleted = ref(false)
  const isFailed = ref(false)

  const currentStepIndex = computed(() =>
    steps.value.findIndex(s => s.status === 'running')
  )

  const completedCount = computed(() =>
    steps.value.filter(s => s.status === 'completed').length
  )

  const progressPercent = computed(() =>
    stepConfigs.length > 0
      ? Math.round((completedCount.value / stepConfigs.length) * 100)
      : 0
  )

  function startStep(stepName: string) {
    const step = steps.value.find(s => s.name === stepName)
    if (step) {
      step.status = 'running'
      step.durationMs = undefined
      step.error = undefined
    }
    isRunning.value = true
  }

  function completeStep(stepName: string, durationMs?: number) {
    const step = steps.value.find(s => s.name === stepName)
    if (step) {
      step.status = 'completed'
      step.durationMs = durationMs
    }
  }

  function failStep(stepName: string, error: string) {
    const step = steps.value.find(s => s.name === stepName)
    if (step) {
      step.status = 'failed'
      step.error = error
    }
    isRunning.value = false
    isFailed.value = true
  }

  function completeAll() {
    steps.value.forEach(s => {
      if (s.status !== 'failed') s.status = 'completed'
    })
    isRunning.value = false
    isCompleted.value = true
  }

  function reset() {
    steps.value.forEach(s => {
      s.status = 'pending'
      s.durationMs = undefined
      s.error = undefined
    })
    isRunning.value = false
    isCompleted.value = false
    isFailed.value = false
  }

  function getStep(stepName: string): WorkflowStepDisplay | undefined {
    return steps.value.find(s => s.name === stepName)
  }

  return {
    steps,
    isRunning,
    isCompleted,
    isFailed,
    currentStepIndex,
    completedCount,
    progressPercent,
    startStep,
    completeStep,
    failStep,
    completeAll,
    reset,
    getStep
  }
}
