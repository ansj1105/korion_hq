import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RequestListPage from '../../../components/templates/RequestListPage'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Badge from '../../../components/atoms/Badge'
import type { TableRow } from '../../../components/organisms/DataTable'
import type { AccentKey } from '../../../types'
import { useTranslation } from '../../../i18n'
import { postHqPageData } from '../../../services/korionChongApi'
import { usePartners, type HqPartnerStatus } from './usePartners'
import styles from './Partners.module.css'

/*
 * Partners (page) — 본사어드민 · 파트너 관리 · 파트너 전체 목록
 * ------------------------------------------------------------------
 * RequestListPage 템플릿 재사용. 리더 어드민의 동명 화면과 컬럼이 달라 별도 작성.
 */
interface PartnersProps {
  detailTab?: 'history'
}

export default function Partners({ detailTab }: PartnersProps = {}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { stats, columns, rows: rawRows, statusMeta, reload } = usePartners()
  const [query, setQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | HqPartnerStatus>('all')
  const [statusOverrides, setStatusOverrides] = useState<Record<string, HqPartnerStatus>>({})

  const sortedRows = useMemo(
    () =>
      [...rawRows].sort((a, b) => {
        const dateCompare = b.appliedAt.localeCompare(a.appliedAt)
        if (dateCompare !== 0) return dateCompare
        return extractNumber(b.no) - extractNumber(a.no)
      }),
    [rawRows],
  )

  const countryOptions = useMemo(() => Array.from(new Set(sortedRows.map((row) => row.country))), [sortedRows])

  const rowsWithCurrentStatus = useMemo(
    () => sortedRows.map((row) => ({ ...row, currentStatus: statusOverrides[row.no] ?? row.status ?? 'approved' })),
    [sortedRows, statusOverrides],
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return rowsWithCurrentStatus.filter((row) => {
      const queryMatches =
        !normalizedQuery ||
        [row.no, row.appliedAt, row.leaderCode, row.partnerCode, row.country, row.partnerName].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        )
      const countryMatches = countryFilter === 'all' || row.country === countryFilter
      const statusMatches = statusFilter === 'all' || row.currentStatus === statusFilter
      return queryMatches && countryMatches && statusMatches
    })
  }, [countryFilter, query, rowsWithCurrentStatus, statusFilter])

  const rows: TableRow[] = filteredRows.map((r, index) => {
    const active = statusMeta[r.currentStatus]
    const actionLabel = r.currentStatus === 'approved' ? t('hqPartnerList.action.suspend') : t('hqPartnerList.action.release')
    const actionAccent: AccentKey = r.currentStatus === 'approved' ? 'red' : 'green'

    return {
      id: r.no,
      cells: {
        no: String(filteredRows.length - index),
        appliedAt: r.appliedAt,
        leaderCode: r.leaderCode,
        partnerCode: r.partnerCode,
        country: r.country,
        partnerName: r.partnerName,
        subMerchantCount: r.subMerchantCount,
        monthVolume: r.monthVolume,
        monthTxCount: r.monthTxCount,
        unsettledFee: r.unsettledFee,
        status: (
          <Badge accent={active.accent} size="md" shape="rect" solid={active.solid}>
            {active.label}
          </Badge>
        ),
        action: (
          <div className={styles.actionStop} onClick={(event) => event.stopPropagation()}>
            <ActionBadges
              labels={[actionLabel]}
              accentByLabel={{ [actionLabel]: actionAccent }}
              solid
              size="md"
              shape="rect"
              onLabelClick={() => togglePartnerStatus(r, r.currentStatus)}
            />
          </div>
        ),
      },
    }
  })

  const togglePartnerStatus = async (row: { no: string; partnerCode: string }, currentStatus: HqPartnerStatus) => {
    const nextStatus = currentStatus === 'approved' ? 'suspended' : 'approved'
    const ok = await updateEntityStatus(`/api/hq/partners/${encodeURIComponent(row.partnerCode)}/status`, nextStatus)
    if (!ok) return
    setStatusOverrides((prev) => ({
      ...prev,
      [row.no]: nextStatus,
    }))
    reload()
  }

  const handleRowClick = (id: string) => {
    const row = rawRows.find((item) => item.no === id)
    if (!row) return
    const params = new URLSearchParams({
      partnerCode: row.partnerCode,
      partner: row.partnerName,
    })
    if (detailTab) {
      params.set('tab', detailTab)
    }
    navigate(`/hq/partners/sales?${params.toString()}`)
  }

  const handleDownload = () => {
    const headers = columns.map((column) => column.label)
    const csvRows = filteredRows.map((row, index) =>
      toCsvLine([
        String(filteredRows.length - index),
        row.appliedAt,
        row.leaderCode,
        row.partnerCode,
        row.country,
        row.partnerName,
        row.subMerchantCount,
        row.monthVolume,
        row.monthTxCount,
        row.unsettledFee,
        statusMeta[row.currentStatus].label,
        row.currentStatus === 'suspended' ? t('hqPartnerList.action.release') : t('hqPartnerList.action.suspend'),
      ]),
    )
    const blob = new Blob([[toCsvLine(headers), ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hq-partners.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <RequestListPage
      title={t('hqPartnerList.title')}
      statsBare
      stats={stats}
      columns={columns}
      rows={rows}
      tableTitle={t('hqPartnerList.section')}
      toolbarExtra={
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('hqPartnerList.search.placeholder')}
            aria-label={t('hqPartnerList.search.placeholder')}
          />
          <select className={styles.select} value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)}>
            <option value="all">{t('hqPartnerList.filter.allCountries')}</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | HqPartnerStatus)}
          >
            <option value="all">{t('hqPartnerList.filter.allStatuses')}</option>
            <option value="approved">{statusMeta.approved.label}</option>
            <option value="suspended">{statusMeta.suspended.label}</option>
          </select>
          <button type="button" className={styles.excelButton} onClick={handleDownload}>
            {t('common.excel')}
          </button>
        </div>
      }
      toolbarInline
      tableMutedText
      tableHeaderBar
      onRowClick={handleRowClick}
    />
  )
}

function extractNumber(value: string) {
  const match = value.match(/\d+/g)
  return match ? Number(match.join('')) : 0
}

function toCsvLine(values: string[]) {
  return values.map((value) => `"${value.replace(/"/g, '""')}"`).join(',')
}

async function updateEntityStatus(path: string, status: HqPartnerStatus) {
  try {
    await postHqPageData(path, {
      status,
      requestId: `hq-entity-${status}-${Date.now()}`,
    })
    return true
  } catch (error) {
    window.alert(error instanceof Error ? error.message : '요청 처리에 실패했습니다.')
    return false
  }
}
