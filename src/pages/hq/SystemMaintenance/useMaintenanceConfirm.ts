import { useTranslation } from '../../../i18n'

interface FieldRaw {
  labelKey: string
  value: string
}

/*
 * useMaintenanceConfirm — "서비스 점검 시작 확인" 모달 데이터 훅
 * ------------------------------------------------------------------
 * 고정 예시값을 노출하지 않는다. 실제 확인 값 연결 전까지 빈 계약을 반환한다.
 */
export function useMaintenanceConfirm() {
  const { t } = useTranslation()

  const fields = ([] as FieldRaw[]).map((f) => ({
    label: t(f.labelKey),
    value: f.value,
  }))

  return { fields }
}
