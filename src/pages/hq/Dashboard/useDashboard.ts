import { useEffect, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { MiniStatCardData } from '../../../components/molecules/MiniStatCard'
import type { Column } from '../../../components/organisms/DataTable'
import type { AccentKey } from '../../../types'
import { fetchHqPageData } from '../../../services/korionChongApi'
import data from './dashboardData.json'

export type HqDashboardRange = '1D' | '7D' | '14D' | '30D' | '90D' | '180D' | '365D'

interface UseDashboardFilters {
  countryScope?: string
  range?: HqDashboardRange
}

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  noteKey: string
  note?: string
  labelTone?: 'default' | 'amber' | 'green'
  deltaTone?: 'cyan' | 'red'
}

interface MiniStatRaw {
  id: string
  labelKey: string
  noteKey?: string
  note?: string
  value: string
  accent: AccentKey
}

/*
 * dashboardData.json의 행 데이터는 accent류 필드만 AccentKey로 단언해 사용한다(나머지는 JSON 추론 타입 그대로).
 * Figma 실측 결과 상태/액션 셀이 "항상 배지"가 아니라 행마다 배지/평텍스트가 섞여 있어서
 * (예: 진행 중·이례적인 상태만 배지로 강조, 나머지는 평텍스트) accent 필드를 전부 optional로 두고
 * Dashboard.tsx에서 "accent가 있으면 Badge, 없으면 평텍스트"로 분기한다.
 */
interface RealtimePaymentRow {
  id: string
  country: string
  merchant: string
  method: string
  connection: string
  amount: string
  status: string
  statusAccent: AccentKey
  sync: string
  syncAccent?: AccentKey
  verify: string
}

interface SettlementRow {
  id: string
  type: string
  name: string
  country: string
  requested: string
  held: string
  payable: string
  status: string
  statusAccent?: AccentKey
  action: string
  actionAccent?: AccentKey
}

interface RiskRow {
  id: string
  type: string
  targetId: string
  wallet: string
  country: string
  relatedTx: string
  score: string
  scoreAccent?: AccentKey
  held: string
  action: string
  actionAccent?: AccentKey
}

interface ApprovalQueueRow {
  id: string
  type: string
  name: string
  country: string
  contact: string
  wallet: string
  time: string
  risk: string
  riskAccent?: AccentKey
  status: string
  statusAccent: AccentKey
}

interface PaymentMethodRow {
  id: string
  count: string
  successRate: string
  failRate: string
  avgApprove: string
  sync: string
  syncAccent?: AccentKey
  failReason: string
}

interface ActivityLogRow {
  id: string
  admin: string
  menu: string
  menuAccent?: AccentKey
  action: string
  actionAccent?: AccentKey
  targetId: string
  time: string
  ip: string
  result: string
  riskLevel: string
  riskAccent: AccentKey
}

interface RankingRowRaw {
  rank: number
  name: string
  meta: string
  amount: string
}

interface RankingPanelRaw {
  id: string
  titleKey: string
  rows?: RankingRowRaw[]
}

interface AiInsightRaw {
  id: string
  severity: string
  severityAccent: AccentKey
  messageKey: string
  actionKey: string
}

const ALL_COUNTRIES = 'all'
const RANGE_DAYS: Record<HqDashboardRange, number> = {
  '1D': 1,
  '7D': 7,
  '14D': 14,
  '30D': 30,
  '90D': 90,
  '180D': 180,
  '365D': 365,
}

const COUNTRY_CODE_BY_NAME: Record<string, string> = {
  Nigeria: 'NG',
  Korea: 'KR',
  Philippines: 'PH',
  Vietnam: 'VN',
  Ghana: 'GH',
}

const RANGE_SENSITIVE_KPIS = new Set([
  'collateralTopup',
  'collateralTopupCount',
  'collateralRelease',
  'newApplicationsToday',
  'todayPaymentCount',
  'todayPaymentAmount',
  'todayFee',
  'settlementRequests',
  'settlementPendingAmount',
  'unsettledMemberPayout',
  'verificationQueue',
  'riskHoldAmount',
  'riskAlerts',
])

