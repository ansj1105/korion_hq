import { useTranslation } from '../../../i18n'
import { useHqPageData } from '../../../hooks/useHqPageData'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'

export interface SecurityPolicyRow {
  id: string
  no: string
  policyKey: string
  policyName: string
  category: string
  scope: string
  currentValue: string
  requiredValue: string
  enforcement: string
  autoAction: string
  status: string
  statusAccent?: string
  updatedAt: string
  source: string
  actions?: string[]
}

interface SecurityPolicyPageData {
  kpis: Array<{ id: string; labelKey: string; value: string; delta?: string; deltaBadge?: boolean }>
  rows: SecurityPolicyRow[]
}

const EMPTY_SECURITY_POLICY: SecurityPolicyPageData = {
  kpis: [],
  rows: [],
}

export function useSystemSecurityPolicy() {
  const { t } = useTranslation()
  const { data, isLoading, error } = useHqPageData<SecurityPolicyPageData>(
    '/api/hq/system/security-policy',
    EMPTY_SECURITY_POLICY,
  )

  const kpis: StatCardData[] = data.kpis.map((kpi) => ({
    id: kpi.id,
    label: t(kpi.labelKey),
    value: kpi.value,
    delta: kpi.delta,
    deltaBadge: kpi.deltaBadge,
    dense: true,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqSystemSecurityPolicy.col.no'), width: '72px', align: 'center' },
    { key: 'policyName', label: t('hqSystemSecurityPolicy.col.policyName'), width: '180px' },
    { key: 'category', label: t('hqSystemSecurityPolicy.col.category'), width: '120px' },
    { key: 'scope', label: t('hqSystemSecurityPolicy.col.scope'), width: '130px' },
    { key: 'currentValue', label: t('hqSystemSecurityPolicy.col.currentValue'), width: '120px' },
    { key: 'requiredValue', label: t('hqSystemSecurityPolicy.col.requiredValue'), width: '120px' },
    { key: 'enforcement', label: t('hqSystemSecurityPolicy.col.enforcement'), width: '110px' },
    { key: 'autoAction', label: t('hqSystemSecurityPolicy.col.autoAction'), width: '150px' },
    { key: 'status', label: t('hqSystemSecurityPolicy.col.status'), width: '120px' },
    { key: 'updatedAt', label: t('hqSystemSecurityPolicy.col.updatedAt'), width: '150px' },
    { key: 'source', label: t('hqSystemSecurityPolicy.col.source'), width: '110px' },
    { key: 'action', label: t('hqSystemSecurityPolicy.col.action'), width: '180px' },
  ]

  return { kpis, columns, rows: data.rows, isLoading, error }
}
