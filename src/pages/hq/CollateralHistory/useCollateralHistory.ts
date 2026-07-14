import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'

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

const EMPTY_COLLATERAL_HISTORY_DATA: CollateralHistoryPageData = {
  kpis: [],
  history: { rows: [] },
  info: { rows: [] },
  settlement: { rows: [] },
}

/*
 * useCollateralHistory — 본사어드민 "회원 담보금 충전 / 해제 내역" 데이터 훅
 * ------------------------------------------------------------------
 * /api/hq/collateral-history 응답만 화면에 반영한다. API 실패 시 정적 더미를
 * 표시하지 않고 빈 데이터와 오류 상태를 그대로 노출한다.
 */
export function useCollateralHistory(countryScope: string, date: string) {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData<CollateralHistoryPageData>(
    '/api/hq/collateral-history',
    EMPTY_COLLATERAL_HISTORY_DATA,
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
    { key: 'no', label: t('hqCollateral.col.no'), width: '56px', align: 'center' },
    { key: 'processedAt', label: t('hqCollateral.col.processedAt'), width: '136px' },
    { key: 'code', label: t('hqCollateral.col.code'), width: '132px' },
    { key: 'country', label: t('hqCollateral.col.country'), width: '110px' },
    { key: 'memberId', label: t('hqCollateral.col.memberId'), width: '116px' },
    { key: 'memberName', label: t('hqCollateral.col.memberName'), width: '128px' },
    { key: 'type', label: t('hqCollateral.col.type'), width: '86px' },
    { key: 'amount', label: t('hqCollateral.col.amount'), width: '112px' },
    { key: 'beforeAfter', label: t('hqCollateral.col.beforeAfter'), width: '134px' },
    { key: 'status', label: t('hqCollateral.col.status'), width: '96px' },
    { key: 'action', label: t('hqCollateral.col.action'), width: '220px' },
  ]

  return {
    kpis,
    columns,
    rows: (pageData.history?.rows ?? []) as CollateralHistoryRow[],
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
