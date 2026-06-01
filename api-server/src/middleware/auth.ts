import { Request, Response, NextFunction } from 'express'
import { createClient } from '@supabase/supabase-js'

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      userId?: string
      userEmail?: string
    }
  }
}

function getEnvConfig() {
  const url = process.env.VITE_SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Missing SUPABASE env vars: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY')
  }
  return { url, anonKey }
}

let supabaseForAuth: ReturnType<typeof createClient> | null = null

function getAuthClient() {
  if (!supabaseForAuth) {
    const { url, anonKey } = getEnvConfig()
    supabaseForAuth = createClient(url, anonKey)
  }
  return supabaseForAuth
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: '未提供认证令牌' })
    return
  }

  const token = authHeader.slice(7)

  try {
    const supabase = getAuthClient()
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      res.status(401).json({ error: '认证令牌无效或已过期' })
      return
    }

    req.userId = user.id
    req.userEmail = user.email
    next()
  } catch (err) {
    console.error('[auth middleware] token verification failed:', err)
    res.status(500).json({ error: '认证服务异常' })
  }
}
