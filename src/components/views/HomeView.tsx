import { useState, useRef } from 'react'
import { Link2, FileText, Loader2, Sparkles, Upload, Info } from 'lucide-react'
import { motion } from 'motion/react'
import * as pdfjsLib from 'pdfjs-dist'
import type { Source, ReadMode } from '../../types'
import { fetchArticle } from '../../utils/fetchArticle'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href

interface Props {
  onSubmit: (text: string, source: Source) => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

type Tab = 'url' | 'text' | 'pdf'

async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const pages: string[] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items.map((item: unknown) => (item as { str: string }).str).join(' ')
    pages.push(pageText)
  }
  return pages.join('\n\n')
}

export default function HomeView({ onSubmit, t }: Props) {
  const [tab, setTab] = useState<Tab>('url')
  const [value, setValue] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [readMode, setReadMode] = useState<ReadMode>('deep')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const textRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      if (tab === 'url') {
        const trimmed = value.trim()
        if (!trimmed) { setError(t('home.error.empty')); setLoading(false); return }
        const { title, text } = await fetchArticle(trimmed)
        onSubmit(text, { type: 'url', title, url: trimmed, readMode })
      } else if (tab === 'text') {
        const trimmed = value.trim()
        if (!trimmed) { setError(t('home.error.empty')); setLoading(false); return }
        const title = trimmed.slice(0, 60) + (trimmed.length > 60 ? '...' : '')
        onSubmit(trimmed, { type: 'text', title, readMode })
      } else {
        if (!pdfFile) { setError(t('home.error.pdf_empty')); setLoading(false); return }
        const text = await extractPdfText(pdfFile)
        if (!text.trim()) { setError(t('home.error.pdf_parse')); setLoading(false); return }
        const title = pdfFile.name.replace(/\.pdf$/i, '')
        onSubmit(text, { type: 'pdf', title, readMode })
      }
    } catch {
      if (tab === 'pdf') setError(t('home.error.pdf_parse'))
      else setError(t('home.error.fetch'))
      setLoading(false)
    }
  }

  function handleTabChange(newTab: Tab) {
    setTab(newTab)
    setValue('')
    setPdfFile(null)
    setError('')
  }

  const tabIcons: Record<Tab, React.ReactNode> = {
    url: <Link2 size={15} />,
    text: <FileText size={15} />,
    pdf: <Upload size={15} />,
  }

  return (
    <div className="home-bg min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 bg-white border border-gray-200 px-4 py-1.5 rounded-full text-sm text-gray-500 font-medium mb-6 shadow-sm">
            <Sparkles size={13} className="text-amber-500" />
            {t('home.badge')}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
            {t('home.title')}
          </h1>
          <p className="mt-4 text-gray-500 text-lg leading-relaxed max-w-md mx-auto">{t('home.subtitle')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 p-6"
        >
          {/* URL / Text / PDF tab */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
            {(['url', 'text', 'pdf'] as Tab[]).map(tabId => (
              <button
                key={tabId}
                onClick={() => handleTabChange(tabId)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === tabId ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tabIcons[tabId]}
                {t(`home.tab.${tabId}`)}
              </button>
            ))}
          </div>

          {/* Input */}
          {tab === 'url' && (
            <input
              type="url"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder={t('home.url.placeholder')}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition bg-white"
            />
          )}

          {tab === 'text' && (
            <textarea
              ref={textRef}
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={t('home.text.placeholder')}
              rows={6}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition resize-none bg-white"
            />
          )}

          {tab === 'pdf' && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl px-4 py-6 text-sm transition flex flex-col items-center gap-2 ${
                  pdfFile
                    ? 'border-gray-900 bg-gray-50 text-gray-900'
                    : 'border-gray-200 bg-white text-gray-400 hover:border-gray-400 hover:text-gray-600'
                }`}
              >
                <Upload size={20} className={pdfFile ? 'text-gray-700' : 'text-gray-300'} />
                <span className="font-medium">
                  {pdfFile
                    ? t('home.pdf.selected', { name: pdfFile.name })
                    : t('home.pdf.button')}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0] ?? null
                  setPdfFile(file)
                  setError('')
                }}
              />
              <div className="flex items-start gap-1.5 text-xs text-gray-400 px-1">
                <Info size={12} className="mt-0.5 shrink-0" />
                <span>{t('home.pdf.notice')}</span>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {/* Read mode selector */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(['skim', 'deep'] as ReadMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setReadMode(mode)}
                className={`flex flex-col items-start px-4 py-3 rounded-xl border-2 transition-all text-left ${
                  readMode === mode
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="font-semibold text-sm">{t(`home.mode.${mode}`)}</span>
                <span className={`text-xs mt-0.5 ${readMode === mode ? 'text-gray-300' : 'text-gray-400'}`}>
                  {t(`home.mode.${mode}_desc`)}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 w-full py-3 bg-gray-900 text-white font-semibold rounded-xl shadow-md btn-primary disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" />{t('home.submitting')}</> : t('home.submit')}
          </button>
        </motion.div>
      </div>
    </div>
  )
}
