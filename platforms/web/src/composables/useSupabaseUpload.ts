import { ref } from 'vue'
import { getSupabaseClientSafe } from '@trailmate/adapters/supabase-adapter/src/client'

/**
 * Supabase Storage 文件上传 composable
 * 使用已创建的 storage bucket：avatars（公开）、id-cards（私有）
 */
export function useSupabaseUpload() {
  const uploading = ref(false)
  const uploadError = ref<string | null>(null)

  /**
   * 上传文件到 Supabase Storage
   * @param file 要上传的文件
   * @param bucket 存储桶名称 ('avatars' | 'id-cards')
   * @param folder 文件路径前缀（通常用 userId）
   * @returns 上传后的公开 URL
   */
  async function uploadFile(
    file: File,
    bucket: string,
    folder: string
  ): Promise<string | null> {
    const supabase = getSupabaseClientSafe()
    if (!supabase) {
      uploadError.value = 'Supabase 客户端未初始化'
      return null
    }

    uploading.value = true
    uploadError.value = null

    try {
      const ext = file.name.split('.').pop() || 'png'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
      const filePath = `${folder}/${fileName}`

      const { error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (error) {
        uploadError.value = error.message
        return null
      }

      // 获取公开 URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      return urlData.publicUrl
    } catch (e: any) {
      uploadError.value = e.message || '上传失败'
      return null
    } finally {
      uploading.value = false
    }
  }

  return { uploading, uploadError, uploadFile }
}
