import { useTranslation } from '../../i18n'
import type { StatCardData } from '../../components/molecules/StatCard'
import type { Column } from '../../components/organisms/DataTable'
import { useRolePageData } from '../../hooks/useRolePageData'
import data from './merchantSalesData.json'

interface StatRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
}

/** 가맹점별 매출 테이블 행 */
export interface MerchantSalesT1Row {
  no: string
  code: string
  name: string
  telegram: string
  region: string
  monthRevenue: string
  monthCount: string
  recentActivity: string
}

/** 가맹점 매출 테이블 행 */
export interface MerchantSalesT2Row {
  no: string
  partner: string
  merchantCode: string
  merchantName: string
  amount: string
  monthCount: string
  recentPay: string
  fee: string
  unsettledFee: string
  recentPay2: string
  qrUsage: string
}

/*
 * useMerchantSales — 가맹점별 매출 화면 데이터 훅
 * ------------------------------------------------------------------
 * 지표 8개 + 테이블 2개(가맹점별 매출 / 가맹점 매출).
 * UI 라벨은 번역, 행 값은 데이터 그대로. 추후 API 연동 시 이 훅 내부만 교체.
 */
export function useMerchantSales(merchantVariant?: 'all' | 'refund') {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useRolePageData(
    {
      leader: '/api/leader/merchant-sales',
      partner: '/api/partner/merchant-sales',
      merchant: '/api/merchant/transactions',
    },
    data,
    merchantVariant ? { variant: merchantVariant } : undefined
  )

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    note: s.noteKey ? t(s.noteKey) : undefined,
  }))

  // 테이블 1: 가맹점별 매출
  const t1Columns: Column[] = [
    { key: 'no', label: t('merchantSales.t1.col.no'), width: '0.5fr', align: 'center' },
    { key: 'code', label: t('merchantSales.t1.col.code'), width: '1.1fr' },
    { key: 'name', label: t('merchantSales.t1.col.name'), width: '1fr' },
    { key: 'telegram', label: t('merchantSales.t1.col.telegram'), width: '1fr' },
    { key: 'region', label: t('merchantSales.t1.col.region'), width: '0.9fr' },
    { key: 'monthRevenue', label: t('merchantSales.t1.col.monthRevenue'), width: '1fr' },
    { key: 'monthCount', label: t('merchantSales.t1.col.monthCount'), width: '1fr' },
    { key: 'recentActivity', label: t('merchantSales.t1.col.recentActivity'), width: '1fr' },
    { key: 'action', label: t('merchantSales.t1.col.action'), width: '0.8fr' },
  ]

  // 테이블 2: 가맹점 매출
  const t2Columns: Column[] = [
    { key: 'no', label: t('merchantSales.t2.col.no'), width: '0.5fr', align: 'center' },
    { key: 'partner', label: t('merchantSales.t2.col.partner'), width: '1.1fr' },
    { key: 'merchantCode', label: t('merchantSales.t2.col.merchantCode'), width: '1.1fr' },
    { key: 'merchantName', label: t('merchantSales.t2.col.merchantName'), width: '1fr' },
    { key: 'amount', label: t('merchantSales.t2.col.amount'), width: '0.9fr' },
    { key: 'monthCount', label: t('merchantSales.t2.col.monthCount'), width: '0.9fr' },
    { key: 'recentPay', label: t('merchantSales.t2.col.recentPay'), width: '1fr' },
    { key: 'fee', label: t('merchantSales.t2.col.fee'), width: '0.8fr' },
    { key: 'unsettledFee', label: t('merchantSales.t2.col.unsettledFee'), width: '1fr' },
    { key: 'recentPay2', label: t('merchantSales.t2.col.recentPay2'), width: '1fr' },
    { key: 'qrUsage', label: t('merchantSales.t2.col.qrUsage'), width: '1.3fr' },
  ]

  return {
    stats,
    t1: { title: t('merchantSales.t1.title'), columns: t1Columns, rows: pageData.t1Rows as MerchantSalesT1Row[] },
    t2: { title: t('merchantSales.t2.title'), columns: t2Columns, rows: pageData.t2Rows as MerchantSalesT2Row[] },
    isLoading,
    error,
  }
}
