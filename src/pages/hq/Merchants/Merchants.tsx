import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RequestListPage from '../../../components/templates/RequestListPage'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Badge from '../../../components/atoms/Badge'
import type { TableRow } from '../../../components/organisms/DataTable'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { AccentKey } from '../../../types'
import { useTranslation } from '../../../i18n'
import { useMerchants, type HqMerchantStatus } from './useMerchants'
import styles from '../Partners/Partners.module.css'

/*
 * Merchants (page) — 본사어드민 · 가맹점 관리 · 가맹점 전체 목록
 * ------------------------------------------------------------------
 * RequestListPage 템플릿 재사용. 리더 어드민의 동명 화면과 컬럼이 달라 별도 작성.
 */
export default function Merchants() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { stats: apiStats, columns, rows: rawRows, statusMeta } = useMerchants()
  const [query, setQuery] = useState('')
  const [countryFilter, setCountryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | HqMerchantStatus>('all')
  const [statusOverrides, setStatusOverrides] = useState<Record<string, HqMerchantStatus>>({})

  const sortedRows = useMemo(
    () =>
      [...rawRows].sort((a, b) => {
        const dateCompare = (b.appliedAt ?? '').localeCompare(a.appliedAt ?? '')
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

  const stats = useMemo<StatCardData[]>(
    () =>
      apiStats.map((stat) => ({
        ...stat,
        deltaBadge: stat.deltaBadge ?? Boolean(stat.delta),
      })),
    [apiStats],
  )

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return rowsWithCurrentStatus.filter((row) => {
      const queryMatches =
        !normalizedQuery ||
        [
          row.no,
          row.appliedAt ?? '',
          row.leaderCode,
          row.partnerCode,
          row.merchantCode,
          row.country,
          row.region,
          row.merchantName,
          row.businessType,
        ].some((value) => value.toLowerCase().includes(normalizedQuery))
      const countryMatches = countryFilter === 'all' || row.country === countryFilter
      const statusMatches = statusFilter === 'all' || row.currentStatus === statusFilter
      return queryMatches && countryMatches && statusMatches
    })
  }, [countryFilter, query, rowsWithCurrentStatus, statusFilter])

  const rows: TableRow[] = filteredRows.map((r, index) => {
    const active = statusMeta[r.currentStatus]
    const actionLabel = r.currentStatus === 'approved' ? t('hqMerchantList.action.suspend') : t('hqMerchantList.action.release')
    const actionAccent: AccentKey = r.currentStatus === 'approved' ? 'red' : 'green'

    return {
      id: r.no,
      cells: {
        no: String(filteredRows.length - index),
        appliedAt: r.appliedAt ?? '-',
        leaderCode: r.leaderCode,
        partnerCode: r.partnerCode,
        merchantCode: r.merchantCode,
        country: r.country,
        region: r.region,
        merchantName: r.merchantName,
        businessType: r.businessType,
        monthVolume: r.monthVolume,
        monthTxCount: r.monthTxCount,
        fee: r.fee,
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
              onLabelClick={() => toggleMerchantStatus(r.no, r.currentStatus)}
            />
          </div>
        ),
      },
    }
  })

  const toggleMerchantStatus = (id: string, currentStatus: HqMerchantStatus) => {
    setStatusOverrides((prev) => ({
      ...prev,
      [id]: currentStatus === 'approved' ? 'suspended' : 'approved',
    }))
  }

  const handleRowClick = (id: string) => {
    const row = rawRows.find((item) => item.no === id)
    if (!row) return
    const params = new URLSearchParams({
      merchantCode: row.merchantCode,
      merchant: row.merchantName,
    })
    navigate(`/hq/merchants/sales?${params.toString()}`)
  }

  const handleDownload = () => {
    const headers = columns.map((column) => column.label)
    const csvRows = filteredRows.map((row, index) =>
      toCsvLine([
        String(filteredRows.length - index),
        row.appliedAt ?? '-',
        row.leaderCode,
        row.partnerCode,
        row.merchantCode,
        row.country,
        row.region,
        row.merchantName,
        row.businessType,
        row.monthVolume,
        row.monthTxCount,
        row.fee,
        statusMeta[row.currentStatus].label,
        row.currentStatus === 'approved' ? t('hqMerchantList.action.suspend') : t('hqMerchantList.action.release'),
      ]),
    )
    const blob = new Blob([[toCsvLine(headers), ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hq-merchants.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <RequestListPage
      title={t('hqMerchantList.title')}
      statsBare
      stats={stats}
      columns={columns}
      rows={rows}
      tableTitle={t('hqMerchantList.section')}
      toolbarExtra={
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('hqMerchantList.search.placeholder')}
            aria-label={t('hqMerchantList.search.placeholder')}
          />
          <select className={styles.select} value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)}>
            <option value="all">{t('hqMerchantList.filter.allCountries')}</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | HqMerchantStatus)}
          >
            <option value="all">{t('hqMerchantList.filter.allStatuses')}</option>
            <option value="approved">{statusMeta.approved.label}</option>
            <option value="suspended">{statusMeta.suspended.label}</option>
            <option value="black">{statusMeta.black.label}</option>
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
