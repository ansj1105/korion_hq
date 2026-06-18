import { useEffect, useState } from 'react'
import { defaultSessionCountryScope } from '../services/authSession'
import { fetchMerchantPageData } from '../services/korionChongApi'

type Query = Record<string, string | number | undefined>

export function useMerchantPageData<T>(path: string, initialData: T, query?: Query) {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetchMerchantPageData<T>(path, {
      countryScope: defaultSessionCountryScope(),
      ...query,
    })
      .then((response) => {
        if (!cancelled) setData(response)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'API error')
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
