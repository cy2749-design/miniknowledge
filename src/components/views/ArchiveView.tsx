import { Trash2, RotateCcw, ArrowLeft, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { ArchiveEntry, Card } from '../../types'
import { loadSessions, deleteSession } from '../../lib/db'

interface Props {
  onBack: () => void
  onReplay: (cards: Card[]) => void
  t: (key: string) => string
}

export default function ArchiveView({ onBack, onReplay, t }: Props) {
  const [entries, setEntries] = useState<ArchiveEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions().then(data => { setEntries(data); setLoading(false) })
  }, [])

  async function deleteEntry(id: string) {
    await deleteSession(id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-20">
      <div className="w-full max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900">{t('archive.title')}</h1>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
            <Loader2 size={18} className="animate-spin" />
            <span className="text-sm">{t('archive.loading') || '...'}</span>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">{t('archive.empty')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entries.map(entry => (
              <div key={entry.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        entry.sourceType === 'url' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {entry.sourceType === 'url' ? t('archive.source.url') : t('archive.source.text')}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString()}</span>
                    </div>
                    <p className="font-semibold text-gray-900 truncate">{entry.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {t('archive.score')}: {entry.score}/{entry.total}
                    </p>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
