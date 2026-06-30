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
import styles from './Dashboard.module.css'

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
  const {
    kpis,
    rankingPanels,
    realtimePayments,
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
  } = useDashboard()

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

  const realtimePaymentRows: TableRow[] = realtimePayments.rows.map((r) => ({
    id: r.id,
    cells: {
      id: r.id,
      country: r.country,
      merchant: r.merchant,
      method: r.method,
      connection: r.connection,
      amount: r.amount,
      status: badgeOrText(r.status, r.statusAccent),
      sync: badgeOrText(r.sync, r.syncAccent),
      verify: r.verify,
      detail: (
        <Badge accent="cyan" size="cell">
          {t('common.detail')}
        </Badge>
      ),
    },
  }))

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
        {/* Figma의 국가/날짜 필터칩 — 동작 없는 UI 표시만 (CLAUDE.md 1번 규칙: 인터랙션은 협의 전까지 보류) */}
        <div className={styles.filterChips}>
          <span className={styles.chip}>{t('hqDashboard.filter.allCountries')}</span>
          <span className={styles.chip}>{t('hqDashboard.filter.today')}</span>
        </div>
      </PageHeader>

      {/* 전체 운영 KPI 그리드 — Figma 실측 5열×4행(마지막 칸 1개는 원래 비어있음) */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <StatCard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* 대시보드 요약 패널 — Figma상 제목만 있고 내용 미정의. 빈 채로 두고 자리만 확보(Panel 컨벤션과 동일) */}
      <div className={styles.rankingGrid}>
        {rankingPanels.map((panel) => (
          <Panel key={panel.id} title={panel.title} />
        ))}
      </div>

      {/* bare: Panel 자체가 카드 박스이므로 DataTable의 중복 박스 제거 */}
      <Panel title={t('hqDashboard.realtimePayments.title')} subtitle={t('hqDashboard.realtimePayments.desc')}>
        <DataTable columns={realtimePayments.columns} rows={realtimePaymentRows} largeText navyZebra bare />
      </Panel>

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

      <Panel title={t('hqDashboard.settlement.title')} subtitle={t('hqDashboard.settlement.desc')}>
        <div className={styles.miniStatGrid}>
          {settlement.stats.map((s) => (
            <MiniStatCard key={s.id} {...s} />
          ))}
        </div>
        <DataTable columns={settlement.columns} rows={settlementRows} largeText navyZebra bare />
      </Panel>

      <Panel title={t('hqDashboard.risk.title')} subtitle={t('hqDashboard.risk.desc')}>
        <div className={styles.miniStatGrid}>
          {risk.stats.map((s) => (
            <MiniStatCard key={s.id} {...s} />
          ))}
        </div>
        <DataTable columns={risk.columns} rows={riskRows} largeText navyZebra bare />
      </Panel>

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

      <Panel title={t('hqDashboard.networkGrowth.title')} subtitle={t('hqDashboard.networkGrowth.desc')}>
        <div className={styles.miniStatGrid}>
          {networkGrowth.stats.map((s) => (
            <MiniStatCard key={s.id} {...s} />
          ))}
        </div>
        {/* 차트 박스와 TOP5 박스를 좌우 1:1로 (Figma 실측 480:512 ≈ 1:1) */}
        <div className={styles.evenSplit}>
          <div className={styles.chartBox}>
            <h4 className={styles.subBoxTitle}>{t('hqDashboard.networkGrowth.chartTitle')}</h4>
            {/* 증가 추이 — 동작 없는 정적 막대그래프(Figma 실측: 막대 높이 + 시안/보라/초록 순환색) */}
            <div className={styles.barChart}>
              {networkGrowth.trendBars.map((b, i) => (
                <span
                  key={i}
                  className={styles.bar}
                  style={{
                    height: `${b.height}px`,
                    background: `color-mix(in srgb, var(--color-accent-${b.accent}) 82%, transparent)`,
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
      </Panel>

      <Panel title={t('hqDashboard.paymentMethod.title')} subtitle={t('hqDashboard.paymentMethod.desc')}>
        <div className={styles.sideBySide}>
          <DataTable columns={paymentMethod.columns} rows={paymentMethodRows} largeText navyZebra bare fluid />
          <div className={styles.donutBox}>
            {/* 결제수단 비율 — Figma: 시안 링 + 결제수단별 비율 막대 범례. 제목은 하단. */}
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

      <Panel title={t('hqDashboard.quickActions.title')} subtitle={t('hqDashboard.quickActions.desc')}>
        <div className={styles.quickActionGrid}>
          {quickActions.map((label) => (
            <Button key={label} className={styles.quickActionButton}>
              {label}
            </Button>
          ))}
        </div>
      </Panel>
    </div>
  )
}
