import type { VercelRequest, VercelResponse } from '@vercel/node'

// Strip HTML tags and collapse whitespace
function htmlToText(html: string): string {
  return html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function extractTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  return m ? m[1].trim() : 'Untitled'
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { url } = req.body ?? {}
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url is required' })

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MiniKnowledge/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const html = await response.text()
    const title = extractTitle(html)
    const text = htmlToText(html).slice(0, 12000)  // limit to ~12k chars

    return res.json({ title, text })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[fetch-article]', msg)
    return res.status(500).json({ error: msg })
  }
}
