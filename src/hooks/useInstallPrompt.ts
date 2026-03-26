import { useEffect, useState } from 'react'

export interface InstallState {
  isIOS: boolean
  isStandalone: boolean
  isSafari: boolean
  isInAppBrowser: boolean
  canInstall: boolean
}

export function useInstallPrompt(): InstallState {
  const [state, setState] = useState<InstallState>({
    isIOS: false,
    isStandalone: false,
    isSafari: false,
    isInAppBrowser: false,
    canInstall: false,
  })

  useEffect(() => {
    const ua = navigator.userAgent
    const isIOS = /iPhone|iPad|iPod/.test(ua)
    const isStandalone =
      ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone === true) ||
      window.matchMedia('(display-mode: standalone)').matches
    const isInAppBrowser = /MicroMessenger|WeiBo|CriOS|FxiOS|OPiOS|Line|Twitter|Instagram|Facebook/.test(ua)
    const isSafari = /Safari/.test(ua) && !/Chrome|CriOS|FxiOS/.test(ua) && !isInAppBrowser

    setState({
      isIOS,
      isStandalone,
      isSafari,
      isInAppBrowser,
      canInstall: isIOS && !isStandalone,
    })
  }, [])

  return state
}
