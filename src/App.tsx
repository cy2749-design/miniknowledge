import { useState, useCallback, useEffect, useRef } from 'react'
import { useLanguage } from './hooks/useLanguage'
import { generateCards, generateAISummary, findRelated } from './utils/generateCards'
import type { ViewId, Card, Answers, Source, ArchiveEntry } from './types'
import { supabase } from './lib/supabase'
import { createGeneratingSession, savePendingSession, updateSessionStatus, saveSession } from './lib/db'

import Header from './components/ui/Header'
import HomeView from './components/views/HomeView'
import LoadingView from './components/views/LoadingView'
import LearningView from './components/views/LearningView'
import AISummaryView from './components/views/AISummaryView'
import ArchiveView from './components/views/ArchiveView'
import AuthView from './components/views/AuthView'

function genId() {
  return crypto.randomUUID()
}

function startAiBackground(
  text: string,
  entryLang: string,
  setAiSummaryBullets: (b: string[]) => void,
  setAiSummaryLoading: (v: boolean) => void,
  setAiRelatedLinks: (l: {title: string; url: string; description: string}[]) => void,
  setAiRelatedLoading: (v: boolean) => void,
  hasBullets: boolean,
) {
  if (!hasBullets) {
    setAiSummaryLoading(true)
    generateAISummary(text, entryLang)
      .then(bullets => setAiSummaryBullets(bullets))
      .catch(() => {})
      .finally(() => setAiSummaryLoading(false))
  }
  setAiRelatedLoading(true)
  findRelated(text, entryLang)
    .then(links => setAiRelatedLinks(links))
    .catch(() => {})
    .finally(() => setAiRelatedLoading(false))
}

