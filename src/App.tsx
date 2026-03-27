import { useState, useCallback, useEffect } from 'react'
import { useLanguage } from './hooks/useLanguage'
import { generateCards, generateAISummary, findRelated } from './utils/generateCards'
import type { ViewId, Card, Answers, Source, ReadMode, ArchiveEntry } from './types'
import { supabase } from './lib/supabase'
import { savePendingSession } from './lib/db'

import Header from './components/ui/Header'
import HomeView from './components/views/HomeView'
import LoadingView from './components/views/LoadingView'
import LearningView from './components/views/LearningView'
import AISummaryView from './components/views/AISummaryView'
import SummaryView from './components/views/SummaryView'
import ArchiveView from './components/views/ArchiveView'
import AuthView from './components/views/AuthView'

function genId() {
  return crypto.randomUUID()
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

  const [sessionId, setSessionId] = useState(genId)
  const [sourceText, setSourceText] = useState('')
  const [source, setSource] = useState<Source>({ type: 'text', title: '' })
  const [readMode, setReadMode] = useState<ReadMode>('deep')
  const [cards, setCards] = useState<Card[]>([])
  const [answers, setAnswers] = useState<Answers>({})

  const [aiSummaryBullets, setAiSummaryBullets] = useState<string[]>([])
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiRelatedLinks, setAiRelatedLinks] = useState<{title: string; url: string; description: string}[]>([])
  const [aiRelatedLoading, setAiRelatedLoading] = useState(false)

  async function handleSubmit(text: string, src: Source) {
    const newId = genId()
    setSessionId(newId)
    setSourceText(text)
    setSource(src)
    setReadMode(src.readMode ?? 'deep')
    setCards([])
    setAnswers({})
    setAiSummaryBullets([])
    setView('loading')
    try {
      const generated = await generateCards(text, lang, src.readMode ?? 'deep')
      const withComplete: Card[] = [...generated, { type: 'complete' }]
      setCards(withComplete)

      // Auto-save as pending so user can study later even if they exit
      savePendingSession({
        id: newId,
        title: src.title,
        source: src,
        lang,
        readMode: src.readMode ?? 'deep',
        cards: withComplete,
        sourceText: text,
      }).catch(console.error)

      setView('learning')
      setAiSummaryLoading(true)
      setAiRelatedLoading(true)
      generateAISummary(text, lang)
        .then(bullets => setAiSummaryBullets(bullets))
        .catch(() => setAiSummaryBullets([]))
        .finally(() => setAiSummaryLoading(false))
      findRelated(text, lang)
        .then(links => setAiRelatedLinks(links))
        .catch(() => setAiRelatedLinks([]))
        .finally(() => setAiRelatedLoading(false))
    } catch (e) {
      console.error(e)
      setView('home')
    }
  }

  // Start a previously queued (pending) session from Archive
  function handleStartPending(entry: ArchiveEntry) {
    setSessionId(entry.id)
    setSourceText(entry.sourceText ?? '')
    setSource({ type: entry.sourceType, title: entry.title, url: entry.sourceUrl, readMode: entry.readMode })
    setReadMode(entry.readMode ?? 'deep')
    setCards(entry.cards ?? [])
    setAnswers({})
    setAiSummaryBullets(entry.bulletPoints ?? [])
    setAiRelatedLinks([])
    setView('learning')
    // Kick off AI summary in background if not already available
    if (!entry.bulletPoints?.length && entry.sourceText) {
      setAiSummaryLoading(true)
      generateAISummary(entry.sourceText, entry.lang ?? lang)
        .then(bullets => setAiSummaryBullets(bullets))
        .catch(() => {})
        .finally(() => setAiSummaryLoading(false))
    }
  }

  const handleAnswer = useCallback((idx: number, sel: string, correct: boolean) => {
    setAnswers(prev => ({ ...prev, [idx]: { sel, correct } }))
  }, [])

  function handleLearningComplete() {
    setView('ai-summary')
  }

  function handleRestart() {
    setView('home')
    setCards([])
    setAnswers({})
    setAiSummaryBullets([])
    setAiRelatedLinks([])
  }

  function handleReplay(replayCards: Card[]) {
    setCards([...replayCards, { type: 'complete' }])
    setAnswers({})
    setView('learning')
  }

  async function handleLearnFromUrl(url: string, title: string) {
    const newId = genId()
    setSessionId(newId)
    setView('loading')
    setCards([])
    setAnswers({})
    setAiSummaryBullets([])
    setAiRelatedLinks([])
    try {
      const res = await fetch('/api/fetch-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      const text = data.text as string
      const fetchedTitle = (data.title as string) || title
      const src: Source = { type: 'url', url, title: fetchedTitle, readMode }
      setSourceText(text)
      setSource(src)
      const generated = await generateCards(text, lang, readMode)
      const withComplete: Card[] = [...generated, { type: 'complete' }]
      setCards(withComplete)

      savePendingSession({
        id: newId,
        title: fetchedTitle,
        source: src,
        lang,
        readMode,
        cards: withComplete,
        sourceText: text,
      }).catch(console.error)

      setView('learning')
      setAiSummaryLoading(true)
      setAiRelatedLoading(true)
      generateAISummary(text, lang)
        .then(bullets => setAiSummaryBullets(bullets))
        .catch(() => setAiSummaryBullets([]))
        .finally(() => setAiSummaryLoading(false))
      findRelated(text, lang)
        .then(links => setAiRelatedLinks(links))
        .catch(() => setAiRelatedLinks([]))
        .finally(() => setAiRelatedLoading(false))
    } catch (e) {
      console.error(e)
      setView('home')
    }
  }

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut()
    setAuthed(false)
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
        onArchive={() => setView('archive')}
        onLogout={supabase ? handleLogout : undefined}
        t={t}
      />
      <main className="pt-14">
        {view === 'home' && (
          <HomeView onSubmit={handleSubmit} t={t} />
        )}
        {view === 'loading' && <LoadingView t={t} />}
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
            onContinue={() => setView('summary')}
            t={t}
          />
        )}
        {view === 'summary' && (
          <SummaryView
            cards={cards}
            answers={answers}
            sessionId={sessionId}
            title={source.title}
            source={source}
            lang={lang}
            bulletPoints={aiSummaryBullets}
            onRestart={handleRestart}
            onReviewCards={() => setView('learning')}
            t={t}
          />
        )}
        {view === 'archive' && (
          <ArchiveView
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
