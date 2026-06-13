import { useTranslation } from '../../i18n'
import data from './settlementRequestData.json'

interface FieldRaw {
  labelKey: string
  value: string
}

/** 라벨/값 한 쌍 (정산 요청 카드의 요약 정보) */
export interface SettlementField {
  label: string
  value: string
}

/*
 * useSettlementRequest — 정산 신청 카드 데이터 훅
 * ------------------------------------------------------------------
 * 요약 필드의 라벨은 번역, 값은 데이터 그대로. 추후 API 연동 시 이 훅 내부만 교체.
 */
export function useSettlementRequest() {
  const { t } = useTranslation()

  const fields: SettlementField[] = (data.fields as FieldRaw[]).map((f) => ({
    label: t(f.labelKey),
    value: f.value,
  }))

  return { fields }
}
