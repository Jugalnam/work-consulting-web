import { useMemo, useState } from 'react'
import { siteConfig } from '../config/siteConfig'
import { trackEvent } from './AnalyticsProvider'

declare global {
  interface Window {
    Kakao?: {
      isInitialized?: () => boolean
      init?: (key: string) => void
      Share?: {
        sendDefault: (payload: unknown) => void
      }
    }
  }
}

interface ShareButtonsProps {
  className?: string
}

function loadScriptOnce(id: string, src: string): Promise<void> {
  const existing = document.getElementById(id)
  if (existing) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.id = id
    script.async = true
    script.src = src
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

export function ShareButtons({ className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = useMemo(() => siteConfig.siteUrl.replace(/\/+$/, ''), [])

  async function onKakaoShare() {
    trackEvent('share', 'social', 'kakao')
    const kakaoKey = import.meta.env.VITE_KAKAO_APP_KEY as string | undefined
    if (!kakaoKey) {
      alert('카카오 공유 키(VITE_KAKAO_APP_KEY)가 아직 설정되지 않았습니다.')
      return
    }

    try {
      await loadScriptOnce(
        'kakao-sdk',
        'https://t1.kakaocdn.net/kakao_js_sdk/2.6.0/kakao.min.js',
      )

      if (!window.Kakao?.isInitialized?.()) {
        window.Kakao?.init?.(kakaoKey)
      }

      window.Kakao?.Share?.sendDefault({
        objectType: 'feed',
        content: {
          title: siteConfig.siteName,
          description: siteConfig.siteDescription,
          imageUrl: `${shareUrl}${siteConfig.ogImage.startsWith('/') ? '' : '/'}${siteConfig.ogImage}`,
          link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
        },
        buttons: [
          {
            title: '열기',
            link: { mobileWebUrl: shareUrl, webUrl: shareUrl },
          },
        ],
      })
    } catch (e) {
      console.error(e)
      alert('카카오 공유를 실행할 수 없습니다.')
    }
  }

  function onTwitterShare() {
    trackEvent('share', 'social', 'twitter')
    const url = encodeURIComponent(shareUrl)
    const text = encodeURIComponent(siteConfig.siteDescription)
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'noreferrer')
  }

  async function onCopyLink() {
    trackEvent('share', 'social', 'copy_link')
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error(e)
      alert('링크를 복사할 수 없습니다.')
    }
  }

  return (
    <div className={className ?? 'flex flex-wrap items-center gap-2'}>
      {siteConfig.share.kakao ? (
        <button
          type="button"
          onClick={onKakaoShare}
          className="rounded-md border px-3 py-2 text-sm"
        >
          카카오 공유
        </button>
      ) : null}

      {siteConfig.share.twitter ? (
        <button
          type="button"
          onClick={onTwitterShare}
          className="rounded-md border px-3 py-2 text-sm"
        >
          트위터 공유
        </button>
      ) : null}

      {siteConfig.share.copyLink ? (
        <button
          type="button"
          onClick={onCopyLink}
          className="rounded-md border px-3 py-2 text-sm"
        >
          {copied ? '복사됨!' : '링크 복사'}
        </button>
      ) : null}
    </div>
  )
}

