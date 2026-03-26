// ─── View Routing ───────────────────────────────────────────────────────────
export type ViewId = 'home' | 'loading' | 'learning' | 'deeper' | 'examples' | 'summary' | 'archive'

// ─── Language ────────────────────────────────────────────────────────────────
export type Lang = 'en' | 'zh'

// ─── Source ──────────────────────────────────────────────────────────────────
export interface Source {
  type: 'url' | 'text'
  title: string
  url?: string
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
  html: string  // restricted HTML: <p> <strong> <em> <ul> <li> <kblock>
}

export interface QuizCard {
  type: 'quiz'
  tag: string
  tagCls: 'tagQuiz'
  title: string
  question: string
  options: QuizOption[]
  correct: string  // letter
  explain: string
}

export interface ReviewCard {
  type: 'review'
  tag: string
  tagCls: 'tagReview'
  title: string
  keyPoints: string  // comma-separated keywords
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
  summary: string  // paragraph
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
  sel: string   // selected option letter (or 'T'/'F' for trueFalse)
  correct: boolean
}
export type Answers = Record<number, Answer>  // keyed by card index

// ─── Learning Session (runtime) ───────────────────────────────────────────────
export interface LearningSession {
  id: string
  title: string
  source: Source
  language: Lang
  cards: Card[]
  deeperExplanation?: string
  realWorldExamples?: string[]
  sessionSummary?: string
  answers: Answers
  createdAt: string
  completedAt?: string
}

// ─── Archive Entry (persisted) ────────────────────────────────────────────────
export interface ArchiveEntry {
  id: string
  title: string
  sourceType: 'url' | 'text'
  date: string
  score: number      // correct quiz answers
  total: number      // total quiz cards
  cards?: Card[]     // preserved for replay
  deeperExplanation?: string
  realWorldExamples?: string[]
}
