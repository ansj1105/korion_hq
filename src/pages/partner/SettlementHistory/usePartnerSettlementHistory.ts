import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import { usePartnerPageData } from '../../../hooks/usePartnerPageData'
import data from './partnerSettlementHistoryData.json'

/** 파트너 정산 내역 행 (리더와 달리 '리더 신청금액' 열이 없음) */
export interface PartnerSettlementHistoryRow {
  no: string
  appliedDate: string
  period: string
  totalAmount: string
  partnerAmount: string
  held: string
  status: string
  paidDate: string
}

/*
 * usePartnerSettlementHistory — 파트너 · 정산 내역 데이터 훅
 * ------------------------------------------------------------------
 * 리더 정산 내역과 구조 동일하나 컬럼이 하나 적다(리더 신청금액 열 없음).
 * UI 라벨/탭은 리더와 동일 문구라 settle.hist.* 키를 그대로 재사용.
 */
export function usePartnerSettlementHistory() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = usePartnerPageData('/api/partner/settlements', data)

  const columns: Column[] = [
    { key: 'no', label: t('settle.hist.col.no'), width: '1.4fr' },
    { key: 'appliedDate', label: t('settle.hist.col.appliedDate'), width: '1fr' },
    { key: 'period', label: t('settle.hist.col.period'), width: '1.4fr' },
    { key: 'totalAmount', label: t('settle.hist.col.totalAmount'), width: '1.1fr' },
    { key: 'partnerAmount', label: t('settle.hist.col.partnerAmount'), width: '1.1fr' },
    { key: 'held', label: t('settle.hist.col.held'), width: '0.9fr' },
    { key: 'status', label: t('settle.hist.col.status'), width: '1fr' },
    { key: 'paidDate', label: t('settle.hist.col.paidDate'), width: '1fr' },
    { key: 'action', label: t('settle.hist.col.action'), width: '0.8fr' },
  ]

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
    rows: pageData.rows as PartnerSettlementHistoryRow[],
    isLoading,
    error,
  }
}
