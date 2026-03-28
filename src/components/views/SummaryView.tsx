import { Trophy, RotateCcw } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { Card, Answers, Source, Lang } from '../../types'
import { saveSession } from '../../lib/db'

interface Props {
  cards: Card[]
  answers: Answers
  sessionId: string
  title: string
  source: Source
  sourceText: string
  lang: Lang
  bulletPoints?: string[]
  onRestart: () => void
  onReviewCards: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

export default function SummaryView({ cards, answers, sessionId, title, source, sourceText, lang, bulletPoints, onRestart, onReviewCards, t }: Props) {
  const saved = useRef(false)

  useEffect(() => {
    if (saved.current) return
    saved.current = true
    saveSession({ id: sessionId, title, source, sourceText, lang, cards, bulletPoints })
      .catch(console.error)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-lg">
            <Trophy className="text-white" size={36} />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">{t('summary.title')}</h1>
        </div>

        {bulletPoints && bulletPoints.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">{t('archive.key_takeaways')}</h2>
            <ul className="flex flex-col gap-2">
              {bulletPoints.map((b, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button onClick={onReviewCards} className="w-full py-3 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <RotateCcw size={16} />{t('summary.review_again')}
          </button>
          <button onClick={onRestart} className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl shadow-md btn-primary">
            {t('summary.restart')}
          </button>
        </div>
      </div>
    </div>
  )
}
