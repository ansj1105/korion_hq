import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import data from './collateralSettlementData.json'

/** 행 데이터(코드/금액/날짜/상태 enum 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과한다. */
interface SettlementRow {
  no: string
  settledAt: string
  parentPartner: string
  ownCode: string
  country: string
  memberId: string
  memberName: string
  target: string
  amount: string
  beforeAfter: string
  status: string
}

/*
 * useCollateralSettlement — "회원 정산 내역" 탭(Figma 81:21528) 데이터 훅
 * ------------------------------------------------------------------
 * 이 탭은 표와 함께 두 번째 안내 카드도 "PAY 수취금 정산 흐름"으로 바뀐다(카드는 페이지에서 처리).
 * collateralSettlementData.json(더미)을 읽어 컬럼 라벨만 번역해 반환한다.
 */
export function useCollateralSettlement() {
  const { t } = useTranslation()

  // 컬럼 폭은 Figma 실측 px(49/65/75/75/69/68/69/62/62/85/48/128)의 상대 비율
  const columns: Column[] = [
    { key: 'no', label: t('hqCollateral.settle.col.no'), width: '0.75fr' },
    { key: 'settledAt', label: t('hqCollateral.settle.col.settledAt'), width: '1fr' },
    { key: 'parentPartner', label: t('hqCollateral.settle.col.parentPartner'), width: '1.15fr' },
    { key: 'ownCode', label: t('hqCollateral.settle.col.ownCode'), width: '1.15fr' },
    { key: 'country', label: t('hqCollateral.col.country'), width: '1.05fr' },
    { key: 'memberId', label: t('hqCollateral.col.memberId'), width: '1.05fr' },
    { key: 'memberName', label: t('hqCollateral.col.memberName'), width: '1.05fr' },
    { key: 'target', label: t('hqCollateral.settle.col.target'), width: '0.95fr' },
    { key: 'amount', label: t('hqCollateral.settle.col.amount'), width: '0.95fr' },
    { key: 'beforeAfter', label: t('hqCollateral.settle.col.beforeAfter'), width: '1.3fr' },
    { key: 'status', label: t('hqCollateral.col.status'), width: '0.75fr' },
    { key: 'action', label: t('hqCollateral.col.action'), width: '1.95fr' },
  ]

  return { columns, rows: data.rows as SettlementRow[] }
}
