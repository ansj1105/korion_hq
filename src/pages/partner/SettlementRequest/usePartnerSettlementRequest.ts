import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import { usePartnerPageData } from '../../../hooks/usePartnerPageData'
import data from './partnerSettlementRequestData.json'

interface StatRaw {
  labelKey: string
  value: string
  note?: string
  chip?: string
}
export interface KpiItem {
  id: string
  label: string
  value: string
  note?: string
  chip: string
}
interface FieldRaw {
  labelKey: string
  value: string
  color?: string
}

/*
 * usePartnerSettlementRequest — 파트너 · 정산 신청 데이터 훅
 * ------------------------------------------------------------------
 * 리더와 달리: KPI 6개, 계산식 2항(가맹점 별 수수료 수익 − 보류 제외 = 최종),
 * 직계약 테이블·자동정산 섹션 없음, 가맹점별 수수료 수익 테이블 1개.
 * 테이블 컬럼/보류 거래는 리더와 동일 문구라 settle.req.pt / settle.req.ht 키 재사용.
 */
export function usePartnerSettlementRequest() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = usePartnerPageData('/api/partner/settlements/request-summary', data)

  // 가맹점별 수수료 수익 테이블 (리더 파트너 테이블과 동일 컬럼)
  const merchantColumns: Column[] = [
    { key: 'code', label: t('settle.req.pt.code'), width: '1.1fr' },
    { key: 'name', label: t('settle.req.pt.name'), width: '1fr' },
    { key: 'subCount', label: t('settle.req.pt.subCount'), width: '0.9fr' },
    { key: 'amount', label: t('settle.req.pt.amount'), width: '1fr' },
    { key: 'leaderFee', label: t('settle.req.pt.leaderFee'), width: '0.8fr' },
    { key: 'partnerFee', label: t('settle.req.pt.partnerFee'), width: '0.8fr' },
    { key: 'held', label: t('settle.req.pt.held'), width: '0.7fr' },
    { key: 'settleable', label: t('settle.req.pt.settleable'), width: '0.9fr' },
    { key: 'auto', label: t('settle.req.pt.auto'), width: '0.9fr' },
    { key: 'detail', label: t('settle.req.pt.detail'), width: '0.7fr' },
  ]

  const heldColumns: Column[] = [
    { key: 'txNo', label: t('settle.req.ht.txNo'), width: '1fr' },
    { key: 'datetime', label: t('settle.req.ht.datetime'), width: '1fr' },
    { key: 'type', label: t('settle.req.ht.type'), width: '1fr' },
    { key: 'partner', label: t('settle.req.ht.partner'), width: '1fr' },
    { key: 'merchant', label: t('settle.req.ht.merchant'), width: '1fr' },
    { key: 'amount', label: t('settle.req.ht.amount'), width: '1fr' },
    { key: 'reason', label: t('settle.req.ht.reason'), width: '1fr' },
    { key: 'heldFee', label: t('settle.req.ht.heldFee'), width: '0.8fr' },
    { key: 'status', label: t('settle.req.ht.status'), width: '1fr' },
    { key: 'detail', label: t('settle.req.ht.detail'), width: '0.7fr' },
  ]

  const kpis: KpiItem[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.labelKey,
    label: t(s.labelKey),
    value: s.value,
    note: s.note,
    chip: s.chip ?? '#7c5cff',
  }))

  return {
    banner: pageData.banner,
    kpis,
    calc: pageData.calc,
    feeStructure: pageData.feeStructure as string[][],
    merchantTable: {
      desc: t(pageData.merchantTable.descKey),
      columns: merchantColumns,
      rows: pageData.merchantTable.rows as Array<Record<string, string>>,
    },
    heldTable: {
      desc: t(pageData.heldTable.descKey),
      columns: heldColumns,
      rows: pageData.heldTable.rows as Array<Record<string, string>>,
    },
    summary: pageData.summary,
    checks: pageData.checks as string[],
    formFields: (pageData.form.fields as FieldRaw[]).map((f) => ({ label: t(f.labelKey), value: f.value, color: f.color })),
    isLoading,
    error,
  }
}
