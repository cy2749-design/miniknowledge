import { Loader2 } from 'lucide-react'

interface Props {
  content: string
  loading: boolean
  onContinue: () => void
  t: (key: string) => string
}

export default function DeeperView({ content, loading, onContinue, t }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">{t('deeper.title')}</h1>
          <p className="text-gray-500 mt-2">{t('deeper.subtitle')}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-8 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">{t('deeper.loading')}</span>
            </div>
          ) : (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</p>
          )}
        </div>
        {!loading && (
          <button
            onClick={onContinue}
            className="mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-md btn-primary"
          >
            {t('deeper.continue')}
          </button>
        )}
      </div>
    </div>
  )
}
