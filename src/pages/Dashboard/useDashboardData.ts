import { useTranslation } from '../../i18n'
import type { AccentKey } from '../../types'
import type { KpiCardData } from '../../components/molecules/KpiCard'
import data from './dashboardData.json'

/** JSON 원본 KPI 형태 (라벨은 i18n 키로 저장) */
interface KpiRaw {
  id: string
  labelKey: string
  value: string
  delta?: string
  tag?: string
  accent: string
}

/*
 * useDashboardData — 대시보드 데이터 훅
 * ------------------------------------------------------------------
 * dashboardData.json(하드코딩)을 읽어, KPI 라벨은 현재 언어로 번역해서 반환한다.
 * (값·증감·태그는 데이터/enum이라 그대로 둔다)
 * 추후 실데이터 연동 시 이 훅 내부만 API 호출로 교체하면 화면은 그대로 동작한다.
 */
export function useDashboardData() {
  const { t } = useTranslation()

  const kpis: KpiCardData[] = (data.kpis as KpiRaw[]).map((k) => ({
    id: k.id,
    label: t(k.labelKey), // UI 라벨만 번역
    value: k.value,
    delta: k.delta,
    tag: k.tag,
    accent: k.accent as AccentKey,
  }))

  return { kpis }
}
