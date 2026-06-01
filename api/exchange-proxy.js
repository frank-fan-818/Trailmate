// Vercel Serverless Function — 汇率 API 代理
// Usage: GET /api/exchange-proxy?from=CNY&to=USD

module.exports = async function handler(req, res) {
  console.log('[exchange-proxy] ====== REQUEST RECEIVED ======')
  console.log('[exchange-proxy] method:', req.method)
  console.log('[exchange-proxy] url:', req.url)
  console.log('[exchange-proxy] headers:', JSON.stringify(req.headers))

  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    const rawUrl = req.url || ''
    console.log('[exchange-proxy] rawUrl:', rawUrl)

    const url = new URL(rawUrl, 'http://localhost')
    const from = url.searchParams.get('from')
    console.log('[exchange-proxy] from:', from)

    if (!from) {
      console.log('[exchange-proxy] ERROR: missing from param')
      return res.status(400).json({ error: 'Missing from parameter', url: rawUrl })
    }

    const frankfurterUrl = `https://api.frankfurter.app/latest?from=${from}`
    console.log('[exchange-proxy] calling Frankfurter:', frankfurterUrl)

    const response = await fetch(frankfurterUrl, {
      headers: { 'User-Agent': 'Trailmate/1.0' }
    })
    console.log('[exchange-proxy] Frankfurter status:', response.status)

    const body = await response.text()
    console.log('[exchange-proxy] Frankfurter body preview:', body.slice(0, 200))

    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.status(response.status).send(body)
    console.log('[exchange-proxy] ====== SUCCESS ======')
  } catch (e) {
    console.error('[exchange-proxy] CATCH ERROR:', e.message, e.stack)
    res.status(502).json({ error: 'Proxy error', message: e.message })
  }
}
