// Vercel Serverless Function — 汇率 API 代理
// Usage: GET /api/exchange-proxy?from=CNY&to=USD
// Forwards to: https://api.frankfurter.app/latest?from=CNY&to=USD

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  if (!from) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(400).json({ error: 'Missing from parameter' })
  }

  let targetUrl = `https://api.frankfurter.app/latest?from=${from}`
  if (to) targetUrl += `&to=${to}`

  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Trailmate/1.0', 'Accept': 'application/json' }
    })
    const body = await response.text()
    const ct = response.headers.get('content-type') || 'application/json; charset=utf-8'
    res.setHeader('Content-Type', ct)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(response.status).send(body)
  } catch (e) {
    res.status(502).json({ error: 'Exchange API proxy error', message: e.message })
  }
}
