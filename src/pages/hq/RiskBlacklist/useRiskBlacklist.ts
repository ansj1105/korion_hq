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

interface RiskBlacklistData {
  stats: StatRaw[]
  rows: BlacklistRow[]
}

const EMPTY_RISK_BLACKLIST_DATA: RiskBlacklistData = {
  stats: [],
  rows: [],
}

export type BlacklistRiskLevel = 'low' | 'medium' | 'high'
export type BlacklistStatus = 'blacklisted' | 'requested' | 'review'

export interface BlacklistRow {
  id: string
  requestId: number
  targetId: number
  no: string
  targetType: string
  targetCode: string
  targetName: string
  country: string
  parentCode: string
  parentName: string
  email: string
  phone: string
  wallet: string
  walletRaw: string
  entityStatus: string
  accessStatus: string
  requestStatus: string
  reason: string
  latestAt: string
  riskScore: number
  riskLevel: BlacklistRiskLevel
  riskAccent: 'cyan' | 'orange' | 'red'
  reasons: string[]
  reasonSummaryKey: string
  status: BlacklistStatus
}

export function useRiskBlacklist() {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState<RiskBlacklistData>(EMPTY_RISK_BLACKLIST_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetchHqPageData<RiskBlacklistData>('/api/hq/risk/blacklist')
      .then((response) => {
        if (!cancelled) setPageData(response)
      })
      .catch((err) => {
        if (!cancelled) {
          setPageData(EMPTY_RISK_BLACKLIST_DATA)
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
    { key: 'no', label: t('hqRiskBlacklist.col.no'), width: '56px', align: 'center' },
    { key: 'targetType', label: t('hqRiskBlacklist.col.targetType'), width: '112px' },
    { key: 'targetCode', label: t('hqRiskBlacklist.col.targetCode'), width: '136px' },
    { key: 'targetName', label: t('hqRiskBlacklist.col.targetName'), width: '154px' },
    { key: 'country', label: t('hqRiskBlacklist.col.country'), width: '100px' },
    { key: 'parentCode', label: t('hqRiskBlacklist.col.parentCode'), width: '136px' },
    { key: 'entityStatus', label: t('hqRiskBlacklist.col.entityStatus'), width: '140px' },
    { key: 'requestStatus', label: t('hqRiskBlacklist.col.requestStatus'), width: '128px' },
    { key: 'reason', label: t('hqRiskBlacklist.col.reason'), width: '180px' },
    { key: 'riskScore', label: t('hqRiskBlacklist.col.riskScore'), width: '118px' },
    { key: 'status', label: t('hqRiskBlacklist.col.status'), width: '116px' },
    { key: 'detail', label: t('hqRiskBlacklist.col.detail'), width: '110px' },
  ]

  const targetTypeMeta: Record<string, { label: string; accent: 'green' | 'orange' }> = {
    PARTNER: { label: t('hqRiskBlacklist.type.partner'), accent: 'orange' },
    MERCHANT: { label: t('hqRiskBlacklist.type.merchant'), accent: 'green' },
  }

  const statusMeta: Record<BlacklistStatus, { label: string; accent: 'cyan' | 'orange' | 'red' }> = {
    blacklisted: { label: t('hqRiskBlacklist.status.blacklisted'), accent: 'red' },
    requested: { label: t('hqRiskBlacklist.status.requested'), accent: 'orange' },
    review: { label: t('hqRiskBlacklist.status.review'), accent: 'cyan' },
  }

  const riskLevelMeta: Record<BlacklistRiskLevel, { label: string; accent: 'cyan' | 'orange' | 'red' }> = {
    low: { label: t('hqRiskBlacklist.risk.low'), accent: 'cyan' },
    medium: { label: t('hqRiskBlacklist.risk.medium'), accent: 'orange' },
    high: { label: t('hqRiskBlacklist.risk.high'), accent: 'red' },
  }

  return {
    stats,
    columns,
    rows: pageData.rows as BlacklistRow[],
    targetTypeMeta,
    statusMeta,
    riskLevelMeta,
    isLoading,
    error,
  }
}
