import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RequestListPage from '../../../components/templates/RequestListPage'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Badge from '../../../components/atoms/Badge'
import type { TableRow } from '../../../components/organisms/DataTable'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { AccentKey } from '../../../types'
import { useTranslation } from '../../../i18n'
import { useLeaders, type LeaderStatus } from './useLeaders'
import styles from './Leaders.module.css'

/*
 * Leaders (page) — 본사어드민 · 국가 리더 관리 · 국가 리더 전체 목록
 * ------------------------------------------------------------------
 * 리더 어드민의 Partners 화면과 같은 RequestListPage 템플릿을 재사용하지만,
 * 컬럼이 다르다(리더 코드/하위 파트너 수 등 — Figma 확인 결과 리더용 화면과 별개 데이터).
 */
export default function Leaders() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { columns, rows: rawRows, statusMeta } = useLeaders()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | LeaderStatus>('all')
  const [countryFilter, setCountryFilter] = useState('all')
  const [statusOverrides, setStatusOverrides] = useState<Record<string, LeaderStatus>>({})

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

  const stats = useMemo<StatCardData[]>(() => {
    const rowsWithStatus = rawRows.map((row) => statusOverrides[row.no] ?? row.status)
    const approvedCount = rowsWithStatus.filter((status) => status === 'approved').length
    const suspendedCount = rowsWithStatus.filter((status) => status === 'suspended').length
    const uniqueCountryCount = new Set(rawRows.map((row) => row.country)).size

    return [
      {
        id: 'countries',
        label: t('hqLeaderList.kpi.countries'),
        value: String(uniqueCountryCount),
        delta: t('hqLeaderList.kpi.delta5'),
        deltaBadge: true,
      },
      {
        id: 'totalLeaders',
        label: t('hqLeaderList.kpi.totalLeaders'),
        value: String(rawRows.length),
        delta: t('hqLeaderList.kpi.delta5'),
        deltaBadge: true,
      },
      {
        id: 'approvedLeaders',
        label: t('hqLeaderList.kpi.approvedLeaders'),
        value: String(approvedCount),
        delta: t('hqLeaderList.kpi.delta5'),
        deltaBadge: true,
      },
      {
        id: 'suspendedLeaders',
        label: t('hqLeaderList.kpi.suspendedLeaders'),
        value: String(suspendedCount),
        delta: t('hqLeaderList.kpi.delta5'),
        deltaBadge: true,
      },
    ]
  }, [rawRows, statusOverrides, t])

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return sortedRows.filter((row) => {
      const currentStatus = statusOverrides[row.no] ?? row.status
      const queryMatches =
        !normalizedQuery ||
        [row.no, row.appliedAt, row.leaderCode, row.country, row.partnerName].some((value) =>
          value.toLowerCase().includes(normalizedQuery),
        )
      const statusMatches = statusFilter === 'all' || currentStatus === statusFilter
      const countryMatches = countryFilter === 'all' || row.country === countryFilter
      return queryMatches && statusMatches && countryMatches
    })
  }, [countryFilter, query, sortedRows, statusFilter, statusOverrides])

  const rows: TableRow[] = filteredRows.map((r, index) => {
    const status = statusOverrides[r.no] ?? r.status
    const active = statusMeta[status]
    const actionLabel = status === 'approved' ? t('hqLeaderList.action.suspend') : t('hqLeaderList.action.release')
    const actionAccent: AccentKey = status === 'approved' ? 'red' : 'green'

    return {
      id: r.no,
      cells: {
        no: String(filteredRows.length - index),
        appliedAt: r.appliedAt,
        leaderCode: r.leaderCode,
        country: r.country,
        partnerName: r.partnerName,
        subPartnerCount: r.subPartnerCount,
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
              onLabelClick={() => toggleLeaderStatus(r.no, status)}
            />
          </div>
        ),
      },
    }
  })

  const handleDownload = () => {
    const headers = columns.map((column) => column.label)
    const csvRows = filteredRows.map((row, index) => {
      const currentStatus = statusOverrides[row.no] ?? row.status
      return toCsvLine([
        String(filteredRows.length - index),
        row.appliedAt,
        row.leaderCode,
        row.country,
        row.partnerName,
        row.subPartnerCount,
        row.subMerchantCount,
        row.monthVolume,
        row.monthTxCount,
        row.unsettledFee,
        statusMeta[currentStatus].label,
        currentStatus === 'suspended' ? t('hqLeaderList.action.release') : t('hqLeaderList.action.suspend'),
      ])
    })
    const blob = new Blob([[toCsvLine(headers), ...csvRows].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'hq-leaders.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const toggleLeaderStatus = (id: string, currentStatus: LeaderStatus) => {
    setStatusOverrides((prev) => ({
      ...prev,
      [id]: currentStatus === 'approved' ? 'suspended' : 'approved',
    }))
  }

  const handleRowClick = (id: string) => {
    const row = rawRows.find((item) => item.no === id)
    if (!row) return
    navigate(`/hq/leaders/sales?leaderCode=${encodeURIComponent(row.leaderCode)}&leader=${encodeURIComponent(row.partnerName)}`)
  }

  return (
    <RequestListPage
      title={t('hqLeaderList.title')}
      statsBare
      stats={stats}
      columns={columns}
      rows={rows}
      tableTitle={t('hqLeaderList.section')}
      toolbarExtra={
        <div className={styles.toolbar}>
          <input
            className={styles.searchInput}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('hqLeaderList.search.placeholder')}
            aria-label={t('hqLeaderList.search.placeholder')}
          />
          <select className={styles.select} value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)}>
            <option value="all">{t('hqLeaderList.filter.allCountries')}</option>
            {countryOptions.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | LeaderStatus)}
          >
            <option value="all">{t('hqLeaderList.filter.allStatuses')}</option>
            <option value="approved">{statusMeta.approved.label}</option>
            <option value="suspended">{statusMeta.suspended.label}</option>
          </select>
          <button type="button" className={styles.excelButton} onClick={handleDownload}>
            {t('common.excel')}
          </button>
        </div>
      }
      onRowClick={handleRowClick}
      toolbarInline
      tableMutedText
      tableHeaderBar
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
