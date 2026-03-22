// 复用Mock适配器的基础数据类型
export type { Flight, Hotel, Attraction, Weather } from '../../mock-adapter/types'

/**
 * Supabase查询分页参数
 */
export interface SupabasePaginationParams {
  page?: number
  pageSize?: number
}

/**
 * Supabase查询通用响应
 */
export interface SupabaseResponse<T> {
  data: T | null
  error: Error | null
  count?: number
}