const RANGE_SENSITIVE_MINI_STATS = new Set([
  'createdTx',
  'uploadPending',
  'syncFailed',
  'longUnsynced',
  'senderProofOnly',
  'receiverEvidenceOnly',
  'totalPending',
  'completed',
  'onHold',
  'memberCollateral',
  'abnormalWithdrawal',
  'bugSuspect',
  'duplicateWallet',
  'settlementHoldTarget',
  'receivedToday',
  'pending',
  'docsRequested',
  'approvedToday',
  'totalLeaders',
  'totalPartners',
  'totalMerchants',
  'problemPartners',
])

function formatScaledNumber(value: number, hasDecimals: boolean) {
  const maximumFractionDigits = hasDecimals ? 2 : 0
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits,
    minimumFractionDigits: hasDecimals ? Math.min(1, maximumFractionDigits) : 0,
  }).format(value)
}

function scaleDisplayValue(value: string, multiplier: number) {
  if (multiplier === 1 || value.includes('%') || value.includes('초')) return value

  return value.replace(/([₩$]?)(\d[\d,]*(?:\.\d+)?)([KM]?)/g, (_match, currency: string, raw: string, suffix: string) => {
    const numeric = Number(raw.replace(/,/g, ''))
    if (!Number.isFinite(numeric)) return `${currency}${raw}${suffix}`
    const scaled = numeric * multiplier
    return `${currency}${formatScaledNumber(scaled, raw.includes('.'))}${suffix}`
  })
}

function countryMatches(rowCountry: string, countryScope: string) {
  return countryScope === ALL_COUNTRIES || rowCountry === countryScope
}

function fallbackCountryRatio(countryRows: Array<{ id: string; amount?: string }>, selectedCountry: string) {
  if (selectedCountry === ALL_COUNTRIES) return 1
  const amountOf = (value?: string) => Number((value ?? '').replace(/[^\d.]/g, '')) || 0
  const total = countryRows.reduce((sum, row) => sum + amountOf(row.amount), 0)
  const selected = amountOf(countryRows.find((row) => row.id === selectedCountry)?.amount)
  return total > 0 && selected > 0 ? selected / total : 1
}

function scaleMiniStats(stats: MiniStatRaw[], multiplier: number): MiniStatRaw[] {
  return stats.map((stat) =>
    RANGE_SENSITIVE_MINI_STATS.has(stat.id)
      ? {
          ...stat,
          value: scaleDisplayValue(stat.value, multiplier),
        }
      : stat,
  )
}

/*
 * useDashboard — 본사어드민 "전체 운영 대시보드" 데이터 훅
 * ------------------------------------------------------------------
 * /api/hq/dashboard를 우선 사용하고 실패 시 dashboardData.json을 fallback으로 쓴다.
 * UI 라벨(지표명/컬럼명)은 번역해 반환하고, 행 데이터(국가코드/금액/상태)는 API 값을 그대로 통과한다.
 */
