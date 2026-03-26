import { useState, useCallback, useEffect } from 'react'
import { useLanguage } from './hooks/useLanguage'
import { generateCards, generateAISummary, findRelated } from './utils/generateCards'
import type { ViewId, Card, Answers, Source } from './types'
import { supabase } from './lib/supabase'

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

  const [sessionId] = useState(genId)
  const [sourceText, setSourceText] = useState('')
  const [source, setSource] = useState<Source>({ type: 'text', title: '' })
  const [cards, setCards] = useState<Card[]>([])
  const [answers, setAnswers] = useState<Answers>({})

  const [aiSummaryBullets, setAiSummaryBullets] = useState<string[]>([])
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false)
  const [aiRelatedLinks, setAiRelatedLinks] = useState<{title: string; url: string; description: string}[]>([])
  const [aiRelatedLoading, setAiRelatedLoading] = useState(false)

  async function handleSubmit(text: string, src: Source) {
    setSourceText(text)
    setSource(src)
    setCards([])
    setAnswers({})
    setAiSummaryBullets([])
    setView('loading')
    try {
      const generated = await generateCards(text, lang)
      const withComplete: Card[] = [...generated, { type: 'complete' }]
      setCards(withComplete)
      setView('learning')
      // Start AI summary + related articles in background while user answers cards
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
            t={t}
          />
        )}
      </main>
    </div>
  )
}
