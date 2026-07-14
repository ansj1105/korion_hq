import { useTranslation } from '../../../i18n'
import type { InfoDetailTone } from './useCollateralInfoDetail'

interface FieldRaw {
  labelKey: string
  value: string
  /** true면 2열 그리드에서 강제로 왼쪽 열(새 행)부터 시작 — Figma의 빈 칸 배치 재현용 */
  newRow?: boolean
}

/** 관련 거래 요약 행 — 값(거래 ID/일시/금액/상태)은 데이터라 번역하지 않는다(CLAUDE.md 11번). */
interface TxRow {
  id: string
  at: string
  payAmount: string
  receiveAmount: string
  status: string
  statusTone: InfoDetailTone
}

/*
 * useCollateralSettleDetail — "회원 정산 상세" 오버레이(Figma 81:29616) 데이터 훅
 * ------------------------------------------------------------------
 * 행 데이터가 없는 예외 상태에서 빈 상세를 반환한다.
 * 실제 오버레이 값은 CollateralHistory API 행 데이터를 사용한다.
 */
export function useCollateralSettleDetail() {
  const { t } = useTranslation()

  const fields = ([] as FieldRaw[]).map((f) => ({
    label: t(f.labelKey),
    value: f.value,
    newRow: f.newRow,
  }))

  return { fields, txRows: [] as TxRow[] }
}
