import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import MetricCard from '../../../components/molecules/MetricCard'
import ActionBadges from '../../../components/molecules/ActionBadges'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import type { AccentKey } from '../../../types'
import { useTranslation } from '../../../i18n'
import { fetchHqPageData, postHqPageData } from '../../../services/korionChongApi'
import { useNoticeHistory, type HqNoticeHistoryRange, type NoticeHistoryRow, type NoticeRecipientRow } from './useNoticeHistory'
import NoticeDetailOverlay from './NoticeDetailOverlay'
import styles from './NoticeHistory.module.css'

const KPI_CHIPS: Record<string, { chip: string; chipSolid?: boolean }> = {
  totalSent: { chip: '#24e6b8', chipSolid: true },
  todaySent: { chip: '#7c5cff' },
  scheduledPending: { chip: '#f6c85a', chipSolid: true },
  totalRecipients: { chip: '#2a8bff' },
  successRate: { chip: '#22d9ff' },
}

const STATUS_ACCENT: Record<string, AccentKey> = {
  완료: 'green',
  예약대기: 'orange',
  발송중: 'blue',
  부분실패: 'orange',
  실패: 'red',
  취소: 'red',
  임시저장: 'purple',
}

export default function NoticeHistory() {
  const { t } = useTranslation()
  const [countryScope, setCountryScope] = useState('all')
  const [range, setRange] = useState<HqNoticeHistoryRange>('TODAY')
  const [reloadToken, setReloadToken] = useState(0)
  const { isLoading, error, kpis, filters, columns, rows: rawRows, detail } = useNoticeHistory(countryScope, range, reloadToken)

  const [selectedNotice, setSelectedNotice] = useState<NoticeHistoryRow | null>(null)
  const [recipientNotice, setRecipientNotice] = useState<NoticeHistoryRow | null>(null)
  const [recipients, setRecipients] = useState<NoticeRecipientRow[]>([])
  const [recipientError, setRecipientError] = useState('')
  const [toast, setToast] = useState('')
  const metricCards = kpis.map((kpi) => ({
    id: kpi.id,
    label: kpi.label,
    value: kpi.value,
    note: kpi.delta,
    chip: KPI_CHIPS[kpi.id]?.chip ?? '#7c5cff',
    chipSolid: KPI_CHIPS[kpi.id]?.chipSolid,
  }))

  const getRangeLabel = (option: HqNoticeHistoryRange) => {
    if (option === 'ALL') return t('hqDashboard.filter.allPeriod')
    if (option === 'TODAY' || option === '1D') return t('hqDashboard.filter.today')
    return option
  }

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3000)
  }

  const cancelNotice = async (notice: NoticeHistoryRow) => {
    const noticeId = notice.id
    if (noticeId === undefined || notice.rawStatus === 'CANCELLED') return
    if (!window.confirm(t('hqNoticeHistory.confirm.cancelSend'))) return
    try {
      await postHqPageData(`/api/hq/announcements/${noticeId}/cancel`, {})
      showToast(t('notice.history.cancelled'))
      setSelectedNotice(null)
      setReloadToken((value) => value + 1)
    } catch (requestError) {
      showToast(requestError instanceof Error ? requestError.message : t('common.apiError'))
    }
  }

  const openRecipients = async (notice: NoticeHistoryRow) => {
    if (notice.id === undefined) return
    setRecipientNotice(notice)
    setRecipients([])
    setRecipientError('')
    try {
      const response = await fetchHqPageData<{ rows: NoticeRecipientRow[] }>(`/api/hq/announcements/${notice.id}/recipients`)
      setRecipients(response.rows ?? [])
    } catch (requestError) {
      setRecipientError(requestError instanceof Error ? requestError.message : t('common.apiError'))
    }
  }

  const rowById = (id: string) => rawRows.find((row) => String(row.id) === id) ?? null

  const rows: TableRow[] = rawRows.map((r) => ({
    id: String(r.id ?? r.no),
    cells: {
      no: r.no,
      sentAt: r.sentAt,
      title: r.title,
      country: r.country,
      target: r.target,
      recipients: r.recipients,
      method: r.method,
      status: <Badge accent={STATUS_ACCENT[r.status] ?? 'cyan'} size="md" shape="rect">{r.status}</Badge>,
      action: (
        <ActionBadges
          labels={[
            t('common.detail'),
            t('hqCollateral.action.memberInfo'),
            ...(r.rawStatus === 'CANCELLED' ? [] : [t('hqNoticeHistory.action.cancelSend')]),
          ]}
          accentByLabel={{ [t('hqNoticeHistory.action.cancelSend')]: 'red' }}
          solid
          size="md"
          shape="rect"
          onLabelClick={(label) => {
            if (label === t('common.detail')) {
              setSelectedNotice(r)
              return
            }
            if (label === t('hqCollateral.action.memberInfo')) {
              void openRecipients(r)
              return
            }
            if (label === t('hqNoticeHistory.action.cancelSend')) {
              void cancelNotice(r)
            }
          }}
        />
      ),
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqNoticeHistory.title')}>
        <p className={styles.pageDesc}>{t('hqNoticeHistory.desc')}</p>
        <div className={styles.filterChips}>
          <label className={styles.filterSelectField}>
            <span>{t('hqNoticeSend.filter.country')}</span>
            <select className={styles.filterSelect} value={countryScope} onChange={(event) => setCountryScope(event.target.value)}>
              {filters.countryOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className={styles.filterSelectField}>
            <span>{t('hqNoticeSend.filter.range')}</span>
            <select className={styles.filterSelect} value={range} onChange={(event) => setRange(event.target.value as HqNoticeHistoryRange)}>
              {filters.rangeOptions.map((option) => (
                <option key={option} value={option}>{getRangeLabel(option)}</option>
              ))}
            </select>
          </label>
        </div>
      </PageHeader>

      <div className={styles.metrics}>
        {metricCards.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </div>
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      <DataTable
        title={t('hqNoticeHistory.table.title')}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        columns={columns}
        rows={rows}
        searchKeys={['no', 'sentAt', 'title', 'country', 'target', 'method', 'status']}
        filterKeys={['country', 'target', 'method', 'status']}
        mutedText
        headerBar
        wrapCells
        paginated
        pageSize={10}
        onRowClick={(id) => setSelectedNotice(rowById(id))}
      />

      <NoticeDetailOverlay
        row={selectedNotice}
        extra={!selectedNotice ? detail : {
          sender: selectedNotice.sender ?? detail.sender,
          success: selectedNotice.success ?? detail.success,
          fail: selectedNotice.fail ?? detail.fail,
          rate: selectedNotice.rate ?? detail.rate,
          body: selectedNotice.body ?? detail.body,
        }}
        onClose={() => setSelectedNotice(null)}
        onCancelSend={selectedNotice ? () => void cancelNotice(selectedNotice) : undefined}
      />
      {recipientNotice && (
        <div className={styles.recipientBackdrop} onClick={() => setRecipientNotice(null)}>
          <section className={styles.recipientPanel} role="dialog" aria-modal="true" aria-label={t('hqNoticeHistory.recipients.title')} onClick={(event) => event.stopPropagation()}>
            <div className={styles.recipientHeader}>
              <div>
                <h2>{t('hqNoticeHistory.recipients.title')}</h2>
                <p>{recipientNotice.title}</p>
              </div>
              <button type="button" onClick={() => setRecipientNotice(null)} aria-label={t('hqNoticeSend.toast.close')}>×</button>
            </div>
            {recipientError && <p className={styles.errorText}>{recipientError}</p>}
            <DataTable
              columns={[
                { key: 'no', label: t('hqNoticeHistory.recipients.no'), width: '72px', align: 'center' },
                { key: 'recipientType', label: t('hqNoticeHistory.recipients.type'), width: '110px' },
                { key: 'recipientCode', label: t('hqNoticeHistory.recipients.code'), width: '150px' },
                { key: 'recipientName', label: t('hqNoticeHistory.recipients.name'), width: '180px' },
                { key: 'country', label: t('hqNoticeHistory.recipients.country'), width: '100px' },
                { key: 'deliveryStatus', label: t('hqNoticeHistory.recipients.delivery'), width: '130px' },
                { key: 'readStatus', label: t('hqNoticeHistory.recipients.read'), width: '120px' },
              ]}
              rows={recipients.map((recipient) => ({
                id: `${recipient.recipientType}-${recipient.recipientCode}-${recipient.no}`,
                cells: {
                  no: String(recipient.no),
                  recipientType: recipient.recipientType,
                  recipientCode: recipient.recipientCode,
                  recipientName: recipient.recipientName,
                  country: recipient.country,
                  deliveryStatus: <Badge accent={recipient.deliveryStatus === 'CANCELLED' ? 'red' : 'green'} size="md" shape="rect">{recipient.deliveryStatus}</Badge>,
                  readStatus: recipient.readStatus,
                },
              }))}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              searchKeys={['recipientType', 'recipientCode', 'recipientName', 'country']}
              filterKeys={['recipientType', 'country', 'deliveryStatus', 'readStatus']}
              bare
              paginated
              pageSize={8}
              wrapCells
            />
          </section>
        </div>
      )}
      {toast && (
        <div className={styles.toast}>
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')} aria-label={t('hqNoticeSend.toast.close')}>×</button>
        </div>
      )}
    </div>
  )
}
