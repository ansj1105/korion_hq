import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import Panel from '../../../components/molecules/Panel'
import StatCard from '../../../components/molecules/StatCard'
import MiniStatCard from '../../../components/molecules/MiniStatCard'
import DataTable from '../../../components/organisms/DataTable'
import type { TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import Button from '../../../components/atoms/Button'
import type { AccentKey } from '../../../types'
import { useTranslation } from '../../../i18n'
import { useDashboard } from './useDashboard'
import type { HqDashboardRange } from './useDashboard'
import styles from './Dashboard.module.css'

type DashboardTab = 'overview' | 'offline' | 'settlement' | 'risk' | 'growth' | 'payment' | 'logs'

const DASHBOARD_TABS: DashboardTab[] = ['overview', 'offline', 'settlement', 'risk', 'growth', 'payment', 'logs']

/*
 * Dashboard (page) — 본사어드민 · 대시보드 · 전체 운영 대시보드
 * ------------------------------------------------------------------
 * Figma 실측 결과 1:14972 프레임(헤더 바로 아래 "기간 필터 / 1D-365D"가
 * top:1799px 절대좌표로 박혀 있어 화면 맨 밑 가장자리에 잘려서 안 보이는
 * 위치였다 — 다른 화면들에서도 반복 확인된 복붙 leftover라
 * 이 화면에서도 구현하지 않는다(docs/head-office-admin/CHANGELOG.md 참고).
 *
 * 11개 섹션은 전부 "제목 + 설명 + 본문"으로 같은 모양이라 Panel(molecule)을
 * 그대로 재사용한다. 색상은 Figma가 같은 의미(파랑/주황/빨강/초록 등)에
 * 색조만 카드마다 조금씩 다르게 써서(복붙 변형), 토큰의 AccentKey로
 * 의미 단위로 매핑했다 — 픽셀 단위 rgba를 전부 따로 박지 않음.
 */
export default function Dashboard() {
  const { t } = useTranslation()
  const [countryScope, setCountryScope] = useState('all')
  const [range, setRange] = useState<HqDashboardRange>('1D')
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')
  const {
    filters,
    kpis,
    rankingPanels,
    offlinePay,
    settlement,
    risk,
    countryOps,
    approvalQueue,
    networkGrowth,
    paymentMethod,
    activityLogs,
    aiInsight,
    quickActions,
  } = useDashboard({ countryScope, range })

  /*
   * Figma 실측: 상태/액션 류 셀은 "항상 배지"가 아니라 진행 중·이례적인 값만 배지로
   * 강조하고 나머지는 평텍스트다(예: 결제 5건 중 PENDING 1건만 Sync도 배지로 강조).
   * accent가 있을 때만 Badge, 없으면 평텍스트로 렌더하는 작은 헬퍼.
   */
  const badgeOrText = (text: string, accent?: AccentKey) =>
    accent ? (
      <Badge accent={accent} size="cell">
        {text}
      </Badge>
    ) : (
      text
    )

  const handleQuickActionClick = (action: (typeof quickActions)[number]) => {
    window.dispatchEvent(
      new CustomEvent('hq-dashboard:quick-action', {
        detail: {
          actionId: action.id,
          actionLabel: action.label,
          tab: activeTab,
        },
      }),
    )
  }

  const settlementRows: TableRow[] = settlement.rows.map((r) => ({
    id: r.id,
    cells: {
      type: r.type,
      name: r.name,
      country: r.country,
      requested: r.requested,
      held: r.held,
      payable: r.payable,
      status: badgeOrText(r.status, r.statusAccent),
      action: badgeOrText(r.action, r.actionAccent),
    },
  }))

  const riskRows: TableRow[] = risk.rows.map((r) => ({
    id: r.id,
    cells: {
      type: r.type,
      targetId: r.targetId,
      wallet: r.wallet,
      country: r.country,
      relatedTx: r.relatedTx,
      score: badgeOrText(r.score, r.scoreAccent),
      held: r.held,
      action: badgeOrText(r.action, r.actionAccent),
    },
  }))

  const countryOpsRows: TableRow[] = countryOps.rows.map((r) => ({
    id: r.id,
    cells: {
      id: r.id,
      leaders: r.leaders,
      partners: r.partners,
      merchants: r.merchants,
      members: r.members,
      amount: r.amount,
      syncFail: r.syncFail,
      growth: (
        <Badge accent="cyan" size="cell">
          {r.growth}
        </Badge>
      ),
    },
  }))

  const approvalQueueRows: TableRow[] = approvalQueue.rows.map((r) => ({
    id: r.id,
    cells: {
      type: r.type,
      name: r.name,
      country: r.country,
      contact: r.contact,
      wallet: r.wallet,
      time: r.time,
      risk: badgeOrText(r.risk, r.riskAccent),
      status: badgeOrText(r.status, r.statusAccent),
    },
  }))

  const paymentMethodRows: TableRow[] = paymentMethod.rows.map((r) => ({
    id: r.id,
    cells: {
      id: r.id,
      count: r.count,
      successRate: r.successRate,
      failRate: r.failRate,
      avgApprove: r.avgApprove,
      sync: badgeOrText(r.sync, r.syncAccent),
      // 실패 원인은 Figma상 4행 전부 시안색 배지로 항상 강조됨
      failReason: (
        <Badge accent="cyan" size="cell">
          {r.failReason}
        </Badge>
      ),
    },
  }))

  const activityLogRows: TableRow[] = activityLogs.rows.map((r) => ({
    id: r.id,
    cells: {
      admin: r.admin,
      menu: badgeOrText(r.menu, r.menuAccent),
      action: badgeOrText(r.action, r.actionAccent),
      targetId: r.targetId,
      time: r.time,
      ip: r.ip,
      result: r.result,
      riskLevel: (
        <Badge accent={r.riskAccent} size="cell">
          {r.riskLevel}
        </Badge>
      ),
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqDashboard.title')}>
        <div className={styles.filterControls} aria-label={t('hqDashboard.filter.label')}>
          <div className={styles.tabList} role="tablist" aria-label={t('hqDashboard.tabs.label')}>
            {DASHBOARD_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`${styles.tabButton} ${activeTab === tab ? styles.tabButtonActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {t(`hqDashboard.tabs.${tab}`)}
              </button>
            ))}
          </div>
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
            <select className={styles.filterSelect} value={filters.selectedRange} onChange={(event) => setRange(event.target.value as HqDashboardRange)}>
              {filters.rangeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PageHeader>

      {activeTab === 'overview' && (
        <>
          {/* 전체 운영 KPI 그리드 — Figma 실측 5열×4행(마지막 칸 1개는 원래 비어있음) */}
          <div className={styles.kpiGrid}>
            {kpis.map((kpi) => (
              <StatCard key={kpi.id} {...kpi} />
            ))}
          </div>

          {/* 매출 순위 패널 — 날짜 필터 기준으로 API에서 받은 국가/리더/파트너/가맹점 순위를 표시 */}
          <div className={styles.rankingGrid}>
            {rankingPanels.map((panel) => (
              <Panel key={panel.id} title={panel.title}>
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
                  {panel.rows.length === 0 && <li className={styles.rankEmpty}>{t('common.noData')}</li>}
                </ol>
              </Panel>
            ))}
          </div>
        </>
      )}

      {activeTab === 'offline' && (
        <Panel title={t('hqDashboard.offlinePay.title')} subtitle={t('hqDashboard.offlinePay.desc')}>
          <div className={styles.miniStatGrid}>
            {offlinePay.miniStats.map((s) => (
              <MiniStatCard key={s.id} {...s} />
            ))}
          </div>
          {/* 오프라인 결제 진행 단계 — 동작 없는 4단계 표시용 스텝퍼 */}
          <div className={styles.flowStepper}>
            {offlinePay.flowSteps.map((step, i) => (
              <div key={step} className={styles.flowStep}>
                <span className={styles.flowStepLabel}>{step}</span>
                {i < offlinePay.flowSteps.length - 1 && <span className={styles.flowConnector} aria-hidden="true" />}
              </div>
            ))}
          </div>
        </Panel>
      )}

      {activeTab === 'settlement' && (
        <Panel title={t('hqDashboard.settlement.title')} subtitle={t('hqDashboard.settlement.desc')}>
          <div className={styles.miniStatGrid}>
            {settlement.stats.map((s) => (
              <MiniStatCard key={s.id} {...s} />
            ))}
          </div>
          <DataTable columns={settlement.columns} rows={settlementRows} largeText navyZebra bare />
        </Panel>
      )}

      {activeTab === 'risk' && (
        <Panel title={t('hqDashboard.risk.title')} subtitle={t('hqDashboard.risk.desc')}>
          <div className={styles.miniStatGrid}>
            {risk.stats.map((s) => (
              <MiniStatCard key={s.id} {...s} />
            ))}
          </div>
          <DataTable columns={risk.columns} rows={riskRows} largeText navyZebra bare />
        </Panel>
      )}

      {activeTab === 'growth' && (
        <>
          <Panel title={t('hqDashboard.countryOps.title')} subtitle={t('hqDashboard.countryOps.desc')}>
            {/* 표는 남은 폭을 모두 채우고 히트맵은 우측 고정폭 — 좁은 화면(<900px)에선 세로로 쌓임 */}
            <div className={styles.countryOpsLayout}>
              <DataTable columns={countryOps.columns} rows={countryOpsRows} largeText navyZebra bare fluid />
              <div className={styles.heatmapBox}>
                <h4 className={styles.subBoxTitle}>{t('hqDashboard.countryOps.heatmapTitle')}</h4>
                <div className={styles.heatmapGrid}>
                  {countryOps.heatmap.map((c) => (
                    // 테두리는 전부 시안(CSS), 배경만 국가별로 시안/초록/보라/주황 순환(Figma 실측)
                    <span
                      key={c.code}
                      className={styles.heatmapDot}
                      style={{ background: `color-mix(in srgb, var(--color-accent-${c.accent}) 24%, transparent)` }}
                    >
                      {c.code}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Panel>

          <Panel title={t('hqDashboard.approvalQueue.title')} subtitle={t('hqDashboard.approvalQueue.desc')}>
            <div className={styles.miniStatGrid}>
              {approvalQueue.stats.map((s) => (
                <MiniStatCard key={s.id} {...s} />
              ))}
            </div>
            <DataTable columns={approvalQueue.columns} rows={approvalQueueRows} largeText navyZebra bare />
          </Panel>

          {/*
           * 네트워크 성장 — Figma(Group 3701): 제목·설명·미니통계는 박스 밖(페이지 배경 위)에 놓이고
           * 차트+TOP5만 하나의 박스로 감싼다. 다른 섹션(Panel=전체를 박스로)과 구조가 달라 커스텀 마크업.
           */}
          <section className={styles.networkGrowth}>
            <div className={styles.networkGrowthHead}>
              <h2 className={styles.networkGrowthTitle}>{t('hqDashboard.networkGrowth.title')}</h2>
              <p className={styles.networkGrowthDesc}>{t('hqDashboard.networkGrowth.desc')}</p>
            </div>
            <div className={styles.miniStatGrid}>
              {networkGrowth.stats.map((s) => (
                <MiniStatCard key={s.id} {...s} />
              ))}
            </div>
            {/* 차트+TOP5만 감싸는 바깥 박스 */}
            <div className={styles.networkGrowthBox}>
              {/* 차트 박스 : TOP5 박스 = Figma 실측 480:512, 두 박스 높이 226 동일(stretch) */}
              <div className={styles.evenSplit}>
                <div className={styles.chartBox}>
                  <h4 className={styles.subBoxTitle}>{t('hqDashboard.networkGrowth.chartTitle')}</h4>
                  {/* 증가 추이 — 동작 없는 정적 막대그래프. 막대는 박스 하단 정렬, 높이는 Figma 실측 px, 색은 시안/보라/초록 순환 */}
                  <div className={styles.barChart}>
                    {networkGrowth.trendBars.map((b, i) => (
                      <span
                        key={i}
                        className={styles.bar}
                        style={{
                          height: `${b.height}px`,
                          background: `color-mix(in srgb, var(--color-accent-${b.accent}) 82%, transparent)`,
                          borderColor: `color-mix(in srgb, var(--color-accent-${b.accent}) 90%, transparent)`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className={styles.topListBox}>
                  <h4 className={styles.subBoxTitle}>{t('hqDashboard.networkGrowth.topPartnersTitle')}</h4>
                  <ul className={styles.topList}>
                    {networkGrowth.topPartners.map((p) => (
                      <li key={p.id}>
                        {p.name} · {p.amount}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === 'payment' && (
        <Panel title={t('hqDashboard.paymentMethod.title')} subtitle={t('hqDashboard.paymentMethod.desc')}>
          <div className={styles.sideBySide}>
            <DataTable columns={paymentMethod.columns} rows={paymentMethodRows} largeText navyZebra bare fluid />
            <div className={styles.donutBox}>
              {/* 결제수단 비율 — Figma: 단색 시안 링(가운데) + 결제수단별 비율 막대 범례(오른쪽). 제목은 하단. */}
              <div className={styles.donutBody}>
                <div className={styles.donutRing} aria-hidden="true" />
                <ul className={styles.donutLegend}>
                  {paymentMethod.donut.map((seg) => (
                    <li key={seg.id} className={styles.donutLegendItem}>
                      <span>
                        {seg.label} {seg.pct}%
                      </span>
                      {/* 막대 길이는 비율(%)에 비례 — Figma 실측 34%≈84px 기준 약 2.5px/% */}
                      <span
                        className={styles.donutBar}
                        style={{ width: `${seg.pct * 2.5}px`, background: `var(--color-accent-${seg.accent})` }}
                      />
                    </li>
                  ))}
                </ul>
              </div>
              <h4 className={`${styles.subBoxTitle} ${styles.donutTitleBottom}`}>{t('hqDashboard.paymentMethod.donutTitle')}</h4>
            </div>
          </div>
        </Panel>
      )}

      {activeTab === 'logs' && (
        <>
          <Panel title={t('hqDashboard.activityLogs.title')} subtitle={t('hqDashboard.activityLogs.desc')}>
            <DataTable columns={activityLogs.columns} rows={activityLogRows} largeText navyZebra bare />
          </Panel>

          <Panel title={t('hqDashboard.aiInsight.title')} subtitle={t('hqDashboard.aiInsight.desc')}>
            <div className={styles.insightGrid}>
              {aiInsight.map((item) => (
                <div key={item.id} className={styles.insightCard}>
                  <Badge accent={item.severityAccent}>{item.severity}</Badge>
                  <p className={styles.insightMessage}>{item.message}</p>
                  <Button className={styles.insightButton}>{item.action}</Button>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}

      <aside className={styles.floatingActionBar} aria-label={t('hqDashboard.quickActions.title')}>
        <div className={styles.floatingActionText}>
          <strong>{t('hqDashboard.quickActions.title')}</strong>
          <span>{t('hqDashboard.quickActions.desc')}</span>
        </div>
        <div className={styles.floatingActionButtons} role="toolbar" aria-label={t('hqDashboard.quickActions.title')}>
          {quickActions.map((action) => (
            <Button
              key={action.id}
              className={styles.floatingActionButton}
              data-action-id={action.id}
              onClick={() => handleQuickActionClick(action)}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </aside>
    </div>
  )
}
