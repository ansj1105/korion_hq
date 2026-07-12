import { useTranslation } from '../../../i18n'
import data from './errorCodeFormData.json'

interface FieldRaw {
  labelKey: string
  value: string
}

/*
 * useErrorCodeForm — "오류 코드 추가" 폼 오버레이 데이터 훅
 * ------------------------------------------------------------------
 * errorCodeFormData.json(더미 예시값)을 읽어 UI 라벨만 번역해 반환한다.
 * 예시값(SYNC_FAILED/주의/활성 등)은 데이터라 번역하지 않는다(CLAUDE.md 11번).
 * 추후 실 연동 시 이 훅 내부만 교체하면 ErrorCodeFormOverlay는 그대로 동작한다.
 */
export function useErrorCodeForm() {
  const { t } = useTranslation()

  const fields = (data.fields as FieldRaw[]).map((f) => ({
    label: t(f.labelKey),
    value: f.value,
  }))

  return { fields }
}
