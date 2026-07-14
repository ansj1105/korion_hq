import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import type { DiagramRow } from './DistributionDiagram'
import data from './rateSettingData.json'

interface KpiRaw {
  labelKey: string
  value: string
  noteKey: string
}

/** 국가별 배분율 상태 enum — 활성/대기. 표시 라벨은 데이터 값(번역 대상 아님) */
export type RateStatus = 'active' | 'pending'
/** 이벤트 컬럼 enum — 적용중(초록 강조)/미적용 */
export type EventStatus = 'applied' | 'none'

/** 국가별 배분율 행 (Figma 샘플값 하드코딩) */
export interface RateRow {
  country: string
  code: string
  hqFee: string
  leaderFee: string
  partnerFee: string
  merchantSettle: string
  event: EventStatus
  coinCount: string
  status: RateStatus
}

/** 배분율 모달 표시용 샘플값 */
export interface RateModalData {
  country: string
  memo: string
}

/** KPI 카드 (라벨/설명만 번역) */
export interface KpiItem {
  id: string
  label: string
  value: string
  note: string
}

/*
 * useRateSetting — 본사어드민 · 수수료/정산 · 배분율 설정 데이터 훅
 * ------------------------------------------------------------------
 * rateSettingData.json(더미)을 읽어 UI 라벨(KPI/컬럼명)은 번역해 반환한다.
 * 상태/국가명/배분율 수치 등 데이터 값은 번역하지 않는다(CLAUDE.md 11번).
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체.
 */
export function useRateSetting() {
  const { t } = useTranslation()

  const kpis: KpiItem[] = (data.kpis as KpiRaw[]).map((k) => ({
    id: k.labelKey,
    label: t(k.labelKey),
    value: k.value,
    note: t(k.noteKey),
  }))

  /* 컬럼 폭 = Figma 고정폭(px)을 fr 비율로 환산(98/58/63/68/69/93/75/78/78/128 ÷ 65) */
  const columns: Column[] = [
    { key: 'country', label: t('hqRate.col.country'), width: '1.5fr' },
    { key: 'code', label: t('hqRate.col.code'), width: '0.89fr' },
    { key: 'hqFee', label: t('hqRate.col.hqFee'), width: '0.97fr' },
    { key: 'leaderFee', label: t('hqRate.col.leaderFee'), width: '1.05fr' },
    { key: 'partnerFee', label: t('hqRate.col.partnerFee'), width: '1.06fr' },
    { key: 'merchantSettle', label: t('hqRate.col.merchantSettle'), width: '1.43fr' },
    { key: 'event', label: t('hqRate.col.event'), width: '1.15fr' },
    { key: 'coinCount', label: t('hqRate.col.coinCount'), width: '1.2fr' },
    { key: 'status', label: t('hqRate.col.status'), width: '1.2fr' },
    { key: 'action', label: t('hqRate.col.action'), width: '1.97fr' },
  ]

  /** 상태/이벤트 enum → 표시 라벨(데이터 값) */
  const statusLabel: Record<RateStatus, string> = {
    active: '활성',
    pending: '대기',
  }
  const eventLabel: Record<EventStatus, string> = {
    applied: '적용중',
    none: '미적용',
  }

  return {
    kpis,
    columns,
    rows: data.rows as RateRow[],
    diagramRows: data.diagram as DiagramRow[],
    statusLabel,
    eventLabel,
    modalData: data.modal as RateModalData,
    detailLabel: t('hqRate.action.detail'),
  }
}
