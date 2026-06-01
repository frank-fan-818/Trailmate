// Vercel Serverless Function — 汇率 API 代理
// Forwards: /api/exchange-proxy/latest?from=CNY → api.frankfurter.app/latest?from=CNY
// Frankfurter 从国内浏览器直连可能被墙，通过 Vercel US 服务器中转

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const params = url.searchParams

  if (!params.has('from')) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(400).json({ error: 'Missing from parameter' })
  }

  const target = new URL('https://api.frankfurter.app/latest')
  for (const [k, v] of params) target.searchParams.set(k, v)

  try {
    const response = await fetch(target.toString(), {
      headers: { 'User-Agent': 'Trailmate/1.0', 'Accept': 'application/json' }
    })
    const body = await response.text()
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(response.status).send(body)
  } catch (e) {
    res.status(502).json({ error: 'Exchange API proxy error', message: e.message })
  }
}
