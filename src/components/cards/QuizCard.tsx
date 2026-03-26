import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import type { QuizCard as QuizCardType, ReviewCard, OutputCard } from '../../types'

type QuizLike = QuizCardType | ReviewCard | OutputCard

interface Props {
  card: QuizLike
  onAnswer: (sel: string, correct: boolean) => void
  savedAnswer?: { sel: string; correct: boolean }
  t: (key: string) => string
}

const tagColors: Record<string, string> = {
  tagConcept: 'bg-blue-100 text-blue-700',
  tagQuiz: 'bg-amber-100 text-amber-700',
  tagReview: 'bg-purple-100 text-purple-700',
  tagOutput: 'bg-green-100 text-green-700',
}

export default function QuizCard({ card, onAnswer, savedAnswer, t }: Props) {
  const [sel, setSel] = useState<string | null>(savedAnswer?.sel ?? null)
  const answered = sel !== null

  function pick(letter: string) {
    if (answered) return
    setSel(letter)
    onAnswer(letter, letter === card.correct)
  }

  function optionCls(letter: string) {
    const base = 'flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer '
    if (!answered) return base + 'option-btn border-gray-200 hover:border-blue-400 hover:bg-blue-50'
    if (letter === card.correct) return base + 'border-green-500 bg-green-50 text-green-800'
    if (letter === sel) return base + 'border-red-400 bg-red-50 text-red-700'
    return base + 'border-gray-100 text-gray-400'
  }

  const isReview = card.type === 'review'
  const isOutput = card.type === 'output'

  return (
    <div className="flex flex-col gap-4">
      <span className={`self-start px-2.5 py-0.5 rounded-full text-xs font-semibold ${tagColors[card.tagCls] ?? 'bg-gray-100 text-gray-600'}`}>
        {card.tag}
      </span>

      {isReview && 'keyPoints' in card && (
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-purple-600 mb-2 uppercase tracking-wide">{t('learning.keypoints')}</p>
          <div className="flex flex-wrap gap-2">
            {card.keyPoints.split(',').map(kw => kw.trim()).filter(Boolean).map(kw => (
              <span key={kw} className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full text-sm font-medium">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {isOutput && 'summary' in card && (
        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-green-600 mb-2 uppercase tracking-wide">{t('learning.summary_label')}</p>
          <p className="text-sm text-green-900 leading-relaxed">{card.summary}</p>
        </div>
      )}

      <h2 className="text-lg font-bold text-gray-900">{card.title}</h2>
      <p className="text-gray-700 text-base">{card.question}</p>

      <div className="flex flex-col gap-2">
        {card.options.map(opt => (
          <button key={opt.l} className={optionCls(opt.l)} onClick={() => pick(opt.l)}>
            <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold shrink-0">{opt.l}</span>
            <span>{opt.t}</span>
          </button>
        ))}
      </div>

      {answered && (
        <div className={`rounded-xl p-4 flex gap-3 ${sel === card.correct ? 'bg-green-50' : 'bg-red-50'}`}>
          {sel === card.correct
            ? <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={18} />
            : <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />}
          <div>
            <p className={`text-sm font-semibold ${sel === card.correct ? 'text-green-700' : 'text-red-600'}`}>
              {sel === card.correct ? t('learning.correct') : t('learning.wrong')}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">{card.explain}</p>
          </div>
        </div>
      )}
    </div>
  )
}
