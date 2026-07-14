import { useTranslation } from '../../../i18n'

interface FieldRaw {
  labelKey: string
  value: string
}

/*
 * useErrorCodeForm — "오류 코드 추가" 폼 오버레이 데이터 훅
 * ------------------------------------------------------------------
 * 오류 코드 추가 폼의 빈 기본 상태를 반환한다.
 */
export function useErrorCodeForm() {
  const { t } = useTranslation()
  const addFields: FieldRaw[] = [
    { labelKey: 'hqSystemErrorCode.add.field.code', value: '' },
    { labelKey: 'hqSystemErrorCode.add.field.name', value: '' },
    { labelKey: 'hqSystemErrorCode.add.field.category', value: '' },
    { labelKey: 'hqSystemErrorCode.add.field.severity', value: '' },
    { labelKey: 'hqSystemErrorCode.add.field.userMessage', value: '' },
    { labelKey: 'hqSystemErrorCode.add.field.adminDesc', value: '' },
    { labelKey: 'hqSystemErrorCode.add.field.autoAction', value: '' },
    { labelKey: 'hqSystemErrorCode.add.field.status', value: '' },
    { labelKey: 'hqSystemErrorCode.add.field.memo', value: '' },
  ]

  const fields = addFields.map((f) => ({
    label: t(f.labelKey),
    value: f.value,
  }))

  return { fields }
}
