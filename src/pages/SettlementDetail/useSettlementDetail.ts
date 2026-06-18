import { useTranslation } from '../../i18n'
import type { InfoItem } from '../../components/molecules/InfoGrid'
import type { Column } from '../../components/organisms/DataTable'
import { useLeaderPageData } from '../../hooks/useLeaderPageData'
import data from './settlementDetailData.json'

interface FieldRaw {
  labelKey: string
  value: string
  /** 강조 값 색 (예: 청록 #24e6b8) — JSON에서 지정 */
  color?: string
}

/*
 * useSettlementDetail — 정산 상세 데이터 훅
 * ------------------------------------------------------------------
 * 기본정보(A)·금액요약(B)는 라벨/값 쌍, C/D/E는 테이블. UI 라벨은 번역, 값은 데이터.
 */
export function useSettlementDetail() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useLeaderPageData('/api/leader/settlements/detail', data)

  const toItems = (fields: FieldRaw[]): InfoItem[] =>
    fields.map((f) => ({ label: t(f.labelKey), value: f.value, valueColor: f.color }))

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

  return {
    no: pageData.no,
    status: pageData.status,
    basicInfo: toItems(pageData.basicInfo as FieldRaw[]),
    amountSummary: toItems(pageData.amountSummary as FieldRaw[]),
    partnerColumns,
    partnerRows: pageData.partnerRows as Array<Record<string, string>>,
    merchantColumns,
    merchantRows: pageData.merchantRows as Array<Record<string, string>>,
    heldColumns,
    heldRows: pageData.heldRows as Array<Record<string, string>>,
    isLoading,
    error,
  }
}
