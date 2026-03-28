import { useState, useCallback, useRef, useEffect } from 'react'
import { ChevronRight, MessageCircle, Send, X, Loader2 } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { Card, Answers } from '../../types'
import ContentCard from '../cards/ContentCard'
import QuizCard from '../cards/QuizCard'
import TrueFalseCard from '../cards/TrueFalseCard'
import ProgressBar from '../ui/ProgressBar'
import { chatWithAI } from '../../utils/generateCards'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  cards: Card[]
  answers: Answers
  sourceText: string
  lang: string
  onAnswer: (idx: number, sel: string, correct: boolean) => void
  onComplete: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

function isInteractive(card: Card): boolean {
  return card.type === 'quiz' || card.type === 'review' || card.type === 'trueFalse' || card.type === 'output'
}

export default function LearningView({ cards, answers, sourceText, lang, onAnswer, onComplete, t }: Props) {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)

  // Chat state — cleared on unmount (session end)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLInputElement>(null)

  const card = cards[idx]
  const answered = isInteractive(card) ? answers[idx] !== undefined : true
  const isLast = idx === cards.length - 1
  const showChat = true

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
    return null
  }

  async function sendChat() {
    const trimmed = chatInput.trim()
    if (!trimmed || chatLoading) return
    const userMsg: ChatMessage = { role: 'user', content: trimmed }
    const newMessages = [...chatMessages, userMsg]
    setChatMessages(newMessages)
    setChatInput('')
    setChatLoading(true)
    try {
      const reply = await chatWithAI(newMessages, sourceText, lang)
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', content: '...' }])
    } finally {
      setChatLoading(false)
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  useEffect(() => {
    if (chatOpen) chatInputRef.current?.focus()
  }, [chatOpen])

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

        {/* Chatbot */}
        <div className="mt-4">
            {!chatOpen ? (
              <button
                onClick={() => setChatOpen(true)}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 px-3 py-2 rounded-xl hover:bg-white transition-all border border-transparent hover:border-gray-200 hover:shadow-sm"
              >
                <MessageCircle size={15} />
                {t('chat.toggle')}
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
              >
                {/* Chat header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
                  <span className="text-xs text-gray-400 font-medium">{t('chat.label')}</span>
                  <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <X size={14} />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex flex-col gap-3 p-4 max-h-64 overflow-y-auto">
                  {chatMessages.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">{t('chat.placeholder')}</p>
                  )}
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-3 py-2 rounded-xl flex items-center gap-2 text-gray-400">
                        <Loader2 size={13} className="animate-spin" />
                        <span className="text-xs">{t('chat.thinking')}</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2 px-3 pb-3">
                  <input
                    ref={chatInputRef}
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChat()}
                    placeholder={t('chat.placeholder')}
                    className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-white"
                  />
                  <button
                    onClick={sendChat}
                    disabled={!chatInput.trim() || chatLoading}
                    className="px-3 py-2 bg-gray-900 text-white rounded-lg disabled:opacity-40 transition-opacity"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
