import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'
import type { AccentKey } from '../../../types'

export type HqCountryDashboardRange = 'ALL' | '1D' | '7D' | '14D' | '30D' | '90D' | '180D' | '365D'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  delta?: string
  note?: string
  noteKey?: string
  labelTone?: 'default' | 'amber' | 'green'
  deltaTone?: 'cyan' | 'red'
  deltaBadge?: boolean
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
  stats?: KpiRaw[]
  filters?: {
    countryOptions?: Array<{ value: string; label: string }>
    rangeOptions?: HqCountryDashboardRange[]
  }
  rankingPanels?: Array<{ id: string; titleKey: string; rows?: Array<{ rank: number; name: string; meta: string; amount: string }> }>
  countryOps?: {
    rows?: DashboardCountryOpsRow[]
  }
  rows?: DashboardCountryOpsRow[]
}

const emptyDashboardPayload: DashboardPayload = {
  kpis: [],
  stats: [],
  filters: {
    countryOptions: [{ value: 'all', label: '전체 국가' }],
    rangeOptions: ['ALL', '1D', '7D', '14D', '30D', '90D', '180D', '365D'],
  },
  rankingPanels: [],
  countryOps: {
    rows: [],
  },
  rows: [],
}

const rankingPanelDefaults = [
  { id: 'byCountry', titleKey: 'hqDashboard.ranking.byCountry' },
  { id: 'byLeader', titleKey: 'hqDashboard.ranking.byLeader' },
  { id: 'byPartner', titleKey: 'hqDashboard.ranking.byPartner' },
  { id: 'byMerchant', titleKey: 'hqDashboard.ranking.byMerchant' },
]

const rangeOptions: HqCountryDashboardRange[] = ['ALL', '1D', '7D', '14D', '30D', '90D', '180D', '365D']

interface UseCountryDashboardFilters {
  countryScope: string
  range: HqCountryDashboardRange
}

/*
 * useCountryDashboard — 본사어드민 "국가별 대시보드" 데이터 훅
 * ------------------------------------------------------------------
 * /api/hq/dashboard의 KPI/국가별 순위 집계를 사용한다. API 실패 시 샘플 JSON을 노출하지 않는다.
 */
export function useCountryDashboard({ countryScope, range }: UseCountryDashboardFilters) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useHqPageData<DashboardPayload>('/api/hq/dashboard', emptyDashboardPayload, {
    countryScope,
    range,
  })

  const countryOptions = data.filters?.countryOptions?.length
    ? data.filters.countryOptions
    : [
        { value: 'all', label: t('hqDashboard.filter.allCountries') },
        ...((data.countryOps?.rows ?? data.rows ?? []).map((row) => ({
          value: row.countryCode ?? row.id,
          label: row.country ?? row.countryCode ?? row.id,
        }))),
      ]
  const selectedCountryLabel = countryOptions.find((option) => option.value === countryScope)?.label
  const dashboardRows = data.countryOps?.rows ?? data.rows ?? []

  const kpis: StatCardData[] = (data.kpis ?? data.stats ?? []).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: countryScope !== 'all' && k.id === 'activeCountries' && selectedCountryLabel ? selectedCountryLabel : k.value,
    delta: k.delta ?? k.note ?? (k.noteKey ? t(k.noteKey) : undefined),
    labelTone: k.labelTone,
    deltaTone: k.deltaTone,
    deltaBadge: k.deltaBadge,
    dense: k.dense,
    alignTop: k.alignTop,
  }))

  const sourcePanels = new Map((data.rankingPanels ?? []).map((panel) => [panel.id, panel]))
  const rankingPanels = rankingPanelDefaults.map((fallback) => {
    const panel = sourcePanels.get(fallback.id)
    return {
      id: fallback.id,
      title: t(panel?.titleKey ?? fallback.titleKey),
      rows: panel?.rows ?? [],
    }
  })

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
    filters: {
      countryOptions,
      rangeOptions: data.filters?.rangeOptions?.length ? data.filters.rangeOptions : rangeOptions,
      selectedCountry: countryScope,
      selectedRange: range,
    },
    kpis,
    rankingPanels,
    countryRanking: {
      columns: countryRankingColumns,
      rows: dashboardRows.map((row, index): CountryRankingRow => ({
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
