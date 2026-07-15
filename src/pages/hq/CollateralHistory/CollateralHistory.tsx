import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatCard from '../../../components/molecules/StatCard'
import FilterTabs from '../../../components/molecules/FilterTabs'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Badge from '../../../components/atoms/Badge'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useCollateralHistory, type CollateralHistoryRow, type CollateralInfoRow, type CollateralSettlementRow } from './useCollateralHistory'
import { useCollateralInfo } from './useCollateralInfo'
import { useCollateralSettlement } from './useCollateralSettlement'
import CollateralDetailOverlay from './CollateralDetailOverlay'
import CollateralInfoOverlay from './CollateralInfoOverlay'
import CollateralSettleOverlay from './CollateralSettleOverlay'
import styles from './CollateralHistory.module.css'

/* 탭 인덱스 — 충전/해제 내역(기본) 0, 담보금 정보 1, 정산 내역 2 */
const HISTORY_TAB_INDEX = 0
const INFO_TAB_INDEX = 1
const SETTLEMENT_TAB_INDEX = 2

/*
 * CollateralHistory (page) — 본사어드민 · 회원 담보금/정산 · 회원 담보금 충전/해제 내역
 * ------------------------------------------------------------------
 * Figma 81:19066(= 화면 2:17224) 기준: 제목/설명 → 국가·날짜 필터칩 →
 * KPI 14장(5열) → 안내 카드 2장(담보금/정산 구조, Wallet↔PAY 이동 흐름) →
 * 화면 구분 버튼 3개 → 충전/해제 내역 표.
 * 구분 버튼(탭): 충전/해제 내역(기본) → 담보금 정보(81:22038) → 정산 내역(81:21528).
 * 상단 KPI/첫 번째 안내 카드는 세 탭 공통. 두 번째 안내 카드는 정산 내역 탭에서만
 * "PAY 수취금 정산 흐름"(초록 테두리)으로 바뀐다(Figma 실측).
 */
