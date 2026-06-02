import { ref } from 'vue'
import { useApiClient } from './useApiClient'
import type { RealNameVerification } from '@trailmate/companion-matching'

export function useRealNameVerification() {
  const { get, post } = useApiClient()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function submitVerification(data: {
    realName: string
    idNumber: string
    idCardFrontUrl?: string
    idCardBackUrl?: string
  }): Promise<RealNameVerification | null> {
    loading.value = true
    error.value = null
    try {
      return await post<RealNameVerification>('/api/real-name-verifications', data)
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function getMyVerification(): Promise<RealNameVerification | null> {
    loading.value = true
    error.value = null
    try {
      return await get<RealNameVerification | null>('/api/real-name-verifications/me')
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, submitVerification, getMyVerification }
}
