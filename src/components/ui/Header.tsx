import { Layers, Archive, LogOut, Loader2 } from 'lucide-react'
import type { Lang } from '../../types'

interface Props {
  lang: Lang
  setLang: (l: Lang) => void
  onArchive: () => void
  onLogout?: () => void
  generatingCount?: number
  t: (key: string) => string
}

export default function Header({ lang, setLang, onArchive, onLogout, generatingCount = 0, t }: Props) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg header-gradient-border">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center shadow-sm">
            <Layers size={14} className="text-white" />
          </div>
          <span className="font-extrabold text-gray-900 text-sm tracking-tight">{t('header.logo')}</span>
        </div>
        <div className="flex items-center gap-2">
          {generatingCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400 px-2 py-1">
              <Loader2 size={13} className="animate-spin" />
              <span className="hidden sm:inline font-medium">{t('header.generating')}</span>
            </div>
          )}
          <button
            onClick={onArchive}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded-lg hover:bg-gray-100"
          >
            <Archive size={13} />
            <span className="hidden sm:inline font-medium">{t('header.archive')}</span>
          </button>
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setLang('en')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                lang === 'en' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('zh')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-200 ${
                lang === 'zh' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              中文
            </button>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              title={t('auth.logout')}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