export default function CollateralHistory() {
  const { t } = useTranslation()
  const [tab, setTab] = useState(HISTORY_TAB_INDEX)
  const [countryFilter, setCountryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('today')
  const {
    kpis,
    columns,
    rows: rawRows,
    infoRows: rawInfoRows,
    settlementRows: rawSettleRows,
    countryOptions,
    dateOptions,
    isLoading,
    error,
  } = useCollateralHistory(countryFilter, dateFilter)
  const info = useCollateralInfo()
  const settle = useCollateralSettlement()
  // 행 클릭 → 상세 폼 오버레이(내역 탭 81:29506 / 정보 탭 81:29553 / 정산 탭 81:29616). 시안이 단일 샘플이라 어떤 행이든 같은 내용
  const [detailOpen, setDetailOpen] = useState(false)
  const [infoDetailOpen, setInfoDetailOpen] = useState(false)
  const [settleDetailOpen, setSettleDetailOpen] = useState(false)
  const [selectedHistoryRow, setSelectedHistoryRow] = useState<CollateralHistoryRow | null>(null)
  const [selectedInfoRow, setSelectedInfoRow] = useState<CollateralInfoRow | CollateralHistoryRow | null>(null)
  const [selectedSettlementRow, setSelectedSettlementRow] = useState<CollateralSettlementRow | null>(null)

  // Figma 시안은 번호가 전부 "0001"이라 리스트 key는 인덱스로 보강
  const rows: TableRow[] = rawRows.map((r, i) => ({
    id: `${r.no}-${i}`,
    cells: {
      no: r.no,
      processedAt: r.processedAt,
      code: r.code,
      country: r.country,
      memberId: r.memberId,
      memberName: r.memberName,
      type: r.type,
      amount: r.amount,
      beforeAfter: r.beforeAfter,
      status: <StatusBadge status={r.status} />,
      action: (
        <div onClick={(event) => event.stopPropagation()}>
          <ActionBadges
            labels={[t('common.detail'), t('hqCollateral.action.memberInfo')]}
            equalWidth
            size="md"
            shape="rect"
            onLabelClick={(label) => {
              if (label === t('hqCollateral.action.memberInfo')) {
                setSelectedInfoRow(r)
                setInfoDetailOpen(true)
                return
              }
              setSelectedHistoryRow(r)
              setDetailOpen(true)
            }}
          />
        </div>
      ),
    },
  }))

  // "회원 정산 내역" 탭(Figma 81:21528) — 회원 수취금 정산 표. 구조는 내역 표와 동일
  const settleRows: TableRow[] = rawSettleRows.map((r, i) => ({
    id: `${r.ownCode}-${i}`,
    cells: {
      no: r.no,
      settledAt: r.settledAt,
      parentPartner: r.parentPartner,
      ownCode: r.ownCode,
      country: r.country,
      memberId: r.memberId,
      memberName: r.memberName,
      target: r.target,
      amount: r.amount,
      beforeAfter: r.beforeAfter,
      status: <StatusBadge status={r.status} />,
      action: (
        <div onClick={(event) => event.stopPropagation()}>
          <ActionBadges
            labels={[t('common.detail')]}
            equalWidth
            size="md"
            shape="rect"
            onLabelClick={() => {
              setSelectedSettlementRow(r)
              setSettleDetailOpen(true)
            }}
          />
        </div>
      ),
    },
  }))

  // "회원 담보금 정보" 탭(Figma 81:22038) — 회원별 지갑/담보금 잔액 표. 구조는 내역 표와 동일
  const infoRows: TableRow[] = rawInfoRows.map((r, i) => ({
    id: `${r.memberId}-${i}`,
    cells: {
      no: r.no,
      adminCode: r.adminCode,
      country: r.country,
      memberId: r.memberId,
      memberName: r.memberName,
      totalWallet: r.totalWallet,
      availableWallet: r.availableWallet,
      collateralBalance: r.collateralBalance,
      lastTopup: r.lastTopup,
      lastPayment: r.lastPayment,
      action: (
        <div onClick={(event) => event.stopPropagation()}>
          <ActionBadges
            labels={[t('common.detail'), t('hqCollateral.action.memberInfo')]}
            equalWidth
            size="md"
            shape="rect"
            onLabelClick={() => {
              setSelectedInfoRow(r)
              setInfoDetailOpen(true)
            }}
          />
        </div>
      ),
    },
  }))

  const openHistoryDetail = (id: string) => {
    const rowIndex = rows.findIndex((row) => row.id === id)
    const row = rowIndex >= 0 ? rawRows[rowIndex] : null
    setSelectedHistoryRow(row)
    setDetailOpen(Boolean(row))
  }

  const openInfoDetail = (id: string) => {
    const rowIndex = infoRows.findIndex((row) => row.id === id)
    const row = rowIndex >= 0 ? rawInfoRows[rowIndex] : null
    setSelectedInfoRow(row)
    setInfoDetailOpen(Boolean(row))
  }

  const openSettlementDetail = (id: string) => {
    const rowIndex = settleRows.findIndex((row) => row.id === id)
    const row = rowIndex >= 0 ? rawSettleRows[rowIndex] : null
    setSelectedSettlementRow(row)
    setSettleDetailOpen(Boolean(row))
  }

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqCollateral.title')}>
        <p className={styles.pageDesc}>{t('hqCollateral.desc')}</p>
        <div className={styles.filterChips}>
          <label className={styles.filterLabel}>
            <span className={styles.filterLabelText}>{t('hqCollateral.filter.country')}</span>
            <select className={styles.filterSelect} value={countryFilter} onChange={(event) => setCountryFilter(event.target.value)}>
              <option value="all">{t('hqDashboard.filter.allCountries')}</option>
              {countryOptions.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filterLabel}>
            <span className={styles.filterLabelText}>{t('hqCollateral.filter.date')}</span>
            <select className={styles.filterSelect} value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
              <option value="all">{t('hqCollateral.filter.allDates')}</option>
              <option value="today">{t('hqDashboard.filter.today')}</option>
              {dateOptions.map((date) => (
                <option key={date} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PageHeader>

      {/* 담보금/정산 KPI 그리드 — Figma 실측 5열×3행(마지막 행은 4장) */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <StatCard key={kpi.id} {...kpi} />
        ))}
      </div>
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* 담보금 / 정산 구조 안내 카드 (호박색 테두리) */}
      <section className={styles.guideCard}>
        <h2 className={styles.guideTitle}>{t('hqCollateral.guide.title')}</h2>
        <p className={styles.cardDesc}>{t('hqCollateral.guide.desc')}</p>
        <div className={styles.pillRow}>
          <span className={`${styles.pill} ${styles.pillCyan}`}>{t('hqCollateral.guide.badge.pay')}</span>
          <span className={`${styles.pill} ${styles.pillGreen}`}>{t('hqCollateral.guide.badge.settle')}</span>
        </div>
      </section>

      {/* 두 번째 안내 카드 — 정산 내역 탭에서만 "PAY 수취금 정산 흐름"(초록 테두리)으로 교체(Figma 81:21528) */}
      {tab === SETTLEMENT_TAB_INDEX ? (
        <section className={`${styles.flowCard} ${styles.flowCardSettle}`}>
          <h2 className={styles.flowTitle}>{t('hqCollateral.settle.flow.title')}</h2>
          <div className={styles.pillRow}>
            <span className={`${styles.pill} ${styles.pillViolet}`}>{t('hqCollateral.settle.flow.badge.receive')}</span>
            <span className={`${styles.pill} ${styles.pillCyan}`}>{t('hqCollateral.settle.flow.badge.accumulate')}</span>
            <span className={`${styles.pill} ${styles.pillBlue}`}>{t('hqCollateral.settle.flow.badge.process')}</span>
            <span className={`${styles.pill} ${styles.pillGreen}`}>{t('hqCollateral.settle.flow.badge.send')}</span>
          </div>
          <p className={styles.cardDesc}>{t('hqCollateral.settle.flow.desc')}</p>
        </section>
      ) : (
        /* Wallet ↔ PAY 담보금 이동 흐름 카드 (시안색 테두리) */
        <section className={styles.flowCard}>
          <h2 className={styles.flowTitle}>{t('hqCollateral.flow.title')}</h2>
          <div className={styles.pillRow}>
            <span className={`${styles.pill} ${styles.pillViolet}`}>{t('hqCollateral.flow.badge.wallet')}</span>
            <span className={`${styles.pill} ${styles.pillCyan}`}>{t('hqCollateral.flow.badge.topup')}</span>
            <span className={`${styles.pill} ${styles.pillGreen}`}>{t('hqCollateral.flow.badge.collateral')}</span>
            <span className={`${styles.pill} ${styles.pillCyan}`}>{t('hqCollateral.flow.badge.release')}</span>
          </div>
          <p className={styles.cardDesc}>{t('hqCollateral.flow.desc')}</p>
        </section>
      )}

      {/* 화면 구분 탭 3개 — 하단 표(+정산 탭은 흐름 카드까지) 전환 */}
      <FilterTabs
        labels={[t('hqCollateral.tab.history'), t('hqCollateral.tab.info'), t('hqCollateral.tab.settlement')]}
        activeIndex={tab}
        onChange={setTab}
        variant="outline"
      />

      {tab === HISTORY_TAB_INDEX ? (
        /* wrapCells: "처리일시"·"코드"가 Figma처럼 두 줄로 꺾이게(말줄임 방지) */
        <DataTable
          title={t('hqCollateral.table.title')}
          toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
          columns={columns}
          rows={rows}
          mutedText
          headerBar
          wrapCells
          paginated
          pageSize={5}
          searchKeys={['processedAt', 'code', 'country', 'memberId', 'memberName', 'type', 'amount', 'status']}
          filterKeys={['country', 'type', 'status']}
          onRowClick={openHistoryDetail}
        />
      ) : tab === INFO_TAB_INDEX ? (
        <DataTable
          title={t('hqCollateral.tab.info')}
          toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
          columns={info.columns}
          rows={infoRows}
          mutedText
          headerBar
          wrapCells
          paginated
          pageSize={5}
          searchKeys={['adminCode', 'country', 'memberId', 'memberName', 'totalWallet', 'availableWallet', 'collateralBalance']}
          filterKeys={['country']}
          onRowClick={openInfoDetail}
        />
      ) : (
        <DataTable
          title={t('hqCollateral.tab.settlement')}
          toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
          columns={settle.columns}
          rows={settleRows}
          mutedText
          headerBar
          wrapCells
          paginated
          pageSize={5}
          searchKeys={['settledAt', 'parentPartner', 'ownCode', 'country', 'memberId', 'memberName', 'target', 'status']}
          filterKeys={['country', 'target', 'status']}
          onRowClick={openSettlementDetail}
        />
      )}

      <CollateralDetailOverlay open={detailOpen} row={selectedHistoryRow} onClose={() => setDetailOpen(false)} />
      <CollateralInfoOverlay open={infoDetailOpen} row={selectedInfoRow} onClose={() => setInfoDetailOpen(false)} />
      <CollateralSettleOverlay open={settleDetailOpen} row={selectedSettlementRow} onClose={() => setSettleDetailOpen(false)} />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.trim()
  const accent = normalized === '실패' ? 'red' : normalized === '보류' || normalized === '대기' ? 'orange' : 'green'
  return (
    <Badge accent={accent} size="md" shape="rect">
      {status}
    </Badge>
  )
}
