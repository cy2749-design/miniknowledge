import { useState } from 'react'
import { Loader2, Search, ExternalLink, Bookmark, Check } from 'lucide-react'
import { addReadLater } from '../../lib/db'
import type { ReadLaterEntry } from '../../types'

interface RelatedLink {
  title: string
  url: string
  description: string
}

interface Props {
  bullets: string[]
  loading: boolean
  sourceText: string
  lang: string
  onContinue: () => void
  t: (key: string) => string
}

export default function AISummaryView({ bullets, loading, sourceText: _sourceText, onContinue, t }: Props) {
  const [relatedLinks, setRelatedLinks] = useState<RelatedLink[]>([])
  const [findingRelated, setFindingRelated] = useState(false)
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  async function handleFindRelated() {
    setFindingRelated(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'find-related', text: _sourceText }),
      })
      if (!res.ok) throw new Error('Failed')
      const data = await res.json()
      setRelatedLinks(data.links ?? [])
    } catch {
      setRelatedLinks([])
    }
    setFindingRelated(false)
  }

  async function handleSaveLink(link: RelatedLink) {
    const entry: ReadLaterEntry = {
      id: crypto.randomUUID(),
      title: link.title,
      url: link.url,
      description: link.description,
      addedAt: new Date().toISOString(),
    }
    await addReadLater(entry)
    setSavedIds(prev => new Set([...prev, link.url]))
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-20">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">{t('aisummary.title')}</h1>
          <p className="text-gray-500 mt-2">{t('aisummary.subtitle')}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-4">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-8 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">{t('aisummary.loading')}</span>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {bullets.map((b, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-1 w-2 h-2 rounded-full bg-gray-900 shrink-0" />
                  <span className="text-gray-700 leading-relaxed">{b}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {!loading && relatedLinks.length === 0 && (
          <button
            onClick={handleFindRelated}
            disabled={findingRelated}
            className="w-full py-3 border-2 border-gray-900 text-gray-900 font-semibold rounded-xl hover:bg-gray-50 transition-colors mb-4 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {findingRelated ? (
              <><Loader2 size={16} className="animate-spin" />{t('aisummary.finding')}</>
            ) : (
              <><Search size={16} />{t('aisummary.find_related')}</>
            )}
          </button>
        )}

        {relatedLinks.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-4">
            <h2 className="font-bold text-gray-900 mb-4">{t('aisummary.related_title')}</h2>
            <div className="flex flex-col gap-3">
              {relatedLinks.map((link, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                  <div className="flex-1 min-w-0">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-sm text-gray-900 hover:underline flex items-center gap-1"
                    >
                      {link.title}
                      <ExternalLink size={12} className="shrink-0 text-gray-400" />
                    </a>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{link.description}</p>
                  </div>
                  <button
                    onClick={() => handleSaveLink(link)}
                    disabled={savedIds.has(link.url)}
                    className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
                  >
                    {savedIds.has(link.url) ? (
                      <><Check size={12} />{t('aisummary.added')}</>
                    ) : (
                      <><Bookmark size={12} />{t('aisummary.add_read_later')}</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && (
          <button
            onClick={onContinue}
            className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl shadow-md btn-primary"
          >
            {t('aisummary.continue')}
          </button>
        )}
      </div>
    </div>
  )
}
