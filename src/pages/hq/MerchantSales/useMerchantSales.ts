import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import type { InfoItem } from '../../../components/molecules/InfoGrid'
import data from './merchantSalesData.json'

interface StatRaw {
  id: string
  labelKey: string
  value: string
}

/** 거래 로그 행 원본 데이터 형태 (Figma 샘플값 하드코딩) */
export interface MerchantSalesLogRow {
  txNo: string
  partnerCode: string
  txAt: string
  merchantCode: string
  merchantName: string
  amount: string
  method: string
  fee: string
  net: string
  status: string
  syncStatus: string
  actions: string[]
}

/*
 * useMerchantSales (hq) — 본사어드민 "가맹점별 거래내역" 데이터 훅
 * ------------------------------------------------------------------
 * LeaderSales/PartnerSales와 같은 구조. 탭 내용은 "구현 예정"으로 둠(동일 결정).
 */
export function useMerchantSales() {
  const { t } = useTranslation()

  const miniStats: StatCardData[] = (data.miniStats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
  }))

  const logColumns: Column[] = [
    { key: 'txNo', label: t('hqMerchantSales.col.txNo'), width: '0.6fr' },
    { key: 'partnerCode', label: t('hqMerchantSales.col.partnerCode'), width: '1.1fr' },
    { key: 'txAt', label: t('hqMerchantSales.col.txAt'), width: '1.2fr' },
    { key: 'merchantCode', label: t('hqMerchantSales.col.merchantCode'), width: '1.1fr' },
    { key: 'merchantName', label: t('hqMerchantSales.col.merchantName'), width: '0.9fr' },
    { key: 'amount', label: t('hqMerchantSales.col.amount'), width: '0.9fr' },
    { key: 'method', label: t('hqMerchantSales.col.method'), width: '0.8fr' },
    { key: 'fee', label: t('hqMerchantSales.col.fee'), width: '0.9fr' },
    { key: 'net', label: t('hqMerchantSales.col.net'), width: '0.9fr' },
    { key: 'status', label: t('hqMerchantSales.col.status'), width: '0.8fr' },
    { key: 'syncStatus', label: t('hqMerchantSales.col.syncStatus'), width: '0.9fr' },
    { key: 'action', label: t('hqMerchantSales.col.action'), width: '1.6fr' },
  ]

  const profile = data.profile
  const accountInfo: InfoItem[] = [
    { label: t('hqMerchantSales.account.loginId'), value: profile.account.loginId },
    { label: t('hqMerchantSales.account.password'), value: profile.account.password },
    { label: t('hqMerchantSales.account.email'), value: profile.account.email },
    { label: t('hqMerchantSales.account.telegram'), value: profile.account.telegram },
    { label: t('hqMerchantSales.account.phone'), value: profile.account.phone },
    { label: t('hqMerchantSales.account.twitter'), value: profile.account.twitter },
    { label: t('hqMerchantSales.account.appliedAt'), value: profile.account.appliedAt },
  ]

  return {
    miniStats,
    logColumns,
    logRows: data.logRows as MerchantSalesLogRow[],
    profile: { code: profile.code, country: profile.country, parent: profile.parent },
    accountInfo,
  }
}
