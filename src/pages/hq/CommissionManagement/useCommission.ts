import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import data from './commissionData.json'

interface KpiRaw {
  labelKey: string
  value: string
  noteKey: string
}

/** 국가별 수수료 상태 enum — 활성/대기. 표시 라벨은 데이터 값(번역 대상 아님) */
export type FeeStatus = 'active' | 'pending'

/** 국가별 수수료 행 (Figma 샘플값 하드코딩) */
export interface FeeRow {
  country: string
  code: string
  baseFee: string
  online: string
  offline: string
  event: string
  actualFee: string
  coinCount: string
  status: FeeStatus
}

/** 수수료 설정/추가 모달 표시용 샘플값 */
export interface FeeModalData {
  country: string
  eventFee: string
  baseFee: string
  onlineFee: string
  offlineFee: string
  coins: { name: string; fee: string }[]
}

/** KPI 카드 (라벨만 번역) */
export interface KpiItem {
  id: string
  label: string
  value: string
  note: string
}

/*
 * useCommission — 본사어드민 · 수수료/정산 · 수수료 관리 데이터 훅
 * ------------------------------------------------------------------
 * commissionData.json(더미)을 읽어 UI 라벨(KPI/컬럼명)은 번역해 반환한다.
 * 상태/국가명/수수료율 등 행 데이터 값은 번역하지 않는다(CLAUDE.md 11번).
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체.
 */
export function useCommission() {
  const { t } = useTranslation()

  const kpis: KpiItem[] = (data.kpis as KpiRaw[]).map((k) => ({
    id: k.labelKey,
    label: t(k.labelKey),
    value: k.value,
    note: t(k.noteKey),
  }))

  /* 컬럼 폭 = Figma 고정폭(px)을 fr 비율로 환산(98/58/63/68/69/69/75/78/78/128 ÷ 65) */
  const columns: Column[] = [
    { key: 'country', label: t('hqCommission.col.country'), width: '1.5fr' },
    { key: 'code', label: t('hqCommission.col.code'), width: '0.89fr' },
    { key: 'baseFee', label: t('hqCommission.col.baseFee'), width: '0.97fr' },
    { key: 'online', label: t('hqCommission.col.online'), width: '1.05fr' },
    { key: 'offline', label: t('hqCommission.col.offline'), width: '1.06fr' },
    { key: 'event', label: t('hqCommission.col.event'), width: '1.06fr' },
    { key: 'actualFee', label: t('hqCommission.col.actualFee'), width: '1.15fr' },
    { key: 'coinCount', label: t('hqCommission.col.coinCount'), width: '1.2fr' },
    { key: 'status', label: t('hqCommission.col.status'), width: '1.2fr' },
    { key: 'action', label: t('hqCommission.col.action'), width: '1.97fr' },
  ]

  /** 상태 enum → 표시 라벨(데이터 값) */
  const statusLabel: Record<FeeStatus, string> = {
    active: '활성',
    pending: '대기',
  }

  return {
    kpis,
    columns,
    rows: data.rows as FeeRow[],
    statusLabel,
    globalFee: data.globalFee,
    modalData: data.modal as FeeModalData,
    detailLabel: t('hqCommission.action.detail'),
  }
}
