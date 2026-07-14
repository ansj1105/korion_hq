import { useEffect, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { MiniStatCardData } from '../../../components/molecules/MiniStatCard'
import type { Column } from '../../../components/organisms/DataTable'
import type { AccentKey } from '../../../types'
import { fetchHqPageData } from '../../../services/korionChongApi'

export type HqDashboardRange = 'ALL' | '1D' | '7D' | '14D' | '30D' | '90D' | '180D' | '365D'

interface UseDashboardFilters {
  countryScope?: string
  range?: HqDashboardRange
  refreshToken?: number
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
 * dashboard 응답의 accent류 필드는 AccentKey로 단언해 사용한다.
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
  settlementRequestId?: string | number
  requestNo?: string
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
  typeKey?: string
  typeCode?: string
  targetId: string
  wallet: string
  country: string
  relatedTx: string
  score: string
  scoreAccent?: AccentKey
  scoreCriteriaKey?: string
  held: string
  actionStatus?: string
  actionStatusCode?: string
  actionStatusKey?: string
  actionStatusAccent?: AccentKey
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

interface CountryOpsRow {
  rank?: string
  id: string
  leaders: string
  partners: string
  merchants: string
  members: string
  amount: string
  syncFail: string
  growth: string
}

interface ActivityLogRow {
  id: string
  adminId?: string
  admin: string
  eventType?: string
  menu: string
  menuAccent?: AccentKey
  action: string
  actionAccent?: AccentKey
  targetId: string
  time: string
  ip: string
  result: string
  resultAccent?: AccentKey
  riskLevel: string
  riskAccent: AccentKey
}

interface RankingRowRaw {
  rank: number
  name: string
  meta: string
  amount: string
}

interface TrendBarRaw {
  height: number
  count?: number
  accent: string
}

interface PaymentMethodDonutSegment {
  id: string
  labelKey: string
  label?: string
  pct: number
  accent: AccentKey
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
  eventType?: string
  sourceKey?: string
  collectorStatusKey?: string
  collectorStatusAccent?: AccentKey
  evidenceLabelKey?: string
  evidenceCount?: number
  logQuery?: string
  actionRoute?: string
}

interface DashboardData {
  filters?: {
    countryOptions?: Array<{ value: string; label: string }>
    rangeOptions?: HqDashboardRange[]
  }
  kpis: KpiRaw[]
  rankingPanels: RankingPanelRaw[]
  realtimePayments: { rows: RealtimePaymentRow[] }
  offlinePay: { miniStats: MiniStatRaw[]; flowSteps: string[] }
  settlement: { stats: MiniStatRaw[]; rows: SettlementRow[] }
  risk: { stats: MiniStatRaw[]; rows: RiskRow[] }
  countryOps: { rows: CountryOpsRow[]; heatmap: Array<{ code: string; [key: string]: unknown }> }
  approvalQueue: { stats: MiniStatRaw[]; rows: ApprovalQueueRow[] }
  networkGrowth: {
    stats: MiniStatRaw[]
    trendBars: TrendBarRaw[]
    topPartners: RankingRowRaw[]
    topLeaders: RankingRowRaw[]
    topMerchants: RankingRowRaw[]
  }
  paymentMethod: { rows: PaymentMethodRow[]; donut: PaymentMethodDonutSegment[] }
  activityLogs: { rows: ActivityLogRow[] }
  aiInsight: { items: AiInsightRaw[] }
  quickActions: string[]
}

const ALL_COUNTRIES = 'all'
const RANGE_OPTIONS: HqDashboardRange[] = ['ALL', '1D', '7D', '14D', '30D', '90D', '180D', '365D']

const DASHBOARD_QUICK_ACTION_KEYS = [
  'hqDashboard.quickActions.reviewApplications',
  'hqDashboard.quickActions.approveSettlement',
  'hqDashboard.quickActions.retrySyncFailures',
  'hqDashboard.quickActions.addBlacklist',
  'hqDashboard.quickActions.sendNotice',
  'hqDashboard.quickActions.maintenanceMode',
  'hqDashboard.quickActions.viewAdminLogs',
  'hqDashboard.quickActions.exportReport',
]

const emptyDashboardData: DashboardData = {
  kpis: [],
  rankingPanels: [],
  realtimePayments: { rows: [] },
  offlinePay: { miniStats: [], flowSteps: [] },
  settlement: { stats: [], rows: [] },
  risk: { stats: [], rows: [] },
  countryOps: { rows: [], heatmap: [] },
  approvalQueue: { stats: [], rows: [] },
  networkGrowth: { stats: [], trendBars: [], topPartners: [], topLeaders: [], topMerchants: [] },
  paymentMethod: { rows: [], donut: [] },
  activityLogs: { rows: [] },
  aiInsight: { items: [] },
  quickActions: DASHBOARD_QUICK_ACTION_KEYS,
}

function normalizeTopRows(rows: RankingRowRaw[] | undefined): RankingRowRaw[] {
  return (rows ?? []).map((row, index) => ({
    rank: row.rank ?? index + 1,
    name: row.name,
    meta: row.meta ?? row.name,
    amount: row.amount,
  }))
}

function withRows<T extends { rows?: unknown[] }>(payloadSection: T, fallbackSection: T): T {
  return {
    ...fallbackSection,
    ...payloadSection,
    rows: Array.isArray(payloadSection.rows) ? payloadSection.rows : fallbackSection.rows,
  }
}

function withItems<T extends { items?: unknown[] }>(payloadSection: T, fallbackSection: T): T {
  return {
    ...fallbackSection,
    ...payloadSection,
    items: Array.isArray(payloadSection.items) ? payloadSection.items : fallbackSection.items,
  }
}

function withNonEmptyArray<T>(payload: T[] | undefined, fallback: T[]): T[] {
  return Array.isArray(payload) ? payload : fallback
}

function withApiArray<T>(payload: T[] | undefined, fallback: T[]): T[] {
  return Array.isArray(payload) ? payload : fallback
}

function withDashboardDefaults(payload: DashboardData): DashboardData {
  return {
    ...emptyDashboardData,
    ...payload,
    filters: payload.filters,
    kpis: withNonEmptyArray(payload.kpis, emptyDashboardData.kpis),
    rankingPanels: withNonEmptyArray(payload.rankingPanels, emptyDashboardData.rankingPanels),
    realtimePayments: withRows(payload.realtimePayments, emptyDashboardData.realtimePayments),
    offlinePay: {
      ...emptyDashboardData.offlinePay,
      ...payload.offlinePay,
      miniStats: withNonEmptyArray(payload.offlinePay?.miniStats, emptyDashboardData.offlinePay.miniStats),
      flowSteps: withNonEmptyArray(payload.offlinePay?.flowSteps, emptyDashboardData.offlinePay.flowSteps),
    },
    settlement: {
      ...emptyDashboardData.settlement,
      ...payload.settlement,
      stats: withNonEmptyArray(payload.settlement?.stats, emptyDashboardData.settlement.stats),
      rows: withNonEmptyArray(payload.settlement?.rows, emptyDashboardData.settlement.rows),
    },
    risk: {
      ...emptyDashboardData.risk,
      ...payload.risk,
      stats: withNonEmptyArray(payload.risk?.stats, emptyDashboardData.risk.stats),
      rows: withNonEmptyArray(payload.risk?.rows, emptyDashboardData.risk.rows),
    },
    countryOps: {
      ...emptyDashboardData.countryOps,
      ...payload.countryOps,
      rows: withNonEmptyArray(payload.countryOps?.rows, emptyDashboardData.countryOps.rows),
      heatmap: withNonEmptyArray(payload.countryOps?.heatmap, emptyDashboardData.countryOps.heatmap),
    },
    approvalQueue: {
      ...emptyDashboardData.approvalQueue,
      ...payload.approvalQueue,
      stats: withApiArray(payload.approvalQueue?.stats, emptyDashboardData.approvalQueue.stats),
      rows: withApiArray(payload.approvalQueue?.rows, emptyDashboardData.approvalQueue.rows),
    },
    networkGrowth: {
      ...emptyDashboardData.networkGrowth,
      ...payload.networkGrowth,
      stats: withNonEmptyArray(payload.networkGrowth?.stats, emptyDashboardData.networkGrowth.stats),
      trendBars: withNonEmptyArray(payload.networkGrowth?.trendBars, emptyDashboardData.networkGrowth.trendBars),
      topPartners: withNonEmptyArray(payload.networkGrowth?.topPartners, emptyDashboardData.networkGrowth.topPartners),
      topLeaders: withNonEmptyArray(payload.networkGrowth?.topLeaders, emptyDashboardData.networkGrowth.topLeaders ?? []),
      topMerchants: withNonEmptyArray(payload.networkGrowth?.topMerchants, emptyDashboardData.networkGrowth.topMerchants ?? []),
    },
    paymentMethod: {
      ...emptyDashboardData.paymentMethod,
      ...payload.paymentMethod,
      rows: withNonEmptyArray(payload.paymentMethod?.rows, emptyDashboardData.paymentMethod.rows),
      donut: withNonEmptyArray(payload.paymentMethod?.donut, emptyDashboardData.paymentMethod.donut),
    },
    activityLogs: withRows(payload.activityLogs, emptyDashboardData.activityLogs),
    aiInsight: withItems(payload.aiInsight, emptyDashboardData.aiInsight),
    quickActions: withNonEmptyArray(payload.quickActions, emptyDashboardData.quickActions),
  }
}

/*
 * useDashboard — 본사어드민 "전체 운영 대시보드" 데이터 훅
 * ------------------------------------------------------------------
 * /api/hq/dashboard 응답만 화면 데이터로 사용한다. 실패 시 샘플 JSON을 노출하지 않는다.
 * UI 라벨(지표명/컬럼명)은 번역해 반환하고, 행 데이터(국가코드/금액/상태)는 API 값을 그대로 통과한다.
 */
export function useDashboard(filters: UseDashboardFilters = {}) {
  const { t } = useTranslation()
  const range = filters.range ?? 'ALL'
  const [source, setSource] = useState(emptyDashboardData)

  useEffect(() => {
    let alive = true
    fetchHqPageData<DashboardData>('/api/hq/dashboard', {
      countryScope: filters.countryScope ?? ALL_COUNTRIES,
      range,
    })
      .then((payload) => {
        if (alive) setSource(withDashboardDefaults(payload))
      })
      .catch(() => {
        if (alive) setSource(emptyDashboardData)
      })
    return () => {
      alive = false
    }
  }, [filters.countryScope, filters.refreshToken, range])

  const countryRows = (source.countryOps.rows as CountryOpsRow[]).map((row, index) => ({
    ...row,
    rank: row.rank ?? String(index + 1),
  }))
  const countryOptions = source.filters?.countryOptions?.length
    ? source.filters.countryOptions.map((option) => ({
        value: option.value,
        label: option.value === ALL_COUNTRIES ? t('hqDashboard.filter.allCountries') : option.label,
      }))
    : [
        { value: ALL_COUNTRIES, label: t('hqDashboard.filter.allCountries') },
        ...countryRows.map((row) => ({ value: row.id, label: row.id })),
      ]
  const selectedCountry = countryOptions.some((option) => option.value === filters.countryScope) ? filters.countryScope ?? ALL_COUNTRIES : ALL_COUNTRIES

  const kpis: StatCardData[] = (source.kpis as KpiRaw[]).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
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

  const offlinePayMiniStats: MiniStatCardData[] = (source.offlinePay.miniStats as MiniStatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    note: s.note ?? (s.noteKey ? t(s.noteKey) : undefined),
    value: s.value,
    accent: s.accent,
  }))
  const offlinePayFlowSteps = source.offlinePay.flowSteps.map((key) => t(key))

  const settlementStats: MiniStatCardData[] = (source.settlement.stats as MiniStatRaw[]).map((s) => ({
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

  const riskStats: MiniStatCardData[] = (source.risk.stats as MiniStatRaw[]).map((s) => ({
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
    { key: 'actionStatus', label: t('hqDashboard.risk.col.actionStatus'), width: '1fr' },
    { key: 'action', label: t('hqDashboard.risk.col.action'), width: '1.6fr' },
  ]

  // Figma 실측(80:566~): 8개 컬럼이 x=64부터 76.5px 등간격으로 균등 배치 → 전부 동일 폭(1fr)
  const countryOpsColumns: Column[] = [
    { key: 'rank', label: t('hqDashboard.countryOps.col.rank'), width: '0.7fr' },
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

  const approvalQueueStats: MiniStatCardData[] = (source.approvalQueue.stats as MiniStatRaw[]).map((s) => ({
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

  const networkGrowthStats: MiniStatCardData[] = (source.networkGrowth.stats as MiniStatRaw[]).map((s) => ({
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
    source: i.sourceKey ? t(i.sourceKey) : '',
    collectorStatus: i.collectorStatusKey ? t(i.collectorStatusKey) : '',
    evidenceLabel: i.evidenceLabelKey ? `${t(i.evidenceLabelKey)} ${i.evidenceCount ?? 0}` : '',
  }))

  const quickActions = source.quickActions.map((key) => ({
    id: key.replace('hqDashboard.quickActions.', ''),
    label: t(key),
  }))

  return {
    filters: {
      countryOptions,
      rangeOptions: RANGE_OPTIONS,
      selectedCountry,
      selectedRange: range,
    },
    kpis,
    rankingPanels,
    realtimePayments: {
      columns: realtimePaymentColumns,
      rows: source.realtimePayments.rows as RealtimePaymentRow[],
    },
    offlinePay: { miniStats: offlinePayMiniStats, flowSteps: offlinePayFlowSteps },
    settlement: {
      stats: settlementStats,
      columns: settlementColumns,
      rows: source.settlement.rows as SettlementRow[],
    },
    risk: {
      stats: riskStats,
      columns: riskColumns,
      rows: source.risk.rows as RiskRow[],
    },
    countryOps: {
      columns: countryOpsColumns,
      rows: countryRows,
      heatmap: source.countryOps.heatmap,
    },
    approvalQueue: {
      stats: approvalQueueStats,
      columns: approvalQueueColumns,
      rows: source.approvalQueue.rows as ApprovalQueueRow[],
    },
    networkGrowth: {
      stats: networkGrowthStats,
      trendBars: source.networkGrowth.trendBars as TrendBarRaw[],
      topLeaders: normalizeTopRows(source.networkGrowth.topLeaders as RankingRowRaw[] | undefined),
      topPartners: normalizeTopRows(source.networkGrowth.topPartners as RankingRowRaw[] | undefined),
      topMerchants: normalizeTopRows(source.networkGrowth.topMerchants as RankingRowRaw[] | undefined),
    },
    paymentMethod: { columns: paymentMethodColumns, rows: source.paymentMethod.rows as PaymentMethodRow[], donut: paymentMethodDonut },
    activityLogs: { columns: activityLogColumns, rows: source.activityLogs.rows as ActivityLogRow[] },
    aiInsight: aiInsightItems,
    quickActions,
  }
}
