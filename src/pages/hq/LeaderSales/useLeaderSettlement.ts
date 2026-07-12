import { useTranslation } from '../../../i18n'
import type { InfoItem } from '../../../components/molecules/InfoGrid'
import type { Column } from '../../../components/organisms/DataTable'
import data from './leaderSettlementData.json'

interface FieldRaw {
  labelKey: string
  value: string
  /** 강조 값 색 (예: 청록 #24e6b8) — JSON에서 지정 */
  color?: string
}

/*
 * useLeaderSettlement — "국가 리더별 거래내역" 화면의 "정산내역" 탭 데이터 훅
 * ------------------------------------------------------------------
 * Figma 81:25283 기준: 1)금액요약 → 2)파트너 자동정산 → 3)직계약 가맹점 →
 * 4)보류·제외 거래 → 정산 내역 표. 섹션 라벨/컬럼은 리더 정산 상세 화면
 * (settle.detail.*, settle.hist.*)과 문구가 같아 기존 i18n 키를 재사용한다.
 * 파일을 분리한 이유는 파트너별/가맹점별 탭과 동일 — 기존 훅(useLeaderSales)의
 * API 연동 작업이 다른 브랜치에서 병렬 진행 중이라 반환 구조를 건드리면 안 됨.
 */
export function useLeaderSettlement() {
  const { t } = useTranslation()

  const summary: InfoItem[] = (data.summary as FieldRaw[]).map((f) => ({
    label: t(f.labelKey),
    value: f.value,
    valueColor: f.color,
  }))

  const partnerColumns: Column[] = [
    { key: 'name', label: t('settle.detail.c.name'), width: '1.2fr' },
    { key: 'code', label: t('settle.detail.c.code'), width: '1.1fr' },
    { key: 'amount', label: t('settle.detail.c.amount'), width: '1fr' },
    { key: 'fee', label: t('settle.detail.c.fee'), width: '1fr' },
    { key: 'status', label: t('settle.detail.c.status'), width: '1fr' },
    { key: 'paidDate', label: t('settle.detail.c.paidDate'), width: '0.9fr' },
    { key: 'detail', label: t('settle.detail.c.detail'), width: '0.7fr' },
  ]

  const merchantColumns: Column[] = [
    { key: 'name', label: t('settle.detail.d.name'), width: '1.2fr' },
    { key: 'code', label: t('settle.detail.d.code'), width: '1.1fr' },
    { key: 'amount', label: t('settle.detail.d.amount'), width: '1fr' },
    { key: 'fee', label: t('settle.detail.d.fee'), width: '1fr' },
    { key: 'status', label: t('settle.detail.d.status'), width: '1fr' },
    { key: 'detail', label: t('settle.detail.d.detail'), width: '0.7fr' },
  ]

  const heldColumns: Column[] = [
    { key: 'txNo', label: t('settle.detail.e.txNo'), width: '1fr' },
    { key: 'merchant', label: t('settle.detail.e.merchant'), width: '1.2fr' },
    { key: 'partner', label: t('settle.detail.e.partner'), width: '1.1fr' },
    { key: 'reason', label: t('settle.detail.e.reason'), width: '1.1fr' },
    { key: 'amount', label: t('settle.detail.e.amount'), width: '1fr' },
    { key: 'heldFee', label: t('settle.detail.e.heldFee'), width: '1fr' },
    { key: 'status', label: t('settle.detail.e.status'), width: '1fr' },
  ]

  // 하단 "정산 내역" 표 — 리더용 정산 내역(settle.hist.*)과 같은 라벨이지만 "리더 신청금액" 열이 없음(Figma 실측)
  const historyColumns: Column[] = [
    { key: 'no', label: t('settle.hist.col.no'), width: '1.4fr' },
    { key: 'appliedDate', label: t('settle.hist.col.appliedDate'), width: '1.1fr' },
    { key: 'period', label: t('settle.hist.col.period'), width: '1.2fr' },
    { key: 'totalAmount', label: t('settle.hist.col.totalAmount'), width: '1.2fr' },
    { key: 'partnerAmount', label: t('settle.hist.col.partnerAmount'), width: '1.1fr' },
    { key: 'held', label: t('settle.hist.col.held'), width: '0.9fr' },
    { key: 'status', label: t('settle.hist.col.status'), width: '1fr' },
    { key: 'paidDate', label: t('settle.hist.col.paidDate'), width: '1fr' },
    { key: 'action', label: t('settle.hist.col.action'), width: '0.8fr' },
  ]

  return {
    summary,
    partnerColumns,
    partnerRows: data.partnerRows as Array<Record<string, string>>,
    merchantColumns,
    merchantRows: data.merchantRows as Array<Record<string, string>>,
    heldColumns,
    heldRows: data.heldRows as Array<Record<string, string>>,
    historyColumns,
    historyRows: data.historyRows as Array<Record<string, string>>,
  }
}
