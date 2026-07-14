import { useTranslation } from '../../../i18n'
import { useHqPageData } from '../../../hooks/useHqPageData'
import type { Column } from '../../../components/organisms/DataTable'
import type { AccentKey } from '../../../types'

interface KpiRaw {
  id?: string
  labelKey: string
  value: string
  noteKey: string
}

/** 정산 신청 상태 enum — 백엔드 UI 상태값 */
export type RequestStatus = 'review' | 'done' | 'hold' | 'infoRequested' | 'rejected'

/** 리더 정산 신청 행 (Figma 샘플값 하드코딩) */
export interface RequestRow {
  settlementRequestId?: number
  no?: string
  id: string
  date: string
  applicant: string
  partnerName: string
  recipientType?: string
  country: string
  period: string
  totalAmount: string
  partnerProfit: string
  directProfit: string
  partnerSettle: string
  held: string
  finalAmount: string
  status: RequestStatus
  statusAccent?: AccentKey
  sourceStatus?: string
  actions?: SettlementRequestActionCode[]
}

export type SettlementRequestActionCode = 'APPROVE' | 'REVIEW' | 'HOLD' | 'REQUEST_INFO' | 'REJECT'

interface SettlementRequestPageData {
  kpis: KpiRaw[]
  rows: RequestRow[]
}

const EMPTY_SETTLEMENT_REQUEST_DATA: SettlementRequestPageData = {
  kpis: [],
  rows: [],
}

/** KPI 카드 (라벨만 번역) */
export interface KpiItem {
  id: string
  label: string
  value: string
  note: string
}

/*
 * useSettlementRequest — 본사어드민 · 수수료/정산 · 정산 신청(목록) 데이터 훅
 * ------------------------------------------------------------------
 * settlementRequestData.json(더미)을 읽어 UI 라벨(KPI/컬럼명/액션)은 번역해 반환한다.
 * 상태/코드/금액/이름 등 행 데이터 값은 번역하지 않는다(CLAUDE.md 11번).
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체.
 */
export function useSettlementRequest() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData<SettlementRequestPageData>(
    '/api/hq/settlement-requests',
    EMPTY_SETTLEMENT_REQUEST_DATA,
  )

  const kpis: KpiItem[] = pageData.kpis.map((k) => ({
    id: k.id ?? k.labelKey,
    label: t(k.labelKey),
    value: k.value,
    note: t(k.noteKey),
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqSettle.req.col.no'), width: '56px', align: 'center' },
    { key: 'id', label: t('hqSettle.req.col.id'), width: '170px' },
    { key: 'date', label: t('hqSettle.req.col.date'), width: '104px' },
    { key: 'applicant', label: t('hqSettle.req.col.applicant'), width: '126px' },
    { key: 'partnerName', label: t('hqSettle.req.col.partnerName'), width: '150px' },
    { key: 'country', label: t('hqSettle.req.col.country'), width: '110px' },
    { key: 'period', label: t('hqSettle.req.col.period'), width: '178px' },
    { key: 'totalAmount', label: t('hqSettle.req.col.totalAmount'), width: '122px', align: 'right' },
    { key: 'partnerProfit', label: t('hqSettle.req.col.partnerProfit'), width: '112px', align: 'right' },
    { key: 'directProfit', label: t('hqSettle.req.col.directProfit'), width: '112px', align: 'right' },
    { key: 'partnerSettle', label: t('hqSettle.req.col.partnerSettle'), width: '112px', align: 'right' },
    { key: 'held', label: t('hqSettle.req.col.held'), width: '86px', align: 'right' },
    { key: 'finalAmount', label: t('hqSettle.req.col.finalAmount'), width: '112px', align: 'right' },
    { key: 'status', label: t('hqSettle.req.col.status'), width: '122px' },
    { key: 'action', label: t('hqSettle.req.col.action'), width: '340px' },
  ]

  const statusLabel: Record<RequestStatus, string> = {
    review: t('hqSettle.req.status.review'),
    done: t('hqSettle.req.status.done'),
    hold: t('hqSettle.req.status.hold'),
    infoRequested: t('hqSettle.req.status.infoRequested'),
    rejected: t('hqSettle.req.status.rejected'),
  }
  const actionLabel: Record<SettlementRequestActionCode, string> = {
    APPROVE: t('hqSettle.req.action.approve'),
    REVIEW: t('hqSettle.req.action.review'),
    HOLD: t('hqSettle.req.action.hold'),
    REQUEST_INFO: t('hqSettle.req.action.requestInfo'),
    REJECT: t('hqSettle.req.action.reject'),
  }

  return {
    kpis,
    columns,
    rows: pageData.rows,
    statusLabel,
    actionLabel,
    chipAutoInclude: t('hqSettle.req.chip.autoInclude'),
    chipExcludeToday: t('hqSettle.req.chip.excludeToday'),
    section: t('hqSettle.req.section'),
    subtitle: t('hqSettle.req.subtitle'),
    isLoading,
    error,
  }
}
