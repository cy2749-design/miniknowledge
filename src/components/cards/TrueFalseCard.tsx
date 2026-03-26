import { useState } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'
import type { TrueFalseCard as TrueFalseCardType } from '../../types'

interface Props {
  card: TrueFalseCardType
  onAnswer: (sel: string, correct: boolean) => void
  savedAnswer?: { sel: string; correct: boolean }
  t: (key: string) => string
}

export default function TrueFalseCard({ card, onAnswer, savedAnswer, t }: Props) {
  const [sel, setSel] = useState<string | null>(savedAnswer?.sel ?? null)
  const answered = sel !== null

  function pick(val: 'T' | 'F') {
    if (answered) return
    setSel(val)
    const correct = val === (card.isTrue ? 'T' : 'F')
    onAnswer(val, correct)
  }

  const isCorrect = sel !== null && sel === (card.isTrue ? 'T' : 'F')

  function btnCls(val: 'T' | 'F') {
    const base = 'flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition-all cursor-pointer '
    if (!answered) return base + 'option-btn border-gray-200 hover:border-blue-400 hover:bg-blue-50'
    const isThisCorrect = val === (card.isTrue ? 'T' : 'F')
    if (isThisCorrect) return base + 'border-green-500 bg-green-50 text-green-800'
    if (val === sel) return base + 'border-red-400 bg-red-50 text-red-700'
    return base + 'border-gray-100 text-gray-400'
  }

  return (
    <div className="flex flex-col gap-4">
      <span className="self-start px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        {card.tag}
      </span>
      <h2 className="text-xl font-bold text-gray-900">{card.title}</h2>
      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
        <p className="text-base text-gray-800 leading-relaxed italic">"{card.statement}"</p>
      </div>
      <div className="flex gap-3">
        <button className={btnCls('T')} onClick={() => pick('T')}>{t('learning.true')}</button>
        <button className={btnCls('F')} onClick={() => pick('F')}>{t('learning.false')}</button>
      </div>
      {answered && (
        <div className={`rounded-xl p-4 flex gap-3 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
          {isCorrect
            ? <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={18} />
            : <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />}
          <div>
            <p className={`text-sm font-semibold ${isCorrect ? 'text-green-700' : 'text-red-600'}`}>
              {isCorrect ? t('learning.correct') : t('learning.wrong')}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">{card.explain}</p>
          </div>
        </div>
      )}
    </div>
  )
}
