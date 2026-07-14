import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import data from './collateralHistoryData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
  deltaTone?: 'cyan' | 'red'
  deltaPlain?: boolean
  dense?: boolean
  alignTop?: boolean
}

/** 행 데이터(회원명/코드/금액/유형·상태 enum 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과한다. */
interface HistoryRow {
  no: string
  processedAt: string
  code: string
  country: string
  memberId: string
  memberName: string
  type: string
  amount: string
  beforeAfter: string
  status: string
}

/*
 * useCollateralHistory — 본사어드민 "회원 담보금 충전 / 해제 내역" 데이터 훅
 * ------------------------------------------------------------------
 * collateralHistoryData.json(더미)을 읽어 UI 라벨(지표명/컬럼명)만 번역해 반환한다.
 * KPI 라벨은 전체 운영 대시보드와 동일한 항목(활성국가/담보금 잔액 등)이 많아
 * 기존 hqDashboard.kpi.* 키를 재사용한다. 추후 실 연동 시 이 훅 내부만
 * API 호출로 교체하면 CollateralHistory.tsx는 그대로 동작한다.
 */
export function useCollateralHistory() {
  const { t } = useTranslation()

  const kpis: StatCardData[] = (data.kpis as KpiRaw[]).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: k.noteKey ? t(k.noteKey) : undefined,
    deltaTone: k.deltaTone,
    deltaPlain: k.deltaPlain,
    dense: k.dense,
    alignTop: k.alignTop,
  }))

  // 컬럼 폭은 Figma 실측 px(49/65/75/69/68/69/46/62/85/48/128)의 상대 비율
  const columns: Column[] = [
    { key: 'no', label: t('hqCollateral.col.no'), width: '0.75fr' },
    { key: 'processedAt', label: t('hqCollateral.col.processedAt'), width: '1fr' },
    { key: 'code', label: t('hqCollateral.col.code'), width: '1.15fr' },
    { key: 'country', label: t('hqCollateral.col.country'), width: '1.05fr' },
    { key: 'memberId', label: t('hqCollateral.col.memberId'), width: '1.05fr' },
    { key: 'memberName', label: t('hqCollateral.col.memberName'), width: '1.05fr' },
    { key: 'type', label: t('hqCollateral.col.type'), width: '0.7fr' },
    { key: 'amount', label: t('hqCollateral.col.amount'), width: '0.95fr' },
    { key: 'beforeAfter', label: t('hqCollateral.col.beforeAfter'), width: '1.3fr' },
    { key: 'status', label: t('hqCollateral.col.status'), width: '0.75fr' },
    { key: 'action', label: t('hqCollateral.col.action'), width: '1.95fr' },
  ]

  return { kpis, columns, rows: data.history.rows as HistoryRow[] }
}
