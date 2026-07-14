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

interface RiskDuplicatesData {
  stats: StatRaw[]
  rows: DuplicateRow[]
}

const EMPTY_RISK_DUPLICATES_DATA: RiskDuplicatesData = {
  stats: [],
  rows: [],
}

export type DuplicateValueType = 'WALLET' | 'EMAIL' | 'PHONE' | 'TELEGRAM'
export type DuplicateRiskLevel = 'low' | 'medium' | 'high'
export type DuplicateStatus = 'high' | 'review' | 'watch'

export interface DuplicateRow {
  id: string
  no: string
  valueType: DuplicateValueType
  duplicateValue: string
  duplicateValueRaw: string
  duplicateCount: number
  affectedRoles: string
  countries: string
  latestAt: string
  riskyStatusCount: number
  riskScore: number
  riskLevel: DuplicateRiskLevel
  riskAccent: 'cyan' | 'orange' | 'red'
  reasons: string[]
  reasonSummaryKey: string
  membersSummary: string
  status: DuplicateStatus
}

export function useRiskDuplicates() {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState<RiskDuplicatesData>(EMPTY_RISK_DUPLICATES_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetchHqPageData<RiskDuplicatesData>('/api/hq/risk/duplicates')
      .then((response) => {
        if (!cancelled) setPageData(response)
      })
      .catch((err) => {
        if (!cancelled) {
          setPageData(EMPTY_RISK_DUPLICATES_DATA)
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
    { key: 'no', label: t('hqRiskDuplicates.col.no'), width: '56px', align: 'center' },
    { key: 'valueType', label: t('hqRiskDuplicates.col.valueType'), width: '112px' },
    { key: 'duplicateValue', label: t('hqRiskDuplicates.col.duplicateValue'), width: '190px' },
    { key: 'duplicateCount', label: t('hqRiskDuplicates.col.duplicateCount'), width: '118px' },
    { key: 'affectedRoles', label: t('hqRiskDuplicates.col.affectedRoles'), width: '148px' },
    { key: 'countries', label: t('hqRiskDuplicates.col.countries'), width: '112px' },
    { key: 'latestAt', label: t('hqRiskDuplicates.col.latestAt'), width: '126px' },
    { key: 'riskScore', label: t('hqRiskDuplicates.col.riskScore'), width: '118px' },
    { key: 'reason', label: t('hqRiskDuplicates.col.reason'), width: '180px' },
    { key: 'status', label: t('hqRiskDuplicates.col.status'), width: '116px' },
    { key: 'detail', label: t('hqRiskDuplicates.col.detail'), width: '110px' },
  ]

  const valueTypeMeta: Record<DuplicateValueType, { label: string; accent: 'cyan' | 'orange' | 'purple' | 'red' }> = {
    WALLET: { label: t('hqRiskDuplicates.type.wallet'), accent: 'red' },
    EMAIL: { label: t('hqRiskDuplicates.type.email'), accent: 'orange' },
    PHONE: { label: t('hqRiskDuplicates.type.phone'), accent: 'cyan' },
    TELEGRAM: { label: t('hqRiskDuplicates.type.telegram'), accent: 'purple' },
  }

  const statusMeta: Record<DuplicateStatus, { label: string; accent: 'cyan' | 'orange' | 'red' }> = {
    high: { label: t('hqRiskDuplicates.status.high'), accent: 'red' },
    review: { label: t('hqRiskDuplicates.status.review'), accent: 'orange' },
    watch: { label: t('hqRiskDuplicates.status.watch'), accent: 'cyan' },
  }

  const riskLevelMeta: Record<DuplicateRiskLevel, { label: string; accent: 'cyan' | 'orange' | 'red' }> = {
    low: { label: t('hqRiskDuplicates.risk.low'), accent: 'cyan' },
    medium: { label: t('hqRiskDuplicates.risk.medium'), accent: 'orange' },
    high: { label: t('hqRiskDuplicates.risk.high'), accent: 'red' },
  }

  return {
    stats,
    columns,
    rows: pageData.rows as DuplicateRow[],
    valueTypeMeta,
    statusMeta,
    riskLevelMeta,
    isLoading,
    error,
  }
}
