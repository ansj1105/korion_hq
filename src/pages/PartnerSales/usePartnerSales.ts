import { useTranslation } from '../../i18n'
import type { StatCardData } from '../../components/molecules/StatCard'
import type { Column } from '../../components/organisms/DataTable'
import { useLeaderPageData } from '../../hooks/useLeaderPageData'
import data from './partnerSalesData.json'

interface StatRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
}

/** 파트너별 매출 테이블 행 */
export interface PartnerSalesRow {
  no: string
  code: string
  name: string
  telegram: string
  region: string
  subCount: string
  monthRevenue: string
  monthCount: string
  unsettledFee: string
  recentActivity: string
}

/** 가맹점 매출 테이블 행 (하위 가맹점 매출 / 가맹점 매출 공용) */
export interface MerchantSalesRow {
  no: string
  partner: string
  merchantCode: string
  merchantName: string
  monthRevenue: string
  monthCount: string
  recentPay: string
  fee: string
  unsettledFee: string
  recentPay2: string
  qrUsage: string
}

/*
 * usePartnerSales — 파트너별 매출 화면 데이터 훅
 * ------------------------------------------------------------------
 * 지표 8개 + 테이블 3개(파트너별 매출 / 하위 가맹점 매출 / 가맹점 매출).
 * UI 라벨은 번역, 행 값은 데이터 그대로. 추후 API 연동 시 이 훅 내부만 교체.
 */
export function usePartnerSales() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useLeaderPageData('/api/leader/partner-sales', data)

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    note: s.noteKey ? t(s.noteKey) : undefined,
  }))

  // 테이블 1: 파트너별 매출
  const t1Columns: Column[] = [
    { key: 'no', label: t('partnerSales.t1.col.no'), width: '0.5fr', align: 'center' },
    { key: 'code', label: t('partnerSales.t1.col.code'), width: '1.1fr' },
    { key: 'name', label: t('partnerSales.t1.col.name'), width: '1fr' },
    { key: 'telegram', label: t('partnerSales.t1.col.telegram'), width: '1fr' },
    { key: 'region', label: t('partnerSales.t1.col.region'), width: '0.8fr' },
    { key: 'subCount', label: t('partnerSales.t1.col.subCount'), width: '0.9fr' },
    { key: 'monthRevenue', label: t('partnerSales.t1.col.monthRevenue'), width: '1fr' },
    { key: 'monthCount', label: t('partnerSales.t1.col.monthCount'), width: '1fr' },
    { key: 'unsettledFee', label: t('partnerSales.t1.col.unsettledFee'), width: '1fr' },
    { key: 'recentActivity', label: t('partnerSales.t1.col.recentActivity'), width: '1fr' },
    { key: 'action', label: t('partnerSales.t1.col.action'), width: '0.8fr' },
  ]

  // 테이블 2·3 공용 컬럼: 하위 가맹점 매출 / 가맹점 매출
  const merchantColumns: Column[] = [
    { key: 'no', label: t('partnerSales.t2.col.no'), width: '0.5fr', align: 'center' },
    { key: 'partner', label: t('partnerSales.t2.col.partner'), width: '1.1fr' },
    { key: 'merchantCode', label: t('partnerSales.t2.col.merchantCode'), width: '1.1fr' },
    { key: 'merchantName', label: t('partnerSales.t2.col.merchantName'), width: '1fr' },
    { key: 'monthRevenue', label: t('partnerSales.t2.col.monthRevenue'), width: '0.9fr' },
    { key: 'monthCount', label: t('partnerSales.t2.col.monthCount'), width: '0.9fr' },
    { key: 'recentPay', label: t('partnerSales.t2.col.recentPay'), width: '1fr' },
    { key: 'fee', label: t('partnerSales.t2.col.fee'), width: '0.8fr' },
    { key: 'unsettledFee', label: t('partnerSales.t2.col.unsettledFee'), width: '1fr' },
    { key: 'recentPay2', label: t('partnerSales.t2.col.recentPay2'), width: '1fr' },
    { key: 'qrUsage', label: t('partnerSales.t2.col.qrUsage'), width: '1.3fr' },
  ]

  return {
    stats,
    t1: {
      title: t('partnerSales.t1.title'),
      columns: t1Columns,
      rows: pageData.t1Rows as PartnerSalesRow[],
    },
    t2Title: t('partnerSales.t2.title'),
    t3Title: t('partnerSales.t3.title'),
    merchantColumns,
    merchantRows: pageData.merchantRows as MerchantSalesRow[],
    isLoading,
    error,
  }
}
