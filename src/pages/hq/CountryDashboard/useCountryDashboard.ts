import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'
import type { AccentKey } from '../../../types'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
  labelTone?: 'default' | 'amber' | 'green'
  deltaTone?: 'cyan' | 'red'
  dense?: boolean
  alignTop?: boolean
}

/** 국가명/코드/금액 등 API 데이터 값은 그대로 표시한다. */
interface CountryRankingRow {
  id: string
  rank: string
  country: string
  countryCode: string
  totalMembers: string
  leaders: string
  partners: string
  merchants: string
  monthlyAmount: string
  monthlyCount: string
  status: string
  statusAccent: AccentKey
}

interface DashboardCountryOpsRow {
  rank?: string
  id: string
  country?: string
  countryCode?: string
  leaders?: string
  partners?: string
  merchants?: string
  members?: string
  amount?: string
  monthlyAmount?: string
  monthlyCount?: string
  status?: string
  statusAccent?: AccentKey
}

interface DashboardPayload {
  kpis?: KpiRaw[]
  rankingPanels?: Array<{ id: string; titleKey: string }>
  countryOps?: {
    rows?: DashboardCountryOpsRow[]
  }
}

const emptyDashboardPayload: DashboardPayload = {
  kpis: [],
  rankingPanels: [],
  countryOps: {
    rows: [],
  },
}

/*
 * useCountryDashboard — 본사어드민 "국가별 대시보드" 데이터 훅
 * ------------------------------------------------------------------
 * /api/hq/dashboard의 countryOps 집계만 사용한다. API 실패 시 샘플 JSON을 노출하지 않는다.
 */
export function useCountryDashboard() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useHqPageData<DashboardPayload>('/api/hq/dashboard', emptyDashboardPayload, {
    countryScope: 'all',
    range: '30D',
  })

  const kpis: StatCardData[] = (data.kpis ?? []).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: k.noteKey ? t(k.noteKey) : undefined,
    labelTone: k.labelTone,
    deltaTone: k.deltaTone,
    dense: k.dense,
    alignTop: k.alignTop,
  }))

  const rankingPanels = (data.rankingPanels ?? []).map((p) => ({ id: p.id, title: t(p.titleKey) }))

  const countryRankingColumns: Column[] = [
    { key: 'rank', label: t('hqDashboard.countryOps.col.rank'), width: '0.7fr' },
    { key: 'country', label: t('hqCountryDashboard.table.col.country'), width: '1.4fr' },
    { key: 'countryCode', label: t('hqCountryDashboard.table.col.countryCode'), width: '1fr' },
    { key: 'totalMembers', label: t('hqCountryDashboard.table.col.totalMembers'), width: '1fr' },
    { key: 'leaders', label: t('hqCountryDashboard.table.col.leaders'), width: '0.7fr' },
    { key: 'partners', label: t('hqCountryDashboard.table.col.partners'), width: '1.2fr' },
    { key: 'merchants', label: t('hqCountryDashboard.table.col.merchants'), width: '1.2fr' },
    { key: 'monthlyAmount', label: t('hqCountryDashboard.table.col.monthlyAmount'), width: '1.5fr' },
    { key: 'monthlyCount', label: t('hqCountryDashboard.table.col.monthlyCount'), width: '1.5fr' },
    { key: 'status', label: t('hqCountryDashboard.table.col.status'), width: '1.2fr' },
  ]

  return {
    kpis,
    rankingPanels,
    countryRanking: {
      columns: countryRankingColumns,
      rows: (data.countryOps?.rows ?? []).map((row, index): CountryRankingRow => ({
        id: row.id,
        rank: row.rank ?? String(index + 1),
        country: row.country ?? row.id,
        countryCode: row.countryCode ?? row.id,
        totalMembers: row.members ?? '0',
        leaders: row.leaders ?? '0',
        partners: row.partners ?? '0',
        merchants: row.merchants ?? '0',
        monthlyAmount: row.monthlyAmount ?? row.amount ?? '0',
        monthlyCount: row.monthlyCount ?? '-',
        status: row.status ?? (index >= 0 ? '활성' : '-'),
        statusAccent: row.statusAccent ?? 'green',
      })),
    },
    isLoading,
    error,
  }
}
