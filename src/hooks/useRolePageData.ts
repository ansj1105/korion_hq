import { useEffect, useState } from 'react'
import { defaultSessionCountryScope, readAuthSession } from '../services/authSession'
import { fetchLeaderPageData, fetchMerchantPageData, fetchPartnerPageData } from '../services/korionChongApi'

type Query = Record<string, string | number | undefined>

export function useRolePageData<T>(
  paths: { leader: string; partner?: string; merchant?: string },
  initialData: T,
  query?: Query
) {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const role = readAuthSession()?.role
  const path =
    role === 'merchant' ? (paths.merchant ?? paths.leader) :
    role === 'partner' ? (paths.partner ?? paths.leader) :
    paths.leader
  const fetcher =
    role === 'merchant' ? fetchMerchantPageData :
    role === 'partner' ? fetchPartnerPageData :
    fetchLeaderPageData

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetcher<T>(path, {
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
