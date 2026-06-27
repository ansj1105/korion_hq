import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import type { InfoItem } from '../../../components/molecules/InfoGrid'
import data from './partnerSalesData.json'

interface StatRaw {
  id: string
  labelKey: string
  value: string
}

/** 거래 로그 행 원본 데이터 형태 (Figma 샘플값 하드코딩) */
export interface PartnerSalesLogRow {
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
 * usePartnerSales (hq) — 본사어드민 "파트너별 거래내역" 데이터 훅
 * ------------------------------------------------------------------
 * LeaderSales와 같은 구조(전체 거래 로그 + 특정 파트너 프로필+탭). 탭 내용은
 * Figma에서 구체 확인 안 돼 UI 전환만 두고 "구현 예정"으로 둠(LeaderSales와 동일 결정).
 */
export function usePartnerSales() {
  const { t } = useTranslation()

  const miniStats: StatCardData[] = (data.miniStats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
  }))

  const logColumns: Column[] = [
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
    { key: 'action', label: t('hqPartnerSales.col.action'), width: '1.6fr' },
  ]

  const profile = data.profile
  const accountInfo: InfoItem[] = [
    { label: t('hqPartnerSales.account.loginId'), value: profile.account.loginId },
    { label: t('hqPartnerSales.account.password'), value: profile.account.password },
    { label: t('hqPartnerSales.account.email'), value: profile.account.email },
    { label: t('hqPartnerSales.account.telegram'), value: profile.account.telegram },
    { label: t('hqPartnerSales.account.phone'), value: profile.account.phone },
    { label: t('hqPartnerSales.account.twitter'), value: profile.account.twitter },
    { label: t('hqPartnerSales.account.appliedAt'), value: profile.account.appliedAt },
  ]

  return {
    miniStats,
    logColumns,
    logRows: data.logRows as PartnerSalesLogRow[],
    profile: { code: profile.code, country: profile.country, parent: profile.parent },
    accountInfo,
  }
}
