import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { fetchHqPageData } from '../../../services/korionChongApi'

export type HqStatsPaymentMethodRange = 'ALL' | '1D' | '7D' | '14D' | '30D' | '90D' | '180D' | '365D'

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

export interface PaymentMethodDonut {
  id: string
  labelKey: string
  label?: string
  pct: number
  accent: 'cyan' | 'purple' | 'green' | 'orange'
}

export interface PaymentMethodStatsRow {
  id: string
  rank: number
  rawCount: number
  rawSuccessCount: number
  rawFailCount: number
  rawSyncCount: number
  count: string
  successRate: string
  failRate: string
  avgApprove: string
  sync: string
  syncAccent?: 'green' | 'blue' | 'orange' | 'red'
  failReason: string
}

interface UseStatsPaymentMethodFilters {
  countryScope: string
  range: HqStatsPaymentMethodRange
}

interface StatsPaymentMethodPageData {
  stats: StatRaw[]
  rows: PaymentMethodStatsRow[]
  rankingPanels: RankingPanel[]
  donut: PaymentMethodDonut[]
  countryOptions?: string[]
}

const RANGE_OPTIONS: HqStatsPaymentMethodRange[] = ['ALL', '1D', '7D', '14D', '30D', '90D', '180D', '365D']
const EMPTY_STATS_PAYMENT_METHOD_DATA: StatsPaymentMethodPageData = {
  stats: [],
  rows: [],
  rankingPanels: [],
  donut: [],
  countryOptions: ['all'],
}

export function useStatsPaymentMethod({ countryScope, range }: UseStatsPaymentMethodFilters) {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState<StatsPaymentMethodPageData>(EMPTY_STATS_PAYMENT_METHOD_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetchHqPageData<StatsPaymentMethodPageData>('/api/hq/stats/payment-method', { countryScope, range })
      .then((response) => {
        if (!cancelled) setPageData(response)
      })
      .catch((requestError) => {
        if (!cancelled) {
          setPageData(EMPTY_STATS_PAYMENT_METHOD_DATA)
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

  const stats: StatCardData[] = pageData.stats.map((stat) => ({
    id: stat.id,
    label: t(stat.labelKey),
    value: stat.value,
    delta: stat.delta ?? (stat.deltaKey ? t(stat.deltaKey) : undefined),
    deltaBadge: stat.deltaBadge,
  }))

  const columns: Column[] = [
    { key: 'id', label: t('hqStatsPaymentMethod.col.method'), width: '120px' },
    { key: 'count', label: t('hqStatsPaymentMethod.col.count'), width: '116px' },
    { key: 'successRate', label: t('hqStatsPaymentMethod.col.successRate'), width: '124px' },
    { key: 'failRate', label: t('hqStatsPaymentMethod.col.failRate'), width: '124px' },
    { key: 'avgApprove', label: t('hqStatsPaymentMethod.col.avgApprove'), width: '124px' },
    { key: 'sync', label: t('hqStatsPaymentMethod.col.sync'), width: '136px' },
    { key: 'failReason', label: t('hqStatsPaymentMethod.col.failReason'), width: '180px' },
  ]

  const donut = useMemo(
    () => pageData.donut.map((segment) => ({ ...segment, label: t(segment.labelKey) })),
    [pageData.donut, t],
  )

  const countryOptions = (pageData.countryOptions ?? ['all']).map((value) => ({
    value,
    label: value === 'all' ? t('hqDashboard.filter.allCountries') : value,
  }))

  return {
    filters: { countryOptions, rangeOptions: RANGE_OPTIONS },
    isLoading,
    error,
    stats,
    columns,
    rows: pageData.rows,
    rankingPanels: pageData.rankingPanels,
    donut,
  }
}