export function useDashboard(filters: UseDashboardFilters = {}) {
  const { t } = useTranslation()
  const range = filters.range ?? '1D'
  const [source, setSource] = useState(data)

  useEffect(() => {
    let alive = true
    fetchHqPageData<typeof data>('/api/hq/dashboard', {
      countryScope: filters.countryScope ?? ALL_COUNTRIES,
      range,
    })
      .then((payload) => {
        if (alive) setSource(payload)
      })
      .catch(() => {
        if (alive) setSource(data)
      })
    return () => {
      alive = false
    }
  }, [filters.countryScope, range])

  const rangeMultiplier = source === data ? RANGE_DAYS[range] : 1
  const countryRows = source.countryOps.rows
  const countryOptions = [
    { value: ALL_COUNTRIES, label: t('hqDashboard.filter.allCountries') },
    ...countryRows.map((row) => ({ value: row.id, label: row.id })),
  ]
  const selectedCountry = countryOptions.some((option) => option.value === filters.countryScope) ? filters.countryScope ?? ALL_COUNTRIES : ALL_COUNTRIES
  const selectedCountryRow = countryRows.find((row) => row.id === selectedCountry)
  const fallbackRatio = source === data ? fallbackCountryRatio(countryRows, selectedCountry) : 1

  const kpis: StatCardData[] = (source.kpis as KpiRaw[]).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value:
      selectedCountryRow && k.id === 'activeCountries'
        ? `1 ${t('hqDashboard.filter.countryUnit')}`
        : selectedCountryRow && k.id === 'collateralHolders'
          ? selectedCountryRow.members
          : selectedCountryRow && k.id === 'countryLeaders'
            ? selectedCountryRow.leaders
            : selectedCountryRow && k.id === 'salesPartners'
              ? selectedCountryRow.partners
              : selectedCountryRow && k.id === 'merchants'
                ? selectedCountryRow.merchants
                : source === data && selectedCountryRow && k.id === 'collateralBalance'
                  ? scaleDisplayValue(k.value, fallbackRatio)
                  : RANGE_SENSITIVE_KPIS.has(k.id)
                  ? scaleDisplayValue(k.value, rangeMultiplier * fallbackRatio)
                  : k.value,
    delta: k.note ?? (k.noteKey ? t(k.noteKey) : ''),
    labelTone: k.labelTone,
    deltaTone: k.deltaTone,
  }))

  const rankingPanels = (source.rankingPanels as RankingPanelRaw[]).map((p) => ({
    id: p.id,
    title: t(p.titleKey),
    rows: p.rows ?? [],
  }))

  // Figma 실측(80:310 그룹): 헤더 10개 컬럼이 x=64부터 99.2px 등간격으로 균등 배치된다.
  // → 컬럼 폭을 전부 동일(1fr)로 둬 피그마 비율을 그대로 재현한다(좁은 화면은 DataTable이 가로 스크롤 처리).
  const realtimePaymentColumns: Column[] = [
    { key: 'id', label: t('hqDashboard.realtimePayments.col.id'), width: '1fr' },
    { key: 'country', label: t('hqDashboard.realtimePayments.col.country'), width: '1fr' },
    { key: 'merchant', label: t('hqDashboard.realtimePayments.col.merchant'), width: '1fr' },
    { key: 'method', label: t('hqDashboard.realtimePayments.col.method'), width: '1fr' },
    { key: 'connection', label: t('hqDashboard.realtimePayments.col.connection'), width: '1fr' },
    { key: 'amount', label: t('hqDashboard.realtimePayments.col.amount'), width: '1fr' },
    { key: 'status', label: t('hqDashboard.realtimePayments.col.status'), width: '1fr' },
    { key: 'sync', label: t('hqDashboard.realtimePayments.col.sync'), width: '1fr' },
    { key: 'verify', label: t('hqDashboard.realtimePayments.col.verify'), width: '1fr' },
    { key: 'detail', label: t('hqDashboard.realtimePayments.col.detail'), width: '1fr' },
  ]

  const offlinePayMiniStats: MiniStatCardData[] = scaleMiniStats(source.offlinePay.miniStats as MiniStatRaw[], rangeMultiplier * fallbackRatio).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    note: s.note ?? (s.noteKey ? t(s.noteKey) : undefined),
    value: s.value,
    accent: s.accent,
  }))
  const offlinePayFlowSteps = source.offlinePay.flowSteps.map((key) => t(key))

  const settlementStats: MiniStatCardData[] = scaleMiniStats(source.settlement.stats as MiniStatRaw[], rangeMultiplier * fallbackRatio).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    accent: s.accent,
  }))
  // Figma 실측(80:444~): 8개 컬럼이 x=64부터 124px 등간격으로 균등 배치 → 전부 동일 폭(1fr)
  const settlementColumns: Column[] = [
    { key: 'type', label: t('hqDashboard.settlement.col.type'), width: '1fr' },
    { key: 'name', label: t('hqDashboard.settlement.col.name'), width: '1fr' },
    { key: 'country', label: t('hqDashboard.settlement.col.country'), width: '1fr' },
    { key: 'requested', label: t('hqDashboard.settlement.col.requested'), width: '1fr' },
    { key: 'held', label: t('hqDashboard.settlement.col.held'), width: '1fr' },
    { key: 'payable', label: t('hqDashboard.settlement.col.payable'), width: '1fr' },
    { key: 'status', label: t('hqDashboard.settlement.col.status'), width: '1fr' },
    { key: 'action', label: t('hqDashboard.settlement.col.action'), width: '1fr' },
  ]

  const riskStats: MiniStatCardData[] = scaleMiniStats(source.risk.stats as MiniStatRaw[], rangeMultiplier * fallbackRatio).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    accent: s.accent,
  }))
  // Figma 실측(80:511~): 8개 컬럼이 x=64부터 124px 등간격으로 균등 배치 → 전부 동일 폭(1fr)
  const riskColumns: Column[] = [
    { key: 'type', label: t('hqDashboard.risk.col.type'), width: '1fr' },
    { key: 'targetId', label: t('hqDashboard.risk.col.targetId'), width: '1fr' },
    { key: 'wallet', label: t('hqDashboard.risk.col.wallet'), width: '1fr' },
    { key: 'country', label: t('hqDashboard.risk.col.country'), width: '1fr' },
    { key: 'relatedTx', label: t('hqDashboard.risk.col.relatedTx'), width: '1fr' },
    { key: 'score', label: t('hqDashboard.risk.col.score'), width: '1fr' },
    { key: 'held', label: t('hqDashboard.risk.col.held'), width: '1fr' },
    { key: 'action', label: t('hqDashboard.risk.col.action'), width: '1fr' },
  ]

  // Figma 실측(80:566~): 8개 컬럼이 x=64부터 76.5px 등간격으로 균등 배치 → 전부 동일 폭(1fr)
  const countryOpsColumns: Column[] = [
    { key: 'id', label: t('hqDashboard.countryOps.col.country'), width: '1fr' },
    { key: 'leaders', label: t('hqDashboard.countryOps.col.leaders'), width: '1fr' },
    { key: 'partners', label: t('hqDashboard.countryOps.col.partners'), width: '1fr' },
    { key: 'merchants', label: t('hqDashboard.countryOps.col.merchants'), width: '1fr' },
    { key: 'members', label: t('hqDashboard.countryOps.col.members'), width: '1fr' },
    { key: 'amount', label: t('hqDashboard.countryOps.col.amount'), width: '1fr' },
    { key: 'syncFail', label: t('hqDashboard.countryOps.col.syncFail'), width: '1fr' },
    // 성장률 칸은 고정폭 배지(86px)라 1fr이 그보다 좁아지면 배지가 셀 밖으로 삐져나온다.
    // 배지+여백이 확실히 들어갈 최소폭(96px)을 px로 보장(minmax)해 어느 화면 폭에서도 안 삐져나옴.
    { key: 'growth', label: t('hqDashboard.countryOps.col.growth'), width: 'minmax(96px, 1fr)' },
  ]

  const approvalQueueStats: MiniStatCardData[] = scaleMiniStats(source.approvalQueue.stats as MiniStatRaw[], rangeMultiplier * fallbackRatio).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    accent: s.accent,
  }))
  // Figma 실측(80:657~): 8개 컬럼이 x=64부터 124px 등간격으로 균등 배치 → 전부 동일 폭(1fr)
  const approvalQueueColumns: Column[] = [
    { key: 'type', label: t('hqDashboard.approvalQueue.col.type'), width: '1fr' },
    { key: 'name', label: t('hqDashboard.approvalQueue.col.name'), width: '1fr' },
    { key: 'country', label: t('hqDashboard.approvalQueue.col.country'), width: '1fr' },
    { key: 'contact', label: t('hqDashboard.approvalQueue.col.contact'), width: '1fr' },
    { key: 'wallet', label: t('hqDashboard.approvalQueue.col.wallet'), width: '1fr' },
    { key: 'time', label: t('hqDashboard.approvalQueue.col.time'), width: '1fr' },
    { key: 'risk', label: t('hqDashboard.approvalQueue.col.risk'), width: '1fr' },
    { key: 'status', label: t('hqDashboard.approvalQueue.col.status'), width: '1fr' },
  ]

  const networkGrowthStats: MiniStatCardData[] = scaleMiniStats(source.networkGrowth.stats as MiniStatRaw[], fallbackRatio).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    accent: s.accent,
  }))

  const paymentMethodColumns: Column[] = [
    { key: 'id', label: t('hqDashboard.paymentMethod.col.method'), width: '0.9fr' },
    { key: 'count', label: t('hqDashboard.paymentMethod.col.count'), width: '0.9fr' },
    { key: 'successRate', label: t('hqDashboard.paymentMethod.col.successRate'), width: '0.9fr' },
    { key: 'failRate', label: t('hqDashboard.paymentMethod.col.failRate'), width: '0.9fr' },
    { key: 'avgApprove', label: t('hqDashboard.paymentMethod.col.avgApprove'), width: '0.9fr' },
    { key: 'sync', label: t('hqDashboard.paymentMethod.col.sync'), width: '0.8fr' },
    { key: 'failReason', label: t('hqDashboard.paymentMethod.col.failReason'), width: '1fr' },
  ]
  const paymentMethodDonut = source.paymentMethod.donut.map((d) => ({ ...d, label: t(d.labelKey) }))

  const activityLogColumns: Column[] = [
    { key: 'admin', label: t('hqDashboard.activityLogs.col.admin'), width: '1fr' },
    { key: 'menu', label: t('hqDashboard.activityLogs.col.menu'), width: '1fr' },
    { key: 'action', label: t('hqDashboard.activityLogs.col.action'), width: '1fr' },
    { key: 'targetId', label: t('hqDashboard.activityLogs.col.targetId'), width: '1fr' },
    { key: 'time', label: t('hqDashboard.activityLogs.col.time'), width: '0.8fr' },
    { key: 'ip', label: t('hqDashboard.activityLogs.col.ip'), width: '1fr' },
    { key: 'result', label: t('hqDashboard.activityLogs.col.result'), width: '0.8fr' },
    { key: 'riskLevel', label: t('hqDashboard.activityLogs.col.riskLevel'), width: '0.8fr' },
  ]

  const aiInsightItems = (source.aiInsight.items as AiInsightRaw[]).map((i) => ({
    ...i,
    message: t(i.messageKey),
    action: t(i.actionKey),
  }))

  const quickActions = source.quickActions.map((key) => ({
    id: key.replace('hqDashboard.quickActions.', ''),
    label: t(key),
  }))

  return {
    filters: {
      countryOptions,
      rangeOptions: Object.keys(RANGE_DAYS) as HqDashboardRange[],
      selectedCountry,
      selectedRange: range,
    },
    kpis,
    rankingPanels,
    realtimePayments: {
      columns: realtimePaymentColumns,
      rows: (source.realtimePayments.rows as RealtimePaymentRow[]).filter((row) => countryMatches(row.country, selectedCountry)),
    },
    offlinePay: { miniStats: offlinePayMiniStats, flowSteps: offlinePayFlowSteps },
    settlement: {
      stats: settlementStats,
      columns: settlementColumns,
      rows: (source.settlement.rows as SettlementRow[]).filter((row) => countryMatches(row.country, selectedCountry)),
    },
    risk: {
      stats: riskStats,
      columns: riskColumns,
      rows: (source.risk.rows as RiskRow[]).filter((row) => countryMatches(row.country, selectedCountry)),
    },
    countryOps: {
      columns: countryOpsColumns,
      rows: selectedCountryRow ? [selectedCountryRow] : source.countryOps.rows,
      heatmap: selectedCountryRow
        ? source.countryOps.heatmap.filter((item) => item.code === (COUNTRY_CODE_BY_NAME[selectedCountryRow.id] ?? selectedCountryRow.id))
        : source.countryOps.heatmap,
    },
    approvalQueue: {
      stats: approvalQueueStats,
      columns: approvalQueueColumns,
      rows: (source.approvalQueue.rows as ApprovalQueueRow[]).filter((row) => countryMatches(row.country, selectedCountry)),
    },
    networkGrowth: {
      stats: networkGrowthStats,
      trendBars: source.networkGrowth.trendBars,
      topPartners:
        source === data && selectedCountryRow
          ? [{ id: selectedCountryRow.id, name: selectedCountryRow.id, amount: selectedCountryRow.amount }]
          : source.networkGrowth.topPartners,
    },
    paymentMethod: { columns: paymentMethodColumns, rows: source.paymentMethod.rows as PaymentMethodRow[], donut: paymentMethodDonut },
    activityLogs: { columns: activityLogColumns, rows: source.activityLogs.rows as ActivityLogRow[] },
    aiInsight: aiInsightItems,
    quickActions,
  }
}
