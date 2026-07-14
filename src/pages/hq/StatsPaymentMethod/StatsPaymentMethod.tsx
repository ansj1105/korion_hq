import { useMemo, useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import Panel from '../../../components/molecules/Panel'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import dashboardStyles from '../Dashboard/Dashboard.module.css'
import riskStyles from '../RiskFakeApplications/RiskFakeApplications.module.css'
import { useStatsPaymentMethod, type HqStatsPaymentMethodRange } from './useStatsPaymentMethod'

export default function StatsPaymentMethod() {
  const { t } = useTranslation()
  const [countryScope, setCountryScope] = useState('all')
  const [range, setRange] = useState<HqStatsPaymentMethodRange>('ALL')
  const { filters, isLoading, error, stats, columns, rows: rawRows, rankingPanels, donut } = useStatsPaymentMethod({ countryScope, range })

  const tableRows: TableRow[] = rawRows.map((row) => ({
    id: row.id,
    cells: {
      id: row.id,
      count: row.count,
      successRate: <Badge accent="green" size="md" shape="rect">{row.successRate}</Badge>,
      failRate: <Badge accent={row.rawFailCount > 0 ? 'orange' : 'cyan'} size="md" shape="rect">{row.failRate}</Badge>,
      avgApprove: row.avgApprove,
      sync: <Badge accent={row.syncAccent ?? 'cyan'} size="md" shape="rect">{row.sync}</Badge>,
      failReason: row.failReason,
    },
  }))

  const donutBackground = useMemo(() => {
    let cursor = 0
    const segments = donut.map((segment) => {
      const start = cursor
      cursor += segment.pct
      return `var(--color-accent-${segment.accent}) ${start}% ${cursor}%`
    })
    return segments.length ? `conic-gradient(${segments.join(', ')}, rgba(255,255,255,0.08) ${cursor}% 100%)` : 'rgba(255,255,255,0.08)'
  }, [donut])

  const getRangeLabel = (option: HqStatsPaymentMethodRange) => (option === 'ALL' ? t('hqDashboard.filter.allPeriod') : option)

  return (
    <div className={dashboardStyles.page}>
      <PageHeader title={t('hqStatsPaymentMethod.title')}>
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
            <select className={dashboardStyles.filterSelect} value={range} onChange={(event) => setRange(event.target.value as HqStatsPaymentMethodRange)}>
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
              <span className={dashboardStyles.rankEmpty}>{t('hqStatsPaymentMethod.emptyRanking')}</span>
            )}
          </Panel>
        ))}
      </div>

      <Panel title={t('hqStatsPaymentMethod.section')} subtitle={t('hqStatsPaymentMethod.desc')}>
        <div className={dashboardStyles.sideBySide}>
          <DataTable
            columns={columns}
            rows={tableRows}
            toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
            searchKeys={['id', 'sync', 'failReason']}
            filterKeys={['id', 'sync']}
            paginated
            pageSize={10}
            largeText
            navyZebra
            bare
            fluid
          />
          <div className={dashboardStyles.donutBox}>
            <div className={dashboardStyles.donutBody}>
              <div className={dashboardStyles.donutRing} style={{ background: donutBackground }} aria-hidden="true" />
              <ul className={dashboardStyles.donutLegend}>
                {donut.map((segment) => (
                  <li key={segment.id} className={dashboardStyles.donutLegendItem}>
                    <span>{segment.label} {segment.pct}%</span>
                    <span
                      className={dashboardStyles.donutBar}
                      style={{ width: `${segment.pct * 2.5}px`, background: `var(--color-accent-${segment.accent})` }}
                    />
                  </li>
                ))}
              </ul>
            </div>
            <h4 className={`${dashboardStyles.subBoxTitle} ${dashboardStyles.donutTitleBottom}`}>{t('hqStatsPaymentMethod.donutTitle')}</h4>
          </div>
        </div>
      </Panel>
    </div>
  )
}
