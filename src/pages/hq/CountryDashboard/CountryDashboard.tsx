import PageHeader from '../../../components/organisms/PageHeader'
import Panel from '../../../components/molecules/Panel'
import StatCard from '../../../components/molecules/StatCard'
import DataTable from '../../../components/organisms/DataTable'
import type { TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useCountryDashboard } from './useCountryDashboard'
import styles from './CountryDashboard.module.css'

/*
 * CountryDashboard (page) — 본사어드민 · 대시보드 · 국가별 대시보드
 * ------------------------------------------------------------------
 * Figma 실측 결과 KPI 19장 + 순위 패널 3개(나라별/파트너별/가맹점별)가
 * "전체 운영 대시보드"(src/pages/hq/Dashboard)와 라벨·값·증감 텍스트까지
 * 완전히 동일한 복붙이라(차이는 1번 카드 "활성국가"의 값이 숫자 대신 국가명
 * "나이지리아"로 바뀌고 증감줄이 빠진 것뿐) 같은 i18n 키/구조를 그대로 재사용했다.
 * 전체 운영 대시보드의 11개 콘텐츠 섹션 대신, 이 화면은 "국가별 운영 순위" 표 1개만 있다.
 */
export default function CountryDashboard() {
  const { t } = useTranslation()
  const { kpis, rankingPanels, countryRanking } = useCountryDashboard()

  const countryRankingRows: TableRow[] = countryRanking.rows.map((r) => ({
    id: r.id,
    cells: {
      country: r.country,
      countryCode: r.countryCode,
      totalMembers: r.totalMembers,
      leaders: r.leaders,
      partners: r.partners,
      merchants: r.merchants,
      monthlyAmount: r.monthlyAmount,
      monthlyCount: r.monthlyCount,
      status: r.status,
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqCountryDashboard.title')}>
        {/* Figma의 국가/날짜 필터칩 — 동작 없는 UI 표시만 (CLAUDE.md 1번 규칙: 인터랙션은 협의 전까지 보류) */}
        <div className={styles.filterChips}>
          <span className={styles.chip}>{t('hqDashboard.filter.allCountries')}</span>
          <span className={styles.chip}>{t('hqDashboard.filter.today')}</span>
        </div>
      </PageHeader>

      {/* 전체 운영 KPI 그리드 — Figma 실측 5열×4행(마지막 칸 1개는 원래 비어있음, 전체 운영 대시보드와 동일) */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <StatCard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* 대시보드 요약 패널 — 전체 운영 대시보드와 동일하게 제목만 있고 내용 미정의. 빈 채로 자리만 확보 */}
      <div className={styles.rankingGrid}>
        {rankingPanels.map((panel) => (
          <Panel key={panel.id} title={panel.title} />
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
