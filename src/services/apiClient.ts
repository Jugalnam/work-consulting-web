import { siteConfig } from '../config/siteConfig'
import { buildCacheKey, cache } from './cache'

export type NormalizedApiError = {
  message: string
  status?: number
  raw?: unknown
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function buildUrl(path: string, params?: Record<string, string>) {
  const baseUrlFromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''
  const base = (baseUrlFromEnv || siteConfig.api.baseUrl || '').replace(/\/+$/, '')
  const p = path.startsWith('/') ? path : `/${path}`
  const url = new URL(`${base}${p}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  return url.toString()
}

function normalizeError(e: unknown, status?: number): NormalizedApiError {
  if (e instanceof Error) return { message: e.message, status, raw: e }
  return { message: 'Unknown error', status, raw: e }
}

async function fetchWithRetry<T>(
  input: RequestInfo,
  init: RequestInit,
  options: { timeoutMs: number; retryCount: number },
): Promise<T> {
  let attempt = 0
  let lastError: NormalizedApiError | null = null

  while (attempt <= options.retryCount) {
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), options.timeoutMs)

    try {
      const res = await fetch(input, { ...init, signal: controller.signal })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const err: NormalizedApiError = {
          message: text || `Request failed with status ${res.status}`,
          status: res.status,
          raw: text,
        }
        if (res.status >= 500 && attempt < options.retryCount) {
          lastError = err
        } else {
          throw err
        }
      } else {
        const data = (await res.json()) as T
        return data
      }
    } catch (e) {
      const normalized =
        typeof e === 'object' && e && 'message' in e
          ? (e as NormalizedApiError)
          : normalizeError(e)
      lastError = normalized
      if (attempt >= options.retryCount) throw normalized
    } finally {
      window.clearTimeout(timeoutId)
    }

    attempt += 1
    await sleep(1000 * attempt)
  }

  throw lastError ?? { message: 'Request failed' }
}

async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  if (!siteConfig.api.enabled) {
    console.warn('[apiClient] API layer is disabled. Enable siteConfig.api.enabled to use it.')
    throw { message: 'API layer disabled' } satisfies NormalizedApiError
  }

  const cacheKey = buildCacheKey(path, params)
  const cached = cache.get<T>(cacheKey)
  if (cached) return cached

  const apiKey = import.meta.env.VITE_API_KEY as string | undefined
  const url = buildUrl(path, params)
  const headers: Record<string, string> = {}
  if (apiKey) headers['X-API-Key'] = apiKey

  const data = await fetchWithRetry<T>(
    url,
    { method: 'GET', headers },
    { timeoutMs: siteConfig.api.timeout, retryCount: siteConfig.api.retryCount },
  )
  cache.set(cacheKey, data)
  return data
}

async function post<T>(path: string, body: unknown): Promise<T> {
  if (!siteConfig.api.enabled) {
    console.warn('[apiClient] API layer is disabled. Enable siteConfig.api.enabled to use it.')
    throw { message: 'API layer disabled' } satisfies NormalizedApiError
  }

  const apiKey = import.meta.env.VITE_API_KEY as string | undefined
  const url = buildUrl(path)
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (apiKey) headers['X-API-Key'] = apiKey

  return await fetchWithRetry<T>(
    url,
    { method: 'POST', headers, body: JSON.stringify(body) },
    { timeoutMs: siteConfig.api.timeout, retryCount: siteConfig.api.retryCount },
  )
}

export const apiClient = { get, post }

