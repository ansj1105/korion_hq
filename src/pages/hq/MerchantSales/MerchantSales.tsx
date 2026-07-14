import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageHeader from '../../../components/organisms/PageHeader'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Card from '../../../components/atoms/Card'
import StatCard from '../../../components/molecules/StatCard'
import InfoGrid from '../../../components/molecules/InfoGrid'
import FilterTabs from '../../../components/molecules/FilterTabs'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import { useHqPageData } from '../../../hooks/useHqPageData'
import Merchants from '../Merchants'
import { useMerchantSales, type MerchantSalesLogRow } from './useMerchantSales'
import { useMerchantSettlement } from './useMerchantSettlement'
import TransactionDetailModal from './TransactionDetailModal'
import styles from './MerchantSales.module.css'

const HISTORY_TAB_INDEX = 0
const SETTLEMENT_TAB_INDEX = 1
const MEMO_TAB_INDEX = 2
const REQUEST_TAB_INDEX = 3

/* 매장 이미지/로고 업로드 슬롯 개수(Figma: 사진 버튼 3개) */
const PHOTO_SLOTS = [0, 1, 2]

/*
 * MerchantSales (page) — 본사어드민 · 가맹점 관리 · 가맹점 거래내역
 * ------------------------------------------------------------------
 * Figma 156:312를 끝까지 추적하니 LeaderSales와 같은 상세 뷰 구조였다:
 *   가맹점 정보(제목) → 코드 미리보기 → KPI 4개 → A.계정정보 → B.기본/소속정보 →
 *   C.매장 기본정보 → 탭 4개(기본 선택: 거래내역) → [거래내역 탭 전용] KPI 4개 +
 *   전체 거래 로그 표 → 하단 확인 버튼. 거래내역 외 3개 탭은 전환 UI만 두고
 *   내용은 "구현 예정"으로 둔다(LeaderSales와 동일 결정).
 */
