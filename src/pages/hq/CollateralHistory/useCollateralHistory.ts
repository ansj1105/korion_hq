import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'
import data from './collateralHistoryData.json'
import infoData from './collateralInfoData.json'
import settlementData from './collateralSettlementData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
  note?: string
  labelTone?: 'default' | 'amber' | 'green'
  deltaTone?: 'cyan' | 'red'
  delta?: string
  deltaBadge?: boolean
  deltaPlain?: boolean
  dense?: boolean
  alignTop?: boolean
}

/** 행 데이터(회원명/코드/금액/유형·상태 enum 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과한다. */
export interface CollateralHistoryRow {
  no: string
  processedAt: string
  code: string
  country: string
  memberId: string
  memberName: string
  type: string
  amount: string
  beforeAfter: string
  status: string
}

export interface CollateralInfoRow {
  no: string
  adminCode: string
  country: string
  memberId: string
  memberName: string
  totalWallet: string
  availableWallet: string
  collateralBalance: string
  lastTopup: string
  lastPayment: string
}

export interface CollateralSettlementRow {
  no: string
  settledAt: string
  parentPartner: string
  ownCode: string
  country: string
  memberId: string
  memberName: string
  target: string
  amount: string
  beforeAfter: string
  status: string
}

interface FilterOption {
  value: string
  label: string
}

interface CollateralHistoryPageData {
  kpis: KpiRaw[]
  filters?: {
    countries?: FilterOption[]
    dates?: string[]
  }
  history: {
    rows: CollateralHistoryRow[]
  }
  info?: {
    rows: CollateralInfoRow[]
  }
  settlement?: {
    rows: CollateralSettlementRow[]
  }
}

const fallbackData: CollateralHistoryPageData = {
  kpis: data.kpis as KpiRaw[],
  history: { rows: data.history.rows as CollateralHistoryRow[] },
  info: { rows: infoData.rows as CollateralInfoRow[] },
  settlement: { rows: settlementData.rows as CollateralSettlementRow[] },
}

/*
 * useCollateralHistory — 본사어드민 "회원 담보금 충전 / 해제 내역" 데이터 훅
 * ------------------------------------------------------------------
 * collateralHistoryData.json(더미)을 읽어 UI 라벨(지표명/컬럼명)만 번역해 반환한다.
 * KPI 라벨은 전체 운영 대시보드와 동일한 항목(활성국가/담보금 잔액 등)이 많아
 * 기존 hqDashboard.kpi.* 키를 재사용한다. 추후 실 연동 시 이 훅 내부만
 * API 호출로 교체하면 CollateralHistory.tsx는 그대로 동작한다.
 */
export function useCollateralHistory(countryScope: string, date: string) {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData<CollateralHistoryPageData>(
    '/api/hq/collateral-history',
    fallbackData,
    { countryScope, date }
  )

  const kpis: StatCardData[] = (pageData.kpis as KpiRaw[]).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: collateralDeltaText(k.delta ?? k.note ?? (k.noteKey ? t(k.noteKey) : undefined)),
    deltaBadge: k.deltaBadge ?? Boolean(k.delta),
    labelTone: k.labelTone,
    deltaTone: k.deltaTone,
    deltaPlain: k.deltaPlain,
    dense: k.dense,
    alignTop: k.alignTop,
  }))

  // 컬럼 폭은 Figma 실측 px(49/65/75/69/68/69/46/62/85/48/128)의 상대 비율
  const columns: Column[] = [
    { key: 'no', label: t('hqCollateral.col.no'), width: '0.75fr' },
    { key: 'processedAt', label: t('hqCollateral.col.processedAt'), width: '1fr' },
    { key: 'code', label: t('hqCollateral.col.code'), width: '1.15fr' },
    { key: 'country', label: t('hqCollateral.col.country'), width: '1.05fr' },
    { key: 'memberId', label: t('hqCollateral.col.memberId'), width: '1.05fr' },
    { key: 'memberName', label: t('hqCollateral.col.memberName'), width: '1.05fr' },
    { key: 'type', label: t('hqCollateral.col.type'), width: '0.7fr' },
    { key: 'amount', label: t('hqCollateral.col.amount'), width: '0.95fr' },
    { key: 'beforeAfter', label: t('hqCollateral.col.beforeAfter'), width: '1.3fr' },
    { key: 'status', label: t('hqCollateral.col.status'), width: '0.75fr' },
    { key: 'action', label: t('hqCollateral.col.action'), width: '1.95fr' },
  ]

  return {
    kpis,
    columns,
    rows: pageData.history.rows as CollateralHistoryRow[],
    infoRows: (pageData.info?.rows ?? []) as CollateralInfoRow[],
    settlementRows: (pageData.settlement?.rows ?? []) as CollateralSettlementRow[],
    countryOptions: pageData.filters?.countries ?? fallbackCountryOptions(pageData),
    dateOptions: pageData.filters?.dates ?? fallbackDateOptions(pageData),
    isLoading,
    error,
  }
}

function fallbackCountryOptions(pageData: CollateralHistoryPageData) {
  return Array.from(
    new Set([
      ...(pageData.history.rows ?? []).map((row) => row.country),
      ...(pageData.info?.rows ?? []).map((row) => row.country),
      ...(pageData.settlement?.rows ?? []).map((row) => row.country),
    ].filter((value) => value && value !== '-'))
  )
    .sort()
    .map((value) => ({ value, label: value }))
}

function fallbackDateOptions(pageData: CollateralHistoryPageData) {
  return Array.from(
    new Set([
      ...(pageData.history.rows ?? []).map((row) => dateKey(row.processedAt)),
      ...(pageData.info?.rows ?? []).map((row) => dateKey(row.lastTopup)),
      ...(pageData.info?.rows ?? []).map((row) => dateKey(row.lastPayment)),
      ...(pageData.settlement?.rows ?? []).map((row) => dateKey(row.settledAt)),
    ].filter(Boolean))
  ).sort((a, b) => b.localeCompare(a))
}

function dateKey(value: string) {
  const match = value.match(/\d{4}[.-]\d{2}[.-]\d{2}/)
  return match ? match[0].replace(/\./g, '-') : ''
}

function collateralDeltaText(value?: string) {
  return value?.replace('전일 대비', '기간 대비')
}
