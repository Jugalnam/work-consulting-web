import React from 'react'
import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

export default async function handler() {
  let fontData: ArrayBuffer | null = null

  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&display=swap',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      },
    ).then((r) => r.text())

    const urls = [...css.matchAll(/src: url\(([^)]+)\) format\('woff2'\)/g)].map((m) => m[1])
    if (urls.length > 0) {
      fontData = await fetch(urls[urls.length - 1]).then((r) => r.arrayBuffer())
    }
  } catch {
    // 폰트 로드 실패 시 기본 폰트로 폴백
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #ecfeff 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 장식 원 */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            left: -80,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'rgba(199, 210, 254, 0.5)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(245, 208, 254, 0.45)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: 200,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: 'rgba(165, 243, 252, 0.4)',
          }}
        />

        {/* 카드 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            margin: '48px',
            flex: 1,
            background: 'rgba(255, 255, 255, 0.82)',
            borderRadius: '32px',
            padding: '52px 60px',
            border: '1px solid rgba(0,0,0,0.07)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* 상단 그라디언트 바 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              background: 'linear-gradient(90deg, #4f46e5, #a855f7, #06b6d4)',
            }}
          />

          {/* 태그 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: '#f5f3ff',
              borderRadius: '999px',
              padding: '6px 20px',
              marginTop: '12px',
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: '#6d28d9' }}>
              직장인 1:1 상담
            </span>
          </div>

          {/* 메인 타이틀 */}
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: '#0a0a0a',
              marginTop: 28,
              letterSpacing: '-2px',
              lineHeight: 1.05,
            }}
          >
            직장 고민 상담
          </div>

          {/* 설명 */}
          <div
            style={{
              fontSize: 27,
              color: '#525252',
              marginTop: 20,
              lineHeight: 1.55,
            }}
          >
            직장 내 관계, 번아웃, 이직·승진 고민을 함께 정리합니다.
          </div>

          {/* 주제 필 */}
          <div style={{ display: 'flex', gap: 10, marginTop: 40 }}>
            {['번아웃', '직장 내 관계', '이직·커리어', '업무 스트레스'].map((t) => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'white',
                  border: '1.5px solid #e5e7eb',
                  borderRadius: '999px',
                  padding: '8px 22px',
                  fontSize: 18,
                  color: '#374151',
                }}
              >
                {t}
              </div>
            ))}
          </div>

          {/* URL */}
          <div style={{ fontSize: 18, color: '#a3a3a3', marginTop: 'auto', paddingTop: 24 }}>
            work-consulting-web.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData
        ? [{ name: 'NotoSansKR', data: fontData, weight: 700, style: 'normal' }]
        : [],
    },
  )
}
