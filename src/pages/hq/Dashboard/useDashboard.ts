import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { MiniStatCardData } from '../../../components/molecules/MiniStatCard'
import type { Column } from '../../../components/organisms/DataTable'
import type { AccentKey } from '../../../types'
import data from './dashboardData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  noteKey: string
  labelTone?: 'default' | 'amber' | 'green'
  deltaTone?: 'cyan' | 'red'
}

interface MiniStatRaw {
  id: string
  labelKey: string
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

interface AiInsightRaw {
  id: string
  severity: string
  severityAccent: AccentKey
  messageKey: string
  actionKey: string
}

/*
 * useDashboard — 본사어드민 "전체 운영 대시보드" 데이터 훅
 * ------------------------------------------------------------------
 * dashboardData.json(더미)을 읽어 UI 라벨(지표명/컬럼명)은 번역해 반환한다.
 * 행 데이터(국가명/지갑주소/금액 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과.
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체하면 Dashboard.tsx는 그대로 동작한다.
 */
export function useDashboard() {
  const { t } = useTranslation()

  const kpis: StatCardData[] = (data.kpis as KpiRaw[]).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: t(k.noteKey),
    labelTone: k.labelTone,
    deltaTone: k.deltaTone,
  }))

  const rankingPanels = data.rankingPanels.map((p) => ({ id: p.id, title: t(p.titleKey) }))

  const realtimePaymentColumns: Column[] = [
    { key: 'id', label: t('hqDashboard.realtimePayments.col.id'), width: '1.3fr' },
    { key: 'country', label: t('hqDashboard.realtimePayments.col.country'), width: '1fr' },
    { key: 'merchant', label: t('hqDashboard.realtimePayments.col.merchant'), width: '1.1fr' },
    { key: 'method', label: t('hqDashboard.realtimePayments.col.method'), width: '0.7fr' },
    { key: 'connection', label: t('hqDashboard.realtimePayments.col.connection'), width: '0.9fr' },
    { key: 'amount', label: t('hqDashboard.realtimePayments.col.amount'), width: '1fr' },
    { key: 'status', label: t('hqDashboard.realtimePayments.col.status'), width: '1fr' },
    { key: 'sync', label: t('hqDashboard.realtimePayments.col.sync'), width: '1fr' },
    { key: 'verify', label: t('hqDashboard.realtimePayments.col.verify'), width: '1fr' },
    { key: 'detail', label: t('hqDashboard.realtimePayments.col.detail'), width: '0.8fr' },
  ]

  const offlinePayMiniStats: MiniStatCardData[] = (data.offlinePay.miniStats as MiniStatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    accent: s.accent,
  }))
  const offlinePayFlowSteps = data.offlinePay.flowSteps.map((key) => t(key))

  const settlementStats: MiniStatCardData[] = (data.settlement.stats as MiniStatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    accent: s.accent,
  }))
  const settlementColumns: Column[] = [
    { key: 'type', label: t('hqDashboard.settlement.col.type'), width: '0.8fr' },
    { key: 'name', label: t('hqDashboard.settlement.col.name'), width: '1.1fr' },
    { key: 'country', label: t('hqDashboard.settlement.col.country'), width: '0.9fr' },
    { key: 'requested', label: t('hqDashboard.settlement.col.requested'), width: '1.1fr' },
    { key: 'held', label: t('hqDashboard.settlement.col.held'), width: '1fr' },
    { key: 'payable', label: t('hqDashboard.settlement.col.payable'), width: '1.1fr' },
    { key: 'status', label: t('hqDashboard.settlement.col.status'), width: '1fr' },
    { key: 'action', label: t('hqDashboard.settlement.col.action'), width: '0.8fr' },
  ]

  const riskStats: MiniStatCardData[] = (data.risk.stats as MiniStatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    accent: s.accent,
  }))
  const riskColumns: Column[] = [
    { key: 'type', label: t('hqDashboard.risk.col.type'), width: '1.1fr' },
    { key: 'targetId', label: t('hqDashboard.risk.col.targetId'), width: '0.9fr' },
    { key: 'wallet', label: t('hqDashboard.risk.col.wallet'), width: '1fr' },
    { key: 'country', label: t('hqDashboard.risk.col.country'), width: '0.9fr' },
    { key: 'relatedTx', label: t('hqDashboard.risk.col.relatedTx'), width: '0.8fr' },
    { key: 'score', label: t('hqDashboard.risk.col.score'), width: '0.9fr' },
    { key: 'held', label: t('hqDashboard.risk.col.held'), width: '1fr' },
    { key: 'action', label: t('hqDashboard.risk.col.action'), width: '0.8fr' },
  ]

  const countryOpsColumns: Column[] = [
    { key: 'id', label: t('hqDashboard.countryOps.col.country'), width: '1.1fr' },
    { key: 'leaders', label: t('hqDashboard.countryOps.col.leaders'), width: '0.8fr' },
    { key: 'partners', label: t('hqDashboard.countryOps.col.partners'), width: '0.8fr' },
    { key: 'merchants', label: t('hqDashboard.countryOps.col.merchants'), width: '0.8fr' },
    { key: 'members', label: t('hqDashboard.countryOps.col.members'), width: '0.9fr' },
    { key: 'amount', label: t('hqDashboard.countryOps.col.amount'), width: '0.9fr' },
    { key: 'syncFail', label: t('hqDashboard.countryOps.col.syncFail'), width: '0.9fr' },
    // 성장률 칸은 알약(배지)이라 좁아지면 잘려서, 최소 폭을 px로 보장(minmax)
    { key: 'growth', label: t('hqDashboard.countryOps.col.growth'), width: 'minmax(92px, 0.9fr)' },
  ]

  const approvalQueueStats: MiniStatCardData[] = (data.approvalQueue.stats as MiniStatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    accent: s.accent,
  }))
  const approvalQueueColumns: Column[] = [
    { key: 'type', label: t('hqDashboard.approvalQueue.col.type'), width: '0.8fr' },
    { key: 'name', label: t('hqDashboard.approvalQueue.col.name'), width: '1.1fr' },
    { key: 'country', label: t('hqDashboard.approvalQueue.col.country'), width: '0.9fr' },
    { key: 'contact', label: t('hqDashboard.approvalQueue.col.contact'), width: '1fr' },
    { key: 'wallet', label: t('hqDashboard.approvalQueue.col.wallet'), width: '0.9fr' },
    { key: 'time', label: t('hqDashboard.approvalQueue.col.time'), width: '0.7fr' },
    { key: 'risk', label: t('hqDashboard.approvalQueue.col.risk'), width: '0.8fr' },
    { key: 'status', label: t('hqDashboard.approvalQueue.col.status'), width: '0.9fr' },
  ]

  const networkGrowthStats: MiniStatCardData[] = (data.networkGrowth.stats as MiniStatRaw[]).map((s) => ({
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
  const paymentMethodDonut = data.paymentMethod.donut.map((d) => ({ ...d, label: t(d.labelKey) }))

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

  const aiInsightItems = (data.aiInsight.items as AiInsightRaw[]).map((i) => ({
    ...i,
    message: t(i.messageKey),
    action: t(i.actionKey),
  }))

  const quickActions = data.quickActions.map((key) => t(key))

  return {
    kpis,
    rankingPanels,
    realtimePayments: { columns: realtimePaymentColumns, rows: data.realtimePayments.rows as RealtimePaymentRow[] },
    offlinePay: { miniStats: offlinePayMiniStats, flowSteps: offlinePayFlowSteps },
    settlement: { stats: settlementStats, columns: settlementColumns, rows: data.settlement.rows as SettlementRow[] },
    risk: { stats: riskStats, columns: riskColumns, rows: data.risk.rows as RiskRow[] },
    countryOps: { columns: countryOpsColumns, rows: data.countryOps.rows, heatmap: data.countryOps.heatmap },
    approvalQueue: { stats: approvalQueueStats, columns: approvalQueueColumns, rows: data.approvalQueue.rows as ApprovalQueueRow[] },
    networkGrowth: { stats: networkGrowthStats, trendBars: data.networkGrowth.trendBars, topPartners: data.networkGrowth.topPartners },
    paymentMethod: { columns: paymentMethodColumns, rows: data.paymentMethod.rows as PaymentMethodRow[], donut: paymentMethodDonut },
    activityLogs: { columns: activityLogColumns, rows: data.activityLogs.rows as ActivityLogRow[] },
    aiInsight: aiInsightItems,
    quickActions,
  }
}
