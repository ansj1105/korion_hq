import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import { useRiskFakeMerchants, type FakeMerchantRow } from './useRiskFakeMerchants'
import RiskFakeMerchantDetailOverlay from './RiskFakeMerchantDetailOverlay'
import styles from '../RiskFakeApplications/RiskFakeApplications.module.css'

export default function RiskFakeMerchants() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows, statusMeta, riskLevelMeta, isLoading, error } = useRiskFakeMerchants()
  const [selectedRow, setSelectedRow] = useState<FakeMerchantRow | null>(null)
  const detailLabel = t('hqRiskFakeMerchants.action.detail')

  const rows: TableRow[] = rawRows.map((row) => {
    const status = statusMeta[row.status] ?? statusMeta.pending
    const risk = riskLevelMeta[row.riskLevel] ?? riskLevelMeta.low
    const reasonKeys = row.reasons.length ? row.reasons.slice(0, 2) : [row.reasonSummaryKey]
    return {
      id: row.id,
      cells: {
        no: row.no,
        merchantCode: row.merchantCode,
        merchantName: row.merchantName,
        parentCode: row.parentCode,
        country: row.country,
        contact: row.contact,
        wallet: row.wallet,
        txCount: row.txCount,
        failedTxCount: row.failedTxCount,
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
            accentByLabel={{ [detailLabel]: 'cyan' }}
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
      <PageHeader title={t('hqRiskFakeMerchants.title')} />
      <StatSection stats={stats} bare />
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}
      <DataTable
        title={t('hqRiskFakeMerchants.section')}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        searchKeys={['merchantCode', 'merchantName', 'parentCode', 'contact', 'wallet', 'country', 'status']}
        filterKeys={['parentCode', 'country', 'txCount', 'failedTxCount', 'riskScore', 'status']}
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
      <RiskFakeMerchantDetailOverlay merchant={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  )
}
