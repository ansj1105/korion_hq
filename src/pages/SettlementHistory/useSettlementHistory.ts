import { useTranslation } from '../../i18n'
import type { Column } from '../../components/organisms/DataTable'
import { useRolePageData } from '../../hooks/useRolePageData'
import data from './settlementHistoryData.json'

/** 정산 내역 행 원본 데이터 형태 */
export interface SettlementHistoryRow {
  no: string
  appliedDate: string
  period: string
  totalAmount: string
  leaderAmount: string
  partnerAmount: string
  held: string
  status: string
  paidDate: string
}

/*
 * useSettlementHistory — 정산 내역 데이터 훅
 * ------------------------------------------------------------------
 * 상단 요약(마지막 정산일/이번 요청액) + 테이블. UI 라벨은 번역, 값은 데이터.
 */
export function useSettlementHistory() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useRolePageData(
    {
      leader: '/api/leader/settlements',
      merchant: '/api/merchant/settlements',
    },
    data
  )

  const columns: Column[] = [
    { key: 'no', label: t('settle.hist.col.no'), width: '1.4fr' },
    { key: 'appliedDate', label: t('settle.hist.col.appliedDate'), width: '1fr' },
    { key: 'period', label: t('settle.hist.col.period'), width: '1.4fr' },
    { key: 'totalAmount', label: t('settle.hist.col.totalAmount'), width: '1.1fr' },
    { key: 'leaderAmount', label: t('settle.hist.col.leaderAmount'), width: '1fr' },
    { key: 'partnerAmount', label: t('settle.hist.col.partnerAmount'), width: '1fr' },
    { key: 'held', label: t('settle.hist.col.held'), width: '0.9fr' },
    { key: 'status', label: t('settle.hist.col.status'), width: '1fr' },
    { key: 'paidDate', label: t('settle.hist.col.paidDate'), width: '1fr' },
    { key: 'action', label: t('settle.hist.col.action'), width: '0.8fr' },
  ]

  // 상태 필터 탭 라벨
  const tabs = [
    t('settle.hist.tab.review'),
    t('settle.hist.tab.paid'),
    t('settle.hist.tab.held'),
    t('settle.hist.tab.rejected'),
  ]

  return {
    lastSettleDate: pageData.lastSettleDate,
    thisRequestAmount: pageData.thisRequestAmount,
    tabs,
    columns,
    rows: pageData.rows as SettlementHistoryRow[],
    isLoading,
    error,
  }
}
