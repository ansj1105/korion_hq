import { useTranslation } from '../../../i18n'
import type { InfoDetailTone } from './useCollateralInfoDetail'
import data from './collateralSettleDetailData.json'

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
 * collateralSettleDetailData.json(더미)을 읽어 라벨만 번역해 반환한다.
 * Figma 시안이 단일 샘플이라 행과 무관하게 같은 내용을 보여준다 —
 * 추후 실 연동 시 이 훅이 정산 id를 받아 API 조회로 교체되면 오버레이는 그대로 동작한다.
 */
export function useCollateralSettleDetail() {
  const { t } = useTranslation()

  const fields = (data.fields as FieldRaw[]).map((f) => ({
    label: t(f.labelKey),
    value: f.value,
    newRow: f.newRow,
  }))

  return { fields, txRows: data.txRows as TxRow[] }
}
