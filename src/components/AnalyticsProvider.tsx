import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { siteConfig } from '../config/siteConfig'

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

function ensureGtagLoaded(gaId: string) {
  if (document.getElementById('ga-gtag')) return

  const script = document.createElement('script')
  script.id = 'ga-gtag'
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer ?? []
  window.gtag =
    window.gtag ??
    ((...args: unknown[]) => {
      window.dataLayer?.push(args)
    })

  window.gtag('js', new Date())
  window.gtag('config', gaId)
}

export function trackEvent(action: string, category: string, label?: string) {
  if (siteConfig.gaId && typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    })
  }
}

export function trackPageView(path: string) {
  if (siteConfig.gaId && typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', { page_path: path })
  }
}

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (!siteConfig.gaId) return
    ensureGtagLoaded(siteConfig.gaId)
  }, [])

  return children
}

