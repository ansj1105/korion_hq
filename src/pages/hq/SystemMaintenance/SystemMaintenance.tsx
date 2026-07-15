import { useMemo, useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatCard from '../../../components/molecules/StatCard'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import { putHqPageData } from '../../../services/korionChongApi'
import { useSystemMaintenance, type MaintenanceRow, type SystemMaintenancePageData } from './useSystemMaintenance'
import MaintenanceStartOverlay from './MaintenanceStartOverlay'
import styles from './SystemMaintenance.module.css'
import type { AccentKey } from '../../../types'

/*
 * SystemMaintenance (page) — 본사어드민 · 시스템 설정 · 서비스 점검 모드
 * ------------------------------------------------------------------
 * Figma 81:20487 기준: 제목/설명 → 현재 상태 카드(초록 테두리, "점검 시작" 버튼 +
 * "점검 모드 OFF" 배지) → 점검 이력 표. 다른 시스템 설정 화면과 달리 KPI 그리드가 없다.
 * "점검 시작" 등 동작은 작업 범위 밖(CLAUDE.md 1번) — UI 상태만 구현.
 */
export default function SystemMaintenance() {
  const { t } = useTranslation()
  const { status, kpis, columns, rows: rawRows, setData, isLoading, error } = useSystemMaintenance()
  // "점검 시작" 클릭 → 점검 범위 설정 폼 오버레이(Figma 81:29906)
  const [startOpen, setStartOpen] = useState(false)
  const [savingId, setSavingId] = useState('')
  const [saveError, setSaveError] = useState('')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [scopeFilter, setScopeFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')

  const actionAccent: Record<string, AccentKey> = {
    [t('common.detail')]: 'cyan',
    상세: 'cyan',
    [t('hqSystemMaintenance.action.start')]: 'red',
    [t('hqSystemMaintenance.action.stop')]: 'green',
    '점검 시작': 'red',
    '점검 종료': 'green',
  }

  const isMaintenanceOn = (row: MaintenanceRow) => row.status === '점검중'

  const sortedRows = useMemo(() => {
    const noValue = (value: string) => Number(String(value).replace(/\D/g, '')) || 0
    return [...rawRows].sort((a, b) => noValue(b.no) - noValue(a.no))
  }, [rawRows])

  const statusOptions = useMemo(() => uniqueOptions(sortedRows.map((row) => row.status)), [sortedRows])
  const scopeOptions = useMemo(() => uniqueOptions(sortedRows.map((row) => row.scope)), [sortedRows])
  const sourceOptions = useMemo(() => uniqueOptions(sortedRows.map((row) => row.source ?? '-')), [sortedRows])

  const filteredRows = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    return sortedRows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false
      if (scopeFilter !== 'all' && row.scope !== scopeFilter) return false
      if (sourceFilter !== 'all' && (row.source ?? '-') !== sourceFilter) return false
      if (!query) return true
      return [
        row.no,
        row.registeredAt,
        row.maintenanceId,
        row.scope,
        row.countries,
        row.features,
        row.status,
        row.admin,
        row.source,
        row.userMessage,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [scopeFilter, searchText, sortedRows, sourceFilter, statusFilter])

  const updateMaintenanceMode = async (maintenanceId: string, enabled: boolean, userMessage?: string) => {
    setSavingId(maintenanceId)
    setSaveError('')
    try {
      const response = await putHqPageData<{ status: string; page: SystemMaintenancePageData }>(
        `/api/hq/system/maintenance-mode/${encodeURIComponent(maintenanceId)}`,
        {
          enabled,
          userMessage: userMessage || status.userMessage || t('hqSystemMaintenance.defaultMessage'),
          requestId: `hq-maintenance-${Date.now()}`,
        },
      )
      setData(response.page)
      setStartOpen(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('hqSystemMaintenance.saveError'))
    } finally {
      setSavingId('')
    }
  }

  // Figma 시안은 번호가 전부 "0001"이라 리스트 key는 점검 ID로 보강
  const rows: TableRow[] = filteredRows.map((r, i) => ({
    id: r.id ?? `${r.maintenanceId}-${i}`,
    cells: {
      no: filteredRows.length - i,
      registeredAt: r.registeredAt,
      maintenanceId: r.maintenanceId,
      scope: r.scope,
      countries: r.countries,
      features: r.features,
      startAt: r.startAt,
      endAt: r.endAt,
      status: (
        <Badge accent={(r.statusAccent as AccentKey) ?? (r.status === '점검중' ? 'orange' : 'green')} size="md" shape="rect">
          {r.status}
        </Badge>
      ),
      admin: <span style={{ color: '#ffffff' }}>{r.admin}</span>,
      source: r.source ?? '-',
      action: (
        <div className={styles.actionGroup}>
          {(r.actions?.length ? r.actions : [t('common.detail'), isMaintenanceOn(r) ? t('hqSystemMaintenance.action.stop') : t('hqSystemMaintenance.action.start')]).map((label) => (
            <Badge
              key={label}
              accent={actionAccent[label] ?? 'cyan'}
              size="md"
              shape="rect"
              onClick={label === t('common.detail') || label === '상세' ? undefined : () => updateMaintenanceMode(r.maintenanceId, !isMaintenanceOn(r), r.userMessage)}
            >
              {savingId === r.maintenanceId && label !== t('common.detail') && label !== '상세' ? t('common.loading') : label}
            </Badge>
          ))}
        </div>
      ),
    },
  }))

  const exportCsv = () => {
    const exportColumns = columns.filter((column) => column.key !== 'action')
    const csvRows = filteredRows.map((row, index) =>
      exportColumns
        .map((column) => {
          const value = column.key === 'no'
            ? filteredRows.length - index
            : row[column.key as keyof MaintenanceRow] ?? ''
          return `"${String(value).replace(/"/g, '""')}"`
        })
        .join(','),
    )
    const blob = new Blob([`\uFEFF${[exportColumns.map((column) => column.label).join(','), ...csvRows].join('\n')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'hq-system-maintenance-mode.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const resetFilters = () => {
    setStatusFilter('all')
    setScopeFilter('all')
    setSourceFilter('all')
  }

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqSystemMaintenance.title')}>
        <p className={styles.pageDesc}>{t('hqSystemMaintenance.desc')}</p>
      </PageHeader>

      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <StatCard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* 현재 상태 카드 — 좌: 상태 텍스트 / 우: "점검 시작" 버튼 + 점검 모드 배지 */}
      <section className={styles.statusCard}>
        <div className={styles.statusText}>
          <span className={styles.statusLabel}>{t('hqSystemMaintenance.status.label')}</span>
          <strong className={styles.statusValue}>{status.value}</strong>
          <p className={styles.statusDesc}>{status.desc}</p>
        </div>
        <div className={styles.statusControls}>
          <button type="button" className={styles.startButton} onClick={() => setStartOpen(true)}>
            {t('hqSystemMaintenance.btn.start')}
          </button>
          <Badge accent={(status.accent as AccentKey) ?? 'green'} size="md" shape="rect">
            {status.badge}
          </Badge>
        </div>
      </section>
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}
      {saveError && <p className={styles.errorText}>{saveError}</p>}

      <DataTable
        title={t('hqSystemMaintenance.table.title')}
        toolbarExtra={
          <div className={styles.toolbar}>
            <input
              className={styles.searchInput}
              type="search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={t('hqSystemMaintenance.search.placeholder')}
              aria-label={t('hqSystemMaintenance.search.placeholder')}
            />
            <button type="button" className={styles.toolbarButton}>
              {t('common.search')}
            </button>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label={t('hqSystemMaintenance.filter.status')}
            >
              <option value="all">{t('hqSystemMaintenance.filter.all')}</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              className={styles.filterSelect}
              value={scopeFilter}
              onChange={(event) => setScopeFilter(event.target.value)}
              aria-label={t('hqSystemMaintenance.filter.scope')}
            >
              <option value="all">{t('hqSystemMaintenance.filter.all')}</option>
              {scopeOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <select
              className={styles.filterSelect}
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value)}
              aria-label={t('hqSystemMaintenance.filter.source')}
            >
              <option value="all">{t('hqSystemMaintenance.filter.all')}</option>
              {sourceOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <button type="button" className={styles.toolbarButton} onClick={resetFilters}>
              {t('common.filter')}
            </button>
            <button type="button" className={styles.toolbarButton} onClick={exportCsv}>
              {t('common.excel')}
            </button>
          </div>
        }
        columns={columns}
        rows={rows}
        mutedText
        headerBar
        inlineToolbar
        wrapCells
        paginated
        pageSize={10}
      />

      <MaintenanceStartOverlay
        open={startOpen}
        onClose={() => setStartOpen(false)}
        onConfirm={(message) => updateMaintenanceMode('MAIN-GLOBAL', true, message)}
        isSaving={savingId === 'MAIN-GLOBAL'}
      />
    </div>
  )
}

function uniqueOptions(values: Array<string | undefined>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b))
}
