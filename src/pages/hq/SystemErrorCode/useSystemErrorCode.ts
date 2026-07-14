import { useTranslation } from '../../../i18n'
import { useHqPageData } from '../../../hooks/useHqPageData'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'

/** 행 데이터(코드/카테고리/심각도/상태 enum 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과한다. */
export interface ErrorCodeRow {
  id: string
  no: string
  registeredAt: string
  updatedAt: string
  code: string
  name: string
  category: string
  severity: string
  userMessage: string
  adminDescription: string
  autoAction: string
  ownerTeam: string
  httpStatus: string
  retryable: boolean
  settlementBlocked: boolean
  riskHold: boolean
  publicVisible: boolean
  status: string
  memo: string
  severityAccent?: string
  statusAccent?: string
  actions?: string[]
}

export interface ErrorCodeOptions {
  categories: string[]
  severities: string[]
  autoActions: string[]
  statuses: string[]
}

interface SystemErrorCodePageData {
  systemStats?: Array<{ id: string; labelKey: string; value: string; delta?: string; deltaBadge?: boolean }>
  options: ErrorCodeOptions
  rows: ErrorCodeRow[]
}

const EMPTY_SYSTEM_ERROR_CODE: SystemErrorCodePageData = {
  options: {
    categories: [],
    severities: [],
    autoActions: [],
    statuses: [],
  },
  rows: [],
}

/*
 * useSystemErrorCode — 본사어드민 "시스템 설정 - 오류 코드 설정" 데이터 훅
 * ------------------------------------------------------------------
 * HQ 오류코드 레지스트리 API를 읽어 시스템 설정 화면의 KPI와 표로 변환한다.
 */
export function useSystemErrorCode() {
  const { t } = useTranslation()
  const { data, setData, isLoading, error } = useHqPageData<SystemErrorCodePageData>(
    '/api/hq/payments/error-codes',
    EMPTY_SYSTEM_ERROR_CODE,
  )
  const rows = data.rows
  const apiStats = data.systemStats?.length ? data.systemStats : [
    {
      id: 'total',
      labelKey: 'hqSystemErrorCode.kpi.total',
      value: `${rows.length}개`,
      delta: t('hqSystemErrorCode.kpi.totalNote'),
    },
    {
      id: 'payment',
      labelKey: 'hqSystemErrorCode.kpi.payment',
      value: `${rows.filter((row) => row.category === 'PAYMENT').length}개`,
    },
    {
      id: 'sync',
      labelKey: 'hqSystemErrorCode.kpi.sync',
      value: `${rows.filter((row) => row.category === 'OFFLINE_SYNC').length}개`,
    },
    {
      id: 'security',
      labelKey: 'hqSystemErrorCode.kpi.security',
      value: `${rows.filter((row) => row.category === 'RISK' || row.severity === 'CRITICAL').length}개`,
    },
  ]

  const kpis: StatCardData[] = apiStats.map((stat) => ({
    id: stat.id,
    label: t(stat.labelKey),
    value: stat.value,
    delta: stat.delta,
    deltaBadge: stat.deltaBadge,
    deltaPlain: stat.id === 'total',
    dense: true,
    alignTop: stat.id !== 'total',
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqSystemErrorCode.col.no'), width: '72px', align: 'center' },
    { key: 'registeredAt', label: t('hqSystemErrorCode.col.registeredAt'), width: '150px' },
    { key: 'code', label: t('hqSystemErrorCode.col.code'), width: '170px' },
    { key: 'name', label: t('hqSystemErrorCode.col.name'), width: '140px' },
    { key: 'category', label: t('hqSystemErrorCode.col.category'), width: '150px' },
    { key: 'severity', label: t('hqSystemErrorCode.col.severity'), width: '120px' },
    { key: 'userMessage', label: t('hqSystemErrorCode.col.userMessage'), width: '240px' },
    { key: 'autoAction', label: t('hqSystemErrorCode.col.autoAction'), width: '160px' },
    { key: 'status', label: t('hqSystemErrorCode.col.status'), width: '120px' },
    { key: 'action', label: t('hqSystemErrorCode.col.action'), width: '180px' },
  ]

  return { kpis, columns, rows, options: data.options, setData, isLoading, error }
}

export type { SystemErrorCodePageData }
