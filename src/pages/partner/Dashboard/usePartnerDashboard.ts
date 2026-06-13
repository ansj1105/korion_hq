import { useTranslation } from '../../../i18n'
import type { AccentKey } from '../../../types'
import type { KpiCardData } from '../../../components/molecules/KpiCard'
import data from './partnerDashboardData.json'

/** JSON 원본 KPI 형태 (라벨은 i18n 키, 값·증감·태그는 데이터) */
interface KpiRaw {
  id: string
  labelKey: string
  value: string
  delta?: string
  tag?: string
  accent: string
}

/*
 * usePartnerDashboard — 파트너 · 내 가맹점 대시보드 데이터 훅
 * ------------------------------------------------------------------
 * KPI 라벨만 번역하고 값/증감/태그는 데이터 그대로 반환(리더 대시보드와 동일 패턴).
 * 추후 실데이터 연동 시 이 훅 내부만 API로 교체하면 화면은 그대로 동작한다.
 */
export function usePartnerDashboard() {
  const { t } = useTranslation()

  const kpis: KpiCardData[] = (data.kpis as KpiRaw[]).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: k.delta,
    tag: k.tag,
    accent: k.accent as AccentKey,
  }))

  return { kpis }
}
