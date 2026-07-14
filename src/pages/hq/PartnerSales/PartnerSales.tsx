import { useEffect, useState } from 'react'
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
import Partners from '../Partners'
import { usePartnerOverview } from './usePartnerSales'
import { usePartnerMerchants } from './usePartnerMerchants'
import { usePartnerTransactions } from './usePartnerTransactions'
import { usePartnerSettlement } from './usePartnerSettlement'
import { usePartnerMemo } from './usePartnerMemo'
import styles from '../LeaderSales/LeaderSales.module.css'

const MERCHANT_TAB_INDEX = 0
const HISTORY_TAB_INDEX = 1
const SETTLEMENT_TAB_INDEX = 2
const MEMO_TAB_INDEX = 3

export default function PartnerSales() {
  const [searchParams] = useSearchParams()
  const partnerCode = searchParams.get('partnerCode') ?? undefined
  const tabParam = searchParams.get('tab') ?? undefined

  if (!partnerCode) {
    return <Partners detailTab="history" />
  }

  return <PartnerSalesDetail partnerCode={partnerCode} initialTab={tabParam} />
}

function PartnerSalesDetail({ partnerCode, initialTab }: { partnerCode: string; initialTab?: string }) {
  const { t } = useTranslation()
  const { profile, kpiTop, accountInfo, basicInfo } = usePartnerOverview(partnerCode)
  const partnerMerchants = usePartnerMerchants(partnerCode)
  const partnerTransactions = usePartnerTransactions(partnerCode)
  const partnerSettlement = usePartnerSettlement(partnerCode)
  const partnerMemo = usePartnerMemo(partnerCode)
  const [tab, setTab] = useState(initialTab === 'history' ? HISTORY_TAB_INDEX : MERCHANT_TAB_INDEX)
  const [memo, setMemo] = useState('')

  useEffect(() => {
    setMemo(partnerMemo.data.memo)
  }, [partnerMemo.data.memo])

  const merchantRows: TableRow[] = partnerMerchants.rows.map((r) => ({
    id: r.merchantCode,
    cells: {
      no: r.no,
      partnerCode: r.partnerCode,
      merchantCode: r.merchantCode,
      city: r.city,
      merchantName: r.merchantName,
      sector: r.sector,
      monthVolume: r.monthVolume,
      monthTxCount: r.monthTxCount,
      fee: r.fee,
      lastPaidAt: r.lastPaidAt,
      usage: r.usage,
      action: <ActionBadges labels={[t('common.detail')]} />,
    },
  }))

  const transactionRows: TableRow[] = partnerTransactions.rows.map((r) => ({
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

  const heldRows: TableRow[] = partnerSettlement.heldRows.map((r, index) => ({
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

  const settlementHistoryRows: TableRow[] = partnerSettlement.historyRows.map((r, index) => ({
    id: `${r.no}-${index}`,
    cells: {
      no: r.no,
      appliedDate: r.appliedDate,
      period: r.period,
      partnerAmount: r.partnerAmount,
      held: r.held,
      status: r.status === '본사 검토중' ? <Badge accent="purple" size="md" shape="rect">{r.status}</Badge> : r.status,
      paidDate: r.paidDate,
      action: <ActionBadges labels={[t('common.detail')]} />,
    },
  }))

  const tabLabels = [
    t('hqPartnerSales.tab.merchants'),
    t('hqPartnerSales.tab.history'),
    t('hqPartnerSales.tab.settlement'),
    t('hqPartnerSales.tab.memo'),
  ]

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqPartnerSales.title')} />

      <Card className={styles.panel}>
        <h2 className={styles.entityTitle}>{t('hqPartnerSales.entityTitle')}</h2>

        <div className={styles.codePanel}>
          <div className={styles.codePanelLeft}>
            <span className={styles.codePanelLabel}>{profile.topLabel}</span>
            <div className={styles.codeBadges}>
              <span className={styles.parentBadge}>{profile.parentBadge}</span>
              <span className={styles.countryBadge}>{profile.country}</span>
            </div>
          </div>
          <div className={styles.codePanelRight}>
            <span className={styles.codeKeyLabel}>{t('hqPartnerSales.codeLabel')}</span>
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

        {tab === MERCHANT_TAB_INDEX ? (
          <>
            <div className={styles.kpiRow5}>
              {partnerMerchants.kpi.map((s) => (
                <StatCard key={s.id} {...s} dense />
              ))}
            </div>
            <DataTable
              title={t('hqLeaderSales.merchants.tableTitle')}
              columns={partnerMerchants.columns}
              rows={merchantRows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
            />
          </>
        ) : tab === HISTORY_TAB_INDEX ? (
          <>
            <div className={styles.kpiRow5}>
              {partnerTransactions.kpi.map((s) => (
                <StatCard key={s.id} {...s} dense />
              ))}
            </div>
            <DataTable
              title={t('hqPartnerSales.logTitle')}
              columns={partnerTransactions.columns}
              rows={transactionRows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
            />
          </>
        ) : tab === SETTLEMENT_TAB_INDEX ? (
          <>
            <div className={styles.settlementSection}>
              <h3 className={styles.settlementTitle}>{t('hqLeaderSales.settle.sec1')}</h3>
              <InfoGrid items={partnerSettlement.summary} />
            </div>
            <div className={styles.settlementSection}>
              <h3 className={styles.settlementTitle}>{t('hqPartnerSales.settle.sec2')}</h3>
              <p className={styles.settlementDesc}>보류 사유, 거래금액, 보류 수수료와 처리 상태를 확인합니다.</p>
              <DataTable columns={partnerSettlement.heldColumns} rows={heldRows} toolbar={[t('common.search'), t('common.filter'), t('common.excel')]} bare mutedText fluid />
            </div>
            <DataTable
              title={t('settle.hist.tableTitle')}
              columns={partnerSettlement.historyColumns}
              rows={settlementHistoryRows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
            />
          </>
        ) : tab === MEMO_TAB_INDEX ? (
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
        ) : null}

        <div className={styles.actionRow}>
          <button type="button" className={styles.confirmButton}>
            {t('hqLeaderSales.confirmButton')}
          </button>
        </div>
      </Card>
    </div>
  )
}
