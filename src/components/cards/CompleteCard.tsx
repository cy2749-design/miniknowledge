import { Sparkles } from 'lucide-react'

interface Props {
  onContinue: () => void
  t: (key: string) => string
}

export default function CompleteCard({ onContinue, t }: Props) {
  return (
    <div className="flex flex-col items-center gap-6 py-8 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
        <Sparkles className="text-white" size={36} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('complete.title')}</h2>
        <p className="text-gray-500 mt-1">{t('complete.subtitle')}</p>
      </div>
      <button
        onClick={onContinue}
        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-md btn-primary"
      >
        {t('complete.continue')}
      </button>
    </div>
  )
}
