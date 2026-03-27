/**
 * db.ts — 数据层
 * Supabase 可用时读写云端（跨设备同步），否则降级到 localStorage。
 */
import { supabase } from './supabase'
import type { Card, Answers, ArchiveEntry, ReadLaterEntry, Source, Lang, ReadMode } from '../types'

const LOCAL_KEY      = 'mk-archive'
const READ_LATER_KEY = 'mk-read-later'
const PENDING_KEY    = 'mk-pending'

// ─── localStorage 工具 ────────────────────────────────────────────────────────
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

// ─── 获取当前用户 ID ──────────────────────────────────────────────────────────
async function getUserId(): Promise<string | null> {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

// ─── 保存 pending 会话（生成完卡片后立即调用）────────────────────────────────
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
    score: 0, total: 0,
    cards,
    status: 'pending',
    sourceText,
    lang,
    readMode,
  }

  // 写本地（立即可用，换设备前的保底）
  setPendingLocal([entry, ...getPendingLocal().filter(e => e.id !== id)])

  const userId = await getUserId()
  if (!supabase || !userId) return

  // 写云端
  await supabase.from('learning_sessions').upsert({
    id,
    user_id: userId,
    title,
    source_type: source.type,
    source_url: source.url ?? null,
    source_text: sourceText,
    language: lang,
    read_mode: readMode,
    status: 'pending',
  })

  const cardRows = cards.map((card, i) => ({
    session_id: id,
    card_index: i,
    card_data: card as unknown as Record<string, unknown>,
  }))
  await supabase.from('session_cards').upsert(cardRows)
}

// ─── 读取 pending 会话（优先云端，降级本地）──────────────────────────────────
export async function loadPendingSessions(): Promise<ArchiveEntry[]> {
  if (!supabase) return getPendingLocal()

  const { data, error } = await supabase
    .from('learning_sessions')
    .select('id, title, source_type, source_url, source_text, language, read_mode, created_at, session_cards(card_index, card_data)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error || !data) return getPendingLocal()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entries: ArchiveEntry[] = (data as any[]).map(row => ({
    id: row.id,
    title: row.title,
    sourceType: row.source_type as 'url' | 'text',
    sourceUrl: row.source_url ?? undefined,
    sourceText: row.source_text ?? undefined,
    date: row.created_at,
    score: 0, total: 0,
    status: 'pending' as const,
    lang: row.language as Lang,
    readMode: row.read_mode as ReadMode,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cards: (row.session_cards ?? []).sort((a: any, b: any) => a.card_index - b.card_index).map((c: any) => c.card_data as Card),
  }))

  // 同步到本地（离线保底）
  setPendingLocal(entries)
  return entries
}

// ─── 删除 pending 会话 ────────────────────────────────────────────────────────
export async function deletePendingSession(id: string): Promise<void> {
  setPendingLocal(getPendingLocal().filter(e => e.id !== id))
  if (!supabase) return
  await supabase.from('learning_sessions').delete().eq('id', id).eq('status', 'pending')
}

// ─── 保存已完成会话（自动调用，无需用户手动点击）────────────────────────────
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

  // 从 pending 移除
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

  const userId = await getUserId()
  if (!supabase || !userId) return

  const { error: sessionErr } = await supabase.from('learning_sessions').upsert({
    id,
    user_id: userId,
    title,
    source_type: source.type,
    source_url: source.url ?? null,
    language: lang,
    status: 'completed',
    bullet_points: bulletPoints ?? null,
    score,
    total_quiz: total,
    completed_at: new Date().toISOString(),
  })
  if (sessionErr) { console.error('[db] session save:', sessionErr); return }

  const cardRows = cards.map((card, i) => ({
    session_id: id,
    card_index: i,
    card_data: card as unknown as Record<string, unknown>,
  }))
  const { error: cardsErr } = await supabase.from('session_cards').upsert(cardRows)
  if (cardsErr) console.error('[db] cards save:', cardsErr)
}

// ─── 读取已完成会话 ───────────────────────────────────────────────────────────
export async function loadSessions(): Promise<ArchiveEntry[]> {
  if (!supabase) return getLocal()

  const { data, error } = await supabase
    .from('learning_sessions')
    .select('id, title, source_type, source_url, language, created_at, score, total_quiz, bullet_points, session_cards(card_index, card_data)')
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cards: (row.session_cards ?? []).sort((a: any, b: any) => a.card_index - b.card_index).map((c: any) => c.card_data as Card),
    bulletPoints: Array.isArray(row.bullet_points) ? row.bullet_points as string[] : undefined,
  }))
}

// ─── 删除已完成会话 ───────────────────────────────────────────────────────────
export async function deleteSession(id: string): Promise<void> {
  setLocal(getLocal().filter(e => e.id !== id))
  if (!supabase) return
  const { error } = await supabase.from('learning_sessions').delete().eq('id', id)
  if (error) console.error('[db] delete session:', error)
}

// ─── 稍后学习（Read Later）────────────────────────────────────────────────────
export async function addReadLater(entry: ReadLaterEntry): Promise<void> {
  setReadLaterLocal([entry, ...getReadLaterLocal().filter(e => e.id !== entry.id)])

  const userId = await getUserId()
  if (!supabase || !userId) return

  await supabase.from('read_later').upsert({
    id: entry.id,
    user_id: userId,
    url: entry.url,
    title: entry.title,
    description: entry.description ?? null,
    added_at: entry.addedAt,
  })
}

export async function loadReadLater(): Promise<ReadLaterEntry[]> {
  if (!supabase) return getReadLaterLocal()

  const { data, error } = await supabase
    .from('read_later')
    .select('id, url, title, description, added_at')
    .order('added_at', { ascending: false })

  if (error || !data) return getReadLaterLocal()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entries: ReadLaterEntry[] = (data as any[]).map(row => ({
    id: row.id,
    url: row.url,
    title: row.title,
    description: row.description ?? undefined,
    addedAt: row.added_at,
  }))

  setReadLaterLocal(entries)
  return entries
}

export async function deleteReadLater(id: string): Promise<void> {
  setReadLaterLocal(getReadLaterLocal().filter(e => e.id !== id))
  if (!supabase) return
  await supabase.from('read_later').delete().eq('id', id)
}
