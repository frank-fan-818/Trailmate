import { ref } from 'vue'
import { useApiClient } from './useApiClient'
import type { RealNameVerification } from '@trailmate/companion-matching'

export function useAdmin() {
  const { get, post } = useApiClient()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchVerifications(status?: string): Promise<RealNameVerification[]> {
    loading.value = true
    error.value = null
    try {
      const params = status ? `?status=${status}` : ''
      return await get<RealNameVerification[]>(`/api/real-name-verifications${params}`)
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  async function reviewVerification(
    id: string,
    action: 'approved' | 'rejected',
    remark?: string
  ): Promise<RealNameVerification | null> {
    loading.value = true
    error.value = null
    try {
      return await post<RealNameVerification>(`/api/real-name-verifications/${id}/review`, {
        status: action,
        remark,
      })
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, fetchVerifications, reviewVerification }
}
