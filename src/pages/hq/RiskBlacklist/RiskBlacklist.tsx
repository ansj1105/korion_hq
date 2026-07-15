import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import { useRiskBlacklist, type BlacklistRow } from './useRiskBlacklist'
import RiskBlacklistDetailOverlay from './RiskBlacklistDetailOverlay'
import styles from '../RiskFakeApplications/RiskFakeApplications.module.css'

export default function RiskBlacklist() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows, targetTypeMeta, statusMeta, riskLevelMeta, isLoading, error } = useRiskBlacklist()
  const [selectedRow, setSelectedRow] = useState<BlacklistRow | null>(null)
  const detailLabel = t('hqRiskBlacklist.action.detail')

  const rows: TableRow[] = rawRows.map((row) => {
    const targetType = targetTypeMeta[row.targetType] ?? { label: row.targetType || '-', accent: 'orange' as const }
    const status = statusMeta[row.status] ?? statusMeta.review
    const risk = riskLevelMeta[row.riskLevel] ?? riskLevelMeta.low
    const reasonKeys = row.reasons.length ? row.reasons.slice(0, 2) : [row.reasonSummaryKey]
    return {
      id: row.id,
      cells: {
        no: row.no,
        targetType: <Badge accent={targetType.accent} size="md" shape="rect">{targetType.label}</Badge>,
        targetCode: row.targetCode,
        targetName: row.targetName,
        country: row.country,
        parentCode: row.parentCode,
        entityStatus: row.entityStatus,
        requestStatus: row.requestStatus,
        reason: (
          <div className={styles.reasonBadges}>
            {reasonKeys.map((reasonKey) => (
              <Badge key={reasonKey} accent="orange" size="md" shape="rect">{t(reasonKey)}</Badge>
            ))}
          </div>
        ),
        riskScore: <Badge accent={risk.accent} size="md" shape="rect">{risk.label} {row.riskScore}</Badge>,
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
      <PageHeader title={t('hqRiskBlacklist.title')} />
      <StatSection stats={stats} bare />
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}
      <DataTable
        title={t('hqRiskBlacklist.section')}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        searchKeys={['targetCode', 'targetName', 'parentCode', 'country', 'status']}
        filterKeys={['targetType', 'country', 'entityStatus', 'requestStatus', 'status']}
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
      <RiskBlacklistDetailOverlay row={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  )
}
