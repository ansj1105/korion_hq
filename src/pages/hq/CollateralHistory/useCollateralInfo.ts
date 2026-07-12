import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import data from './collateralInfoData.json'

/** 행 데이터(회원명/코드/금액/날짜 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과한다. */
interface InfoRow {
  no: string
  adminCode: string
  country: string
  memberId: string
  memberName: string
  totalWallet: string
  availableWallet: string
  collateralBalance: string
  lastTopup: string
  lastPayment: string
}

/*
 * useCollateralInfo — "회원 담보금 정보" 탭(Figma 81:22038) 데이터 훅
 * ------------------------------------------------------------------
 * 화면 상단(KPI/안내 카드)은 충전/해제 내역 탭과 동일하고 표만 다르다.
 * collateralInfoData.json(더미)을 읽어 컬럼 라벨만 번역해 반환한다.
 */
export function useCollateralInfo() {
  const { t } = useTranslation()

  // 컬럼 폭은 Figma 실측 px(49/75/69/68/69/79/95/85/62/85/128)의 상대 비율
  const columns: Column[] = [
    { key: 'no', label: t('hqCollateral.col.no'), width: '0.75fr' },
    { key: 'adminCode', label: t('hqCollateral.detail.field.adminCode'), width: '1.15fr' },
    { key: 'country', label: t('hqCollateral.col.country'), width: '1.05fr' },
    { key: 'memberId', label: t('hqCollateral.col.memberId'), width: '1.05fr' },
    { key: 'memberName', label: t('hqCollateral.col.memberName'), width: '1.05fr' },
    { key: 'totalWallet', label: t('hqCollateral.col.totalWallet'), width: '1.2fr' },
    { key: 'availableWallet', label: t('hqCollateral.col.availableWallet'), width: '1.45fr' },
    { key: 'collateralBalance', label: t('hqCollateral.col.collateralBalance'), width: '1.3fr' },
    { key: 'lastTopup', label: t('hqCollateral.col.lastTopup'), width: '0.95fr' },
    { key: 'lastPayment', label: t('hqCollateral.col.lastPayment'), width: '1.3fr' },
    { key: 'action', label: t('hqCollateral.col.action'), width: '1.95fr' },
  ]

  return { columns, rows: data.rows as InfoRow[] }
}
