import { useEffect, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { fetchHqPageData } from '../../../services/korionChongApi'

export type HqStatsCountryRange = 'ALL' | '1D' | '7D' | '14D' | '30D' | '90D' | '180D' | '365D'
export type CountryStatStatus = 'active' | 'attention' | 'idle'

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

export interface CountryStatsRow {
  id: string
  no: string
  rank: string
  country: string
  countryCode: string
  leaders: string
  partners: string
  merchants: string
  members: string
  amount: string
  syncFail: string
  growth: string
  status: CountryStatStatus
}

export interface HeatmapItem {
  code: string
  rank: string
  amount: string
  syncFail: string
  growth: string
  intensity: number
}

interface UseStatsCountryFilters {
  countryScope: string
  range: HqStatsCountryRange
}

interface StatsCountryPageData {
  stats: StatRaw[]
  rows: CountryStatsRow[]
  rankingPanels: RankingPanel[]
  heatmap: HeatmapItem[]
}

const RANGE_OPTIONS: HqStatsCountryRange[] = ['ALL', '1D', '7D', '14D', '30D', '90D', '180D', '365D']
const EMPTY_STATS_COUNTRY_DATA: StatsCountryPageData = {
  stats: [],
  rows: [],
  rankingPanels: [],
  heatmap: [],
}

export function useStatsCountry({ countryScope, range }: UseStatsCountryFilters) {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState<StatsCountryPageData>(EMPTY_STATS_COUNTRY_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetchHqPageData<StatsCountryPageData>('/api/hq/stats/country', { countryScope, range })
      .then((response) => {
        if (!cancelled) setPageData(response)
      })
      .catch((requestError) => {
        if (!cancelled) {
          setPageData(EMPTY_STATS_COUNTRY_DATA)
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
    ...rows.map((row) => ({ value: row.countryCode, label: row.countryCode })),
  ]

  const stats: StatCardData[] = pageData.stats.map((stat) => ({
    id: stat.id,
    label: t(stat.labelKey),
    value: stat.value,
    delta: stat.delta ?? (stat.deltaKey ? t(stat.deltaKey) : undefined),
    deltaBadge: stat.deltaBadge,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqStatsCountry.col.no'), width: '72px', align: 'center' },
    { key: 'countryCode', label: t('hqStatsCountry.col.countryCode'), width: '112px' },
    { key: 'leaders', label: t('hqStatsCountry.col.leaders'), width: '112px' },
    { key: 'partners', label: t('hqStatsCountry.col.partners'), width: '116px' },
    { key: 'merchants', label: t('hqStatsCountry.col.merchants'), width: '124px' },
    { key: 'members', label: t('hqStatsCountry.col.members'), width: '116px' },
    { key: 'amount', label: t('hqStatsCountry.col.amount'), width: '140px' },
    { key: 'syncFail', label: t('hqStatsCountry.col.syncFail'), width: '116px' },
    { key: 'growth', label: t('hqStatsCountry.col.growth'), width: '108px' },
    { key: 'status', label: t('hqStatsCountry.col.status'), width: '112px' },
    { key: 'detail', label: t('hqStatsCountry.col.detail'), width: '96px' },
  ]

  const statusMeta: Record<CountryStatStatus, { label: string; accent: 'cyan' | 'orange' | 'green' }> = {
    active: { label: t('hqStatsCountry.status.active'), accent: 'green' },
    attention: { label: t('hqStatsCountry.status.attention'), accent: 'orange' },
    idle: { label: t('hqStatsCountry.status.idle'), accent: 'cyan' },
  }

  return {
    filters: {
      countryOptions,
      rangeOptions: RANGE_OPTIONS,
    },
    isLoading,
    error,
    stats,
    columns,
    rows,
    rankingPanels: pageData.rankingPanels,
    heatmap: pageData.heatmap,
    statusMeta,
  }
}
