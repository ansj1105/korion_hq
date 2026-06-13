import { useTranslation } from '../../../i18n'
import type { MetricCardData } from '../../../components/molecules/MetricCard'
import data from './partnerNoticeSendData.json'

interface MetricRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
  chip: string
  chipSolid?: boolean
}

/*
 * usePartnerNoticeSend — 파트너 · 공지 보내기 상단 KPI 데이터 훅
 * ------------------------------------------------------------------
 * 리더와 달리 KPI 3개(발송 가능 파트너 카드 없음). 폼 UI 텍스트는 notice.send.* 재사용.
 */
export function usePartnerNoticeSend() {
  const { t } = useTranslation()

  const metrics: MetricCardData[] = (data.metrics as MetricRaw[]).map((m) => ({
    id: m.id,
    label: t(m.labelKey),
    value: m.value,
    note: m.noteKey ? t(m.noteKey) : undefined,
    chip: m.chip,
    chipSolid: m.chipSolid,
  }))

  return { metrics }
}
