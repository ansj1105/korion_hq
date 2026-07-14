import { useTranslation } from '../../../i18n'
import { useHqPageData } from '../../../hooks/useHqPageData'
import type { Column } from '../../../components/organisms/DataTable'
import type { AccentKey } from '../../../types'
import data from './settlementHistoryData.json'

interface KpiRaw {
  labelKey: string
  value: string
  noteKey: string
  highlight?: boolean
}

/** 정산 상태 enum — 검토/완료/보류. 표시 라벨은 데이터 값(번역 대상 아님) */
export type HistoryStatus = 'review' | 'done' | 'hold' | 'infoRequested' | 'rejected'

/** 정산 내역 행 (Figma 샘플값 하드코딩) */
export interface HistoryRow {
  settlementRequestId?: number
  no?: string
  id: string
  date: string
  processedAt: string
  code: string
  partnerName: string
  country: string
  period: string
  totalAmount: string
  partnerProfit: string
  directProfit: string
  partnerSettle: string
  held: string
  finalAmount: string
  status: HistoryStatus
  statusAccent?: AccentKey
  sourceStatus?: string
}

/** KPI 카드 (라벨/설명만 번역, highlight면 시안 강조 테두리) */
export interface KpiItem {
  id: string
  label: string
  value: string
  note: string
  highlight: boolean
}

/*
 * useSettlementHistory — 본사어드민 · 수수료/정산 · 정산 내역(목록) 데이터 훅
 * ------------------------------------------------------------------
 * settlementHistoryData.json(더미)을 읽어 UI 라벨(KPI/컬럼명/액션)은 번역해 반환한다.
 * 상태/코드/금액/이름 등 행 데이터 값은 번역하지 않는다(CLAUDE.md 11번).
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체.
 */
export function useSettlementHistory() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData<{ kpis: KpiRaw[]; rows: HistoryRow[] }>(
    '/api/hq/settlement-history',
    data as { kpis: KpiRaw[]; rows: HistoryRow[] },
  )

  const kpis: KpiItem[] = pageData.kpis.map((k) => ({
    id: k.labelKey,
    label: t(k.labelKey),
    value: k.value,
    note: t(k.noteKey),
    highlight: k.highlight ?? false,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqSettle.hist.col.no'), width: '0.5fr', align: 'center' },
    { key: 'id', label: t('hqSettle.hist.col.id'), width: '1.5fr' },
    { key: 'date', label: t('hqSettle.hist.col.date'), width: '0.9fr' },
    { key: 'processedAt', label: t('hqSettle.hist.col.processedAt'), width: '0.9fr' },
    { key: 'code', label: t('hqSettle.hist.col.code'), width: '1fr' },
    { key: 'partnerName', label: t('hqSettle.hist.col.partnerName'), width: '1fr' },
    { key: 'country', label: t('hqSettle.hist.col.country'), width: '0.9fr' },
    { key: 'period', label: t('hqSettle.hist.col.period'), width: '1.5fr' },
    { key: 'totalAmount', label: t('hqSettle.hist.col.totalAmount'), width: '1fr', align: 'right' },
    { key: 'partnerProfit', label: t('hqSettle.hist.col.partnerProfit'), width: '0.8fr', align: 'right' },
    { key: 'directProfit', label: t('hqSettle.hist.col.directProfit'), width: '0.8fr', align: 'right' },
    { key: 'partnerSettle', label: t('hqSettle.hist.col.partnerSettle'), width: '0.8fr', align: 'right' },
    { key: 'held', label: t('hqSettle.hist.col.held'), width: '0.6fr', align: 'right' },
    { key: 'finalAmount', label: t('hqSettle.hist.col.finalAmount'), width: '0.9fr', align: 'right' },
    { key: 'status', label: t('hqSettle.hist.col.status'), width: '0.9fr' },
  ]

  /** 상태 enum → 표시 라벨(데이터 값) + 행 액션 2번째 버튼 라벨(번역, 신청 화면 키 재사용) */
  const statusLabel: Record<HistoryStatus, string> = {
    review: t('hqSettle.req.status.review'),
    done: t('hqSettle.req.status.done'),
    hold: t('hqSettle.req.status.hold'),
    infoRequested: t('hqSettle.req.status.infoRequested'),
    rejected: t('hqSettle.req.status.rejected'),
  }

  return {
    kpis,
    columns,
    rows: pageData.rows,
    statusLabel,
    section: t('hqSettle.hist.section'),
    isLoading,
    error,
  }
}
