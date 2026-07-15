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
import { useStatsCountry, type CountryStatsRow, type HqStatsCountryRange } from './useStatsCountry'
import StatsCountryDetailOverlay from './StatsCountryDetailOverlay'

export default function StatsCountry() {
  const { t } = useTranslation()
  const [countryScope, setCountryScope] = useState('all')
  const [range, setRange] = useState<HqStatsCountryRange>('ALL')
  const [selectedRow, setSelectedRow] = useState<CountryStatsRow | null>(null)
  const { filters, isLoading, error, stats, columns, rows: rawRows, rankingPanels, heatmap, statusMeta } = useStatsCountry({ countryScope, range })
  const detailLabel = t('hqStatsCountry.action.detail')

  const tableRows: TableRow[] = rawRows.map((row) => {
    const status = statusMeta[row.status] ?? statusMeta.idle
    return {
      id: row.id,
      cells: {
        no: row.no,
        countryCode: row.countryCode,
        leaders: row.leaders,
        partners: row.partners,
        merchants: row.merchants,
        members: row.members,
        amount: row.amount,
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

  const getRangeLabel = (option: HqStatsCountryRange) => (option === 'ALL' ? t('hqDashboard.filter.allPeriod') : option)

  return (
    <div className={dashboardStyles.page}>
      <PageHeader title={t('hqStatsCountry.title')}>
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
            <select className={dashboardStyles.filterSelect} value={range} onChange={(event) => setRange(event.target.value as HqStatsCountryRange)}>
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
              <span className={dashboardStyles.rankEmpty}>{t('hqStatsCountry.emptyRanking')}</span>
            )}
          </Panel>
        ))}
      </div>

      <Panel title={t('hqStatsCountry.heatmap.title')} subtitle={t('hqStatsCountry.heatmap.desc')}>
        <div className={riskStyles.reasonBadges}>
          {heatmap.map((item) => (
            <Badge key={item.code} accent={Number(item.intensity) > 70 ? 'green' : Number(item.intensity) > 30 ? 'cyan' : 'orange'} size="md" shape="rect">
              {item.code} · {item.amount} · {item.growth}
            </Badge>
          ))}
        </div>
      </Panel>

      <DataTable
        title={t('hqStatsCountry.section')}
        columns={columns}
        rows={tableRows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        searchKeys={['countryCode', 'status']}
        filterKeys={['countryCode', 'status']}
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
      <StatsCountryDetailOverlay row={selectedRow} onClose={() => setSelectedRow(null)} />
    </div>
  )
}
