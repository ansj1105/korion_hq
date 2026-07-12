import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import data from './merchantSettlementData.json'

interface FieldRaw {
  labelKey: string
  value: string
  /** 강조 값 색 (예: 청록 #24e6b8) — JSON에서 지정 */
  color?: string
}

/** "정산내역" 탭 요약 항목 — 1행 5열 그리드(Figma 81:26833 실측) */
export interface MerchantSettleSummaryItem {
  label: string
  value: string
  color?: string
}

/*
 * useMerchantSettlement — "가맹점 거래내역" 화면의 "정산내역" 탭 데이터 훅
 * ------------------------------------------------------------------
 * Figma 81:26833 기준: 1)정산 금액 요약(1행 5항목) → 2)보류·제외 거래 →
 * 하단 "정산 내역" 표(파트너 상세 81:25829와 동일 구성 — 사용자 확인).
 * 문구·샘플값이 파트너 정산내역 탭과 같아 기존 i18n 키를 재사용한다.
 * 파일 분리 이유는 다른 탭과 동일 — 기존 훅의 API 연동 병렬 작업과 충돌 방지.
 */
export function useMerchantSettlement() {
  const { t } = useTranslation()

  const summary: MerchantSettleSummaryItem[] = (data.summary as FieldRaw[]).map((f) => ({
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
