import { useTranslation } from '../../../i18n'

export interface DetailField {
  label: string
  value: string
  placeholder?: string
}

interface FieldRaw {
  labelKey: string
  value: string
  placeholderKey?: string
}

/*
 * useApplicationDetail — 본사어드민 "제휴 / 투자 신청 상세" 데이터 훅
 * ------------------------------------------------------------------
 * 신청서 관리 목록의 "확인/검토/위험/삭제"에서 진입(Figma 1:16477 "제휴 / 투자 신청 상세").
 * 정적 샘플 신청 값을 노출하지 않는다. 실제 상세는 Applications 목록 행 overlay가 담당한다.
 */
export function useApplicationDetail() {
  const { t } = useTranslation()
  const toFields = (fields: FieldRaw[]): DetailField[] =>
    fields.map((f) => ({ label: t(f.labelKey), value: f.value, placeholder: f.placeholderKey ? t(f.placeholderKey) : undefined }))

  return {
    fields: toFields([]),
    textFields: toFields([]),
  }
}
