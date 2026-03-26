import { Loader2 } from 'lucide-react'

interface Props {
  examples: string[]
  loading: boolean
  onContinue: () => void
  t: (key: string) => string
}

export default function ExamplesView({ examples, loading, onContinue, t }: Props) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">{t('examples.title')}</h1>
          <p className="text-gray-500 mt-2">{t('examples.subtitle')}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-8 text-gray-400">
              <Loader2 size={20} className="animate-spin" />
              <span className="text-sm">{t('examples.loading')}</span>
            </div>
          ) : (
            <ol className="flex flex-col gap-5">
              {examples.map((ex, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-bold text-sm flex items-center justify-center shrink-0">{i + 1}</span>
                  <p className="text-gray-700 leading-relaxed pt-0.5">{ex}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
        {!loading && (
          <button
            onClick={onContinue}
            className="mt-6 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-md btn-primary"
          >
            {t('examples.continue')}
          </button>
        )}
      </div>
    </div>
  )
}
