import { useMemo } from 'react'
import { useTranslation } from '../../../i18n'
import { useHqPageData } from '../../../hooks/useHqPageData'
import type { Column } from '../../../components/organisms/DataTable'
import type { StatCardData } from '../../../components/molecules/StatCard'

export type HqLogPageType = 'admin' | 'approval' | 'settlement' | 'permission-change' | 'security'

interface HqLogColumn {
  key: string
  labelKey: string
  width?: string
  align?: 'left' | 'right' | 'center'
}

export interface HqLogRow {
  id: string
  no: string
  adminId: string
  admin: string
  eventType: string
  menu: string
  menuAccent?: string
  action: string
  actionAccent?: string
  targetId: string
  time: string
  ip: string
  result: string
  resultAccent?: string
  riskLevel: string
  riskAccent?: string
  actions?: string[]
  [key: string]: unknown
}

interface HqLogPageData {
  titleKey: string
  descKey: string
  tableTitleKey: string
  stats: Array<{ id: string; labelKey: string; value: string; delta?: string; deltaBadge?: boolean }>
  columns: HqLogColumn[]
  rows: HqLogRow[]
}

const EMPTY_LOG_PAGE: HqLogPageData = {
  titleKey: 'hqLog.admin.title',
  descKey: 'hqLog.admin.desc',
  tableTitleKey: 'hqLog.admin.table',
  stats: [],
  columns: [],
  rows: [],
}

export function useHqLogPage(pageType: HqLogPageType) {
  const { t } = useTranslation()
  const { data, isLoading, error } = useHqPageData<HqLogPageData>(
    `/api/hq/logs/${pageType}`,
    EMPTY_LOG_PAGE,
  )

  const stats: StatCardData[] = data.stats.map((stat) => ({
    id: stat.id,
    label: t(stat.labelKey),
    value: stat.value,
    delta: stat.delta,
    deltaBadge: Boolean(stat.delta ?? stat.deltaBadge),
  }))

  const columns: Column[] = useMemo(() => data.columns.map((column) => ({
    key: column.key,
    label: t(column.labelKey),
    width: column.width,
    align: column.align,
  })), [data.columns, t])

  return {
    title: t(data.titleKey),
    desc: t(data.descKey),
    tableTitle: t(data.tableTitleKey),
    stats,
    columns,
    rows: data.rows,
    isLoading,
    error,
  }
}
