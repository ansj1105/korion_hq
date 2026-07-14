import { useEffect, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { fetchHqPageData } from '../../../services/korionChongApi'

export type HqStatsMerchantRange = 'ALL' | '1D' | '7D' | '14D' | '30D' | '90D' | '180D' | '365D'
export type MerchantStatStatus = 'active' | 'suspended' | 'blacklisted'

interface StatRaw {
  id: string
  labelKey: string
  value: string
  delta?: string
  deltaKey?: string
  deltaBadge?: boolean
}

export interface RankingRow {
  rank: number
  name: string
  meta: string
  amount: string
}

export interface RankingPanel {
  id: string
  titleKey: string
  rows: RankingRow[]
}

export interface MerchantStatsRow {
  id: string
  no: string
  rank: string
  merchantCode: string
  merchantName: string
  partnerCode: string
  leaderCode: string
  country: string
  region: string
  amount: string
  txCount: string
  fee: string
  unsettledFee: string
  syncFail: string
  growth: string
  status: MerchantStatStatus
}

interface UseStatsMerchantFilters {
  countryScope: string
  range: HqStatsMerchantRange
}

interface StatsMerchantPageData {
  stats: StatRaw[]
  rows: MerchantStatsRow[]
  rankingPanels: RankingPanel[]
}

const RANGE_OPTIONS: HqStatsMerchantRange[] = ['ALL', '1D', '7D', '14D', '30D', '90D', '180D', '365D']
const EMPTY_STATS_MERCHANT_DATA: StatsMerchantPageData = {
  stats: [],
  rows: [],
  rankingPanels: [],
}

export function useStatsMerchant({ countryScope, range }: UseStatsMerchantFilters) {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState<StatsMerchantPageData>(EMPTY_STATS_MERCHANT_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetchHqPageData<StatsMerchantPageData>('/api/hq/stats/merchant', { countryScope, range })
      .then((response) => {
        if (!cancelled) setPageData(response)
      })
      .catch((requestError) => {
        if (!cancelled) {
          setPageData(EMPTY_STATS_MERCHANT_DATA)
          setError(requestError instanceof Error ? requestError.message : t('common.apiError'))
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [countryScope, range, t])

  const rows = pageData.rows
  const countryOptions = [
    { value: 'all', label: t('hqDashboard.filter.allCountries') },
    ...Array.from(new Set(rows.map((row) => row.country).filter(Boolean))).map((country) => ({ value: country, label: country })),
  ]

  const stats: StatCardData[] = pageData.stats.map((stat) => ({
    id: stat.id,
    label: t(stat.labelKey),
    value: stat.value,
    delta: stat.delta ?? (stat.deltaKey ? t(stat.deltaKey) : undefined),
    deltaBadge: stat.deltaBadge,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqStatsMerchant.col.no'), width: '72px', align: 'center' },
    { key: 'merchantCode', label: t('hqStatsMerchant.col.merchantCode'), width: '136px' },
    { key: 'merchantName', label: t('hqStatsMerchant.col.merchantName'), width: '156px' },
    { key: 'partnerCode', label: t('hqStatsMerchant.col.partnerCode'), width: '136px' },
    { key: 'leaderCode', label: t('hqStatsMerchant.col.leaderCode'), width: '136px' },
    { key: 'country', label: t('hqStatsMerchant.col.country'), width: '104px' },
    { key: 'region', label: t('hqStatsMerchant.col.region'), width: '116px' },
    { key: 'amount', label: t('hqStatsMerchant.col.amount'), width: '144px' },
    { key: 'txCount', label: t('hqStatsMerchant.col.txCount'), width: '116px' },
    { key: 'fee', label: t('hqStatsMerchant.col.fee'), width: '124px' },
    { key: 'unsettledFee', label: t('hqStatsMerchant.col.unsettledFee'), width: '132px' },
    { key: 'syncFail', label: t('hqStatsMerchant.col.syncFail'), width: '112px' },
    { key: 'growth', label: t('hqStatsMerchant.col.growth'), width: '108px' },
    { key: 'status', label: t('hqStatsMerchant.col.status'), width: '112px' },
    { key: 'detail', label: t('hqStatsMerchant.col.detail'), width: '96px' },
  ]

  const statusMeta: Record<MerchantStatStatus, { label: string; accent: 'green' | 'orange' | 'red' }> = {
    active: { label: t('hqStatsMerchant.status.active'), accent: 'green' },
    suspended: { label: t('hqStatsMerchant.status.suspended'), accent: 'orange' },
    blacklisted: { label: t('hqStatsMerchant.status.blacklisted'), accent: 'red' },
  }

  return {
    filters: { countryOptions, rangeOptions: RANGE_OPTIONS },
    isLoading,
    error,
    stats,
    columns,
    rows,
    rankingPanels: pageData.rankingPanels,
    statusMeta,
  }
}