export default function MerchantSales() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const merchantCode = searchParams.get('merchantCode') ?? undefined
  const { profile, kpiTop, accountInfo, basicInfo, storeInfo, kpiBottom, logColumns, logRows } = useMerchantSales(merchantCode)
  const merchantSettlement = useMerchantSettlement(merchantCode)
  const merchantMemo = useHqPageData<{ memo: string }>(
    merchantCode ? `/api/hq/merchants/${encodeURIComponent(merchantCode)}/sales/memo` : null,
    { memo: '' },
  )
  const [tab, setTab] = useState(HISTORY_TAB_INDEX)
  const [memo, setMemo] = useState('')
  const [selectedTx, setSelectedTx] = useState<MerchantSalesLogRow | null>(null)

  useEffect(() => {
    setMemo(merchantMemo.data.memo)
  }, [merchantMemo.data.memo])

  if (!merchantCode) {
    return <Merchants />
  }

  const rows: TableRow[] = logRows.map((r) => ({
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
      action: <ActionBadges labels={r.actions} size="xs" />,
    },
  }))

  const heldRows: TableRow[] = merchantSettlement.heldRows.map((r, index) => ({
    id: `${r.txNo}-${index}`,
    cells: {
      txNo: r.txNo,
      merchant: r.merchant,
      partner: r.partner,
      reason: r.reason,
      amount: r.amount,
      heldFee: r.heldFee,
      status: <span className={styles.statusHold}>{r.status}</span>,
    },
  }))

  const settlementHistoryRows: TableRow[] = merchantSettlement.historyRows.map((r, index) => ({
    id: `${r.no}-${index}`,
    cells: {
      no: r.no,
      appliedDate: r.appliedDate,
      period: r.period,
      partnerAmount: r.partnerAmount,
      held: r.held,
      status: r.status === '본사 검토중' ? <span className={styles.statusReview}>{r.status}</span> : r.status,
      paidDate: r.paidDate,
      action: <ActionBadges labels={[t('common.detail')]} size="xs" />,
    },
  }))

  const tabLabels = [
    t('hqMerchantSales.tab.history'),
    t('hqMerchantSales.tab.settlement'),
    t('hqMerchantSales.tab.memo'),
    t('hqMerchantSales.tab.request'),
  ]

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqMerchantSales.title')} />

      <Card className={styles.panel}>
        <h2 className={styles.entityTitle}>{t('hqMerchantSales.entityTitle')}</h2>

        {/* 코드 미리보기 — 좌: 캡션+배지(상위 리더 코드/국가) / 우: 코드 라벨+큰 값(우측 정렬) */}
        <div className={styles.codePanel}>
          <div className={styles.codePanelLeft}>
            <span className={styles.codePanelLabel}>{profile.topLabel}</span>
            <div className={styles.codeBadges}>
              <span className={styles.parentBadge}>{profile.parentBadge}</span>
              <span className={styles.countryBadge}>{profile.country}</span>
            </div>
          </div>
          <div className={styles.codePanelRight}>
            <span className={styles.codeKeyLabel}>{t('hqMerchantSales.codeLabel')}</span>
            <span className={styles.codeValue}>{profile.code}</span>
          </div>
        </div>

        <div className={styles.kpiRow4}>
          {kpiTop.map((s) => (
            <StatCard key={s.id} {...s} dense />
          ))}
        </div>

        <div className={styles.sectionBox}>
          <h3 className={styles.sectionTitle}>{t('hqMerchantSales.section.account')}</h3>
          <InfoGrid items={accountInfo} />
        </div>

        <div className={styles.sectionBox}>
          <h3 className={styles.sectionTitle}>{t('hqMerchantSales.section.basic')}</h3>
          <InfoGrid items={basicInfo} />
        </div>

        <div className={styles.sectionBox}>
          <h3 className={styles.sectionTitle}>{t('hqMerchantSales.section.store')}</h3>
          <InfoGrid items={storeInfo} />
          {/* 매장 이미지 / 로고 — 사진 업로드 슬롯 3개(UI 상태만) */}
          <div className={styles.photoField}>
            <span className={styles.photoLabel}>{t('hqMerchantSales.store.image')}</span>
            <div className={styles.photoRow}>
              {PHOTO_SLOTS.map((i) => (
                <button key={i} type="button" className={styles.photoBtn}>
                  {t('hqMerchantSales.store.photo')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.tabBar}>
          <FilterTabs labels={tabLabels} activeIndex={tab} onChange={setTab} variant="outline" />
        </div>

        {tab === HISTORY_TAB_INDEX ? (
          <>
            <div className={styles.kpiRowPay}>
              {kpiBottom.map((s) => (
                <StatCard key={s.id} {...s} dense />
              ))}
            </div>
            <DataTable
              title={t('hqMerchantSales.logTitle')}
              columns={logColumns}
              rows={rows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
              onRowClick={(id) => setSelectedTx(logRows.find((row) => row.txNo === id) ?? null)}
            />
          </>
        ) : tab === SETTLEMENT_TAB_INDEX ? (
          <>
            <div className={styles.settlementSection}>
              <h3 className={styles.settlementTitle}>{t('hqLeaderSales.settle.sec1')}</h3>
              <InfoGrid items={merchantSettlement.summary} />
            </div>
            <div className={styles.settlementSection}>
              <h3 className={styles.settlementTitle}>{t('settle.detail.e.title')}</h3>
              <p className={styles.settlementDesc}>{t('settle.detail.e.desc')}</p>
              <DataTable columns={merchantSettlement.heldColumns} rows={heldRows} toolbar={[t('common.search'), t('common.filter'), t('common.excel')]} bare mutedText fluid />
            </div>
            <DataTable
              title={t('settle.hist.tableTitle')}
              columns={merchantSettlement.historyColumns}
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
        ) : tab === REQUEST_TAB_INDEX ? (
          <p className={styles.tabPlaceholder}>{t('common.comingSoon')}</p>
        ) : (
          null
        )}

        {/* Figma 레이어명은 "본사 정산 요청 보내기"지만, 버튼 안 실제 텍스트는 "확인"뿐이라 그대로 표기 */}
        <div className={styles.actionRow}>
          <button type="button" className={styles.confirmButton}>
            {t('hqMerchantSales.confirmButton')}
          </button>
        </div>
      </Card>
      {selectedTx && <TransactionDetailModal transaction={selectedTx} onClose={() => setSelectedTx(null)} />}
    </div>
  )
}
