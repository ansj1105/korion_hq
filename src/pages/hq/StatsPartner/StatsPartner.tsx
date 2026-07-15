import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import Panel from '../../../components/molecules/Panel'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import dashboardStyles from '../Dashboard/Dashboard.module.css'
import riskStyles from '../RiskFakeApplications/RiskFakeApplications.module.css'
import { useStatsPartner, type HqStatsPartnerRange, type PartnerStatsRow } from './useStatsPartner'
import StatsPartnerDetailOverlay from './StatsPartnerDetailOverlay'

export default function StatsPartner() {
  const { t } = useTranslation()
  const [countryScope, setCountryScope] = useState('all')
  const [range, setRange] = useState<HqStatsPartnerRange>('ALL')
  const [selectedRow, setSelectedRow] = useState<PartnerStatsRow | null>(null)
  const { filters, isLoading, error, stats, columns, rows: rawRows, rankingPanels, statusMeta } = useStatsPartner({ countryScope, range })
  const detailLabel = t('hqStatsPartner.action.detail')

  const tableRows: TableRow[] = rawRows.map((row) => {
    const status = statusMeta[row.status] ?? statusMeta.active
    return {
      id: row.id,
      cells: {
        no: row.no,
        partnerCode: row.partnerCode,
        partnerName: row.partnerName,
        leaderCode: row.leaderCode,
        country: row.country,
        subMerchantCount: row.subMerchantCount,
        amount: row.amount,
        txCount: row.txCount,
        partnerFee: row.partnerFee,
        unsettledFee: row.unsettledFee,
        syncFail: row.syncFail,
        growth: <Badge accent={String(row.growth).startsWith('-') ? 'orange' : 'cyan'} size="md" shape="rect">{row.growth}</Badge>,
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

  const getRangeLabel = (option: HqStatsPartnerRange) => (option === 'ALL' ? t('hqDashboard.filter.allPeriod') : option)

  return (
    <div className={dashboardStyles.page}>
      <PageHeader title={t('hqStatsPartner.title')}>
        <div className={dashboardStyles.filterControls}>
          <label className={dashboardStyles.filterField}>
            <span>{t('hqDashboard.filter.country')}</span>
            <select className={dashboardStyles.filterSelect} value={countryScope} onChange={(event) => setCountryScope(event.target.value)}>
              {filters.countryOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className={dashboardStyles.filterField}>
            <span>{t('hqDashboard.filter.range')}</span>
            <select className={dashboardStyles.filterSelect} value={range} onChange={(event) => setRange(event.target.value as HqStatsPartnerRange)}>
              {filters.rangeOptions.map((option) => (
                <option key={option} value={option}>{getRangeLabel(option)}</option>
              ))}
            </select>
          </label>
        </div>
      </PageHeader>

      <StatSection stats={stats} bare />
      {isLoading && <p className={riskStyles.stateText}>{t('common.loading')}</p>}
      {error && <p className={riskStyles.errorText}>{error}</p>}

      <div className={dashboardStyles.rankingGrid}>
        {rankingPanels.map((panel) => (
          <Panel key={panel.id} title={t(panel.titleKey)}>
            {panel.rows.length ? (
              <ol className={dashboardStyles.rankList}>
                {panel.rows.map((row) => (
                  <li key={`${panel.id}-${row.rank}-${row.name}`} className={dashboardStyles.rankItem}>
                    <span className={dashboardStyles.rankNo}>{row.rank}</span>
                    <span className={dashboardStyles.rankMain}>
                      <strong className={dashboardStyles.rankName}>{row.name}</strong>
                      <span className={dashboardStyles.rankMeta}>{row.meta}</span>
                    </span>
                    <span className={dashboardStyles.rankAmount}>{row.amount}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <span className={dashboardStyles.rankEmpty}>{t('hqStatsPartner.emptyRanking')}</span>
            )}
          </Panel>
        ))}
      </div>

      <DataTable
        title={t('hqStatsPartner.section')}
        columns={columns}
        rows={tableRows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        searchKeys={['partnerCode', 'partnerName', 'leaderCode', 'country', 'status']}
        filterKeys={['country', 'leaderCode', 'status']}
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
      <StatsPartnerDetailOverlay row={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  )
}
