import { Trash2, RotateCcw, ArrowLeft, Loader2, ExternalLink, BookOpen, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { ArchiveEntry, ReadLaterEntry, Card } from '../../types'
import { loadSessions, deleteSession, loadReadLater, deleteReadLater } from '../../lib/db'

type Tab = 'learned' | 'read-later'

interface Props {
  onBack: () => void
  onReplay: (cards: Card[]) => void
  t: (key: string) => string
}

export default function ArchiveView({ onBack, onReplay, t }: Props) {
  const [tab, setTab] = useState<Tab>('learned')
  const [sessions, setSessions] = useState<ArchiveEntry[]>([])
  const [readLater, setReadLater] = useState<ReadLaterEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([loadSessions(), loadReadLater()]).then(([s, r]) => {
      setSessions(s)
      setReadLater(r)
      setLoading(false)
    })
  }, [])

  async function deleteEntry(id: string) {
    await deleteSession(id)
    setSessions(prev => prev.filter(e => e.id !== id))
  }

  async function deleteReadLaterEntry(id: string) {
    await deleteReadLater(id)
    setReadLater(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-20">
      <div className="w-full max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900">{t('archive.title')}</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
          <button
            onClick={() => setTab('learned')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'learned' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen size={14} />{t('archive.tab.learned')}
          </button>
          <button
            onClick={() => setTab('read-later')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === 'read-later' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock size={14} />{t('archive.tab.read_later')}
            {readLater.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-gray-900 text-white text-xs rounded-full leading-none">{readLater.length}</span>
            )}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ) : tab === 'learned' ? (
          sessions.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">{t('archive.empty')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map(entry => (
                <div key={entry.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                          {entry.sourceType === 'url' ? t('archive.source.url') : t('archive.source.text')}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      <p className="font-semibold text-gray-900 truncate">{entry.title}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{t('archive.score')}: {entry.score}/{entry.total}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {entry.cards && (
                        <button
                          onClick={() => onReplay(entry.cards!)}
                          className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"
                          title={t('archive.replay')}
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-colors"
                        title={t('archive.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {entry.bulletPoints && entry.bulletPoints.length > 0 && (
                    <ul className="flex flex-col gap-1.5 border-t border-gray-50 pt-3">
                      {entry.bulletPoints.map((b, i) => (
                        <li key={i} className="flex gap-2 text-xs text-gray-500">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          readLater.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">{t('archive.read_later_empty')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {readLater.map(entry => (
                <div key={entry.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 leading-snug mb-1">{entry.title}</p>
                      <p className="text-xs text-gray-500 leading-relaxed mb-2">{entry.description}</p>
                      <span className="text-xs text-gray-400">{new Date(entry.addedAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl hover:bg-blue-50 text-blue-500 transition-colors"
                        title={t('archive.open_link')}
                      >
                        <ExternalLink size={16} />
                      </a>
                      <button
                        onClick={() => deleteReadLaterEntry(entry.id)}
                        className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-colors"
                        title={t('archive.delete')}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
