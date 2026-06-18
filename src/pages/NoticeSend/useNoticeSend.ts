import { useTranslation } from '../../i18n'
import type { MetricCardData } from '../../components/molecules/MetricCard'
import { useLeaderPageData } from '../../hooks/useLeaderPageData'
import data from './noticeSendData.json'

/** JSON의 KPI 원본 */
interface MetricRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
  chip: string
  chipSolid?: boolean
}

/*
 * useNoticeSend — 알림/공지 · 공지 보내기 상단 KPI 데이터 훅
 * ------------------------------------------------------------------
 * 폼의 라벨/플레이스홀더 등은 모두 UI 텍스트라 화면에서 t()로 직접 출력하고,
 * 데이터성(발송 가능 수 등) KPI만 이 훅이 제공한다.
 */
export function useNoticeSend() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useLeaderPageData('/api/leader/notices/send-summary', data)

  const metrics: MetricCardData[] = (pageData.metrics as MetricRaw[]).map((m) => ({
    id: m.id,
    label: t(m.labelKey),
    value: m.value,
    note: m.noteKey ? t(m.noteKey) : undefined,
    chip: m.chip,
    chipSolid: m.chipSolid,
  }))

  return { metrics, isLoading, error }
}
