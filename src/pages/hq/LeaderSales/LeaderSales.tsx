import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../../components/organisms/PageHeader'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Card from '../../../components/atoms/Card'
import StatCard from '../../../components/molecules/StatCard'
import InfoGrid from '../../../components/molecules/InfoGrid'
import FilterTabs from '../../../components/molecules/FilterTabs'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import { useLeaderSales } from './useLeaderSales'
import { useLeaderPartners } from './useLeaderPartners'
import { useLeaderMerchants } from './useLeaderMerchants'
import { useLeaderTransactions } from './useLeaderTransactions'
import { useLeaderSettlement } from './useLeaderSettlement'
import Leaders from '../Leaders'
import styles from './LeaderSales.module.css'

/* 탭 인덱스 — row 진입 상세는 거래내역을 기본으로 연다. */
const PARTNER_TAB_INDEX = 0
const MERCHANT_TAB_INDEX = 1
const HISTORY_TAB_INDEX = 2
const SETTLEMENT_TAB_INDEX = 3
const MEMO_TAB_INDEX = 4

/*
 * LeaderSales (page) — 본사어드민 · 국가 리더 관리 · 국가 리더별 거래내역
 * ------------------------------------------------------------------
 * Figma 좌표를 끝까지 따라가 보니 전체가 하나의 패널(Card) 안에 다음 순서로
 * 들어있었다: 큰 제목 "리더 정보" → 코드 미리보기 → KPI 4개 → A.계정정보 →
 * B.기본/소속정보 → 탭 5개 → 탭별 KPI/표/메모 영역 → 하단 확인 버튼.
 */
export default function LeaderSales() {
  const [searchParams] = useSearchParams()
  const leaderCode = searchParams.get('leaderCode') ?? undefined

  if (!leaderCode) {
    return <Leaders />
  }

  return <LeaderSalesDetail leaderCode={leaderCode} />
}

