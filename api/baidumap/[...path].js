// Vercel Serverless Function — Baidu API reverse proxy
// Catches all /api/baidumap/* requests and forwards to api.map.baidu.com

export default async function handler(req, res) {
  const { path, query } = req.query
  const pathStr = Array.isArray(path) ? path.join('/') : path || ''

  // Build Baidu API URL
  const baiduUrl = new URL(`https://api.map.baidu.com/${pathStr}`)
  // Copy query params
  Object.entries(req.query).forEach(([k, v]) => {
    if (k !== 'path') baiduUrl.searchParams.set(k, v)
  })

  try {
    const response = await fetch(baiduUrl.toString(), {
      headers: {
        'User-Agent': 'Trailmate/1.0'
      }
    })
    const data = await response.text()

    // Baidu API may return XML errors, pass through directly
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('xml')) {
      res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    } else {
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
    }

    res.status(response.status).send(data)
  } catch (e) {
    res.status(502).json({ error: 'Baidu API proxy error', message: e.message })
  }
}
