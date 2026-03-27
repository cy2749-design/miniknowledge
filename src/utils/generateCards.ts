import type { Card, ReadMode } from '../types'

export async function generateCards(
  text: string,
  lang: string,
  readMode: ReadMode = 'deep'
): Promise<Card[]> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'cards', text, lang, readMode }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Failed to generate cards')
  }
  const data = await res.json()
  return data.cards as Card[]
}

export async function generateAISummary(
  text: string,
  lang: string
): Promise<string[]> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'ai-summary', text, lang }),
  })
  if (!res.ok) throw new Error('Failed to generate AI summary')
  const data = await res.json()
  return data.bullets as string[]
}

export async function findRelated(
  text: string,
  lang: string
): Promise<{ title: string; url: string; description: string }[]> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'find-related', text, lang }),
  })
  if (!res.ok) throw new Error('Failed to find related articles')
  const data = await res.json()
  return data.links
}

export async function chatWithAI(
  messages: { role: 'user' | 'assistant'; content: string }[],
  context: string,
  lang: string
): Promise<string> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'chat', messages, context, lang }),
  })
  if (!res.ok) throw new Error('Chat failed')
  const data = await res.json()
  return data.reply as string
}
