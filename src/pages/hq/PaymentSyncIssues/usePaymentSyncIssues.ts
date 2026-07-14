import { useTranslation } from '../../../i18n'
import { useHqPageData } from '../../../hooks/useHqPageData'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import data from './paymentSyncIssuesData.json'

export interface PaymentSyncIssueRow {
  id: string
  no: string
  txId: string
  sessionId: string
  proofId: string
  occurredAt: string
  updatedAt: string
  leaderCode: string
  partnerCode: string
  merchantCode: string
  merchantName: string
  country: string
  amount: string
  connection: string
  senderDeviceId: string
  receiverDeviceId: string
  senderUploadStatus: string
  receiverUploadStatus: string
  serverVerifyStatus: string
  settlementStatus: string
  sourceStatus: string
  overallStatus: string
  overallAccent?: string
  senderAccent?: string
  receiverAccent?: string
  longWaiting: boolean
  retryable: boolean
  reason: string
  actions: string[]
}

interface PaymentSyncIssuesPageData {
  stats: Array<{ id: string; labelKey: string; value: string; delta?: string; deltaBadge?: boolean }>
  rows: PaymentSyncIssueRow[]
}

export function usePaymentSyncIssues() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData<PaymentSyncIssuesPageData>(
    '/api/hq/payments/sync-issues',
    data as PaymentSyncIssuesPageData,
  )

  const stats: StatCardData[] = pageData.stats.map((stat) => ({
    id: stat.id,
    label: t(stat.labelKey),
    value: stat.value,
    delta: stat.delta,
    deltaBadge: stat.deltaBadge,
    dense: true,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqPaymentSyncIssues.col.no'), width: '0.5fr', align: 'center' },
    { key: 'txId', label: t('hqPaymentSyncIssues.col.txId'), width: '1fr' },
    { key: 'occurredAt', label: t('hqPaymentSyncIssues.col.occurredAt'), width: '1.1fr' },
    { key: 'merchantName', label: t('hqPaymentSyncIssues.col.merchantName'), width: '1.2fr' },
    { key: 'senderDeviceId', label: t('hqPaymentSyncIssues.col.senderDeviceId'), width: '1.25fr' },
    { key: 'senderUploadStatus', label: t('hqPaymentSyncIssues.col.senderUploadStatus'), width: '1fr' },
    { key: 'receiverDeviceId', label: t('hqPaymentSyncIssues.col.receiverDeviceId'), width: '1.25fr' },
    { key: 'receiverUploadStatus', label: t('hqPaymentSyncIssues.col.receiverUploadStatus'), width: '1fr' },
    { key: 'serverVerifyStatus', label: t('hqPaymentSyncIssues.col.serverVerifyStatus'), width: '1.1fr' },
    { key: 'settlementStatus', label: t('hqPaymentSyncIssues.col.settlementStatus'), width: '0.95fr' },
    { key: 'overallStatus', label: t('hqPaymentSyncIssues.col.overallStatus'), width: '0.9fr' },
    { key: 'reason', label: t('hqPaymentSyncIssues.col.reason'), width: '1.3fr' },
    { key: 'action', label: t('hqPaymentSyncIssues.col.action'), width: '1fr' },
  ]

  return {
    title: t('hqPaymentSyncIssues.title'),
    desc: t('hqPaymentSyncIssues.desc'),
    tableTitle: t('hqPaymentSyncIssues.tableTitle'),
    noticeTitle: t('hqPaymentSyncIssues.notice.title'),
    noticeDesc: t('hqPaymentSyncIssues.notice.desc'),
    stats,
    columns,
    rows: pageData.rows,
    isLoading,
    error,
  }
}
