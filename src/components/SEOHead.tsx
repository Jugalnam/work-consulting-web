import { Helmet } from 'react-helmet-async'
import { siteConfig } from '../config/siteConfig'

interface SEOHeadProps {
  title?: string
  description?: string
  ogImage?: string
  path?: string
}

function joinUrl(baseUrl: string, path?: string) {
  if (!path) return baseUrl
  const base = baseUrl.replace(/\/+$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  return `${base}${p}`
}

export function SEOHead({ title, description, ogImage, path }: SEOHeadProps) {
  const pageTitle = title ? `${title} | ${siteConfig.siteName}` : siteConfig.siteName
  const pageDescription = description ?? siteConfig.siteDescription
  const canonicalUrl = joinUrl(siteConfig.siteUrl, path)
  const imageUrl = joinUrl(siteConfig.siteUrl, ogImage ?? siteConfig.ogImage)

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={siteConfig.keywords.join(',')} />
      <meta name="author" content={siteConfig.author} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content={siteConfig.locale} />
      <meta property="og:site_name" content={siteConfig.siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={imageUrl} />

      {siteConfig.gscVerification ? (
        <meta name="google-site-verification" content={siteConfig.gscVerification} />
      ) : null}
    </Helmet>
  )
}

