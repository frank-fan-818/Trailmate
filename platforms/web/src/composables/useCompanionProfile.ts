import { ref } from 'vue'
import { useApiClient } from './useApiClient'
import type { CompanionProfile, CompanionProfileUpdate } from '@trailmate/companion-matching'

export function useCompanionProfile() {
  const { get, post, put, del } = useApiClient()
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMyProfile(): Promise<CompanionProfile | null> {
    loading.value = true
    error.value = null
    try {
      return await get<CompanionProfile | null>('/api/companion-profiles/me')
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function saveMyProfile(data: CompanionProfileUpdate): Promise<CompanionProfile | null> {
    loading.value = true
    error.value = null
    try {
      return await post<CompanionProfile>('/api/companion-profiles/me', data)
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteMyProfile(): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      await del('/api/companion-profiles/me')
      return true
    } catch (e: any) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchAllProfiles(filters?: Record<string, string>): Promise<CompanionProfile[]> {
    loading.value = true
    error.value = null
    try {
      const params = filters ? '?' + new URLSearchParams(filters).toString() : ''
      return await get<CompanionProfile[]>(`/api/companion-profiles${params}`)
    } catch (e: any) {
      error.value = e.message
      return []
    } finally {
      loading.value = false
    }
  }

  async function fetchProfileById(id: string): Promise<CompanionProfile | null> {
    loading.value = true
    error.value = null
    try {
      return await get<CompanionProfile>(`/api/companion-profiles/${id}`)
    } catch (e: any) {
      error.value = e.message
      return null
    } finally {
      loading.value = false
    }
  }

  return { loading, error, fetchMyProfile, saveMyProfile, deleteMyProfile, fetchAllProfiles, fetchProfileById }
}
