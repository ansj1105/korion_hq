import { useTranslation } from '../../../i18n'
import type { InfoItem } from '../../../components/molecules/InfoGrid'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'
import data from './partnerSettlementData.json'

interface FieldRaw {
  labelKey?: string
  label?: string
  value: string
  color?: string
}

export function usePartnerSettlement(partnerCode?: string) {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData(
    `/api/hq/partners/${encodeURIComponent(partnerCode ?? '')}/sales/settlement`,
    data,
    { partnerCode },
  )

  const summary: InfoItem[] = (pageData.summary as FieldRaw[]).map((f) => ({
    label: f.labelKey ? t(f.labelKey) : f.label ?? '-',
    value: f.value,
    valueColor: f.color,
  }))

  const heldColumns: Column[] = [
    { key: 'txNo', label: t('settle.detail.e.txNo'), width: '1fr' },
    { key: 'merchant', label: t('settle.detail.e.merchant'), width: '1.2fr' },
    { key: 'partner', label: t('settle.detail.e.partner'), width: '1.1fr' },
    { key: 'reason', label: t('settle.detail.e.reason'), width: '1.1fr' },
    { key: 'amount', label: t('settle.detail.e.amount'), width: '1fr' },
    { key: 'heldFee', label: t('settle.detail.e.heldFee'), width: '1fr' },
    { key: 'status', label: t('settle.detail.e.status'), width: '1fr' },
  ]

  const historyColumns: Column[] = [
    { key: 'no', label: t('settle.hist.col.no'), width: '1.4fr' },
    { key: 'appliedDate', label: t('settle.hist.col.appliedDate'), width: '1.1fr' },
    { key: 'period', label: t('settle.hist.col.period'), width: '1.2fr' },
    { key: 'partnerAmount', label: t('settle.hist.col.partnerAmount'), width: '1.1fr' },
    { key: 'held', label: t('settle.hist.col.held'), width: '0.9fr' },
    { key: 'status', label: t('settle.hist.col.status'), width: '1fr' },
    { key: 'paidDate', label: t('settle.hist.col.paidDate'), width: '1fr' },
    { key: 'action', label: t('settle.hist.col.action'), width: '0.8fr' },
  ]

  return {
    summary,
    heldColumns,
    heldRows: pageData.heldRows as Array<Record<string, string>>,
    historyColumns,
    historyRows: pageData.historyRows as Array<Record<string, string>>,
    isLoading,
    error,
  }
}
