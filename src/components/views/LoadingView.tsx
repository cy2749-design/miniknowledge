import { useEffect, useState } from 'react'

interface Props {
  t: (key: string) => string
}

const STEPS = ['loading.step1', 'loading.step2', 'loading.step3', 'loading.step4']

export default function LoadingView({ t }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(s => Math.min(s + 1, STEPS.length - 1))
    }, 900)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shadow-lg animate-pulse">
          <span className="text-2xl">✦</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-6">{t('loading.title')}</h2>
        <div className="flex flex-col gap-3">
          {STEPS.map((key, i) => (
            <div key={key} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-500 ${
              i < step ? 'bg-green-50 opacity-60' : i === step ? 'bg-blue-50 shadow-sm' : 'opacity-30'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                i < step ? 'bg-green-400' : i === step ? 'bg-blue-400 animate-pulse' : 'bg-gray-200'
              }`}>
                {i < step && <span className="text-white text-xs">✓</span>}
              </div>
              <span className={`text-sm font-medium ${
                i < step ? 'text-green-700' : i === step ? 'text-blue-700' : 'text-gray-400'
              }`}>{t(key)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
