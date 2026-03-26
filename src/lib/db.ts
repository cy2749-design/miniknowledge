/**
 * db.ts — Unified data layer
 * Uses Supabase when env vars are set, falls back to localStorage silently.
 */
import { supabase } from './supabase'
import type { Card, Answers, ArchiveEntry, Source, Lang } from '../types'

const LOCAL_KEY = 'mk-archive'

function getLocal(): ArchiveEntry[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') } catch { return [] }
}
function setLocal(entries: ArchiveEntry[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(entries))
}

// ─── Save completed session ───────────────────────────────────────────────────
export async function saveSession(params: {
  id: string
  title: string
  source: Source
  lang: Lang
  cards: Card[]
  answers: Answers
  score: number
  total: number
  deeperExplanation?: string
  realWorldExamples?: string[]
}): Promise<void> {
  const { id, title, source, lang, cards, score, total, deeperExplanation, realWorldExamples } = params

  // Always persist to localStorage as backup
  const entry: ArchiveEntry = {
    id, title,
    sourceType: source.type,
    date: new Date().toISOString(),
    score, total, cards, deeperExplanation, realWorldExamples,
  }
  setLocal([entry, ...getLocal().filter(e => e.id !== id)])

  if (!supabase) return

  // ── learning_sessions ──
  const { error: sessionErr } = await supabase.from('learning_sessions').upsert({
    id,
    title,
    source_type: source.type,
    source_url: source.url ?? null,
    language: lang,
    status: 'completed',
    score,
    total_quiz: total,
    completed_at: new Date().toISOString(),
  })
  if (sessionErr) { console.error('[db] session save:', sessionErr); return }

  // ── session_cards ──
  const cardRows = cards.map((card, i) => ({
    session_id: id,
    card_index: i,
    card_type: card.type,
    card_data: card as unknown as Record<string, unknown>,
  }))
  const { error: cardsErr } = await supabase.from('session_cards').upsert(cardRows)
  if (cardsErr) console.error('[db] cards save:', cardsErr)

  // ── session_extras ──
  if (deeperExplanation || realWorldExamples?.length) {
    const { error: extrasErr } = await supabase.from('session_extras').upsert({
      session_id: id,
      deeper_explanation: deeperExplanation ?? null,
      real_world_examples: realWorldExamples ?? null,
    })
    if (extrasErr) console.error('[db] extras save:', extrasErr)
  }
}

// ─── Load all completed sessions ─────────────────────────────────────────────
export async function loadSessions(): Promise<ArchiveEntry[]> {
  if (!supabase) return getLocal()

  const { data, error } = await supabase
    .from('learning_sessions')
    .select(`
      id, title, source_type, created_at, score, total_quiz,
      session_cards ( card_index, card_data ),
      session_extras ( deeper_explanation, real_world_examples )
    `)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  if (error || !data) {
    console.error('[db] load sessions:', error)
    return getLocal()
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(row => ({
    id: row.id,
    title: row.title,
    sourceType: row.source_type as 'url' | 'text',
    date: row.created_at,
    score: row.score ?? 0,
    total: row.total_quiz ?? 0,
    cards: (row.session_cards ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.card_index - b.card_index)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => c.card_data as Card),
    deeperExplanation: row.session_extras?.[0]?.deeper_explanation ?? undefined,
    realWorldExamples: row.session_extras?.[0]?.real_world_examples ?? undefined,
  }))
}

// ─── Delete a session ─────────────────────────────────────────────────────────
export async function deleteSession(id: string): Promise<void> {
  setLocal(getLocal().filter(e => e.id !== id))
  if (!supabase) return
  const { error } = await supabase.from('learning_sessions').delete().eq('id', id)
  if (error) console.error('[db] delete session:', error)
}
