/**
 * db.ts — Unified data layer
 * Uses Supabase when env vars are set, falls back to localStorage silently.
 */
import { supabase } from './supabase'
import type { Card, Answers, ArchiveEntry, ReadLaterEntry, Source, Lang, ReadMode } from '../types'

const LOCAL_KEY = 'mk-archive'
const READ_LATER_KEY = 'mk-read-later'
const PENDING_KEY = 'mk-pending'

function getLocal(): ArchiveEntry[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]') } catch { return [] }
}
function setLocal(entries: ArchiveEntry[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(entries))
}

function getReadLaterLocal(): ReadLaterEntry[] {
  try { return JSON.parse(localStorage.getItem(READ_LATER_KEY) ?? '[]') } catch { return [] }
}
function setReadLaterLocal(entries: ReadLaterEntry[]) {
  localStorage.setItem(READ_LATER_KEY, JSON.stringify(entries))
}

function getPendingLocal(): ArchiveEntry[] {
  try { return JSON.parse(localStorage.getItem(PENDING_KEY) ?? '[]') } catch { return [] }
}
function setPendingLocal(entries: ArchiveEntry[]) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(entries))
}

// ─── Save pending session (immediately after generation) ──────────────────────
export async function savePendingSession(params: {
  id: string
  title: string
  source: Source
  lang: Lang
  readMode: ReadMode
  cards: Card[]
  sourceText: string
}): Promise<void> {
  const { id, title, source, lang, readMode, cards, sourceText } = params

  const entry: ArchiveEntry = {
    id, title,
    sourceType: source.type,
    sourceUrl: source.url,
    date: new Date().toISOString(),
    score: 0,
    total: 0,
    cards,
    status: 'pending',
    sourceText,
    lang,
    readMode,
  }
  setPendingLocal([entry, ...getPendingLocal().filter(e => e.id !== id)])

  if (!supabase) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('learning_sessions').upsert({
    id,
    user_id: user.id,
    title,
    source_type: source.type,
    source_url: source.url ?? null,
    language: lang,
    status: 'pending',
  })

  const cardRows = cards.map((card, i) => ({
    session_id: id,
    card_index: i,
    card_type: card.type,
    card_data: card as unknown as Record<string, unknown>,
  }))
  await supabase.from('session_cards').upsert(cardRows)
}

// ─── Load pending sessions ────────────────────────────────────────────────────
export async function loadPendingSessions(): Promise<ArchiveEntry[]> {
  return getPendingLocal()
}

// ─── Delete pending session ───────────────────────────────────────────────────
export async function deletePendingSession(id: string): Promise<void> {
  setPendingLocal(getPendingLocal().filter(e => e.id !== id))
  if (!supabase) return
  await supabase.from('learning_sessions').delete().eq('id', id).eq('status', 'pending')
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
  bulletPoints?: string[]
}): Promise<void> {
  const { id, title, source, lang, cards, score, total, bulletPoints } = params

  // Remove from pending (session is now completed)
  setPendingLocal(getPendingLocal().filter(e => e.id !== id))

  const entry: ArchiveEntry = {
    id, title,
    sourceType: source.type,
    sourceUrl: source.url,
    date: new Date().toISOString(),
    score, total, cards, bulletPoints,
    status: 'completed',
  }
  setLocal([entry, ...getLocal().filter(e => e.id !== id)])

  if (!supabase) return

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { console.error('[db] no authenticated user'); return }

  const { error: sessionErr } = await supabase.from('learning_sessions').upsert({
    id,
    user_id: user.id,
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

  const cardRows = cards.map((card, i) => ({
    session_id: id,
    card_index: i,
    card_type: card.type,
    card_data: card as unknown as Record<string, unknown>,
  }))
  const { error: cardsErr } = await supabase.from('session_cards').upsert(cardRows)
  if (cardsErr) { console.error('[db] cards save:', cardsErr); return }

  if (bulletPoints) {
    const { error: extrasErr } = await supabase.from('session_extras').upsert({
      session_id: id,
      deeper_explanation: bulletPoints.join('\n'),
    })
    if (extrasErr) console.error('[db] extras save:', extrasErr)
  }
}

// ─── Load archive sessions ────────────────────────────────────────────────────
export async function loadSessions(): Promise<ArchiveEntry[]> {
  if (!supabase) return getLocal()

  const { data, error } = await supabase
    .from('learning_sessions')
    .select(`
      id, title, source_type, source_url, created_at, score, total_quiz,
      session_cards ( card_index, card_data ),
      session_extras ( deeper_explanation )
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
    sourceUrl: row.source_url ?? undefined,
    date: row.created_at,
    score: row.score ?? 0,
    total: row.total_quiz ?? 0,
    status: 'completed' as const,
    cards: (row.session_cards ?? [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => a.card_index - b.card_index)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((c: any) => c.card_data as Card),
    bulletPoints: row.session_extras?.[0]?.deeper_explanation
      ? row.session_extras[0].deeper_explanation.split('\n').filter(Boolean)
      : undefined,
  }))
}

// ─── Delete a session ─────────────────────────────────────────────────────────
export async function deleteSession(id: string): Promise<void> {
  setLocal(getLocal().filter(e => e.id !== id))
  if (!supabase) return
  const { error } = await supabase.from('learning_sessions').delete().eq('id', id)
  if (error) console.error('[db] delete session:', error)
}

// ─── Read Later ───────────────────────────────────────────────────────────────
export async function addReadLater(entry: ReadLaterEntry): Promise<void> {
  setReadLaterLocal([entry, ...getReadLaterLocal().filter(e => e.id !== entry.id)])
}

export async function loadReadLater(): Promise<ReadLaterEntry[]> {
  return getReadLaterLocal()
}

export async function deleteReadLater(id: string): Promise<void> {
  setReadLaterLocal(getReadLaterLocal().filter(e => e.id !== id))
}
