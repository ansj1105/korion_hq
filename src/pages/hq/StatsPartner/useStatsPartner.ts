import { useEffect, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { fetchHqPageData } from '../../../services/korionChongApi'

export type HqStatsPartnerRange = 'ALL' | '1D' | '7D' | '14D' | '30D' | '90D' | '180D' | '365D'
export type PartnerStatStatus = 'active' | 'suspended' | 'blacklisted'

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

export interface PartnerStatsRow {
  id: string
  no: string
  rank: string
  partnerCode: string
  partnerName: string
  leaderCode: string
  country: string
  subMerchantCount: string
  amount: string
  txCount: string
  partnerFee: string
  unsettledFee: string
  syncFail: string
  growth: string
  status: PartnerStatStatus
}

interface UseStatsPartnerFilters {
  countryScope: string
  range: HqStatsPartnerRange
}

interface StatsPartnerPageData {
  stats: StatRaw[]
  rows: PartnerStatsRow[]
  rankingPanels: RankingPanel[]
}

const RANGE_OPTIONS: HqStatsPartnerRange[] = ['ALL', '1D', '7D', '14D', '30D', '90D', '180D', '365D']
const EMPTY_STATS_PARTNER_DATA: StatsPartnerPageData = {
  stats: [],
  rows: [],
  rankingPanels: [],
}

export function useStatsPartner({ countryScope, range }: UseStatsPartnerFilters) {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState<StatsPartnerPageData>(EMPTY_STATS_PARTNER_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetchHqPageData<StatsPartnerPageData>('/api/hq/stats/partner', { countryScope, range })
      .then((response) => {
        if (!cancelled) setPageData(response)
      })
      .catch((requestError) => {
        if (!cancelled) {
          setPageData(EMPTY_STATS_PARTNER_DATA)
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
    { key: 'no', label: t('hqStatsPartner.col.no'), width: '72px', align: 'center' },
    { key: 'partnerCode', label: t('hqStatsPartner.col.partnerCode'), width: '136px' },
    { key: 'partnerName', label: t('hqStatsPartner.col.partnerName'), width: '148px' },
    { key: 'leaderCode', label: t('hqStatsPartner.col.leaderCode'), width: '132px' },
    { key: 'country', label: t('hqStatsPartner.col.country'), width: '104px' },
    { key: 'subMerchantCount', label: t('hqStatsPartner.col.subMerchantCount'), width: '132px' },
    { key: 'amount', label: t('hqStatsPartner.col.amount'), width: '144px' },
    { key: 'txCount', label: t('hqStatsPartner.col.txCount'), width: '116px' },
    { key: 'partnerFee', label: t('hqStatsPartner.col.partnerFee'), width: '128px' },
    { key: 'unsettledFee', label: t('hqStatsPartner.col.unsettledFee'), width: '132px' },
    { key: 'syncFail', label: t('hqStatsPartner.col.syncFail'), width: '112px' },
    { key: 'growth', label: t('hqStatsPartner.col.growth'), width: '108px' },
    { key: 'status', label: t('hqStatsPartner.col.status'), width: '112px' },
    { key: 'detail', label: t('hqStatsPartner.col.detail'), width: '96px' },
  ]

  const statusMeta: Record<PartnerStatStatus, { label: string; accent: 'green' | 'orange' | 'red' }> = {
    active: { label: t('hqStatsPartner.status.active'), accent: 'green' },
    suspended: { label: t('hqStatsPartner.status.suspended'), accent: 'orange' },
    blacklisted: { label: t('hqStatsPartner.status.blacklisted'), accent: 'red' },
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
