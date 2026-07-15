import { useEffect, useMemo, useState } from 'react'
import RequestListPage from '../../../components/templates/RequestListPage'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Badge from '../../../components/atoms/Badge'
import type { TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { postHqPageData } from '../../../services/korionChongApi'
import { useApplications } from './useApplications'
import type { ApplicationListRow, ApplicationStatus } from './useApplications'
import ApplicationDetailOverlay from './ApplicationDetailOverlay'
import styles from './Applications.module.css'

/*
 * Applications (page) — 본사어드민 · 신청서 관리 · 제휴 / 투자 신청서
 * ------------------------------------------------------------------
 * RequestListPage 템플릿 재사용. 상태 컬럼은 현재 처리 상태를 보여주고,
 * 액션 컬럼은 모든 행에서 공통 액션 배지 색상 규칙을 따른다.
 */
export default function Applications() {
  const { t } = useTranslation()
  const [selectedApplication, setSelectedApplication] = useState<ApplicationListRow | null>(null)
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const { stats, columns, rows: rawRows, statusMeta, deleteLabel, reload } = useApplications()
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

  const handleAction = async (row: ApplicationListRow, label: string) => {
    const rowId = applicationRowId(row)
    const applicationId = applicationIdFromNo(row.no)
    if (!applicationId) {
      window.alert('신청서 식별자가 없어 처리할 수 없습니다.')
      return
    }
    if (label === deleteLabel) {
      const ok = await updateApplicationStatus(applicationId, 'deleted')
      if (!ok) return
      setApplicationRows((prev) => prev.filter((item) => applicationRowId(item) !== rowId))
      setSelectedApplication((prev) => (prev && applicationRowId(prev) === rowId ? null : prev))
      reload()
      return
    }

    const nextStatus = actionStatusByLabel[label]
    if (!nextStatus) return
    const ok = await updateApplicationStatus(applicationId, nextStatus)
    if (!ok) return
    setApplicationRows((prev) => prev.map((item) => (applicationRowId(item) === rowId ? { ...item, status: nextStatus } : item)))
    reload()
  }

  const rows: TableRow[] = pagedRows.map((r, index) => {
    const rowId = applicationRowId(r)
    const displayNo = filteredRows.length - ((currentPage - 1) * pageSize + index)
    const labels = [actionLabelByStatus.waiting, actionLabelByStatus.review, actionLabelByStatus.confirmed, actionLabelByStatus.risk, deleteLabel]
    const active = statusMeta[r.status]

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
        status: <Badge accent={active.accent} size="md" shape="rect">{active.label}</Badge>,
        action: (
          <span onClick={(event) => event.stopPropagation()}>
            <ActionBadges
              labels={labels}
              size="md"
              shape="rect"
              onLabelClick={(label) => handleAction(r, label)}
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

function applicationIdFromNo(no: string) {
  const parsed = Number(String(no).replace(/\D/g, ''))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

async function updateApplicationStatus(applicationId: number, status: ApplicationStatus | 'deleted') {
  try {
    await postHqPageData(`/api/hq/applications/${applicationId}/status`, {
      status,
      requestId: `hq-application-${status}-${applicationId}-${Date.now()}`,
    })
    return true
  } catch (error) {
    window.alert(error instanceof Error ? error.message : '요청 처리에 실패했습니다.')
    return false
  }
}
