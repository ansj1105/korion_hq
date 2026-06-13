import { useTranslation } from '../../i18n'
import type { StatCardData } from '../../components/molecules/StatCard'
import type { Column } from '../../components/organisms/DataTable'
import data from './settlementRequestData.json'

interface StatRaw {
  labelKey: string
  value: string
  note?: string
  chip?: string
  chipSolid?: boolean
}

/** KPI 카드 항목 (제목 칩 색 포함) */
export interface KpiItem {
  id: string
  label: string
  value: string
  note?: string
  chip: string
  chipSolid: boolean
}
interface FieldRaw {
  labelKey: string
  value: string
}

/*
 * useSettlementRequest — 정산 신청 화면 데이터 훅
 * ------------------------------------------------------------------
 * 긴 기본 화면(요약/지표/계산/테이블/요청 폼)과 확인 폼에 필요한 데이터를 제공.
 * UI 라벨은 번역, 값/설명 본문은 데이터 그대로. 추후 API 연동 시 이 훅 내부만 교체.
 */
export function useSettlementRequest() {
  const { t } = useTranslation()
  const toStats = (arr: StatRaw[]): StatCardData[] =>
    arr.map((s) => ({ id: s.labelKey, label: t(s.labelKey), value: s.value, note: s.note }))

  const partnerColumns: Column[] = [
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

  const directColumns: Column[] = [
    { key: 'code', label: t('settle.req.dt.code'), width: '1.1fr' },
    { key: 'name', label: t('settle.req.dt.name'), width: '1fr' },
    { key: 'city', label: t('settle.req.dt.city'), width: '0.8fr' },
    { key: 'contract', label: t('settle.req.dt.contract'), width: '0.9fr' },
    { key: 'amount', label: t('settle.req.dt.amount'), width: '1fr' },
    { key: 'hqFee', label: t('settle.req.dt.hqFee'), width: '0.8fr' },
    { key: 'leaderFee', label: t('settle.req.dt.leaderFee'), width: '0.8fr' },
    { key: 'partnerFee', label: t('settle.req.dt.partnerFee'), width: '0.7fr' },
    { key: 'held', label: t('settle.req.dt.held'), width: '0.7fr' },
    { key: 'settleable', label: t('settle.req.dt.settleable'), width: '0.9fr' },
    { key: 'detail', label: t('settle.req.dt.detail'), width: '0.7fr' },
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

  const kpis: KpiItem[] = (data.stats as StatRaw[]).map((s) => ({
    id: s.labelKey,
    label: t(s.labelKey),
    value: s.value,
    note: s.note,
    chip: s.chip ?? '#7c5cff',
    chipSolid: s.chipSolid ?? false,
  }))

  return {
    banner: data.banner,
    kpis,
    calc: data.calc,
    feeStructure: data.feeStructure as string[][],
    autoDesc: data.autoDesc,
    autoHighlightTitle: data.autoHighlightTitle,
    autoHighlightDesc: data.autoHighlightDesc,
    autoStats: toStats(data.autoStats as StatRaw[]),
    partnerTable: {
      desc: t(data.partnerTable.descKey),
      columns: partnerColumns,
      rows: data.partnerTable.rows as Array<Record<string, string>>,
    },
    directTable: {
      desc: t(data.directTable.descKey),
      columns: directColumns,
      rows: data.directTable.rows as Array<Record<string, string>>,
    },
    heldTable: {
      desc: t(data.heldTable.descKey),
      columns: heldColumns,
      rows: data.heldTable.rows as Array<Record<string, string>>,
    },
    summary: data.summary,
    checks: data.checks as string[],
    formFields: (data.form.fields as FieldRaw[]).map((f) => ({ label: t(f.labelKey), value: f.value })),
  }
}
