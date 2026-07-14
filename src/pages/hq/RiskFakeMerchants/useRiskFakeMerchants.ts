import { useEffect, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { fetchHqPageData } from '../../../services/korionChongApi'

interface StatRaw {
  id: string
  labelKey: string
  value: string
  delta?: string
  deltaKey?: string
  deltaBadge?: boolean
}

interface RiskFakeMerchantsData {
  stats: StatRaw[]
  rows: FakeMerchantRow[]
}

const EMPTY_RISK_FAKE_MERCHANTS_DATA: RiskFakeMerchantsData = {
  stats: [],
  rows: [],
}

export type FakeMerchantStatus = 'approved' | 'suspended' | 'pending'
export type FakeMerchantRiskLevel = 'low' | 'medium' | 'high'

export interface FakeMerchantRow {
  id: string
  merchantId: number
  no: string
  merchantCode: string
  merchantName: string
  businessType: string
  country: string
  region: string
  city: string
  address: string
  parentCode: string
  parentName: string
  loginId: string
  email: string
  phone: string
  telegram: string
  whatsapp: string
  contact: string
  wallet: string
  walletRaw: string
  walletAuthStatus: string
  appliedAt: string
  approvedAt: string
  lastActivityAt: string
  status: FakeMerchantStatus
  statusCode: string
  storeAccessStatus: string
  riskScore: number
  riskLevel: FakeMerchantRiskLevel
  riskAccent: 'cyan' | 'orange' | 'red'
  reasons: string[]
  reasonSummaryKey: string
  hasDuplicateIdentity: boolean
  hasAbnormalTransactions: boolean
  hasMissingProfile: boolean
  txCount: number
  failedTxCount: number
  heldTxCount: number
  confirmedAmount: string
  failedAmount: string
  duplicateWalletCount: number
  duplicateEmailCount: number
  duplicatePhoneCount: number
  duplicateTelegramCount: number
}

export function useRiskFakeMerchants() {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState<RiskFakeMerchantsData>(EMPTY_RISK_FAKE_MERCHANTS_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetchHqPageData<RiskFakeMerchantsData>('/api/hq/risk/fake-merchants')
      .then((response) => {
        if (!cancelled) setPageData(response)
      })
      .catch((err) => {
        if (!cancelled) {
          setPageData(EMPTY_RISK_FAKE_MERCHANTS_DATA)
          setError(err instanceof Error ? err.message : 'API 데이터를 불러오지 못했습니다.')
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((stat) => ({
    id: stat.id,
    label: t(stat.labelKey),
    value: stat.value,
    delta: stat.delta ?? (stat.deltaKey ? t(stat.deltaKey) : undefined),
    deltaBadge: stat.deltaBadge,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqRiskFakeMerchants.col.no'), width: '56px', align: 'center' },
    { key: 'merchantCode', label: t('hqRiskFakeMerchants.col.merchantCode'), width: '128px' },
    { key: 'merchantName', label: t('hqRiskFakeMerchants.col.merchantName'), width: '154px' },
    { key: 'parentCode', label: t('hqRiskFakeMerchants.col.parentCode'), width: '126px' },
    { key: 'country', label: t('hqRiskFakeMerchants.col.country'), width: '92px' },
    { key: 'contact', label: t('hqRiskFakeMerchants.col.contact'), width: '150px' },
    { key: 'wallet', label: t('hqRiskFakeMerchants.col.wallet'), width: '150px' },
    { key: 'txCount', label: t('hqRiskFakeMerchants.col.txCount'), width: '96px' },
    { key: 'failedTxCount', label: t('hqRiskFakeMerchants.col.failedTxCount'), width: '116px' },
    { key: 'riskScore', label: t('hqRiskFakeMerchants.col.riskScore'), width: '118px' },
    { key: 'reason', label: t('hqRiskFakeMerchants.col.reason'), width: '180px' },
    { key: 'status', label: t('hqRiskFakeMerchants.col.status'), width: '116px' },
    { key: 'detail', label: t('hqRiskFakeMerchants.col.detail'), width: '110px' },
  ]

  const statusMeta: Record<FakeMerchantStatus, { label: string; accent: 'cyan' | 'orange' | 'red' | 'green' }> = {
    approved: { label: t('hqRiskFakeMerchants.status.approved'), accent: 'green' },
    suspended: { label: t('hqRiskFakeMerchants.status.suspended'), accent: 'red' },
    pending: { label: t('hqRiskFakeMerchants.status.pending'), accent: 'orange' },
  }

  const riskLevelMeta: Record<FakeMerchantRiskLevel, { label: string; accent: 'cyan' | 'orange' | 'red' }> = {
    low: { label: t('hqRiskFakeMerchants.risk.low'), accent: 'cyan' },
    medium: { label: t('hqRiskFakeMerchants.risk.medium'), accent: 'orange' },
    high: { label: t('hqRiskFakeMerchants.risk.high'), accent: 'red' },
  }

  return {
    stats,
    columns,
    rows: pageData.rows as FakeMerchantRow[],
    statusMeta,
    riskLevelMeta,
    isLoading,
    error,
  }
}
