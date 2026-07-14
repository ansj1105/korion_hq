import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'

/*
 * useCollateralInfo — "회원 담보금 정보" 탭(Figma 81:22038) 데이터 훅
 * ------------------------------------------------------------------
 * 화면 상단(KPI/안내 카드)은 충전/해제 내역 탭과 동일하고 표만 다르다.
 * 표 데이터는 useCollateralHistory의 /api/hq/collateral-history 응답을 사용하고,
 * 이 훅은 컬럼 라벨/폭만 제공한다.
 */
export function useCollateralInfo() {
  const { t } = useTranslation()

  // 컬럼 폭은 Figma 실측 px(49/75/69/68/69/79/95/85/62/85/128)의 상대 비율
  const columns: Column[] = [
    { key: 'no', label: t('hqCollateral.col.no'), width: '56px', align: 'center' },
    { key: 'adminCode', label: t('hqCollateral.detail.field.adminCode'), width: '132px' },
    { key: 'country', label: t('hqCollateral.col.country'), width: '110px' },
    { key: 'memberId', label: t('hqCollateral.col.memberId'), width: '116px' },
    { key: 'memberName', label: t('hqCollateral.col.memberName'), width: '128px' },
    { key: 'totalWallet', label: t('hqCollateral.col.totalWallet'), width: '132px' },
    { key: 'availableWallet', label: t('hqCollateral.col.availableWallet'), width: '168px' },
    { key: 'collateralBalance', label: t('hqCollateral.col.collateralBalance'), width: '146px' },
    { key: 'lastTopup', label: t('hqCollateral.col.lastTopup'), width: '116px' },
    { key: 'lastPayment', label: t('hqCollateral.col.lastPayment'), width: '126px' },
    { key: 'action', label: t('hqCollateral.col.action'), width: '220px' },
  ]

  return { columns }
}
