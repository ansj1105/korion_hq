import { useTranslation } from '../../../i18n'
import data from './collateralDetailData.json'

interface DetailFieldRaw {
  labelKey: string
  value: string
}

/*
 * useCollateralDetail — "담보금 충전 / 해제 상세" 오버레이 데이터 훅
 * ------------------------------------------------------------------
 * collateralDetailData.json(더미)을 읽어 필드 라벨만 번역해 반환한다.
 * 값(처리번호/금액/메모 등)은 데이터라 번역하지 않고 그대로 통과(CLAUDE.md 11번).
 * Figma 시안이 단일 샘플이라 행과 무관하게 같은 내용을 보여준다 —
 * 추후 실 연동 시 이 훅이 행 id를 받아 API 조회로 교체되면 오버레이는 그대로 동작한다.
 */
export function useCollateralDetail() {
  const { t } = useTranslation()

  const fields = (data.fields as DetailFieldRaw[]).map((f) => ({
    label: t(f.labelKey),
    value: f.value,
  }))

  return { fields, memo: data.memo }
}
