import { siteConfig } from '../config/siteConfig'

type CacheEntry<T> = {
  value: T
  expiry: number
}

const store = new Map<string, CacheEntry<unknown>>()

export function buildCacheKey(path: string, params?: Record<string, string>): string {
  const sortedParams = params
    ? Object.fromEntries(Object.entries(params).sort(([a], [b]) => a.localeCompare(b)))
    : undefined
  return `${path}::${sortedParams ? JSON.stringify(sortedParams) : ''}`
}

export const cache = {
  get<T>(key: string): T | null {
    const entry = store.get(key) as CacheEntry<T> | undefined
    if (!entry) return null
    if (Date.now() > entry.expiry) {
      store.delete(key)
      return null
    }
    return entry.value
  },

  set<T>(key: string, value: T): void {
    if (siteConfig.api.cacheMinutes === 0) return
    const expiry = Date.now() + siteConfig.api.cacheMinutes * 60 * 1000
    store.set(key, { value, expiry })
  },

  clear(): void {
    store.clear()
  },
}

