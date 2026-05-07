import { useCallback, useEffect, useRef, useState } from 'react'

type UseApiCallOptions = {
  immediate?: boolean
}

export function useApiCall<T>(
  fetcher: () => Promise<T>,
  options: UseApiCallOptions = { immediate: true },
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requestIdRef = useRef(0)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const run = useCallback(async () => {
    const requestId = (requestIdRef.current += 1)
    setIsLoading(true)
    setError(null)

    try {
      const result = await fetcher()
      if (!isMountedRef.current || requestId !== requestIdRef.current) return
      setData(result)
    } catch (e) {
      const message = e instanceof Error ? e.message : '요청에 실패했습니다.'
      if (!isMountedRef.current || requestId !== requestIdRef.current) return
      setError(message)
    } finally {
      if (!isMountedRef.current || requestId !== requestIdRef.current) return
      setIsLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    if (options.immediate ?? true) {
      void run()
    }
  }, [options.immediate, run])

  return { data, isLoading, error, refetch: run }
}

