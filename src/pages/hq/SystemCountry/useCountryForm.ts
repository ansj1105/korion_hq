import { useTranslation } from '../../../i18n'

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
 * 국가 추가 폼의 기본 빈 상태를 반환한다. 상세 폼은 선택한 API row 값을 우선 사용한다.
 */
export function useCountryForm() {
  const { t } = useTranslation()
  const addFields: FieldRaw[] = [
    { labelKey: 'hqSystemCountry.add.field.name', value: '' },
    { labelKey: 'hqSystemCountry.add.field.code', value: '' },
    { labelKey: 'hqSystemCountry.add.field.regions', value: '' },
    { labelKey: 'hqSystemCountry.add.field.timezone', value: '' },
    { labelKey: 'hqSystemCountry.add.field.currency', value: '' },
    { labelKey: 'hqSystemCountry.add.field.language', value: '' },
    { labelKey: 'hqSystemCountry.add.field.leader', value: '' },
    { labelKey: 'hqSystemCountry.add.field.status', value: '' },
  ]
  const addToggles: ToggleRaw[] = [
    { labelKey: 'hqSystemCountry.add.field.paymentAllowed', on: false },
    { labelKey: 'hqSystemCountry.add.field.offlinePaymentAllowed', on: false },
  ]

  const fields = addFields.map((f) => ({
    label: t(f.labelKey),
    value: f.value,
  }))

  const toggles = addToggles.map((tg) => ({
    label: t(tg.labelKey),
    on: tg.on,
  }))

  return { fields, toggles, memo: '' }
}
