import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'
import data from './partnerDetailData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
}

export interface PartnerMerchantRow {
  no: string
  partnerCode: string
  merchantCode: string
  city: string
  merchantName: string
  sector: string
  monthVolume: string
  monthTxCount: string
  fee: string
  lastPaidAt: string
  usage: string
}

export function usePartnerMerchants(partnerCode?: string) {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData(
    `/api/hq/partners/${encodeURIComponent(partnerCode ?? '')}/sales/merchants`,
    { kpi: data.tabKpi, rows: data.merchantRows },
    { partnerCode },
  )

  const kpi: StatCardData[] = (pageData.kpi as KpiRaw[]).map((s) => ({ id: s.id, label: t(s.labelKey), value: s.value }))
  const columns: Column[] = [
    { key: 'no', label: t('hqLeaderSales.merchants.col.no'), width: '0.5fr' },
    { key: 'partnerCode', label: t('hqLeaderSales.merchants.col.partnerCode'), width: '1.1fr' },
    { key: 'merchantCode', label: t('hqLeaderSales.merchants.col.merchantCode'), width: '1.1fr' },
    { key: 'city', label: t('hqPartnerSales.merchants.col.city'), width: '0.7fr' },
    { key: 'merchantName', label: t('hqLeaderSales.merchants.col.merchantName'), width: '0.9fr' },
    { key: 'sector', label: t('hqPartnerSales.merchants.col.sector'), width: '0.8fr' },
    { key: 'monthVolume', label: t('hqLeaderSales.merchants.col.monthVolume'), width: '0.9fr' },
    { key: 'monthTxCount', label: t('hqLeaderSales.merchants.col.monthTxCount'), width: '1fr' },
    { key: 'fee', label: t('hqLeaderSales.merchants.col.fee'), width: '0.9fr' },
    { key: 'lastPaidAt', label: t('hqLeaderSales.merchants.col.lastPaidAt'), width: '1fr' },
    { key: 'usage', label: t('hqLeaderSales.merchants.col.usage'), width: '1.4fr' },
    { key: 'action', label: t('hqLeaderSales.merchants.col.action'), width: '0.7fr' },
  ]

  return { kpi, columns, rows: pageData.rows as PartnerMerchantRow[], isLoading, error }
}
