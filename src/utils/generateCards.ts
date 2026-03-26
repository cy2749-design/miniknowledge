import type { Card } from '../types'

export async function generateCards(
  text: string,
  lang: string
): Promise<Card[]> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'cards', text, lang }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error ?? 'Failed to generate cards')
  }
  const data = await res.json()
  return data.cards as Card[]
}

export async function generateDeeper(
  text: string,
  lang: string
): Promise<string> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'deeper', text, lang }),
  })
  if (!res.ok) throw new Error('Failed to generate deeper explanation')
  const data = await res.json()
  return data.content as string
}

export async function generateExamples(
  text: string,
  lang: string
): Promise<string[]> {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'examples', text, lang }),
  })
  if (!res.ok) throw new Error('Failed to generate examples')
  const data = await res.json()
  return data.examples as string[]
}
