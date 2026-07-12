import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import data from './settlementHistoryData.json'

interface KpiRaw {
  labelKey: string
  value: string
  noteKey: string
  highlight?: boolean
}

/** 정산 상태 enum — 검토/완료/보류. 표시 라벨은 데이터 값(번역 대상 아님) */
export type HistoryStatus = 'review' | 'done' | 'hold'

/** 정산 내역 행 (Figma 샘플값 하드코딩) */
export interface HistoryRow {
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

  const kpis: KpiItem[] = (data.kpis as KpiRaw[]).map((k) => ({
    id: k.labelKey,
    label: t(k.labelKey),
    value: k.value,
    note: t(k.noteKey),
    highlight: k.highlight ?? false,
  }))

  /* 컬럼 폭 = Figma 고정폭(px)을 fr 비율로 환산(98/35/63/…/128 ÷ 65). 정렬도 Figma처럼 전부 좌측 */
  const columns: Column[] = [
    { key: 'id', label: t('hqSettle.hist.col.id'), width: '1.5fr' },
    { key: 'date', label: t('hqSettle.hist.col.date'), width: '0.54fr' },
    { key: 'processedAt', label: t('hqSettle.hist.col.processedAt'), width: '0.97fr' },
    { key: 'code', label: t('hqSettle.hist.col.code'), width: '1.05fr' },
    { key: 'partnerName', label: t('hqSettle.hist.col.partnerName'), width: '1.06fr' },
    { key: 'country', label: t('hqSettle.hist.col.country'), width: '1.06fr' },
    { key: 'period', label: t('hqSettle.hist.col.period'), width: '1.15fr' },
    { key: 'totalAmount', label: t('hqSettle.hist.col.totalAmount'), width: '1.2fr' },
    { key: 'partnerProfit', label: t('hqSettle.hist.col.partnerProfit'), width: '0.95fr' },
    { key: 'directProfit', label: t('hqSettle.hist.col.directProfit'), width: '0.9fr' },
    { key: 'partnerSettle', label: t('hqSettle.hist.col.partnerSettle'), width: '0.86fr' },
    { key: 'held', label: t('hqSettle.hist.col.held'), width: '0.63fr' },
    { key: 'finalAmount', label: t('hqSettle.hist.col.finalAmount'), width: '0.78fr' },
    { key: 'status', label: t('hqSettle.hist.col.status'), width: '0.74fr' },
    { key: 'action', label: t('hqSettle.hist.col.action'), width: '1.97fr' },
  ]

  /** 상태 enum → 표시 라벨(데이터 값) + 행 액션 2번째 버튼 라벨(번역, 신청 화면 키 재사용) */
  const statusLabel: Record<HistoryStatus, string> = {
    review: '정산검토',
    done: '정산완료',
    hold: '정산보류',
  }
  const statusAction: Record<HistoryStatus, string> = {
    review: t('hqSettle.req.action.review'),
    done: t('hqSettle.req.action.review'),
    hold: t('hqSettle.req.action.hold'),
  }

  return {
    kpis,
    columns,
    rows: data.rows as HistoryRow[],
    statusLabel,
    statusAction,
    detailLabel: t('hqSettle.req.action.detail'),
    section: t('hqSettle.hist.section'),
  }
}
