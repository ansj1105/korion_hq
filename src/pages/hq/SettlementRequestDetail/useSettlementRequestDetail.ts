import { useEffect, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import { fetchHqPageData } from '../../../services/korionChongApi'
import data from './settlementRequestDetailData.json'

interface KpiRaw {
  labelKey: string
  value: string
  /** UI 설명 문구 키(번역). 날짜 등 데이터성 노트는 noteKey 없이 note(원문)로 둔다 */
  noteKey?: string
  note?: string
  chip: string
  chipSolid: boolean
}
interface FieldRaw {
  labelKey: string
  value: string
  editable: boolean
}

/** KPI 요약 카드 (제목 칩 색 포함) */
export interface KpiItem {
  id: string
  label: string
  value: string
  note: string
  chip: string
  chipSolid: boolean
}

/*
 * useSettlementRequestDetail — 본사어드민 · 정산 신청 상세 검토 데이터 훅
 * ------------------------------------------------------------------
 * 목록의 ‘상세’에서 진입. 요약 카드/계산/수수료 구조/서브 테이블/본사 정산 요청 폼 데이터를 제공.
 * UI 라벨은 번역, 값/설명/상태 값은 데이터 그대로. 추후 API 연동 시 이 훅 내부만 교체.
 */
export function useSettlementRequestDetail(settlementRequestId?: string | null) {
  const { t } = useTranslation()
  const [source, setSource] = useState(data)

  useEffect(() => {
    if (!settlementRequestId) {
      setSource(data)
      return
    }
    let alive = true
    fetchHqPageData<typeof data>(`/api/hq/settlement-requests/${encodeURIComponent(settlementRequestId)}/detail`)
      .then((payload) => {
        if (alive) setSource(payload)
      })
      .catch(() => {
        if (alive) setSource(data)
      })
    return () => {
      alive = false
    }
  }, [settlementRequestId])

  const kpis: KpiItem[] = (source.kpis as KpiRaw[]).map((k) => ({
    id: k.labelKey,
    label: t(k.labelKey),
    value: k.value,
    // 설명 키가 있으면 번역, 없으면(날짜 등 데이터성) 원문 그대로
    note: k.noteKey ? t(k.noteKey) : (k.note ?? ''),
    chip: k.chip,
    chipSolid: k.chipSolid,
  }))

  const partnerColumns: Column[] = [
    { key: 'code', label: t('hqSettle.reqDetail.pt.code'), width: '1.1fr' },
    { key: 'name', label: t('hqSettle.reqDetail.pt.name'), width: '1fr' },
    { key: 'subCount', label: t('hqSettle.reqDetail.pt.subCount'), width: '0.9fr', align: 'right' },
    { key: 'amount', label: t('hqSettle.reqDetail.pt.amount'), width: '1fr', align: 'right' },
    { key: 'leaderFee', label: t('hqSettle.reqDetail.pt.leaderFee'), width: '0.8fr', align: 'right' },
    { key: 'partnerFee', label: t('hqSettle.reqDetail.pt.partnerFee'), width: '0.8fr', align: 'right' },
    { key: 'held', label: t('hqSettle.reqDetail.pt.held'), width: '0.7fr', align: 'right' },
    { key: 'settleable', label: t('hqSettle.reqDetail.pt.settleable'), width: '0.9fr', align: 'right' },
    { key: 'auto', label: t('hqSettle.reqDetail.pt.auto'), width: '0.9fr' },
    { key: 'detail', label: t('hqSettle.reqDetail.pt.detail'), width: '0.7fr' },
  ]

  const heldColumns: Column[] = [
    { key: 'txNo', label: t('hqSettle.reqDetail.ht.txNo'), width: '1fr' },
    { key: 'datetime', label: t('hqSettle.reqDetail.ht.datetime'), width: '1fr' },
    { key: 'type', label: t('hqSettle.reqDetail.ht.type'), width: '1fr' },
    { key: 'partner', label: t('hqSettle.reqDetail.ht.partner'), width: '1fr' },
    { key: 'merchant', label: t('hqSettle.reqDetail.ht.merchant'), width: '1fr' },
    { key: 'amount', label: t('hqSettle.reqDetail.ht.amount'), width: '1fr', align: 'right' },
    { key: 'reason', label: t('hqSettle.reqDetail.ht.reason'), width: '1fr' },
    { key: 'heldFee', label: t('hqSettle.reqDetail.ht.heldFee'), width: '0.8fr', align: 'right' },
    { key: 'status', label: t('hqSettle.reqDetail.ht.status'), width: '1fr' },
    { key: 'detail', label: t('hqSettle.reqDetail.ht.detail'), width: '0.7fr' },
  ]

  return {
    header: source.header,
    banner: source.banner,
    kpis,
    calc: {
      ...source.calc,
      earnLabel: t(source.calc.earnLabelKey),
      heldLabel: t(source.calc.heldLabelKey),
      finalLabel: t(source.calc.finalLabelKey),
    },
    feeStructure: source.feeStructure as string[][],
    partnerTable: {
      desc: t(source.partnerTable.descKey),
      columns: partnerColumns,
      rows: source.partnerTable.rows as Array<Record<string, string>>,
    },
    heldTable: {
      desc: t(source.heldTable.descKey),
      columns: heldColumns,
      rows: source.heldTable.rows as Array<Record<string, string>>,
    },
    formFields: (source.form.fields as FieldRaw[]).map((f) => ({ label: t(f.labelKey), value: f.value, editable: f.editable })),
    memoPlaceholder: source.form.memoPlaceholder,
    replyPlaceholder: source.form.replyPlaceholder,
    checks: source.checks as string[],
  }
}
