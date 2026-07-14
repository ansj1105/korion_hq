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

interface RiskFakeApplicationsData {
  stats: StatRaw[]
  rows: FakeApplicationRow[]
}

const EMPTY_RISK_FAKE_APPLICATIONS_DATA: RiskFakeApplicationsData = {
  stats: [],
  rows: [],
}

export type FakeApplicationStatus = 'waiting' | 'review' | 'infoRequested' | 'held' | 'rejected' | 'confirmed'
export type FakeApplicationRiskLevel = 'low' | 'medium' | 'high'

export interface FakeApplicationRow {
  id: string
  applicationId: number
  no: string
  applicationNo: string
  appliedAt: string
  updatedAt: string
  applicantType: string
  requestedRole: string
  contractPath: string
  loginId: string
  companyName: string
  contactName: string
  country: string
  region: string
  city: string
  email: string
  phone: string
  telegram: string
  whatsapp: string
  contact: string
  referralCode: string
  wallet: string
  walletRaw: string
  walletAuthStatus: string
  status: FakeApplicationStatus
  statusCode: string
  riskScore: number
  riskLevel: FakeApplicationRiskLevel
  riskAccent: 'cyan' | 'orange' | 'red'
  reasons: string[]
  reasonSummaryKey: string
  hasDuplicateIdentity: boolean
  hasMissingEvidence: boolean
  duplicateWalletCount: number
  duplicateEmailCount: number
  duplicatePhoneCount: number
  duplicateTelegramCount: number
  evidenceNote: string
  integrationPlan: string
  attachmentFileName: string
}

export function useRiskFakeApplications() {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState<RiskFakeApplicationsData>(EMPTY_RISK_FAKE_APPLICATIONS_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetchHqPageData<RiskFakeApplicationsData>('/api/hq/risk/fake-applications')
      .then((response) => {
        if (!cancelled) setPageData(response)
      })
      .catch((err) => {
        if (!cancelled) {
          setPageData(EMPTY_RISK_FAKE_APPLICATIONS_DATA)
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
    { key: 'no', label: t('hqRiskFakeApplications.col.no'), width: '56px', align: 'center' },
    { key: 'applicationNo', label: t('hqRiskFakeApplications.col.applicationNo'), width: '126px' },
    { key: 'appliedAt', label: t('hqRiskFakeApplications.col.appliedAt'), width: '112px' },
    { key: 'applicantType', label: t('hqRiskFakeApplications.col.applicantType'), width: '118px' },
    { key: 'country', label: t('hqRiskFakeApplications.col.country'), width: '92px' },
    { key: 'companyName', label: t('hqRiskFakeApplications.col.companyName'), width: '154px' },
    { key: 'contact', label: t('hqRiskFakeApplications.col.contact'), width: '150px' },
    { key: 'wallet', label: t('hqRiskFakeApplications.col.wallet'), width: '150px' },
    { key: 'riskScore', label: t('hqRiskFakeApplications.col.riskScore'), width: '118px' },
    { key: 'reason', label: t('hqRiskFakeApplications.col.reason'), width: '180px' },
    { key: 'status', label: t('hqRiskFakeApplications.col.status'), width: '116px' },
    { key: 'detail', label: t('hqRiskFakeApplications.col.detail'), width: '110px' },
  ]

  const statusMeta: Record<FakeApplicationStatus, { label: string; accent: 'cyan' | 'orange' | 'purple' | 'red' | 'green' }> = {
    waiting: { label: t('hqRiskFakeApplications.status.waiting'), accent: 'orange' },
    review: { label: t('hqRiskFakeApplications.status.review'), accent: 'cyan' },
    infoRequested: { label: t('hqRiskFakeApplications.status.infoRequested'), accent: 'purple' },
    held: { label: t('hqRiskFakeApplications.status.held'), accent: 'orange' },
    rejected: { label: t('hqRiskFakeApplications.status.rejected'), accent: 'red' },
    confirmed: { label: t('hqRiskFakeApplications.status.confirmed'), accent: 'green' },
  }

  const riskLevelMeta: Record<FakeApplicationRiskLevel, { label: string; accent: 'cyan' | 'orange' | 'red' }> = {
    low: { label: t('hqRiskFakeApplications.risk.low'), accent: 'cyan' },
    medium: { label: t('hqRiskFakeApplications.risk.medium'), accent: 'orange' },
    high: { label: t('hqRiskFakeApplications.risk.high'), accent: 'red' },
  }

  return {
    stats,
    columns,
    rows: pageData.rows as FakeApplicationRow[],
    statusMeta,
    riskLevelMeta,
    isLoading,
    error,
  }
}
