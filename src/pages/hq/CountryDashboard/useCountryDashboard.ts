import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import data from './countryDashboardData.json'

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

/** countryDashboardData.json의 행 데이터(국가명/코드/금액 등)는 CLAUDE.md 11번 규칙상 그대로 통과한다. */
interface CountryRankingRow {
  id: string
  country: string
  countryCode: string
  totalMembers: string
  leaders: string
  partners: string
  merchants: string
  monthlyAmount: string
  monthlyCount: string
  status: string
}

/*
 * useCountryDashboard — 본사어드민 "국가별 대시보드" 데이터 훅
 * ------------------------------------------------------------------
 * countryDashboardData.json(더미)을 읽어 UI 라벨(지표명/컬럼명)은 번역해 반환한다.
 * 행 데이터(국가명/코드/금액 등)는 번역하지 않고 그대로 통과.
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체하면 CountryDashboard.tsx는 그대로 동작한다.
 */
export function useCountryDashboard() {
  const { t } = useTranslation()

  const kpis: StatCardData[] = (data.kpis as KpiRaw[]).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: k.noteKey ? t(k.noteKey) : undefined,
    labelTone: k.labelTone,
    deltaTone: k.deltaTone,
    dense: k.dense,
    alignTop: k.alignTop,
  }))

  const rankingPanels = data.rankingPanels.map((p) => ({ id: p.id, title: t(p.titleKey) }))

  const countryRankingColumns: Column[] = [
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
      rows: data.countryRanking.rows as CountryRankingRow[],
    },
  }
}