function LeaderSalesDetail({ leaderCode }: { leaderCode: string }) {
  const { t } = useTranslation()
  const { profile, kpiTop, accountInfo, basicInfo } = useLeaderSales(leaderCode)
  const leaderPartners = useLeaderPartners(leaderCode)
  const leaderMerchants = useLeaderMerchants(leaderCode)
  const leaderTransactions = useLeaderTransactions(leaderCode)
  const leaderSettlement = useLeaderSettlement(leaderCode)
  const [tab, setTab] = useState(HISTORY_TAB_INDEX)
  const [memo, setMemo] = useState('')

  const rows: TableRow[] = leaderTransactions.rows.map((r) => ({
    id: r.txNo,
    cells: {
      txNo: r.txNo,
      partnerCode: r.partnerCode,
      txAt: r.txAt,
      merchantCode: r.merchantCode,
      merchantName: r.merchantName,
      amount: r.amount,
      method: r.method,
      fee: r.fee,
      net: r.net,
      status: r.status,
      syncStatus: r.syncStatus,
      action: <ActionBadges labels={r.actions} />,
    },
  }))

  const partnerRows: TableRow[] = leaderPartners.rows.map((r) => ({
    id: r.code,
    cells: {
      no: r.no,
      code: r.code,
      partnerName: r.partnerName,
      telegramId: r.telegramId,
      region: r.region,
      subMerchantCount: r.subMerchantCount,
      monthVolume: r.monthVolume,
      monthTxCount: r.monthTxCount,
      unsettledFee: r.unsettledFee,
      lastActive: r.lastActive,
      action: <ActionBadges labels={[t('common.detail')]} />,
    },
  }))

  const merchantRows: TableRow[] = leaderMerchants.rows.map((r) => ({
    id: r.merchantCode,
    cells: {
      no: r.no,
      partnerCode: r.partnerCode,
      merchantCode: r.merchantCode,
      merchantName: r.merchantName,
      monthVolume: r.monthVolume,
      monthTxCount: r.monthTxCount,
      fee: r.fee,
      lastPaidAt: r.lastPaidAt,
      usage: r.usage,
      action: <ActionBadges labels={[t('common.detail')]} />,
    },
  }))

  const settlementPartnerRows: TableRow[] = leaderSettlement.partnerRows.map((r, index) => ({
    id: `${r.code}-${index}`,
    cells: {
      name: r.name,
      code: r.code,
      amount: r.amount,
      fee: r.fee,
      status: <Badge accent="green" size="md" shape="rect">{r.status}</Badge>,
      paidDate: r.paidDate,
      detail: <ActionBadges labels={[t('common.detail')]} />,
    },
  }))

  const settlementMerchantRows: TableRow[] = leaderSettlement.merchantRows.map((r, index) => ({
    id: `${r.code}-${index}`,
    cells: {
      name: r.name,
      code: r.code,
      amount: r.amount,
      fee: r.fee,
      status: <Badge accent="green" size="md" shape="rect">{r.status}</Badge>,
      detail: <ActionBadges labels={[t('common.detail')]} />,
    },
  }))

  const heldRows: TableRow[] = leaderSettlement.heldRows.map((r, index) => ({
    id: `${r.txNo}-${index}`,
    cells: {
      txNo: r.txNo,
      merchant: r.merchant,
      partner: r.partner,
      reason: r.reason,
      amount: r.amount,
      heldFee: r.heldFee,
      status: <Badge accent="orange" size="md" shape="rect">{r.status}</Badge>,
    },
  }))

  const settlementHistoryRows: TableRow[] = leaderSettlement.historyRows.map((r, index) => ({
    id: `${r.no}-${index}`,
    cells: {
      no: r.no,
      appliedDate: r.appliedDate,
      period: r.period,
      totalAmount: r.totalAmount,
      partnerAmount: r.partnerAmount,
      held: r.held,
      status: r.status === '본사 검토중' ? <Badge accent="purple" size="md" shape="rect">{r.status}</Badge> : r.status,
      paidDate: r.paidDate,
      action: <ActionBadges labels={[t('common.detail')]} />,
    },
  }))

  const tabLabels = [
    t('hqLeaderSales.tab.partners'),
    t('hqLeaderSales.tab.merchants'),
    t('hqLeaderSales.tab.history'),
    t('hqLeaderSales.tab.settlement'),
    t('hqLeaderSales.tab.memo'),
  ]

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqLeaderSales.title')} />

      <Card className={styles.panel}>
        <h2 className={styles.entityTitle}>{t('hqLeaderSales.entityTitle')}</h2>

        {/* 코드 미리보기 — 좌: 캡션+배지 / 우: 코드 라벨+큰 값(우측 정렬) */}
        <div className={styles.codePanel}>
          <div className={styles.codePanelLeft}>
            <span className={styles.codePanelLabel}>{profile.topLabel}</span>
            <div className={styles.codeBadges}>
              <span className={styles.parentBadge}>{profile.parentBadge}</span>
              <span className={styles.countryBadge}>{profile.country}</span>
            </div>
          </div>
          <div className={styles.codePanelRight}>
            <span className={styles.codeKeyLabel}>{t('hqLeaderSales.codeLabel')}</span>
            <span className={styles.codeValue}>{profile.code}</span>
          </div>
        </div>

        <div className={styles.kpiRow4}>
          {kpiTop.map((s) => (
            <StatCard key={s.id} {...s} dense />
          ))}
        </div>

        <div className={styles.sectionBox}>
          <h3 className={styles.sectionTitle}>{t('hqLeaderSales.section.account')}</h3>
          <InfoGrid items={accountInfo} />
        </div>

        <div className={styles.sectionBox}>
          <h3 className={styles.sectionTitle}>{t('hqLeaderSales.section.basic')}</h3>
          <InfoGrid items={basicInfo} />
        </div>

        <div className={styles.tabBar}>
          <FilterTabs labels={tabLabels} activeIndex={tab} onChange={setTab} variant="outline" />
          <button type="button" className={styles.rangeButton}>
            {t('hqLeaderSales.range1d')}
          </button>
        </div>

        {tab === PARTNER_TAB_INDEX ? (
          <>
            <div className={styles.kpiRow5}>
              {leaderPartners.kpi.map((s) => (
                <StatCard key={s.id} {...s} dense />
              ))}
            </div>
            <DataTable
              title={t('hqLeaderSales.partners.tableTitle')}
              columns={leaderPartners.columns}
              rows={partnerRows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
            />
          </>
        ) : tab === MERCHANT_TAB_INDEX ? (
          <>
            <div className={styles.kpiRow5}>
              {leaderMerchants.kpi.map((s) => (
                <StatCard key={s.id} {...s} dense />
              ))}
            </div>
            <DataTable
              title={t('hqLeaderSales.merchants.tableTitle')}
              columns={leaderMerchants.columns}
              rows={merchantRows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
            />
          </>
        ) : tab === HISTORY_TAB_INDEX ? (
          <>
            <div className={styles.kpiRow5}>
              {leaderTransactions.kpi.map((s) => (
                <StatCard key={s.id} {...s} dense />
              ))}
            </div>
            <DataTable
              title={t('hqLeaderSales.logTitle')}
              columns={leaderTransactions.columns}
              rows={rows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
            />
          </>
        ) : tab === SETTLEMENT_TAB_INDEX ? (
          <>
            <div className={styles.settlementSection}>
              <h3 className={styles.settlementTitle}>{t('hqLeaderSales.settle.sec1')}</h3>
              <InfoGrid items={leaderSettlement.summary} />
            </div>
            <div className={styles.settlementSection}>
              <h3 className={styles.settlementTitle}>{t('hqLeaderSales.settle.sec2')}</h3>
              <p className={styles.settlementDesc}>파트너명, 코드, 거래금액, 파트너 수수료, 상태 등을 확인합니다.</p>
              <DataTable columns={leaderSettlement.partnerColumns} rows={settlementPartnerRows} toolbar={[t('common.search'), t('common.filter'), t('common.excel')]} bare mutedText fluid />
            </div>
            <div className={styles.settlementSection}>
              <h3 className={styles.settlementTitle}>{t('hqLeaderSales.settle.sec3')}</h3>
              <p className={styles.settlementDesc}>직계약 가맹점의 코드와 수수료 정산 내역입니다.</p>
              <DataTable columns={leaderSettlement.merchantColumns} rows={settlementMerchantRows} toolbar={[t('common.search'), t('common.filter'), t('common.excel')]} bare mutedText fluid />
            </div>
            <div className={styles.settlementSection}>
              <h3 className={styles.settlementTitle}>{t('hqLeaderSales.settle.sec4')}</h3>
              <p className={styles.settlementDesc}>보류 사유, 거래금액, 보류 수수료와 처리 상태를 확인합니다.</p>
              <DataTable columns={leaderSettlement.heldColumns} rows={heldRows} toolbar={[t('common.search'), t('common.filter'), t('common.excel')]} bare mutedText fluid />
            </div>
            <DataTable
              title={t('settle.hist.tableTitle')}
              columns={leaderSettlement.historyColumns}
              rows={settlementHistoryRows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
            />
          </>
        ) : tab === MEMO_TAB_INDEX ? (
          <>
            <div className={styles.memoPanel}>
              <h3 className={styles.memoTitle}>{t('hqLeaderSales.memo.title')}</h3>
              <p className={styles.memoDesc}>{t('hqLeaderSales.memo.desc')}</p>
              <textarea
                className={styles.memoTextarea}
                value={memo}
                maxLength={200}
                onChange={(event) => setMemo(event.target.value)}
                aria-label={t('hqLeaderSales.memo.title')}
              />
              <div className={styles.memoFooter}>
                <button type="button" className={styles.memoSaveButton}>
                  {t('common.save')}
                </button>
                <span className={styles.memoCount}>{memo.length} / 200</span>
              </div>
            </div>
          </>
        ) : (
          <p className={styles.tabPlaceholder}>{t('common.comingSoon')}</p>
        )}

        {/* Figma 레이어명은 "본사 정산 요청 보내기"지만, 버튼 안 실제 텍스트는 "확인"뿐이라 그대로 표기 */}
        <div className={styles.actionRow}>
          <button type="button" className={styles.confirmButton}>
            {t('hqLeaderSales.confirmButton')}
          </button>
        </div>
      </Card>
    </div>
  )
}
