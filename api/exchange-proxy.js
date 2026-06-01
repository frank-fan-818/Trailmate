// Vercel Serverless Function — 新浪汇率 API 代理
// Rewrite rule maps /api/exchange-proxy/fx_susdcny → /api/exchange-proxy?s=fx_susdcny
// Forwards to: https://hq.sinajs.cn/list=fx_susdcny

module.exports = async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const symbols = url.searchParams.get('s') || ''

  if (!symbols) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(400).json({ error: 'Missing symbols' })
  }

  const sinaUrl = `https://hq.sinajs.cn/list=${symbols}`

  try {
    const response = await fetch(sinaUrl, {
      headers: {
        'User-Agent': 'Trailmate/1.0',
        'Referer': 'https://finance.sina.com.cn',
      }
    })
    const body = await response.text()
    res.setHeader('Content-Type', response.headers.get('content-type') || 'text/plain; charset=gb2312')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.status(response.status).send(body)
  } catch (e) {
    res.status(502).json({ error: 'Exchange API proxy error', message: e.message })
  }
}
