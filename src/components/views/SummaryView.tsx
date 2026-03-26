import { Trophy, RotateCcw, BookMarked, Check } from 'lucide-react'
import { useState } from 'react'
import type { Card, Answers, Source, Lang } from '../../types'
import { saveSession } from '../../lib/db'

interface Props {
  cards: Card[]
  answers: Answers
  sessionId: string
  title: string
  source: Source
  lang: Lang
  deeperExplanation?: string
  realWorldExamples?: string[]
  onRestart: () => void
  onReviewCards: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

export default function SummaryView({ cards, answers, sessionId, title, source, lang, deeperExplanation, realWorldExamples, onRestart, onReviewCards, t }: Props) {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const quizCards = cards.filter(c => c.type === 'quiz' || c.type === 'review' || c.type === 'trueFalse' || c.type === 'output')
  const correctCount = quizCards.filter(c => {
    const cardIdx = cards.indexOf(c)
    return answers[cardIdx]?.correct
  }).length
  const total = quizCards.length
  const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0

  async function saveToArchive() {
    setSaving(true)
    await saveSession({
      id: sessionId, title, source, lang, cards, answers,
      score: correctCount, total, deeperExplanation, realWorldExamples,
    })
    setSaved(true)
    setSaving(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center shadow-lg">
            <Trophy className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">{t('summary.title')}</h1>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-4">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-400 mb-1">{t('summary.score')}</p>
            <p className="text-5xl font-extrabold text-gray-900">{correctCount}<span className="text-2xl text-gray-400 font-normal"> / {total}</span></p>
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
            </div>
            <p className="text-sm text-gray-500 mt-2">{t('summary.mastery')} {pct}%</p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={saveToArchive}
            disabled={saved || saving}
            className="w-full py-3 border-2 border-blue-500 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saved ? <><Check size={16} />{t('summary.saved')}</> : saving ? <><BookMarked size={16} className="animate-pulse" />{t('summary.saving') || '...'}</> : <><BookMarked size={16} />{t('summary.save')}</>}
          </button>
          <button onClick={onReviewCards} className="w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <RotateCcw size={16} />{t('summary.review_again')}
          </button>
          <button onClick={onRestart} className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-md btn-primary">
            {t('summary.restart')}
          </button>
        </div>
      </div>
    </div>
  )
}
