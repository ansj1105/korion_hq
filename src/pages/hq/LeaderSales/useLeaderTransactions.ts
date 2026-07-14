import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'
import type { LeaderSalesLogRow } from './useLeaderSales'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
}

interface LeaderTransactionsData {
  kpi: KpiRaw[]
  rows: LeaderSalesLogRow[]
}

const fallbackData: LeaderTransactionsData = {
  kpi: [],
  rows: [],
}

export function useLeaderTransactions(leaderCode?: string) {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData(
    `/api/hq/leaders/${encodeURIComponent(leaderCode ?? '')}/sales/transactions`,
    fallbackData,
    { leaderCode },
  )

  const kpi: StatCardData[] = pageData.kpi.map((s) => ({ id: s.id, label: t(s.labelKey), value: s.value }))

  const columns: Column[] = [
    { key: 'txNo', label: t('hqLeaderSales.col.txNo'), width: '0.6fr' },
    { key: 'partnerCode', label: t('hqLeaderSales.col.partnerCode'), width: '1.1fr' },
    { key: 'txAt', label: t('hqLeaderSales.col.txAt'), width: '1.2fr' },
    { key: 'merchantCode', label: t('hqLeaderSales.col.merchantCode'), width: '1.1fr' },
    { key: 'merchantName', label: t('hqLeaderSales.col.merchantName'), width: '0.9fr' },
    { key: 'amount', label: t('hqLeaderSales.col.amount'), width: '0.9fr' },
    { key: 'method', label: t('hqLeaderSales.col.method'), width: '0.8fr' },
    { key: 'fee', label: t('hqLeaderSales.col.fee'), width: '0.9fr' },
    { key: 'net', label: t('hqLeaderSales.col.net'), width: '0.9fr' },
    { key: 'status', label: t('hqLeaderSales.col.status'), width: '0.8fr' },
    { key: 'syncStatus', label: t('hqLeaderSales.col.syncStatus'), width: '0.9fr' },
    { key: 'action', label: t('hqLeaderSales.col.action'), width: 'minmax(150px, 1.6fr)' },
  ]

  return { kpi, columns, rows: pageData.rows, isLoading, error }
}
