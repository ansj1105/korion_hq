import { useEffect, useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatCard, { type StatCardData } from '../../../components/molecules/StatCard'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import DetailDrawer from '../../../components/organisms/DetailDrawer'
import DetailSection from '../../../components/molecules/DetailSection'
import { useTranslation } from '../../../i18n'
import { postHqPageData } from '../../../services/korionChongApi'
import type { AccentKey } from '../../../types'
import PaymentErrorCodeFormOverlay from './PaymentErrorCodeFormOverlay'
import { usePaymentErrorCodes, type PaymentErrorCodeCreateRequest, type PaymentErrorCodeRow } from './usePaymentErrorCodes'
import styles from './PaymentErrorCodes.module.css'

const severityAccent: Record<string, AccentKey> = {
  INFO: 'blue',
  WARNING: 'amber',
  ERROR: 'orange',
  CRITICAL: 'red',
}

export default function PaymentErrorCodes() {
  const { t } = useTranslation()
  const { title, desc, tableTitle, noticeTitle, noticeDesc, stats, columns, rows: fetchedRows, options, isLoading, error } = usePaymentErrorCodes()
  const [rows, setRows] = useState<PaymentErrorCodeRow[]>(fetchedRows)
  const [formOpen, setFormOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    setRows(fetchedRows)
  }, [fetchedRows])

  const selectedRow = rows.find((row) => row.id === selectedId) ?? null
  const displayStats = applyErrorCodeRowStats(stats, rows)

  const submit = async (payload: PaymentErrorCodeCreateRequest) => {
    const created = await postHqPageData<PaymentErrorCodeRow>('/api/hq/payments/error-codes', payload)
    setRows((prev) => [created, ...prev])
  }

  const tableRows: TableRow[] = rows.map((row) => ({
    id: row.id,
    cells: {
      ...row,
      severity: <Badge accent={(row.severityAccent as AccentKey) ?? severityAccent[row.severity] ?? 'blue'} size="md" shape="rect">{row.severity}</Badge>,
      flags: (
        <span className={styles.flagList}>
          {row.retryable && <Badge accent="blue" size="md" shape="rect">{t('hqPaymentErrorCodes.flag.retryable')}</Badge>}
          {row.settlementBlocked && <Badge accent="amber" size="md" shape="rect">{t('hqPaymentErrorCodes.flag.settlementBlocked')}</Badge>}
          {row.riskHold && <Badge accent="red" size="md" shape="rect">{t('hqPaymentErrorCodes.flag.riskHold')}</Badge>}
          {!row.retryable && !row.settlementBlocked && !row.riskHold && <span className={styles.emptyFlag}>-</span>}
        </span>
      ),
      status: <Badge accent={(row.statusAccent as AccentKey) ?? (row.status === 'ACTIVE' ? 'green' : 'blue')} size="md" shape="rect">{row.status}</Badge>,
      action: (
        <button type="button" className={styles.detailButton} onClick={(event) => {
          event.stopPropagation()
          setSelectedId(row.id)
        }}>
          <Badge size="md" shape="rect">{t('common.detail')}</Badge>
        </button>
      ),
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={title}>
        <p className={styles.pageDesc}>{desc}</p>
      </PageHeader>

      <div className={styles.kpiGrid}>
        {displayStats.map((stat) => <StatCard key={stat.id} {...stat} />)}
      </div>

      <section className={styles.noticeCard}>
        <h2 className={styles.noticeTitle}>{noticeTitle}</h2>
        <p className={styles.noticeDesc}>{noticeDesc}</p>
      </section>

      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      <DataTable
        title={tableTitle}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        toolbarExtra={<button type="button" className={styles.addButton} onClick={() => setFormOpen(true)}>{t('hqPaymentErrorCodes.addButton')}</button>}
        columns={columns}
        rows={tableRows}
        searchKeys={['code', 'name', 'category', 'severity', 'autoAction', 'ownerTeam', 'userMessage']}
        filterKeys={['category', 'severity', 'autoAction', 'status']}
        onRowClick={setSelectedId}
        mutedText
        headerBar
        wrapCells
      />

      <PaymentErrorCodeFormOverlay open={formOpen} options={options} onClose={() => setFormOpen(false)} onSubmit={submit} />

      <DetailDrawer
        open={Boolean(selectedRow)}
        onClose={() => setSelectedId(null)}
        title={selectedRow ? selectedRow.code : t('hqPaymentErrorCodes.detail.title')}
        headerExtra={selectedRow && (
          <div className={styles.drawerHead}>
            <Badge accent={severityAccent[selectedRow.severity] ?? 'blue'} size="md" shape="rect">{selectedRow.severity}</Badge>
            <Badge accent={selectedRow.status === 'ACTIVE' ? 'green' : 'blue'} size="md" shape="rect">{selectedRow.status}</Badge>
          </div>
        )}
      >
        {selectedRow && (
          <>
            <DetailSection title={t('hqPaymentErrorCodes.detail.basic')} rows={[
              { label: t('hqPaymentErrorCodes.col.code'), value: selectedRow.code },
              { label: t('hqPaymentErrorCodes.col.name'), value: selectedRow.name },
              { label: t('hqPaymentErrorCodes.col.category'), value: selectedRow.category },
              { label: t('hqPaymentErrorCodes.col.ownerTeam'), value: selectedRow.ownerTeam },
              { label: t('hqPaymentErrorCodes.col.httpStatus'), value: selectedRow.httpStatus },
            ]} />
            <DetailSection title={t('hqPaymentErrorCodes.detail.policy')} rows={[
              { label: t('hqPaymentErrorCodes.col.userMessage'), value: selectedRow.userMessage },
              { label: t('hqPaymentErrorCodes.col.adminDescription'), value: selectedRow.adminDescription || '-' },
              { label: t('hqPaymentErrorCodes.col.autoAction'), value: selectedRow.autoAction },
              { label: t('hqPaymentErrorCodes.flag.retryable'), value: selectedRow.retryable ? 'YES' : 'NO' },
              { label: t('hqPaymentErrorCodes.flag.settlementBlocked'), value: selectedRow.settlementBlocked ? 'YES' : 'NO' },
              { label: t('hqPaymentErrorCodes.flag.riskHold'), value: selectedRow.riskHold ? 'YES' : 'NO' },
              { label: t('hqPaymentErrorCodes.flag.publicVisible'), value: selectedRow.publicVisible ? 'YES' : 'NO' },
            ]} />
            <DetailSection title={t('hqPaymentErrorCodes.detail.memo')} rows={[
              { label: t('hqPaymentErrorCodes.col.memo'), value: selectedRow.memo || '-' },
              { label: t('hqPaymentErrorCodes.col.registeredAt'), value: selectedRow.registeredAt },
              { label: t('hqPaymentErrorCodes.col.updatedAt'), value: selectedRow.updatedAt },
            ]} />
          </>
        )}
      </DetailDrawer>
    </div>
  )
}

function applyErrorCodeRowStats(stats: StatCardData[], rows: PaymentErrorCodeRow[]) {
  const values: Record<string, string> = {
    total: String(rows.length),
    active: String(rows.filter((row) => row.status === 'ACTIVE').length),
    critical: String(rows.filter((row) => row.severity === 'CRITICAL').length),
    retryable: String(rows.filter((row) => row.retryable).length),
    settlementBlocked: String(rows.filter((row) => row.settlementBlocked).length),
  }
  return stats.map((stat) => ({
    ...stat,
    value: values[stat.id] ?? stat.value,
  }))
}
