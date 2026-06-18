import { useTranslation } from '../../../i18n'
import type { AccentKey } from '../../../types'
import type { KpiCardData } from '../../../components/molecules/KpiCard'
import { useMerchantPageData } from '../../../hooks/useMerchantPageData'
import data from './merchantDashboardData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  delta?: string
  tag?: string
  accent: string
}

/*
 * useMerchantDashboard — 가맹점 · 매장 운영 대시보드 데이터 훅
 * ------------------------------------------------------------------
 * KPI 라벨만 번역, 값/증감/태그는 데이터 그대로(리더·파트너 대시보드와 동일 패턴).
 */
export function useMerchantDashboard() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useMerchantPageData('/api/merchant/dashboard', data)

  const kpis: KpiCardData[] = (pageData.kpis as KpiRaw[]).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: k.delta,
    tag: k.tag,
    accent: k.accent as AccentKey,
  }))

  return { kpis, isLoading, error }
}
