import { useMemo, useState } from 'react'
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
  const { stats, columns, rows: rawRows, statusMeta, deleteLabel } = useApplications()

  const sortedRows = useMemo(() => {
    const noValue = (value: string) => Number(value.replace(/\D/g, '')) || 0
    return [...rawRows].sort((a, b) => {
      const dateCompare = b.appliedAt.localeCompare(a.appliedAt)
      return dateCompare !== 0 ? dateCompare : noValue(b.no) - noValue(a.no)
    })
  }, [rawRows])

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

  const exportCsv = () => {
    const headers = columns.filter((column) => column.key !== 'action').map((column) => column.label)
    const csvRows = filteredRows.map((row) =>
      [row.no, row.appliedAt, row.type, row.country, row.contact, row.company, row.email, row.interest]
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

  const rows: TableRow[] = filteredRows.map((r, index) => {
    const labels = [statusMeta.confirmed.label, statusMeta.review.label, statusMeta.risk.label, deleteLabel]
    const active = statusMeta[r.status]
    const accentByLabel: Record<string, AccentKey> = { [active.label]: active.accent }
    // 활성 배지만 상태별 solid 규칙을 따르고, 비활성·삭제 배지는 항상 solid 회색(Figma 기준)
    const solidByLabel: Record<string, boolean> = Object.fromEntries(
      labels.map((label) => [label, label === active.label ? active.solid : true]),
    )

    return {
      id: `${r.no}-${index}`,
      cells: {
        no: r.no,
        appliedAt: r.appliedAt,
        type: r.type,
        country: r.country,
        contact: r.contact,
        company: r.company,
        email: r.email,
        interest: <Badge accent="purple" size="md" shape="rect">{r.interest}</Badge>,
        action: (
          <span onClick={(event) => event.stopPropagation()}>
            <ActionBadges labels={labels} accentByLabel={accentByLabel} solidByLabel={solidByLabel} size="md" shape="rect" />
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
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={t('hqApplications.search.placeholder')}
              aria-label={t('hqApplications.search.placeholder')}
            />
            <button type="button" className={styles.toolbarButton}>
              {t('common.search')}
            </button>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as ApplicationStatus | 'all')}
              aria-label={t('hqApplications.filter.status')}
            >
              <option value="all">{t('hqApplications.filter.all')}</option>
              <option value="confirmed">{statusMeta.confirmed.label}</option>
              <option value="review">{statusMeta.review.label}</option>
              <option value="risk">{statusMeta.risk.label}</option>
            </select>
            <button type="button" className={styles.toolbarButton} onClick={() => setStatusFilter('all')}>
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
          const selected = filteredRows.find((row, index) => `${row.no}-${index}` === id)
          if (selected) setSelectedApplication(selected)
        }}
      />
      <ApplicationDetailOverlay application={selectedApplication} onClose={() => setSelectedApplication(null)} />
    </>
  )
}
