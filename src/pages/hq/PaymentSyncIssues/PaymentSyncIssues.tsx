import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatCard from '../../../components/molecules/StatCard'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import DetailDrawer from '../../../components/organisms/DetailDrawer'
import DetailSection from '../../../components/molecules/DetailSection'
import { useTranslation } from '../../../i18n'
import type { AccentKey } from '../../../types'
import { usePaymentSyncIssues, type PaymentSyncIssueRow } from './usePaymentSyncIssues'
import styles from './PaymentSyncIssues.module.css'

const statusAccent: Record<string, AccentKey> = {
  WAITING: 'blue',
  SUCCESS: 'green',
  FAILED: 'red',
  HOLD: 'amber',
  VERIFY_WAITING: 'blue',
  VERIFIED: 'green',
  VERIFY_FAILED: 'red',
  VERIFY_HOLD: 'amber',
  PENDING: 'blue',
  AVAILABLE: 'blue',
  REQUESTED: 'purple',
  APPROVED: 'green',
  PAID: 'green',
  HELD: 'amber',
  REJECTED: 'red',
  CANCELLED: 'red',
  CONFIRMED: 'green',
  SYNC_PENDING: 'blue',
  SYNC_FAILED: 'red',
  RISK_HOLD: 'amber',
}
const actionAccent: Record<string, AccentKey> = {
  상세: 'cyan',
  재시도: 'blue',
  강제검증: 'purple',
  오류코드: 'red',
  보류사유: 'amber',
  검토: 'purple',
  증빙: 'green',
}

export default function PaymentSyncIssues() {
  const { t } = useTranslation()
  const { title, desc, tableTitle, noticeTitle, noticeDesc, stats, columns, rows, isLoading, error } = usePaymentSyncIssues()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const selectedRow = rows.find((row) => row.id === selectedId) ?? null
  const openDetail = (rowId: string, action?: string) => {
    setSelectedId(rowId)
    setSelectedAction(action ?? null)
  }

  const tableRows: TableRow[] = rows.map((row) => ({
    id: row.id,
    cells: {
      ...row,
      senderUploadStatus: <StatusBadge value={row.senderUploadStatus} accent={row.senderAccent} />,
      receiverUploadStatus: <StatusBadge value={row.receiverUploadStatus} accent={row.receiverAccent} />,
      serverVerifyStatus: <StatusBadge value={row.serverVerifyStatus} />,
      settlementStatus: <StatusBadge value={row.settlementStatus} />,
      overallStatus: (
        <span className={styles.overallCell}>
          <StatusBadge value={row.overallStatus} accent={row.overallAccent} />
          {row.longWaiting && <Badge accent="amber" size="xs" shape="rect">{t('hqPaymentSyncIssues.flag.longWaiting')}</Badge>}
          {row.retryable && <Badge accent="blue" size="xs" shape="rect">{t('hqPaymentSyncIssues.flag.retryable')}</Badge>}
        </span>
      ),
      action: (
        <div className={styles.actionCell}>
          {row.actions.map((label) => (
            <button
              key={label}
              type="button"
              className={styles.actionButton}
              onClick={(event) => {
                event.stopPropagation()
                openDetail(row.id, label)
              }}
            >
              <Badge accent={actionAccent[label] ?? 'cyan'} size="md" shape="rect">
                {label === '상세' ? t('common.detail') : label}
              </Badge>
            </button>
          ))}
        </div>
      ),
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={title}>
        <p className={styles.pageDesc}>{desc}</p>
      </PageHeader>

      <div className={styles.kpiGrid}>
        {stats.map((stat) => <StatCard key={stat.id} {...stat} />)}
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
        columns={columns}
        rows={tableRows}
        searchKeys={['txId', 'sessionId', 'merchantName', 'senderDeviceId', 'receiverDeviceId', 'senderUploadStatus', 'receiverUploadStatus', 'overallStatus', 'reason']}
        filterKeys={['connection', 'senderUploadStatus', 'receiverUploadStatus', 'serverVerifyStatus', 'settlementStatus', 'overallStatus']}
        onRowClick={(id) => openDetail(id)}
        mutedText
        headerBar
        wrapCells
      />

      <DetailDrawer
        open={Boolean(selectedRow)}
        onClose={() => {
          setSelectedId(null)
          setSelectedAction(null)
        }}
        title={selectedRow ? `${selectedRow.txId} ${t('hqPaymentSyncIssues.detail.titleSuffix')}` : t('hqPaymentSyncIssues.detail.title')}
        headerExtra={selectedRow && (
          <div className={styles.drawerHead}>
            <StatusBadge value={selectedRow.overallStatus} accent={selectedRow.overallAccent} />
            {selectedAction && <Badge accent={actionAccent[selectedAction] ?? 'cyan'} size="xs" shape="rect">{selectedAction}</Badge>}
            <span className={styles.drawerMeta}>{selectedRow.sessionId} · {selectedRow.connection} · {selectedRow.occurredAt}</span>
          </div>
        )}
      >
        {selectedRow && <SyncIssueDetail row={selectedRow} />}
      </DetailDrawer>
    </div>
  )
}

function StatusBadge({ value, accent }: { value: string; accent?: string }) {
  return <Badge accent={(accent as AccentKey) ?? statusAccent[value] ?? 'blue'} size="md" shape="rect">{value}</Badge>
}

function SyncIssueDetail({ row }: { row: PaymentSyncIssueRow }) {
  const { t } = useTranslation()
  return (
    <>
      <DetailSection title={t('hqPaymentSyncIssues.detail.transaction')} rows={[
        { label: t('hqPaymentSyncIssues.col.txId'), value: row.txId },
        { label: t('hqPaymentSyncIssues.col.sessionId'), value: row.sessionId },
        { label: t('hqPaymentSyncIssues.col.proofId'), value: row.proofId },
        { label: t('hqPaymentSyncIssues.col.merchantName'), value: `${row.merchantName} / ${row.merchantCode}` },
        { label: t('hqPaymentSyncIssues.col.amount'), value: row.amount },
        { label: t('hqPaymentSyncIssues.col.connection'), value: row.connection },
      ]} />
      <DetailSection title={t('hqPaymentSyncIssues.detail.devices')} rows={[
        { label: t('hqPaymentSyncIssues.col.senderDeviceId'), value: row.senderDeviceId },
        { label: t('hqPaymentSyncIssues.col.senderUploadStatus'), value: row.senderUploadStatus },
        { label: t('hqPaymentSyncIssues.col.receiverDeviceId'), value: row.receiverDeviceId },
        { label: t('hqPaymentSyncIssues.col.receiverUploadStatus'), value: row.receiverUploadStatus },
      ]} />
      <DetailSection title={t('hqPaymentSyncIssues.detail.server')} rows={[
        { label: t('hqPaymentSyncIssues.col.serverVerifyStatus'), value: row.serverVerifyStatus },
        { label: t('hqPaymentSyncIssues.col.sourceStatus'), value: row.sourceStatus },
        { label: t('hqPaymentSyncIssues.col.settlementStatus'), value: row.settlementStatus },
        { label: t('hqPaymentSyncIssues.col.overallStatus'), value: row.overallStatus },
        { label: t('hqPaymentSyncIssues.col.reason'), value: row.reason },
        { label: t('hqPaymentSyncIssues.col.updatedAt'), value: row.updatedAt },
      ]} />
    </>
  )
}
