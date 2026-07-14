import { useEffect, useState } from 'react'
import { fetchHqPageData, KorionChongApiError } from '../services/korionChongApi'

type Query = Record<string, string | number | undefined>

export function useHqPageData<T>(path: string | null, initialData: T, query?: Query) {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!path) {
      setData(initialData)
      setIsLoading(false)
      setError(null)
      return
    }

    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetchHqPageData<T>(path, query)
      .then((response) => {
        if (!cancelled) setData(response)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof KorionChongApiError && err.code === 'UNAUTHORIZED'
            ? 'HQ 로그인 토큰이 만료되었거나 누락되었습니다. 다시 로그인 후 확인해주세요.'
            : err instanceof Error ? err.message : 'API error'
          setError(message)
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [path, JSON.stringify(query)])

  return { data, isLoading, error }
}
