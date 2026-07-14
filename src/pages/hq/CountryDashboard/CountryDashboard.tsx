import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import Panel from '../../../components/molecules/Panel'
import StatCard from '../../../components/molecules/StatCard'
import Badge from '../../../components/atoms/Badge'
import DataTable from '../../../components/organisms/DataTable'
import type { TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useCountryDashboard, type HqCountryDashboardRange } from './useCountryDashboard'
import styles from './CountryDashboard.module.css'

/*
 * CountryDashboard (page) — 본사어드민 · 대시보드 · 국가별 대시보드
 * ------------------------------------------------------------------
 * Figma 실측 결과 KPI 19장 + 순위 패널(국가별/리더별/파트너별/가맹점별)이
 * "전체 운영 대시보드"(src/pages/hq/Dashboard)와 라벨·값·증감 텍스트까지
 * 완전히 동일한 복붙이라(차이는 1번 카드 "활성국가"의 값이 숫자 대신 국가명
 * "나이지리아"로 바뀌고 증감줄이 빠진 것뿐) 같은 i18n 키/구조를 그대로 재사용했다.
 * 전체 운영 대시보드의 11개 콘텐츠 섹션 대신, 이 화면은 "국가별 운영 순위" 표 1개만 있다.
 */
export default function CountryDashboard() {
  const { t } = useTranslation()
  const [countryScope, setCountryScope] = useState('all')
  const [range, setRange] = useState<HqCountryDashboardRange>('ALL')
  const { filters, kpis, rankingPanels, countryRanking, isLoading, error } = useCountryDashboard({ countryScope, range })
  const getRangeLabel = (option: HqCountryDashboardRange) => (option === 'ALL' ? t('hqDashboard.filter.allPeriod') : option)

  const countryRankingRows: TableRow[] = countryRanking.rows.map((r) => ({
    id: r.id,
    cells: {
      rank: r.rank,
      country: r.country,
      countryCode: r.countryCode,
      totalMembers: r.totalMembers,
      leaders: r.leaders,
      partners: r.partners,
      merchants: r.merchants,
      monthlyAmount: r.monthlyAmount,
      monthlyCount: r.monthlyCount,
      status: (
        <Badge accent={r.statusAccent} size="cell" shape="rect">
          {r.status}
        </Badge>
      ),
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqCountryDashboard.title')}>
        <div className={styles.filterControls}>
          <label className={styles.filterField}>
            <span>{t('hqDashboard.filter.country')}</span>
            <select className={styles.filterSelect} value={filters.selectedCountry} onChange={(event) => setCountryScope(event.target.value)}>
              {filters.countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filterField}>
            <span>{t('hqDashboard.filter.period')}</span>
            <select className={styles.filterSelect} value={filters.selectedRange} onChange={(event) => setRange(event.target.value as HqCountryDashboardRange)}>
              {filters.rangeOptions.map((option) => (
                <option key={option} value={option}>
                  {getRangeLabel(option)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PageHeader>

      {/* 전체 운영 KPI 그리드 — Figma 실측 5열×4행(마지막 칸 1개는 원래 비어있음, 전체 운영 대시보드와 동일) */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <StatCard key={kpi.id} {...kpi} />
        ))}
      </div>
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* 국가별 순위 요약 패널 — /api/hq/stats/country rankingPanels 응답을 그대로 표시 */}
      <div className={styles.rankingGrid}>
        {rankingPanels.map((panel) => (
          <Panel key={panel.id} title={panel.title}>
            {panel.rows.length ? (
              <ol className={styles.rankList}>
                {panel.rows.map((row) => (
                  <li key={`${panel.id}-${row.rank}-${row.meta}`} className={styles.rankItem}>
                    <span className={styles.rankNo}>{row.rank}</span>
                    <span className={styles.rankMain}>
                      <strong className={styles.rankName}>{row.name}</strong>
                      <span className={styles.rankMeta}>{row.meta}</span>
                    </span>
                    <span className={styles.rankAmount}>{row.amount}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <span className={styles.rankEmpty}>{t('common.noData')}</span>
            )}
          </Panel>
        ))}
      </div>

      <DataTable
        title={t('hqCountryDashboard.table.title')}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        inlineToolbar
        columns={countryRanking.columns}
        rows={countryRankingRows}
        zebra
      />
    </div>
  )
}
