import type { VercelRequest, VercelResponse } from '@vercel/node'

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

async function fetchDirect(url: string): Promise<{ title: string; text: string }> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
    },
    signal: AbortSignal.timeout(10000),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const html = await response.text()
  const title = extractTitle(html)
  const text = htmlToText(html).slice(0, 12000)
  if (text.length < 200) throw new Error('Content too short — likely blocked')
  return { title, text }
}

async function fetchViaJina(url: string): Promise<{ title: string; text: string }> {
  const jinaUrl = `https://r.jina.ai/${url}`
  const response = await fetch(jinaUrl, {
    headers: {
      'Accept': 'text/plain',
      'X-Return-Format': 'text',
    },
    signal: AbortSignal.timeout(20000),
  })
  if (!response.ok) throw new Error(`Jina HTTP ${response.status}`)
  const raw = await response.text()
  // Jina returns markdown-like text; extract title from first line if present
  const lines = raw.split('\n').filter(Boolean)
  const titleLine = lines.find(l => l.startsWith('Title:'))
  const title = titleLine ? titleLine.replace(/^Title:\s*/i, '').trim() : 'Untitled'
  // Remove Jina metadata header lines
  const bodyStart = raw.indexOf('\n\n')
  const text = (bodyStart !== -1 ? raw.slice(bodyStart) : raw).trim().slice(0, 12000)
  return { title, text }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { url } = req.body ?? {}
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'url is required' })

  try {
    // Try direct fetch first
    const result = await fetchDirect(url)
    return res.json(result)
  } catch (e1) {
    console.warn('[fetch-article] direct fetch failed:', e1 instanceof Error ? e1.message : e1)
    try {
      // Fallback to Jina reader
      const result = await fetchViaJina(url)
      return res.json(result)
    } catch (e2: unknown) {
      const msg = e2 instanceof Error ? e2.message : String(e2)
      console.error('[fetch-article] jina fallback failed:', msg)
      return res.status(500).json({ error: `Failed to fetch article: ${msg}` })
    }
  }
}
