import { useState, useCallback } from 'react'
import { useLanguage } from './hooks/useLanguage'
import { generateCards, generateDeeper, generateExamples } from './utils/generateCards'
import type { ViewId, Card, Answers, Source } from './types'

import Header from './components/ui/Header'
import HomeView from './components/views/HomeView'
import LoadingView from './components/views/LoadingView'
import LearningView from './components/views/LearningView'
import DeeperView from './components/views/DeeperView'
import ExamplesView from './components/views/ExamplesView'
import SummaryView from './components/views/SummaryView'
import ArchiveView from './components/views/ArchiveView'

function genId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function App() {
  const { lang, setLang, t } = useLanguage()
  const [view, setView] = useState<ViewId>('home')

  // Session state
  const [sessionId] = useState(genId)
  const [sourceText, setSourceText] = useState('')
  const [source, setSource] = useState<Source>({ type: 'text', title: '' })
  const [cards, setCards] = useState<Card[]>([])
  const [answers, setAnswers] = useState<Answers>({})

  // Post-learning content
  const [deeper, setDeeper] = useState('')
  const [deeperLoading, setDeeperLoading] = useState(false)
  const [examples, setExamples] = useState<string[]>([])
  const [examplesLoading, setExamplesLoading] = useState(false)
  async function handleSubmit(text: string, src: Source) {
    setSourceText(text)
    setSource(src)
    setCards([])
    setAnswers({})
    setDeeper('')
    setExamples([])
    setView('loading')
    try {
      const generated = await generateCards(text, lang)
      const withComplete: Card[] = [...generated, { type: 'complete' }]
      setCards(withComplete)
      setView('learning')
    } catch (e) {
      console.error(e)
      setView('home')
    }
  }

  const handleAnswer = useCallback((idx: number, sel: string, correct: boolean) => {
    setAnswers(prev => ({ ...prev, [idx]: { sel, correct } }))
  }, [])

  async function handleLearningComplete() {
    setView('deeper')
    setDeeperLoading(true)
    try {
      const content = await generateDeeper(sourceText, lang)
      setDeeper(content)
    } catch { setDeeper('') }
    setDeeperLoading(false)
  }

  async function handleDeeperContinue() {
    setView('examples')
    setExamplesLoading(true)
    try {
      const exs = await generateExamples(sourceText, lang)
      setExamples(exs)
    } catch { setExamples([]) }
    setExamplesLoading(false)
  }

  function handleRestart() {
    setView('home')
    setCards([])
    setAnswers({})
    setDeeper('')
    setExamples([])
  }

  function handleReplay(replayCards: Card[]) {
    setCards([...replayCards, { type: 'complete' }])
    setAnswers({})
    setView('learning')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        lang={lang}
        setLang={setLang}
        onArchive={() => setView('archive')}
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
        {view === 'deeper' && (
          <DeeperView
            content={deeper}
            loading={deeperLoading}
            onContinue={handleDeeperContinue}
            t={t}
          />
        )}
        {view === 'examples' && (
          <ExamplesView
            examples={examples}
            loading={examplesLoading}
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
            deeperExplanation={deeper}
            realWorldExamples={examples}
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

