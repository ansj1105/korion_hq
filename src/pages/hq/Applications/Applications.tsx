import { useEffect, useMemo, useState } from 'react'
import RequestListPage from '../../../components/templates/RequestListPage'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Badge from '../../../components/atoms/Badge'
import type { TableRow } from '../../../components/organisms/DataTable'
import type { AccentKey } from '../../../types'
import { useTranslation } from '../../../i18n'
import { useApplications } from './useApplications'
import type { ApplicationListRow, ApplicationStatus } from './useApplications'
import ApplicationDetailOverlay from './ApplicationDetailOverlay'
import styles from './Applications.module.css'

/*
 * Applications (page) — 본사어드민 · 신청서 관리 · 제휴 / 투자 신청서
 * ------------------------------------------------------------------
 * RequestListPage 템플릿 재사용. 액션 컬럼은 라벨 목록형(ActionBadges)이 아니라
 * "확인/검토/위험" 중 그 행의 현재 상태 하나만 색이 켜지는 상태 표시 + "삭제" 액션이라
 * 행마다 accentByLabel을 동적으로 만들어 넘긴다(라벨 자체는 항상 4개 고정).
 */
export default function Applications() {
  const { t } = useTranslation()
  const [selectedApplication, setSelectedApplication] = useState<ApplicationListRow | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const { stats, columns, rows: rawRows, statusMeta, deleteLabel } = useApplications()
  const [applicationRows, setApplicationRows] = useState<ApplicationListRow[]>(rawRows)
  const pageSize = 10
  const actionLabelByStatus: Record<ApplicationStatus, string> = {
    waiting: statusMeta.waiting.label,
    review: t('hqApplicationDetail.action.review'),
    confirmed: t('hqApplicationDetail.action.confirm'),
    risk: t('hqApplicationDetail.action.risk'),
  }
  const actionStatusByLabel: Record<string, ApplicationStatus> = {
    [actionLabelByStatus.waiting]: 'waiting',
    [actionLabelByStatus.review]: 'review',
    [actionLabelByStatus.confirmed]: 'confirmed',
    [actionLabelByStatus.risk]: 'risk',
  }
  const actionAccentByLabel: Record<string, AccentKey> = {
    [actionLabelByStatus.waiting]: 'orange',
    [actionLabelByStatus.review]: 'cyan',
    [actionLabelByStatus.confirmed]: 'green',
    [actionLabelByStatus.risk]: 'red',
    [deleteLabel]: 'red',
  }

  useEffect(() => {
    setApplicationRows(rawRows)
  }, [rawRows])

  const sortedRows = useMemo(() => {
    const noValue = (value: string) => Number(value.replace(/\D/g, '')) || 0
    return [...applicationRows].sort((a, b) => {
      const dateCompare = b.appliedAt.localeCompare(a.appliedAt)
      return dateCompare !== 0 ? dateCompare : noValue(b.no) - noValue(a.no)
    })
  }, [applicationRows])

  const filteredRows = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    return sortedRows.filter((row) => {
      const statusMatches = statusFilter === 'all' || row.status === statusFilter
      if (!statusMatches) return false
      if (!query) return true
      return [row.no, row.appliedAt, row.type, row.country, row.region, row.city, row.contact, row.company, row.email, row.phone, row.website, row.interest]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    })
  }, [searchText, sortedRows, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pagedRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const exportCsv = () => {
    const headers = columns.filter((column) => column.key !== 'action').map((column) => column.label)
    const csvRows = filteredRows.map((row, index) =>
      [filteredRows.length - index, row.appliedAt, row.type, row.country, row.contact, row.company, row.email, row.interest, statusMeta[row.status].label]
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(','),
    )
    const blob = new Blob([`\uFEFF${[headers.join(','), ...csvRows].join('\n')}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'hq-applications.csv'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleAction = (rowId: string, label: string) => {
    if (label === deleteLabel) {
      setApplicationRows((prev) => prev.filter((row) => applicationRowId(row) !== rowId))
      setSelectedApplication((prev) => (prev && applicationRowId(prev) === rowId ? null : prev))
      return
    }

    const nextStatus = actionStatusByLabel[label]
    if (!nextStatus) return
    setApplicationRows((prev) => prev.map((row) => (applicationRowId(row) === rowId ? { ...row, status: nextStatus } : row)))
  }

  const rows: TableRow[] = pagedRows.map((r, index) => {
    const rowId = applicationRowId(r)
    const displayNo = filteredRows.length - ((currentPage - 1) * pageSize + index)
    const labels = [actionLabelByStatus.waiting, actionLabelByStatus.review, actionLabelByStatus.confirmed, actionLabelByStatus.risk, deleteLabel]
    const active = statusMeta[r.status]
    const activeActionLabel = actionLabelByStatus[r.status]
    // 라벨별 색상은 유지하되, 현재 상태 배지만 기존 활성 solid/tint 규칙을 따른다.
    const solidByLabel: Record<string, boolean> = Object.fromEntries(
      labels.map((label) => [label, label === activeActionLabel ? active.solid : true]),
    )

    return {
      id: rowId,
      cells: {
        no: displayNo,
        appliedAt: r.appliedAt,
        type: r.type,
        country: r.country,
        contact: r.contact,
        company: r.company,
        email: r.email,
        interest: <Badge accent="purple" size="md" shape="rect">{r.interest}</Badge>,
        status: <Badge accent={active.accent} size="md" shape="rect" solid={active.solid}>{active.label}</Badge>,
        action: (
          <span onClick={(event) => event.stopPropagation()}>
            <ActionBadges
              labels={labels}
              accentByLabel={actionAccentByLabel}
              solidByLabel={solidByLabel}
              size="md"
              shape="rect"
              onLabelClick={(label) => handleAction(rowId, label)}
            />
          </span>
        ),
      },
    }
  })

  return (
    <>
      <RequestListPage
        title={t('hqApplications.title')}
        statsBare
        stats={stats}
        columns={columns}
        rows={rows}
        tableTitle={t('hqApplications.section')}
        toolbarExtra={
          <div className={styles.toolbar}>
            <input
              className={styles.searchInput}
              type="search"
              value={searchText}
              onChange={(event) => {
                setSearchText(event.target.value)
                setPage(1)
              }}
              placeholder={t('hqApplications.search.placeholder')}
              aria-label={t('hqApplications.search.placeholder')}
            />
            <button type="button" className={styles.toolbarButton}>
              {t('common.search')}
            </button>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as ApplicationStatus | 'all')
                setPage(1)
              }}
              aria-label={t('hqApplications.filter.status')}
            >
              <option value="all">{t('hqApplications.filter.all')}</option>
              <option value="waiting">{statusMeta.waiting.label}</option>
              <option value="review">{statusMeta.review.label}</option>
              <option value="confirmed">{statusMeta.confirmed.label}</option>
              <option value="risk">{statusMeta.risk.label}</option>
            </select>
            <button type="button" className={styles.toolbarButton} onClick={() => {
              setStatusFilter('all')
              setPage(1)
            }}>
              {t('common.filter')}
            </button>
            <button type="button" className={styles.toolbarButton} onClick={exportCsv}>
              {t('common.excel')}
            </button>
          </div>
        }
        toolbarInline
        tableMutedText
        tableHeaderBar
        onRowClick={(id) => {
          const selected = filteredRows.find((row) => applicationRowId(row) === id)
          if (selected) setSelectedApplication(selected)
        }}
      />
      <nav className={styles.pagination} aria-label={t('hqApplications.pagination.label')}>
        {Array.from({ length: totalPages }, (_, index) => {
          const nextPage = index + 1
          return (
            <button
              key={nextPage}
              type="button"
              className={`${styles.pageButton} ${nextPage === currentPage ? styles.pageButtonActive : ''}`}
              aria-current={nextPage === currentPage ? 'page' : undefined}
              aria-label={`${t('hqApplications.pagination.page')} ${nextPage}`}
              onClick={() => setPage(nextPage)}
            >
              {nextPage}
            </button>
          )
        })}
      </nav>
      <ApplicationDetailOverlay application={selectedApplication} onClose={() => setSelectedApplication(null)} />
    </>
  )
}

function applicationRowId(row: ApplicationListRow) {
  return [row.no, row.appliedAt, row.type, row.country, row.contact, row.company, row.email].join('|')
}
