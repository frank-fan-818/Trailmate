import express from 'express'
import { TravelOrchestrator } from '../../shared/multi-agent/orchestrator'

const app = express()
const PORT = parseInt(process.env.PORT || '3456', 10)
const orchestrator = new TravelOrchestrator()

app.use(express.json())

// ---- Health Check ----
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ---- Orchestrate ----
app.post('/api/orchestrate', async (req, res) => {
  const { userInput } = req.body

  if (!userInput || typeof userInput !== 'string') {
    res.status(400).json({
      error: '缺少 userInput 参数',
      example: { userInput: '想去北京玩3天，预算3000' }
    })
    return
  }

  try {
    const result = await orchestrator.orchestrate(userInput)
    res.json(result)
  } catch (error) {
    const err = error as Error
    console.error('[api-server] orchestration failed:', err.message)
    res.status(500).json({
      error: '编排失败',
      message: err.message
    })
  }
})

app.listen(PORT, () => {
  console.log(`[api-server] Trailmate Multi-Agent API running on http://localhost:${PORT}`)
  console.log(`[api-server] Health check: http://localhost:${PORT}/health`)
  console.log(`[api-server] Orchestrate: POST http://localhost:${PORT}/api/orchestrate`)
})

export default app
