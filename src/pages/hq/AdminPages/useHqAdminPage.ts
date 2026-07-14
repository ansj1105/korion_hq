import { useMemo, useState } from 'react'
import { useTranslation } from '../../../i18n'
import { useHqPageData } from '../../../hooks/useHqPageData'
import type { Column } from '../../../components/organisms/DataTable'
import type { StatCardData } from '../../../components/molecules/StatCard'

export type HqAdminPageType = 'accounts' | 'permission-groups' | 'country-access' | 'login-security' | 'two-factor'

export interface HqAdminColumn {
  key: string
  labelKey: string
  width?: string
  align?: 'left' | 'right' | 'center'
}

export interface HqAdminRow {
  id: string
  status?: string
  statusAccent?: string
  actions?: string[]
  [key: string]: unknown
}

interface HqAdminPageData {
  titleKey: string
  descKey: string
  tableTitleKey: string
  stats: Array<{ id: string; labelKey: string; value: string; delta?: string; deltaBadge?: boolean }>
  columns: HqAdminColumn[]
  rows: HqAdminRow[]
}

const EMPTY_ADMIN_PAGE: HqAdminPageData = {
  titleKey: 'hqAdmin.accounts.title',
  descKey: 'hqAdmin.accounts.desc',
  tableTitleKey: 'hqAdmin.accounts.table',
  stats: [],
  columns: [],
  rows: [],
}

export function useHqAdminPage(pageType: HqAdminPageType) {
  const { t } = useTranslation()
  const [reloadToken, setReloadToken] = useState(0)
  const { data, isLoading, error } = useHqPageData<HqAdminPageData>(
    `/api/hq/admin/${pageType}`,
    EMPTY_ADMIN_PAGE,
    { reload: reloadToken },
  )

  const stats: StatCardData[] = data.stats.map((stat) => ({
    id: stat.id,
    label: t(stat.labelKey),
    value: stat.value,
    delta: stat.delta,
    deltaBadge: stat.deltaBadge,
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
    reload: () => setReloadToken((value) => value + 1),
  }
}
