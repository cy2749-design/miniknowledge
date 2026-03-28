/**
 * db.ts — 数据层（仅 Supabase）
 */
import { supabase } from './supabase'
import type { Card, Answers, ArchiveEntry, ReadLaterEntry, Source, Lang, ReadMode } from '../types'

async function getUser() {
  if (!supabase) throw new Error('Supabase not configured')
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user
}

async function ensureProfile(userId: string, email: string | undefined) {
  const { error } = await supabase!.from('profiles').upsert(
    { id: userId, email: email ?? null },
    { onConflict: 'id' }
  )
  if (error) throw new Error(`Profile upsert failed: ${error.message}`)
}

// ─── 立即占位（提交时调用）───────────────────────────────────────────────────
export async function createGeneratingSession(params: {
  id: string
  title: string
  source: Source
  lang: Lang
  readMode: ReadMode
  sourceText: string
}): Promise<void> {
  const { id, title, source, lang, readMode, sourceText } = params
  const user = await getUser()
  await ensureProfile(user.id, user.email)

  const { error } = await supabase!.from('learning_sessions').insert({
    id,
    user_id: user.id,
    title,
    source_type: source.type,
    source_url: source.url ?? null,
    source_text: sourceText,
    language: lang,
    read_mode: readMode,
    status: 'generating',
  })
  if (error) throw new Error(`Create session failed: ${error.message}`)
}

// ─── 更新状态（生成失败时调用）──────────────────────────────────────────────
export async function updateSessionStatus(id: string, status: 'pending' | 'failed'): Promise<void> {
  await getUser() // 确认已登录
  const { error } = await supabase!.from('learning_sessions').update({ status }).eq('id', id)
  if (error) throw new Error(`Update status failed: ${error.message}`)
}

// ─── 生成完成，写入卡片并更新为 pending ──────────────────────────────────────
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
  const user = await getUser()

  const { error: sessionErr } = await supabase!.from('learning_sessions').upsert({
    id,
    user_id: user.id,
    title,
    source_type: source.type,
    source_url: source.url ?? null,
    source_text: sourceText,
    language: lang,
    read_mode: readMode,
    status: 'pending',
  })
  if (sessionErr) throw new Error(`Session save failed: ${sessionErr.message}`)

  const cardRows = cards.map((card, i) => ({
    session_id: id,
    card_index: i,
    card_data: card as unknown as Record<string, unknown>,
  }))
  const { error: cardsErr } = await supabase!.from('session_cards').upsert(cardRows)
  if (cardsErr) throw new Error(`Cards save failed: ${cardsErr.message}`)
}

// ─── 读取非完成会话（generating / pending / failed）──────────────────────────
export async function loadPendingSessions(): Promise<ArchiveEntry[]> {
  const user = await getUser()

  const { data, error } = await supabase!
    .from('learning_sessions')
    .select('id, title, source_type, source_url, source_text, language, read_mode, created_at, status, session_cards(card_index, card_data)')
    .in('status', ['generating', 'pending', 'failed'])
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Load pending failed: ${error.message}`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(row => ({
    id: row.id,
    title: row.title,
    sourceType: row.source_type as 'url' | 'text',
    sourceUrl: row.source_url ?? undefined,
    sourceText: row.source_text ?? undefined,
    date: row.created_at,
    score: 0, total: 0,
    status: row.status as 'generating' | 'pending' | 'failed',
    lang: row.language as Lang,
    readMode: row.read_mode as ReadMode,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cards: (row.session_cards ?? []).sort((a: any, b: any) => a.card_index - b.card_index).map((c: any) => c.card_data as Card),
  }))
}

// ─── 删除 pending/generating/failed 会话 ─────────────────────────────────────
export async function deletePendingSession(id: string): Promise<void> {
  const user = await getUser()
  const { error } = await supabase!.from('learning_sessions').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(`Delete pending failed: ${error.message}`)
}

// ─── 保存已完成会话 ───────────────────────────────────────────────────────────
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
  const user = await getUser()

  const { error: sessionErr } = await supabase!.from('learning_sessions').upsert({
    id,
    user_id: user.id,
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
  if (sessionErr) throw new Error(`Session save failed: ${sessionErr.message}`)

  const cardRows = cards.map((card, i) => ({
    session_id: id,
    card_index: i,
    card_data: card as unknown as Record<string, unknown>,
  }))
  const { error: cardsErr } = await supabase!.from('session_cards').upsert(cardRows)
  if (cardsErr) throw new Error(`Cards save failed: ${cardsErr.message}`)
}

// ─── 读取已完成会话 ───────────────────────────────────────────────────────────
export async function loadSessions(): Promise<ArchiveEntry[]> {
  const user = await getUser()

  const { data, error } = await supabase!
    .from('learning_sessions')
    .select('id, title, source_type, source_url, language, created_at, score, total_quiz, bullet_points, session_cards(card_index, card_data)')
    .eq('status', 'completed')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Load sessions failed: ${error.message}`)

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
  const user = await getUser()
  const { error } = await supabase!.from('learning_sessions').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(`Delete session failed: ${error.message}`)
}

// ─── 稍后学习 ─────────────────────────────────────────────────────────────────
export async function addReadLater(entry: ReadLaterEntry): Promise<void> {
  const user = await getUser()
  await ensureProfile(user.id, user.email)

  const { error } = await supabase!.from('read_later').upsert({
    id: entry.id,
    user_id: user.id,
    url: entry.url,
    title: entry.title,
    description: entry.description ?? null,
    added_at: entry.addedAt,
  })
  if (error) throw new Error(`Add read later failed: ${error.message}`)
}

export async function loadReadLater(): Promise<ReadLaterEntry[]> {
  const user = await getUser()

  const { data, error } = await supabase!
    .from('read_later')
    .select('id, url, title, description, added_at')
    .eq('user_id', user.id)
    .order('added_at', { ascending: false })

  if (error) throw new Error(`Load read later failed: ${error.message}`)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data as any[]).map(row => ({
    id: row.id,
    url: row.url,
    title: row.title,
    description: row.description ?? undefined,
    addedAt: row.added_at,
  }))
}

export async function deleteReadLater(id: string): Promise<void> {
  const user = await getUser()
  const { error } = await supabase!.from('read_later').delete().eq('id', id).eq('user_id', user.id)
  if (error) throw new Error(`Delete read later failed: ${error.message}`)
}
