// ─── View Routing ───────────────────────────────────────────────────────────
export type ViewId = 'home' | 'loading' | 'learning' | 'ai-summary' | 'summary' | 'archive'

// ─── Language ────────────────────────────────────────────────────────────────
export type Lang = 'en' | 'zh'

// ─── Read Mode ───────────────────────────────────────────────────────────────
export type ReadMode = 'skim' | 'deep'

// ─── Source ──────────────────────────────────────────────────────────────────
export interface Source {
  type: 'url' | 'text'
  title: string
  url?: string
  readMode?: ReadMode
}

// ─── Card Types ──────────────────────────────────────────────────────────────
export interface QuizOption {
  l: string  // letter: A B C D
  t: string  // text
}

export interface ContentCard {
  type: 'content'
  tag: string
  tagCls: 'tagConcept'
  title: string
  html: string
}

export interface QuizCard {
  type: 'quiz'
  tag: string
  tagCls: 'tagQuiz'
  title: string
  question: string
  options: QuizOption[]
  correct: string
  explain: string
}

export interface ReviewCard {
  type: 'review'
  tag: string
  tagCls: 'tagReview'
  title: string
  keyPoints: string
  question: string
  options: QuizOption[]
  correct: string
  explain: string
}

export interface TrueFalseCard {
  type: 'trueFalse'
  tag: string
  tagCls: 'tagQuiz'
  title: string
  statement: string
  isTrue: boolean
  explain: string
}

export interface OutputCard {
  type: 'output'
  tag: string
  tagCls: 'tagOutput'
  title: string
  summary: string
  question: string
  options: QuizOption[]
  correct: string
  explain: string
}

export interface CompleteCard {
  type: 'complete'
}

export type Card = ContentCard | QuizCard | ReviewCard | TrueFalseCard | OutputCard | CompleteCard

// ─── Answer Tracking ─────────────────────────────────────────────────────────
export interface Answer {
  sel: string
  correct: boolean
}
export type Answers = Record<number, Answer>

// ─── Learning Session (runtime) ───────────────────────────────────────────────
export interface LearningSession {
  id: string
  title: string
  source: Source
  language: Lang
  cards: Card[]
  aiSummary?: string[]   // bullet points
  answers: Answers
  createdAt: string
  completedAt?: string
}

// ─── Archive Entry (persisted) ────────────────────────────────────────────────
export interface ArchiveEntry {
  id: string
  title: string
  sourceType: 'url' | 'text'
  sourceUrl?: string
  date: string
  score: number
  total: number
  cards?: Card[]
  bulletPoints?: string[]
  status?: 'generating' | 'pending' | 'failed' | 'completed'
  sourceText?: string  // stored locally for chatbot context
  lang?: Lang
  readMode?: ReadMode
}

// ─── Read Later Entry ────────────────────────────────────────────────────────
export interface ReadLaterEntry {
  id: string
  title: string
  url: string
  description: string
  addedAt: string
}
