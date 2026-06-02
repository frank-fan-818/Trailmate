import { Request, Response, NextFunction } from 'express'
import { getSupabaseClient } from '../lib/supabase-client'

export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.userId) {
    res.status(401).json({ error: '请先登录' })
    return
  }

  try {
    const supabase = getSupabaseClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', req.userId)
      .single()

    if (error || !data?.is_admin) {
      res.status(403).json({ error: '需要管理员权限' })
      return
    }

    next()
  } catch (err) {
    console.error('[admin middleware] check failed:', err)
    res.status(500).json({ error: '权限校验失败' })
  }
}
