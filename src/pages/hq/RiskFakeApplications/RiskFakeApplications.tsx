import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import { useRiskFakeApplications, type FakeApplicationRow } from './useRiskFakeApplications'
import RiskFakeApplicationDetailOverlay from './RiskFakeApplicationDetailOverlay'
import styles from './RiskFakeApplications.module.css'

export default function RiskFakeApplications() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows, statusMeta, riskLevelMeta, isLoading, error } = useRiskFakeApplications()
  const [selectedRow, setSelectedRow] = useState<FakeApplicationRow | null>(null)
  const detailLabel = t('hqRiskFakeApplications.action.detail')

  const rows: TableRow[] = rawRows.map((row) => {
    const status = statusMeta[row.status] ?? statusMeta.waiting
    const risk = riskLevelMeta[row.riskLevel] ?? riskLevelMeta.low
    const reasonKeys = row.reasons.length ? row.reasons.slice(0, 2) : [row.reasonSummaryKey]
    return {
      id: row.id,
      cells: {
        no: row.no,
        applicationNo: row.applicationNo,
        appliedAt: row.appliedAt,
        applicantType: <Badge accent="purple" size="md" shape="rect">{row.applicantType}</Badge>,
        country: row.country,
        companyName: row.companyName,
        contact: row.contact,
        wallet: row.wallet,
        riskScore: <Badge accent={risk.accent} size="md" shape="rect">{risk.label} {row.riskScore}</Badge>,
        reason: (
          <div className={styles.reasonBadges}>
            {reasonKeys.map((reasonKey) => (
              <Badge key={reasonKey} accent="orange" size="md" shape="rect">{t(reasonKey)}</Badge>
            ))}
          </div>
        ),
        status: <Badge accent={status.accent} size="md" shape="rect">{status.label}</Badge>,
        detail: (
          <ActionBadges
            labels={[detailLabel]}
            size="md"
            shape="rect"
            onLabelClick={() => setSelectedRow(row)}
          />
        ),
      },
    }
  })

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqRiskFakeApplications.title')} />
      <StatSection stats={stats} bare />
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}
      <DataTable
        title={t('hqRiskFakeApplications.section')}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        searchKeys={['applicationNo', 'companyName', 'contact', 'wallet', 'country', 'status']}
        filterKeys={['applicantType', 'country', 'riskScore', 'status']}
        onRowClick={(id) => {
          const row = rawRows.find((item) => item.id === id)
          if (row) setSelectedRow(row)
        }}
        paginated
        pageSize={10}
        fill
        inlineToolbar
        mutedText
        headerBar
      />
      <RiskFakeApplicationDetailOverlay application={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  )
}
