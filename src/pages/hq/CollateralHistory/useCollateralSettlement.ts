import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'

/*
 * useCollateralSettlement — "회원 정산 내역" 탭(Figma 81:21528) 데이터 훅
 * ------------------------------------------------------------------
 * 이 탭은 표와 함께 두 번째 안내 카드도 "PAY 수취금 정산 흐름"으로 바뀐다(카드는 페이지에서 처리).
 * 표 데이터는 useCollateralHistory의 /api/hq/collateral-history 응답을 사용하고,
 * 이 훅은 컬럼 라벨/폭만 제공한다.
 */
export function useCollateralSettlement() {
  const { t } = useTranslation()

  // 컬럼 폭은 Figma 실측 px(49/65/75/75/69/68/69/62/62/85/48/128)의 상대 비율
  const columns: Column[] = [
    { key: 'no', label: t('hqCollateral.settle.col.no'), width: '56px', align: 'center' },
    { key: 'settledAt', label: t('hqCollateral.settle.col.settledAt'), width: '126px' },
    { key: 'parentPartner', label: t('hqCollateral.settle.col.parentPartner'), width: '132px' },
    { key: 'ownCode', label: t('hqCollateral.settle.col.ownCode'), width: '148px' },
    { key: 'country', label: t('hqCollateral.col.country'), width: '110px' },
    { key: 'memberId', label: t('hqCollateral.col.memberId'), width: '116px' },
    { key: 'memberName', label: t('hqCollateral.col.memberName'), width: '128px' },
    { key: 'target', label: t('hqCollateral.settle.col.target'), width: '104px' },
    { key: 'amount', label: t('hqCollateral.settle.col.amount'), width: '116px' },
    { key: 'beforeAfter', label: t('hqCollateral.settle.col.beforeAfter'), width: '136px' },
    { key: 'status', label: t('hqCollateral.col.status'), width: '96px' },
    { key: 'action', label: t('hqCollateral.col.action'), width: '160px' },
  ]

  return { columns }
}
