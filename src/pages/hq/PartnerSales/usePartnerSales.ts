import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import type { InfoItem } from '../../../components/molecules/InfoGrid'
import { useHqPageData } from '../../../hooks/useHqPageData'

interface StatRaw {
  id: string
  labelKey: string
  value: string
}

/** 거래 로그 행 원본 데이터 형태 */
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

interface PartnerSalesOverviewData {
  miniStats?: StatRaw[]
  kpiBottom?: StatRaw[]
  logRows?: PartnerSalesLogRow[]
  profile?: {
    code: string
    country: string
    parent: string
    account: {
      loginId: string
      password: string
      email: string
      telegram: string
      phone: string
      twitter: string
      appliedAt: string
    }
  }
}

const emptyPartnerSalesOverviewData: PartnerSalesOverviewData = {
  miniStats: [],
  logRows: [],
  profile: {
    code: '-',
    country: '-',
    parent: '-',
    account: {
      loginId: '-',
      password: '******',
      email: '-',
      telegram: '-',
      phone: '-',
      twitter: '-',
      appliedAt: '-',
    },
  },
}

interface PartnerDetailData {
  profile: {
    topLabel: string
    parentBadge: string
    country: string
    code: string
  }
  kpiTop: StatRaw[]
  account: {
    loginId: string
    password: string
    email: string
    telegram: string
    phone: string
    twitter: string
    appliedAt: string
    approvedAt: string
  }
  basic: {
    name: string
    country: string
    region: string
    language: string
    directContractReason: string
    walletAddress: string
  }
  tabKpi: StatRaw[]
  merchantRows: Array<Record<string, string>>
}

const emptyPartnerDetailData: PartnerDetailData = {
  profile: {
    topLabel: '상위 리더 / 해당 국가',
    parentBadge: '-',
    country: '-',
    code: '-',
  },
  kpiTop: [],
  account: {
    loginId: '-',
    password: '******',
    email: '-',
    telegram: '-',
    phone: '-',
    twitter: '-',
    appliedAt: '-',
    approvedAt: '-',
  },
  basic: {
    name: '-',
    country: '-',
    region: '-',
    language: '-',
    directContractReason: '-',
    walletAddress: '-',
  },
  tabKpi: [],
  merchantRows: [],
}

/*
 * usePartnerSales (hq) — 본사어드민 "파트너별 거래내역" 데이터 훅
 * ------------------------------------------------------------------
 * LeaderSales와 같은 구조(전체 거래 로그 + 특정 파트너 프로필+탭). 탭 내용은
 * API 상세 응답만 사용하며, 응답이 없으면 빈 상태를 표시한다.
 */
export function usePartnerSales() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData('/api/hq/partners/sales/overview', emptyPartnerSalesOverviewData)
  const apiData = pageData

  const miniStats: StatCardData[] = ((apiData.miniStats ?? apiData.kpiBottom ?? []) as StatRaw[]).map((s) => ({
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

  const profile = apiData.profile ?? emptyPartnerSalesOverviewData.profile!
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
    logRows: (apiData.logRows ?? []) as PartnerSalesLogRow[],
    profile: { code: profile.code, country: profile.country, parent: profile.parent },
    accountInfo,
    isLoading,
    error,
  }
}

export function usePartnerOverview(partnerCode?: string) {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData(
    `/api/hq/partners/${encodeURIComponent(partnerCode ?? '')}/sales/overview`,
    emptyPartnerDetailData,
    { partnerCode },
  )

  const toStats = (items: StatRaw[]): StatCardData[] => items.map((s) => ({ id: s.id, label: t(s.labelKey), value: s.value }))
  const account = pageData.account
  const basic = pageData.basic

  const accountInfo: InfoItem[] = [
    { label: t('hqPartnerSales.account.loginId'), value: account.loginId },
    { label: t('hqPartnerSales.account.password'), value: account.password, actionLabel: t('common.reset') },
    { label: t('hqPartnerSales.account.email'), value: account.email, actionLabel: t('common.change') },
    { label: t('hqPartnerSales.account.telegram'), value: account.telegram },
    { label: t('hqPartnerSales.account.phone'), value: account.phone },
    { label: t('hqPartnerSales.account.twitter'), value: account.twitter },
    { label: t('hqPartnerSales.account.appliedAt'), value: account.appliedAt, valueColor: 'var(--color-accent-green)' },
    { label: t('hqPartnerSales.account.approvedAt'), value: account.approvedAt, valueColor: 'var(--color-accent-green)' },
  ]

  const basicInfo: InfoItem[] = [
    { label: t('hqPartnerSales.basic.name'), value: basic.name },
    { label: t('hqPartnerSales.basic.country'), value: basic.country },
    { label: t('hqPartnerSales.basic.region'), value: basic.region },
    { label: t('hqPartnerSales.basic.language'), value: basic.language },
    { label: t('hqPartnerSales.basic.directContractReason'), value: basic.directContractReason },
    { label: '', value: '' },
    { label: t('hqPartnerSales.basic.walletAddress'), value: basic.walletAddress },
  ]

  return {
    profile: pageData.profile,
    kpiTop: toStats(pageData.kpiTop as StatRaw[]),
    accountInfo,
    basicInfo,
    isLoading,
    error,
  }
}
