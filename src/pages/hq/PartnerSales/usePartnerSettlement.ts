import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import data from './partnerSettlementData.json'

interface FieldRaw {
  labelKey: string
  value: string
  /** 강조 값 색 (예: 청록 #24e6b8) — JSON에서 지정 */
  color?: string
}

/** "정산내역" 탭 요약 항목 — 1행 5열 그리드(Figma 81:25829 실측, InfoGrid 4열과 달라 페이지에서 직접 렌더) */
export interface PartnerSettleSummaryItem {
  label: string
  value: string
  color?: string
}

/*
 * usePartnerSettlement — "파트너별 거래내역" 화면의 "정산내역" 탭 데이터 훅
 * ------------------------------------------------------------------
 * Figma 81:25829 기준: 1)정산 금액 요약(1행 5항목) → 2)보류·제외 거래 →
 * 정산 내역 표(리더 버전에서 "총 거래금액" 열이 빠진 8컬럼). 라벨은 문구가 같은
 * 기존 키(settle.detail.*, settle.hist.*, hqLeaderSales.settle.sec1)를 재사용.
 * 파일 분리 이유는 다른 탭과 동일 — 기존 훅의 API 연동 병렬 작업과 충돌 방지.
 */
export function usePartnerSettlement() {
  const { t } = useTranslation()

  const summary: PartnerSettleSummaryItem[] = (data.summary as FieldRaw[]).map((f) => ({
    label: t(f.labelKey),
    value: f.value,
    color: f.color,
  }))

  const heldColumns: Column[] = [
    { key: 'txNo', label: t('settle.detail.e.txNo'), width: '1fr' },
    { key: 'merchant', label: t('settle.detail.e.merchant'), width: '1.2fr' },
    { key: 'partner', label: t('settle.detail.e.partner'), width: '1.1fr' },
    { key: 'reason', label: t('settle.detail.e.reason'), width: '1.1fr' },
    { key: 'amount', label: t('settle.detail.e.amount'), width: '1fr' },
    { key: 'heldFee', label: t('settle.detail.e.heldFee'), width: '1fr' },
    { key: 'status', label: t('settle.detail.e.status'), width: '1fr' },
  ]

  const historyColumns: Column[] = [
    { key: 'no', label: t('settle.hist.col.no'), width: '1.4fr' },
    { key: 'appliedDate', label: t('settle.hist.col.appliedDate'), width: '1.1fr' },
    { key: 'period', label: t('settle.hist.col.period'), width: '1.2fr' },
    { key: 'partnerAmount', label: t('settle.hist.col.partnerAmount'), width: '1.1fr' },
    { key: 'held', label: t('settle.hist.col.held'), width: '0.9fr' },
    { key: 'status', label: t('settle.hist.col.status'), width: '1fr' },
    { key: 'paidDate', label: t('settle.hist.col.paidDate'), width: '1fr' },
    { key: 'action', label: t('settle.hist.col.action'), width: '0.8fr' },
  ]

  return {
    summary,
    heldColumns,
    heldRows: data.heldRows as Array<Record<string, string>>,
    historyColumns,
    historyRows: data.historyRows as Array<Record<string, string>>,
  }
}
