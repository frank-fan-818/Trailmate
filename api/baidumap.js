// Vercel Serverless Function — proxy /api/baidumap/* → api.map.baidu.com
// All Baidu API calls go through this to avoid browser CORS/tracker blocking

export default async function handler(req, res) {
  // Extract the path after /api/baidumap/
  const baiduPath = req.url.replace(/^\/api\/baidumap\/?/, '')
  const targetUrl = `https://api.map.baidu.com/${baiduPath}`

  try {
    const response = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Trailmate/1.0' }
    })
    const body = await response.text()
    const ct = response.headers.get('content-type') || 'application/json; charset=utf-8'
    res.setHeader('Content-Type', ct.includes('xml') ? 'application/json; charset=utf-8' : ct)
    res.status(response.status).send(body)
  } catch (e) {
    res.status(502).json({ error: 'Proxy error', message: e.message })
  }
}
