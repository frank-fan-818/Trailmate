// Vercel Serverless Function — Baidu API proxy
// Handles ALL /api/baidumap/* requests by forwarding to api.map.baidu.com
export default async function handler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`)
  const baiduPath = url.pathname.replace(/^\/api\/baidumap\/?/, '')
  const targetUrl = `https://api.map.baidu.com/${baiduPath}?${url.searchParams.toString()}`

  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Trailmate/1.0' }
    })
    const body = await response.text()
    const ct = response.headers.get('content-type') || 'application/json; charset=utf-8'
    res.setHeader('Content-Type', ct)
    res.status(response.status).send(body)
  } catch (e) {
    res.status(502).json({ error: 'Baidu API proxy error', message: e.message })
  }
}
