import { useTranslation } from '../../../i18n'
import { useHqPageData } from '../../../hooks/useHqPageData'
import type { Column } from '../../../components/organisms/DataTable'
import type { StatCardData } from '../../../components/molecules/StatCard'
import data from './paymentErrorCodesData.json'

export interface PaymentErrorCodeRow {
  id: string
  no: string
  registeredAt: string
  updatedAt: string
  code: string
  name: string
  category: string
  severity: string
  userMessage: string
  adminDescription: string
  autoAction: string
  ownerTeam: string
  httpStatus: string
  retryable: boolean
  settlementBlocked: boolean
  riskHold: boolean
  publicVisible: boolean
  status: string
  memo: string
  severityAccent?: string
  statusAccent?: string
  actions: string[]
}

export interface PaymentErrorCodeOptions {
  categories: string[]
  severities: string[]
  autoActions: string[]
  statuses: string[]
}

interface PaymentErrorCodesPageData {
  stats: Array<{ id: string; labelKey: string; value: string; delta?: string; deltaBadge?: boolean }>
  options: PaymentErrorCodeOptions
  rows: PaymentErrorCodeRow[]
}

export function usePaymentErrorCodes() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData<PaymentErrorCodesPageData>(
    '/api/hq/payments/error-codes',
    data as PaymentErrorCodesPageData,
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
    { key: 'no', label: t('hqPaymentErrorCodes.col.no'), width: '0.55fr', align: 'center' },
    { key: 'registeredAt', label: t('hqPaymentErrorCodes.col.registeredAt'), width: '1.15fr' },
    { key: 'code', label: t('hqPaymentErrorCodes.col.code'), width: '1.35fr' },
    { key: 'name', label: t('hqPaymentErrorCodes.col.name'), width: '1fr' },
    { key: 'category', label: t('hqPaymentErrorCodes.col.category'), width: '1fr' },
    { key: 'severity', label: t('hqPaymentErrorCodes.col.severity'), width: '0.85fr' },
    { key: 'userMessage', label: t('hqPaymentErrorCodes.col.userMessage'), width: '1.7fr' },
    { key: 'autoAction', label: t('hqPaymentErrorCodes.col.autoAction'), width: '1.2fr' },
    { key: 'ownerTeam', label: t('hqPaymentErrorCodes.col.ownerTeam'), width: '1fr' },
    { key: 'flags', label: t('hqPaymentErrorCodes.col.flags'), width: '1.25fr' },
    { key: 'status', label: t('hqPaymentErrorCodes.col.status'), width: '0.8fr' },
    { key: 'action', label: t('hqPaymentErrorCodes.col.action'), width: '0.8fr' },
  ]

  return {
    title: t('hqPaymentErrorCodes.title'),
    desc: t('hqPaymentErrorCodes.desc'),
    tableTitle: t('hqPaymentErrorCodes.tableTitle'),
    noticeTitle: t('hqPaymentErrorCodes.notice.title'),
    noticeDesc: t('hqPaymentErrorCodes.notice.desc'),
    stats,
    columns,
    rows: pageData.rows,
    options: pageData.options,
    isLoading,
    error,
  }
}

export type PaymentErrorCodeCreateRequest = Omit<PaymentErrorCodeRow, 'id' | 'no' | 'registeredAt' | 'updatedAt' | 'severityAccent' | 'statusAccent' | 'actions' | 'httpStatus'> & {
  httpStatus?: number | null
}
