import { useState, useCallback } from 'react'
import type { Lang } from '../types'
import { t } from '../lib/i18n'

const STORAGE_KEY = 'mk-lang'

function getInitialLang(): Lang {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'en' || stored === 'zh') return stored
  // Auto-detect from browser
  const browserLang = navigator.language.toLowerCase()
  return browserLang.startsWith('zh') ? 'zh' : 'en'
}

export function useLanguage() {
  const [lang, setLangState] = useState<Lang>(getInitialLang)

  const setLang = useCallback((newLang: Lang) => {
    localStorage.setItem(STORAGE_KEY, newLang)
    setLangState(newLang)
  }, [])

  const translate = useCallback(
    (key: string, vars?: Record<string, string | number>) => t(lang, key, vars),
    [lang]
  )

  return { lang, setLang, t: translate }
}
