import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import type { AccentKey } from '../../../types'
import { useHqPageData } from '../../../hooks/useHqPageData'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
  delta?: string
  deltaBadge?: boolean
}

interface PaymentLogPageData {
  kpis?: KpiRaw[]
  stats?: KpiRaw[]
  rows: PaymentLogRow[]
}

const emptyPaymentLogData: PaymentLogPageData = {
  stats: [],
  rows: [],
}

/** 전체 결제 로그 행 원본 데이터 형태 (Figma 샘플값 하드코딩) */
export interface PaymentLogRow {
  no: string
  id: string
  entryId?: number
  txId: string
  sessionId: string
  datetime: string
  leaderCode: string
  partnerCode: string
  country: string
  merchantName: string
  method: string
  connection: string
  amount: string
  fee: string
  netAmount: string
  payer: string
  /** 결제 상태 값(성공/실패/대기) — enum/데이터라 번역 대상 아님 */
  status?: string
  statusLabel?: string
  /** 상태 글자색 강조 (성공=green / 실패=red / 대기=amber) */
  statusAccent: AccentKey
  /** 액션 배지 라벨(정산 처리 + 상세). enum/데이터라 번역 대상 아님 */
  actions: string[]
}

/*
 * usePaymentLog (hq) — 본사어드민 "전체 결제 로그" 데이터 훅
 * ------------------------------------------------------------------
 * paymentLogData.json(더미)을 읽어 UI 라벨(지표명/컬럼명)은 번역해 반환한다.
 * 행 데이터(거래ID/세션ID/국가/금액 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과.
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체하면 화면 컴포넌트는 그대로 동작한다.
 */
export function usePaymentLog() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData<PaymentLogPageData>('/api/hq/payments/logs', emptyPaymentLogData)

  const kpis: StatCardData[] = (pageData.stats ?? pageData.kpis ?? []).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: k.delta ?? (k.noteKey ? t(k.noteKey) : undefined),
    deltaBadge: k.deltaBadge ?? Boolean(k.delta),
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqPaymentLog.col.no'), width: '0.5fr', align: 'center' },
    { key: 'txId', label: t('hqPaymentLog.col.txId'), width: '1.2fr' },
    { key: 'sessionId', label: t('hqPaymentLog.col.sessionId'), width: '0.9fr' },
    { key: 'datetime', label: t('hqPaymentLog.col.datetime'), width: '1.1fr' },
    { key: 'leaderCode', label: t('hqPaymentLog.col.leaderCode'), width: '1fr' },
    { key: 'partnerCode', label: t('hqPaymentLog.col.partnerCode'), width: '0.9fr' },
    { key: 'country', label: t('hqPaymentLog.col.country'), width: '0.9fr' },
    { key: 'merchantName', label: t('hqPaymentLog.col.merchantName'), width: '0.8fr' },
    { key: 'method', label: t('hqPaymentLog.col.method'), width: '0.7fr' },
    { key: 'connection', label: t('hqPaymentLog.col.connection'), width: '0.8fr' },
    { key: 'amount', label: t('hqPaymentLog.col.amount'), width: '0.8fr' },
    { key: 'fee', label: t('hqPaymentLog.col.fee'), width: '0.6fr' },
    { key: 'netAmount', label: t('hqPaymentLog.col.netAmount'), width: '0.6fr' },
    { key: 'payer', label: t('hqPaymentLog.col.payer'), width: '0.9fr' },
    { key: 'status', label: t('hqPaymentLog.col.status'), width: '0.6fr' },
    // 액션 배지 2개(정산처리 + 상세)가 한 줄에 들어가도록 최소폭 보장
    { key: 'action', label: t('hqPaymentLog.col.action'), width: 'minmax(110px, 1.3fr)' },
  ]

  return {
    // 페이지 헤더 제목(사이드바 그룹+메뉴) vs 테이블 패널 제목을 분리
    pageTitle: t('hqPaymentLog.pageTitle'),
    title: t('hqPaymentLog.title'),
    kpis,
    columns,
    rows: pageData.rows as PaymentLogRow[],
    isLoading,
    error,
  }
}