export default function App() {
  const { lang, setLang, t } = useLanguage()
  const [view, setView] = useState<ViewId>('home')
  const [authed, setAuthed] = useState<boolean | null>(null)

  useEffect(() => {
    if (!supabase) { setAuthed(true); return }
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const [sessionId, setSessionId] = useState<string>(genId)
  const [sourceText, setSourceText] = useState('')
  const [source, setSource] = useState<Source>({ type: 'text', title: '' })
  const [cards, setCards] = useState<Card[]>([])
  const [answers, setAnswers] = useState<Answers>({})

  const [aiSummaryBullets, setAiSummaryBullets] = useState<string[]>([])
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiRelatedLinks, setAiRelatedLinks] = useState<{title: string; url: string; description: string}[]>([])
  const [aiRelatedLoading, setAiRelatedLoading] = useState(false)

  const [generatingCount, setGeneratingCount] = useState(0)
  const [archiveRefreshKey, setArchiveRefreshKey] = useState(0)

  const userIsWaiting = useRef(false)

  function goBackground() {
    userIsWaiting.current = false
    setView('home')
  }

  async function handleSubmit(text: string, src: Source) {
    const newId = genId()
    const mode = src.readMode ?? 'deep'

    userIsWaiting.current = true
    setGeneratingCount(c => c + 1)
    setView('loading')
    setCards([])
    setAnswers({})
    setAiSummaryBullets([])
    setAiRelatedLinks([])

    try {
      await createGeneratingSession({ id: newId, title: src.title, source: src, lang, readMode: mode, sourceText: text })
      setArchiveRefreshKey(k => k + 1)
      const generated = await generateCards(text, lang, mode)
      await savePendingSession({ id: newId, title: src.title, source: src, lang, readMode: mode, cards: generated, sourceText: text })
      setArchiveRefreshKey(k => k + 1)

      if (userIsWaiting.current) {
        setSessionId(newId)
        setSourceText(text)
        setSource(src)
        setCards(generated)
        setView('learning')
        startAiBackground(text, lang, setAiSummaryBullets, setAiSummaryLoading, setAiRelatedLinks, setAiRelatedLoading, false)
      }
    } catch (e) {
      console.error(e)
      await updateSessionStatus(newId, 'failed').catch(console.error)
      setArchiveRefreshKey(k => k + 1)
      if (userIsWaiting.current) setView('home')
    } finally {
      setGeneratingCount(c => c - 1)
      userIsWaiting.current = false
    }
  }

  function handleStartPending(entry: ArchiveEntry) {
    const entryCards = (entry.cards ?? []).filter(c => c.type !== 'complete')
    setSessionId(entry.id)
    setSourceText(entry.sourceText ?? '')
    setSource({ type: entry.sourceType, title: entry.title, url: entry.sourceUrl, readMode: entry.readMode })
    setCards(entryCards)
    setAnswers({})
    setAiSummaryBullets(entry.bulletPoints ?? [])
    setAiRelatedLinks([])
    setView('learning')
    if (entry.sourceText) {
      startAiBackground(entry.sourceText, entry.lang ?? lang, setAiSummaryBullets, setAiSummaryLoading, setAiRelatedLinks, setAiRelatedLoading, !!entry.bulletPoints?.length)
    }
  }

  function handleReplay(entry: ArchiveEntry) {
    const entryCards = (entry.cards ?? []).filter(c => c.type !== 'complete')
    setSessionId(entry.id)
    setSourceText(entry.sourceText ?? '')
    setSource({ type: entry.sourceType, title: entry.title, url: entry.sourceUrl })
    setCards(entryCards)
    setAnswers({})
    setAiSummaryBullets(entry.bulletPoints ?? [])
    setAiRelatedLinks([])
    setView('learning')
    if (entry.sourceText) {
      startAiBackground(entry.sourceText, entry.lang ?? lang, setAiSummaryBullets, setAiSummaryLoading, setAiRelatedLinks, setAiRelatedLoading, !!entry.bulletPoints?.length)
    }
  }

  const handleAnswer = useCallback((idx: number, sel: string, correct: boolean) => {
    setAnswers(prev => ({ ...prev, [idx]: { sel, correct } }))
  }, [])

  function handleLearningComplete() {
    setView('ai-summary')
    saveSession({ id: sessionId, title: source.title, source, sourceText, lang, bulletPoints: aiSummaryBullets })
      .catch(console.error)
  }

  function handleRestart() {
    setView('home')
    setCards([])
    setAnswers({})
    setAiSummaryBullets([])
    setAiRelatedLinks([])
  }

  async function handleLearnFromUrl(url: string, title: string) {
    const newId = genId()
    const src: Source = { type: 'url', url, title, readMode: 'deep' }
    setGeneratingCount(c => c + 1)
    try {
      await createGeneratingSession({ id: newId, title, source: src, lang, readMode: 'deep', sourceText: '' })
      setArchiveRefreshKey(k => k + 1)
      const res = await fetch('/api/fetch-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      const text = data.text as string
      const fetchedTitle = (data.title as string) || title
      const finalSrc: Source = { type: 'url', url, title: fetchedTitle, readMode: 'deep' }
      const generated = await generateCards(text, lang, 'deep')
      await savePendingSession({ id: newId, title: fetchedTitle, source: finalSrc, lang, readMode: 'deep', cards: generated, sourceText: text })
      setArchiveRefreshKey(k => k + 1)
    } catch (e) {
      console.error(e)
      await updateSessionStatus(newId, 'failed').catch(console.error)
      setArchiveRefreshKey(k => k + 1)
    } finally {
      setGeneratingCount(c => c - 1)
    }
  }

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut()
    setAuthed(false)
  }

  function handleArchiveClick() {
    if (view === 'loading') userIsWaiting.current = false
    setView('archive')
  }

  if (authed === null) {
    return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center"><div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" /></div>
  }

  if (!authed) {
    return <AuthView onAuth={() => setAuthed(true)} t={t} />
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header
        lang={lang}
        setLang={setLang}
        onArchive={handleArchiveClick}
        onLogout={supabase ? handleLogout : undefined}
        generatingCount={generatingCount}
        t={t}
      />
      <main className="pt-14">
        {view === 'home' && <HomeView onSubmit={handleSubmit} t={t} />}
        {view === 'loading' && <LoadingView onBackground={goBackground} t={t} />}
        {view === 'learning' && cards.length > 0 && (
          <LearningView
            cards={cards}
            answers={answers}
            sourceText={sourceText}
            lang={lang}
            onAnswer={handleAnswer}
            onComplete={handleLearningComplete}
            t={t}
          />
        )}
        {view === 'ai-summary' && (
          <AISummaryView
            bullets={aiSummaryBullets}
            loading={aiSummaryLoading}
            relatedLinks={aiRelatedLinks}
            relatedLoading={aiRelatedLoading}
            sourceText={sourceText}
            lang={lang}
            onRestart={handleRestart}
            onReviewCards={() => setView('learning')}
            t={t}
          />
        )}
        {view === 'archive' && (
          <ArchiveView
            refreshKey={archiveRefreshKey}
            onBack={() => setView('home')}
            onReplay={handleReplay}
            onStartPending={handleStartPending}
            onLearnFromUrl={handleLearnFromUrl}
            t={t}
          />
        )}
      </main>
    </div>
  )
}
