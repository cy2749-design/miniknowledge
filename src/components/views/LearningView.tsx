import { useState, useCallback } from 'react'
import { ChevronRight } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { Card, Answers } from '../../types'
import ContentCard from '../cards/ContentCard'
import QuizCard from '../cards/QuizCard'
import TrueFalseCard from '../cards/TrueFalseCard'
import CompleteCard from '../cards/CompleteCard'
import ProgressBar from '../ui/ProgressBar'

interface Props {
  cards: Card[]
  answers: Answers
  onAnswer: (idx: number, sel: string, correct: boolean) => void
  onComplete: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

function isInteractive(card: Card): boolean {
  return card.type === 'quiz' || card.type === 'review' || card.type === 'trueFalse' || card.type === 'output'
}

export default function LearningView({ cards, answers, onAnswer, onComplete, t }: Props) {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)

  const card = cards[idx]
  const answered = isInteractive(card) ? answers[idx] !== undefined : true
  const isLast = idx === cards.length - 1

  const advance = useCallback(() => {
    if (isLast) { onComplete(); return }
    setDir(1)
    setIdx(i => i + 1)
  }, [isLast, onComplete])

  function handleAnswer(sel: string, correct: boolean) {
    onAnswer(idx, sel, correct)
  }

  function renderCard() {
    if (card.type === 'content') return <ContentCard card={card} />
    if (card.type === 'quiz' || card.type === 'review' || card.type === 'output')
      return <QuizCard card={card} onAnswer={handleAnswer} savedAnswer={answers[idx]} t={k => t(k)} />
    if (card.type === 'trueFalse')
      return <TrueFalseCard card={card} onAnswer={handleAnswer} savedAnswer={answers[idx]} t={k => t(k)} />
    if (card.type === 'complete')
      return <CompleteCard onContinue={onComplete} t={k => t(k)} />
    return null
  }

  const showNext = card.type !== 'complete'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-xl">
        <div className="mb-6">
          <ProgressBar current={idx + 1} total={cards.length} t={t} />
        </div>

        <div className="relative overflow-hidden rounded-2xl" style={{ minHeight: 360 }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={idx}
              custom={dir}
              initial={{ opacity: 0, x: dir * 60, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: dir * -60, scale: 0.97 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
            >
              {renderCard()}
            </motion.div>
          </AnimatePresence>
        </div>

        {showNext && (
          <div className="mt-4 flex justify-end">
            <AnimatePresence mode="wait">
              {answered ? (
                <motion.button
                  key="next"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  onClick={advance}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl shadow-md btn-primary"
                >
                  {t('learning.next')} <ChevronRight size={16} />
                </motion.button>
              ) : (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-gray-400 py-3 px-4"
                >
                  {t('learning.answer_first')}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
