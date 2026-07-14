import { useTranslation } from '../../../i18n'
import data from './maintenanceConfirmData.json'

interface FieldRaw {
  labelKey: string
  value: string
}

/*
 * useMaintenanceConfirm — "서비스 점검 시작 확인" 모달 데이터 훅
 * ------------------------------------------------------------------
 * maintenanceConfirmData.json(더미 예시값)을 읽어 UI 라벨만 번역해 반환한다.
 * 예시값(기능별 점검/즉시/HQ Mina 등)은 데이터라 번역하지 않는다(CLAUDE.md 11번).
 * 추후 실 연동 시 이 훅 내부만 교체하면 MaintenanceConfirmOverlay는 그대로 동작한다.
 */
export function useMaintenanceConfirm() {
  const { t } = useTranslation()

  const fields = (data.fields as FieldRaw[]).map((f) => ({
    label: t(f.labelKey),
    value: f.value,
  }))

  return { fields }
}
