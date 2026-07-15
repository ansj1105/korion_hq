import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import { useRiskDuplicates, type DuplicateRow } from './useRiskDuplicates'
import RiskDuplicateDetailOverlay from './RiskDuplicateDetailOverlay'
import styles from '../RiskFakeApplications/RiskFakeApplications.module.css'

export default function RiskDuplicates() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows, valueTypeMeta, statusMeta, riskLevelMeta, isLoading, error } = useRiskDuplicates()
  const [selectedRow, setSelectedRow] = useState<DuplicateRow | null>(null)
  const detailLabel = t('hqRiskDuplicates.action.detail')

  const rows: TableRow[] = rawRows.map((row) => {
    const valueType = valueTypeMeta[row.valueType] ?? valueTypeMeta.EMAIL
    const status = statusMeta[row.status] ?? statusMeta.watch
    const risk = riskLevelMeta[row.riskLevel] ?? riskLevelMeta.low
    const reasonKeys = row.reasons.length ? row.reasons.slice(0, 2) : [row.reasonSummaryKey]
    return {
      id: row.id,
      cells: {
        no: row.no,
        valueType: <Badge accent={valueType.accent} size="md" shape="rect">{valueType.label}</Badge>,
        duplicateValue: row.duplicateValue,
        duplicateCount: row.duplicateCount,
        affectedRoles: row.affectedRoles,
        countries: row.countries,
        latestAt: row.latestAt,
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
      <PageHeader title={t('hqRiskDuplicates.title')} />
      <StatSection stats={stats} bare />
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}
      <DataTable
        title={t('hqRiskDuplicates.section')}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        searchKeys={['valueType', 'duplicateValue', 'affectedRoles', 'countries', 'status']}
        filterKeys={['valueType', 'affectedRoles', 'countries', 'riskScore', 'status']}
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
      <RiskDuplicateDetailOverlay duplicate={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  )
}
