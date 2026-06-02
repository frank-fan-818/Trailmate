import { Router, Request, Response } from 'express'
import {
  getProfile,
  upsertProfile,
  listProfiles,
  deleteProfile,
} from '../services/companion-profile.service'

const router = Router()

// GET /me - Get current user's own profile
router.get('/me', async (req: Request, res: Response) => {
  try {
    const profile = await getProfile(req.userId!)
    res.json({ data: profile })
  } catch (error) {
    console.error('[companion-profiles] GET /me error:', error)
    res.status(500).json({ error: '获取档案失败' })
  }
})

// POST /me - Create or update current user's own profile
router.post('/me', async (req: Request, res: Response) => {
  try {
    const profile = await upsertProfile(req.userId!, req.body)
    res.json({ data: profile })
  } catch (error) {
    console.error('[companion-profiles] POST /me error:', error)
    res.status(500).json({ error: '保存档案失败' })
  }
})

// GET / - List visible profiles (with optional filters)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { destination, budgetType, personalityType, keyword } = req.query as Record<string, string | undefined>
    const filters: Record<string, string> = {}
    if (destination) filters.destination = destination
    if (budgetType) filters.budgetType = budgetType
    if (personalityType) filters.personalityType = personalityType
    if (keyword) filters.keyword = keyword

    const profiles = await listProfiles(filters, req.userId!)
    res.json({ data: profiles })
  } catch (error) {
    console.error('[companion-profiles] GET / error:', error)
    res.status(500).json({ error: '获取旅伴列表失败' })
  }
})

// GET /:id - Get a specific profile by its id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const profile = await getProfile(req.params.id as string)
    if (!profile) {
      res.status(404).json({ error: '档案不存在' })
      return
    }
    res.json({ data: profile })
  } catch (error) {
    console.error('[companion-profiles] GET /:id error:', error)
    res.status(500).json({ error: '获取档案失败' })
  }
})

export default router
