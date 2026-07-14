import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'
import data from './partnerSalesData.json'
import type { PartnerSalesLogRow } from './usePartnerSales'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
}

export function usePartnerTransactions(partnerCode?: string) {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData(
    `/api/hq/partners/${encodeURIComponent(partnerCode ?? '')}/sales/transactions`,
    { kpi: data.miniStats, rows: data.logRows },
    { partnerCode },
  )

  const kpi: StatCardData[] = (pageData.kpi as KpiRaw[]).map((s) => ({ id: s.id, label: t(s.labelKey), value: s.value }))
  const columns: Column[] = [
    { key: 'txNo', label: t('hqPartnerSales.col.txNo'), width: '0.6fr' },
    { key: 'partnerCode', label: t('hqPartnerSales.col.partnerCode'), width: '1.1fr' },
    { key: 'txAt', label: t('hqPartnerSales.col.txAt'), width: '1.2fr' },
    { key: 'merchantCode', label: t('hqPartnerSales.col.merchantCode'), width: '1.1fr' },
    { key: 'merchantName', label: t('hqPartnerSales.col.merchantName'), width: '0.9fr' },
    { key: 'amount', label: t('hqPartnerSales.col.amount'), width: '0.9fr' },
    { key: 'method', label: t('hqPartnerSales.col.method'), width: '0.8fr' },
    { key: 'fee', label: t('hqPartnerSales.col.fee'), width: '0.9fr' },
    { key: 'net', label: t('hqPartnerSales.col.net'), width: '0.9fr' },
    { key: 'status', label: t('hqPartnerSales.col.status'), width: '0.8fr' },
    { key: 'syncStatus', label: t('hqPartnerSales.col.syncStatus'), width: '0.9fr' },
    { key: 'action', label: t('hqPartnerSales.col.action'), width: 'minmax(150px, 1.6fr)' },
  ]

  return { kpi, columns, rows: pageData.rows as PartnerSalesLogRow[], isLoading, error }
}
