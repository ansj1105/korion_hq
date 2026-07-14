import { useTranslation } from '../../../i18n'

interface DetailFieldRaw {
  labelKey: string
  value: string
}

/*
 * useCollateralDetail — "담보금 충전 / 해제 상세" 오버레이 데이터 훅
 * ------------------------------------------------------------------
 * 행 데이터가 없는 예외 상태에서 빈 상세를 반환한다.
 * 실제 오버레이 값은 CollateralHistory API 행 데이터를 사용한다.
 */
export function useCollateralDetail() {
  const { t } = useTranslation()

  const fields = ([] as DetailFieldRaw[]).map((f) => ({
    label: t(f.labelKey),
    value: f.value,
  }))

  return { fields, memo: '' }
}
