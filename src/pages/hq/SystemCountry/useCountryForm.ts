import { useTranslation } from '../../../i18n'
import data from './countryFormData.json'

interface FieldRaw {
  labelKey: string
  value: string
}

interface ToggleRaw {
  labelKey: string
  on: boolean
}

/*
 * useCountryForm — 국가 등록/상세 폼 오버레이 데이터 훅
 * ------------------------------------------------------------------
 * countryFormData.json(더미 예시값)을 읽어 UI 라벨만 번역해 반환한다.
 * 두 시안(국가 추가 81:29739 / 국가 상세정보 81:29865)의 필드·예시값이 동일해 공유한다.
 * 예시값(Nigeria/NG/활성 등)은 데이터라 번역하지 않는다(CLAUDE.md 11번).
 * 추후 실 연동 시 이 훅 내부만 교체하면 CountryFormOverlay는 그대로 동작한다.
 */
export function useCountryForm() {
  const { t } = useTranslation()

  const fields = (data.fields as FieldRaw[]).map((f) => ({
    label: t(f.labelKey),
    value: f.value,
  }))

  const toggles = (data.toggles as ToggleRaw[]).map((tg) => ({
    label: t(tg.labelKey),
    on: tg.on,
  }))

  return { fields, toggles, memo: data.memo }
}
