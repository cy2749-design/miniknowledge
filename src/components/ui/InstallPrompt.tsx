import { useState } from 'react'
import { X, Share, Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'

interface Props {
  t: (key: string) => string
}

function ShareIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="6" fill="#007AFF" />
      <path d="M14 5v12M14 5l-4 4M14 5l4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 13v7a1 1 0 001 1h10a1 1 0 001-1v-7" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function AddIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="6" fill="#F2F2F7" />
      <rect x="4" y="4" width="20" height="20" rx="4" stroke="#8E8E93" strokeWidth="1.5" />
      <path d="M14 9v10M9 14h10" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const steps = [
  { key: '1', icon: <ShareIcon />, titleKey: 'install.step1_title', descKey: 'install.step1_desc' },
  { key: '2', icon: <AddIcon />,   titleKey: 'install.step2_title', descKey: 'install.step2_desc' },
  { key: '3', icon: <Plus size={16} className="text-white" />, titleKey: 'install.step3_title', descKey: 'install.step3_desc', iconBg: true },
]

export default function InstallPrompt({ t }: Props) {
  const [open, setOpen] = useState(false)
  const { isInAppBrowser, isIOS } = useInstallPrompt()

  // Only render the button on iOS
  if (!isIOS) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
      >
        <Share size={13} />
        <span className="hidden sm:inline font-medium">{t('install.button')}</span>
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Sheet — slides up from bottom */}
            <motion.div
              key="sheet"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl shadow-2xl px-6 pt-5 pb-10 max-w-lg mx-auto"
            >
              {/* Handle */}
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900">{t('install.title')}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{t('install.subtitle')}</p>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {isInAppBrowser ? (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                  {t('install.inapp')}
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-4">
                  {steps.map((step, i) => (
                    <div key={step.key} className="flex items-center gap-4">
                      {/* Step number */}
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xs font-bold text-gray-500">
                        {i + 1}
                      </div>
                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        step.iconBg ? 'bg-gray-800' : 'bg-gray-50 border border-gray-100'
                      }`}>
                        {step.icon}
                      </div>
                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{t(step.titleKey)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{t(step.descKey)}</p>
                      </div>
                    </div>
                  ))}

                  {/* Arrow hint pointing down (toward Safari bar) */}
                  <div className="flex flex-col items-center mt-2 gap-1 text-gray-300">
                    <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
                      <path d="M10 0v22M10 22l-6-6M10 22l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-xs text-gray-400">Safari toolbar</span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setOpen(false)}
                className="mt-6 w-full py-3 bg-gray-900 text-white font-semibold rounded-xl text-sm"
              >
                {t('install.close')}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
