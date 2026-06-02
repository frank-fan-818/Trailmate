import { Router, Request, Response } from 'express'
import {
  submitVerification,
  getMyVerification,
  listVerifications,
  reviewVerification,
} from '../services/real-name-verification.service'
import { adminMiddleware } from '../middleware/admin'

const router = Router()

// POST / - Submit a new real-name verification (own)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { realName, idNumber, idCardFrontUrl, idCardBackUrl } = req.body

    if (!realName || !idNumber) {
      res.status(400).json({ error: '缺少必填参数: realName, idNumber' })
      return
    }

    const result = await submitVerification(req.userId!, {
      realName,
      idNumber,
      idCardFrontUrl,
      idCardBackUrl,
    })

    res.json({ data: result })
  } catch (error) {
    console.error('[real-name-verifications] POST / error:', error)
    res.status(500).json({ error: '提交认证失败' })
  }
})

// GET /me - Get current user's own verification record
router.get('/me', async (req: Request, res: Response) => {
  try {
    const result = await getMyVerification(req.userId!)
    res.json({ data: result })
  } catch (error) {
    console.error('[real-name-verifications] GET /me error:', error)
    res.status(500).json({ error: '获取认证信息失败' })
  }
})

// GET / - Admin: list all verifications (optionally filtered by status)
router.get('/', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined
    const result = await listVerifications(status)
    res.json({ data: result })
  } catch (error) {
    console.error('[real-name-verifications] GET / error:', error)
    res.status(500).json({ error: '获取认证列表失败' })
  }
})

// POST /:id/review - Admin: review a verification
router.post('/:id/review', adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { status, remark } = req.body

    if (!status || !['approved', 'rejected'].includes(status)) {
      res.status(400).json({ error: '无效的审核状态，必须为 approved 或 rejected' })
      return
    }

    const result = await reviewVerification(req.params.id as string, req.userId!, status, remark)
    res.json({ data: result })
  } catch (error) {
    console.error('[real-name-verifications] POST /:id/review error:', error)
    res.status(500).json({ error: '审核失败' })
  }
})

export default router
