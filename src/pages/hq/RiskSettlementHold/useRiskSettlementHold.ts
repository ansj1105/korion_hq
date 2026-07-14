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

interface RiskSettlementHoldData {
  stats: StatRaw[]
  rows: SettlementHoldRow[]
}

const EMPTY_RISK_SETTLEMENT_HOLD_DATA: RiskSettlementHoldData = {
  stats: [],
  rows: [],
}

export type SettlementHoldRiskLevel = 'low' | 'medium' | 'high'
export type SettlementHoldStatus = 'blocked' | 'hold' | 'review'

export interface SettlementHoldRow {
  id: string
  entryId: number
  no: string
  targetType: string
  targetCode: string
  targetName: string
  merchantCode: string
  merchantName: string
  country: string
  txNo: string
  occurredAt: string
  amount: string
  fee: string
  heldAmount: string
  sourceStatus: string
  settlementStatus: string
  holdReason: string
  riskScore: number
  riskLevel: SettlementHoldRiskLevel
  riskAccent: 'cyan' | 'orange' | 'red'
  reasons: string[]
  reasonSummaryKey: string
  status: SettlementHoldStatus
}

export function useRiskSettlementHold() {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState<RiskSettlementHoldData>(EMPTY_RISK_SETTLEMENT_HOLD_DATA)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetchHqPageData<RiskSettlementHoldData>('/api/hq/risk/settlement-hold')
      .then((response) => {
        if (!cancelled) setPageData(response)
      })
      .catch((err) => {
        if (!cancelled) {
          setPageData(EMPTY_RISK_SETTLEMENT_HOLD_DATA)
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
    { key: 'no', label: t('hqRiskSettlementHold.col.no'), width: '56px', align: 'center' },
    { key: 'targetType', label: t('hqRiskSettlementHold.col.targetType'), width: '112px' },
    { key: 'targetCode', label: t('hqRiskSettlementHold.col.targetCode'), width: '136px' },
    { key: 'merchantCode', label: t('hqRiskSettlementHold.col.merchantCode'), width: '136px' },
    { key: 'merchantName', label: t('hqRiskSettlementHold.col.merchantName'), width: '154px' },
    { key: 'txNo', label: t('hqRiskSettlementHold.col.txNo'), width: '126px' },
    { key: 'amount', label: t('hqRiskSettlementHold.col.amount'), width: '112px' },
    { key: 'heldAmount', label: t('hqRiskSettlementHold.col.heldAmount'), width: '118px' },
    { key: 'reason', label: t('hqRiskSettlementHold.col.reason'), width: '180px' },
    { key: 'riskScore', label: t('hqRiskSettlementHold.col.riskScore'), width: '118px' },
    { key: 'status', label: t('hqRiskSettlementHold.col.status'), width: '116px' },
    { key: 'detail', label: t('hqRiskSettlementHold.col.detail'), width: '110px' },
  ]

  const targetTypeMeta: Record<string, { label: string; accent: 'cyan' | 'green' | 'purple' | 'orange' }> = {
    LEADER: { label: t('hqRiskSettlementHold.type.leader'), accent: 'purple' },
    PARTNER: { label: t('hqRiskSettlementHold.type.partner'), accent: 'orange' },
    MERCHANT: { label: t('hqRiskSettlementHold.type.merchant'), accent: 'green' },
  }

  const statusMeta: Record<SettlementHoldStatus, { label: string; accent: 'cyan' | 'orange' | 'red' }> = {
    blocked: { label: t('hqRiskSettlementHold.status.blocked'), accent: 'red' },
    hold: { label: t('hqRiskSettlementHold.status.hold'), accent: 'orange' },
    review: { label: t('hqRiskSettlementHold.status.review'), accent: 'cyan' },
  }

  const riskLevelMeta: Record<SettlementHoldRiskLevel, { label: string; accent: 'cyan' | 'orange' | 'red' }> = {
    low: { label: t('hqRiskSettlementHold.risk.low'), accent: 'cyan' },
    medium: { label: t('hqRiskSettlementHold.risk.medium'), accent: 'orange' },
    high: { label: t('hqRiskSettlementHold.risk.high'), accent: 'red' },
  }

  return {
    stats,
    columns,
    rows: pageData.rows as SettlementHoldRow[],
    targetTypeMeta,
    statusMeta,
    riskLevelMeta,
    isLoading,
    error,
  }
}
