import { Trash2, RotateCcw, ArrowLeft, Loader2, ExternalLink, BookOpen, Clock, ChevronRight, GraduationCap, PlayCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import type { ArchiveEntry, ReadLaterEntry, Card } from '../../types'
import { loadSessions, deleteSession, loadReadLater, deleteReadLater, loadPendingSessions, deletePendingSession } from '../../lib/db'

type Tab = 'learned' | 'read-later'

interface Props {
  onBack: () => void
  onReplay: (cards: Card[]) => void
  onStartPending: (entry: ArchiveEntry) => void
  onLearnFromUrl: (url: string, title: string) => void
  t: (key: string) => string
}

function SessionDetail({ entry, onBack, onReplay, onDelete, t }: {
  entry: ArchiveEntry
  onBack: () => void
  onReplay: (cards: Card[]) => void
  onDelete: (id: string) => void
  t: (key: string) => string
}) {
  return (
    <div className="min-h-screen flex flex-col px-4 py-20">
      <div className="w-full max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-extrabold text-gray-900 truncate flex-1">{entry.title}</h1>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
            {entry.sourceType === 'url' ? t('archive.source.url') : t('archive.source.text')}
          </span>
          <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString()}</span>
        </div>

        {entry.bulletPoints && entry.bulletPoints.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">{t('archive.key_takeaways')}</h2>
            <ul className="flex flex-col gap-3">
              {entry.bulletPoints.map((b, i) => (
                <li key={i} className="flex gap-3 text-sm text-gray-700">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 text-sm text-gray-400 text-center">
            {t('archive.no_takeaways')}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {entry.cards && (
            <button
              onClick={() => onReplay(entry.cards!)}
              className="w-full py-3 bg-gray-900 text-white font-semibold rounded-xl shadow-md flex items-center justify-center gap-2"
            >
              <RotateCcw size={16} />{t('archive.replay')}
            </button>
          )}
          <button
            onClick={() => { onDelete(entry.id); onBack() }}
            className="w-full py-3 border-2 border-red-100 text-red-400 font-semibold rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={16} />{t('archive.delete')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ArchiveView({ onBack, onReplay, onStartPending, onLearnFromUrl, t }: Props) {
  const [tab, setTab] = useState<Tab>('learned')
  const [sessions, setSessions] = useState<ArchiveEntry[]>([])
  const [pending, setPending] = useState<ArchiveEntry[]>([])
  const [readLater, setReadLater] = useState<ReadLaterEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<ArchiveEntry | null>(null)
  const [learningId, setLearningId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([loadSessions(), loadPendingSessions(), loadReadLater()]).then(([s, p, r]) => {
      setSessions(s)
      setPending(p)
      setReadLater(r)
      setLoading(false)
    })
  }, [])

  async function deleteEntry(id: string) {
    await deleteSession(id)
    setSessions(prev => prev.filter(e => e.id !== id))
  }

  async function deletePending(id: string) {
    await deletePendingSession(id)
    setPending(prev => prev.filter(e => e.id !== id))
  }

  async function deleteReadLaterEntry(id: string) {
    await deleteReadLater(id)
    setReadLater(prev => prev.filter(e => e.id !== id))
  }

  async function handleLearn(entry: ReadLaterEntry) {
    setLearningId(entry.id)
    await onLearnFromUrl(entry.url, entry.title)
    setLearningId(null)
  }

  if (selectedSession) {
    return (
      <SessionDetail
        entry={selectedSession}
        onBack={() => setSelectedSession(null)}
        onReplay={onReplay}
        onDelete={deleteEntry}
        t={t}
      />
    )
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
          sessions.length === 0 && pending.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">{t('archive.empty')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Pending / queued sessions */}
              {pending.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1">{t('archive.queued')}</p>
                  {pending.map(entry => (
                    <div key={entry.id} className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                              {entry.readMode ? t(`archive.mode.${entry.readMode}`) : ''}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString()}</span>
                          </div>
                          <p className="font-semibold text-gray-900 truncate">{entry.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{entry.cards?.length ?? 0} cards</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onStartPending(entry)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-xs font-semibold rounded-xl transition-colors hover:bg-gray-700"
                          >
                            <PlayCircle size={13} />{t('archive.start')}
                          </button>
                          <button
                            onClick={() => deletePending(entry.id)}
                            className="p-2 rounded-xl hover:bg-red-50 text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {sessions.length > 0 && (
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-1 mt-2">{t('archive.tab.learned')}</p>
                  )}
                </>
              )}
              {sessions.map(entry => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedSession(entry)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left w-full hover:border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                          {entry.sourceType === 'url' ? t('archive.source.url') : t('archive.source.text')}
                        </span>
                        <span className="text-xs text-gray-400">{new Date(entry.date).toLocaleDateString()}</span>
                      </div>
                      <p className="font-semibold text-gray-900 truncate">{entry.title}</p>
                      {entry.bulletPoints && entry.bulletPoints.length > 0 && (
                        <p className="text-xs text-gray-400 mt-1">{entry.bulletPoints.length} {t('archive.takeaways_count')}</p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-gray-400 shrink-0" />
                  </div>
                </button>
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
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleLearn(entry)}
                        disabled={learningId === entry.id}
                        className="p-2 rounded-xl hover:bg-green-50 text-green-600 transition-colors disabled:opacity-50"
                        title={t('archive.learn')}
                      >
                        {learningId === entry.id
                          ? <Loader2 size={16} className="animate-spin" />
                          : <GraduationCap size={16} />}
                      </button>
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
