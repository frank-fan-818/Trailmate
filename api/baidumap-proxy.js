// Vercel Serverless Function — Baidu API HTTP proxy
// Receives: /api/baidumap-proxy?path=place/v2/search&query=故宫&ak=xxx
// Forwards to: https://api.map.baidu.com/place/v2/search?query=故宫&ak=xxx

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const baiduPath = url.searchParams.get('path') || ''
  url.searchParams.delete('path')

  const targetUrl = `https://api.map.baidu.com/${baiduPath}?${url.searchParams.toString()}`

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
    res.status(502).json({ error: 'Baidu API proxy error', message: e.message })
  }
}
