import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Card from '../../../components/atoms/Card'
import StatCard from '../../../components/molecules/StatCard'
import InfoGrid from '../../../components/molecules/InfoGrid'
import FilterTabs from '../../../components/molecules/FilterTabs'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import { usePartnerSales } from './usePartnerSales'
import { usePartnerDetail } from './usePartnerDetail'
import { usePartnerSettlement } from './usePartnerSettlement'
import styles from './PartnerSales.module.css'

/* 탭 인덱스 — Figma 기본 선택 탭은 "가맹점별"(인덱스 0) */
const MERCHANTS_TAB_INDEX = 0
const HISTORY_TAB_INDEX = 1
const SETTLEMENT_TAB_INDEX = 2

/* "관리자 메모" 탭 글자수 카운터 — Figma 샘플 표기(실데이터 연동 시 입력 길이로 교체) */
const MEMO_COUNTER_SAMPLE = '50 / 200'

/*
 * PartnerSales (page) — 본사어드민 · 파트너 관리 · 파트너별 거래내역
 * ------------------------------------------------------------------
 * Figma 81:24063(가맹점별)·81:26017(거래내역)·81:25829(정산내역) 기준으로 리더의
 * "리더 정보"와 같은 "파트너 정보" 상세 패널 구조: 제목 → 코드 미리보기 → KPI 4개 →
 * A.계정정보 → B.기본/소속정보 → 탭 4개(기본 선택: 가맹점별) + 1D → 탭별 콘텐츠 →
 * 하단 확인 버튼. 탭 4개 모두 시안 확인 후 구현 완료.
 */
export default function PartnerSales() {
  const { t } = useTranslation()
  const { logColumns, logRows } = usePartnerSales()
  const { profile, kpiTop, accountInfo, basicInfo, tabKpi, merchantColumns, merchantRows: rawMerchantRows } = usePartnerDetail()
  const settle = usePartnerSettlement()
  const [tab, setTab] = useState(MERCHANTS_TAB_INDEX)

  /*
   * "정산내역" 탭(Figma 81:25829) 상태 강조색 — 보류/검토중=주황(Figma 실측값 #ff8a3d).
   * 상태 문자열은 데이터(enum)라 번역하지 않고, 색만 표시 계층에서 입힌다(리더 화면과 동일 규칙).
   */
  const SETTLE_STATUS_COLOR: Record<string, string> = {
    '정산 보류': '#ff8a3d',
    '본사 검토중': '#ff8a3d',
  }
  const coloredStatus = (status: string) => (
    <span style={{ color: SETTLE_STATUS_COLOR[status] }}>{status}</span>
  )

  const settleHeldRows: TableRow[] = settle.heldRows.map((r) => ({
    id: r.txNo,
    cells: { ...r, status: coloredStatus(r.status) },
  }))
  const settleHistoryRows: TableRow[] = settle.historyRows.map((r, i) => ({
    id: `${r.period}-${i}`,
    cells: {
      ...r,
      status: coloredStatus(r.status),
      action: <ActionBadges labels={[t('common.detail')]} size="xs" />,
    },
  }))

  const merchantRows: TableRow[] = rawMerchantRows.map((r) => ({
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
      action: <ActionBadges labels={[t('common.detail')]} size="xs" />,
    },
  }))

  const logTableRows: TableRow[] = logRows.map((r) => ({
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

        {/* 코드 미리보기 — 좌: 캡션+상위 리더/국가 배지 / 우: 파트너 코드 라벨+큰 값(우측 정렬) */}
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

        {/* 탭 줄 — 좌측 탭 4개 + 우측 "1 D" 기간 버튼(Figma 시안, 동작은 추후 협의라 UI만) */}
        <div className={styles.tabsRow}>
          <FilterTabs labels={tabLabels} activeIndex={tab} onChange={setTab} variant="outline" />
          <button type="button" className={styles.rangeChip}>
            {t('hqLeaderSales.range1d')}
          </button>
        </div>

        {tab === MERCHANTS_TAB_INDEX ? (
          <>
            <div className={styles.kpiRow5}>
              {tabKpi.map((s) => (
                <StatCard key={s.id} {...s} dense />
              ))}
            </div>
            <DataTable
              title={t('hqLeaderSales.merchants.tableTitle')}
              columns={merchantColumns}
              rows={merchantRows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
            />
          </>
        ) : tab === HISTORY_TAB_INDEX ? (
          <>
            {/* 거래내역 탭(Figma 81:24280) — KPI 5개(가맹점별 탭과 동일 구성) + 전체 거래 로그 */}
            <div className={styles.kpiRow5}>
              {tabKpi.map((s) => (
                <StatCard key={s.id} {...s} dense />
              ))}
            </div>
            <DataTable
              title={t('hqPartnerSales.logTitle')}
              columns={logColumns}
              rows={logTableRows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
            />
          </>
        ) : tab === SETTLEMENT_TAB_INDEX ? (
          <>
            {/* 정산내역 탭(Figma 81:25829) — 1)금액요약(1행 5열) → 2)보류·제외 거래 → 정산 내역 표 */}
            <div className={styles.sectionBox}>
              <h3 className={styles.sectionTitle}>{t('hqLeaderSales.settle.sec1')}</h3>
              <div className={styles.settleSummaryGrid}>
                {settle.summary.map((item) => (
                  <div key={item.label} className={styles.settleSummaryItem}>
                    <span className={styles.settleSummaryLabel}>{item.label}</span>
                    <span className={styles.settleSummaryValue} style={item.color ? { color: item.color } : undefined}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.settleTableBox}>
              <h3 className={styles.settleTableTitle}>{t('hqPartnerSales.settle.sec2')}</h3>
              <p className={styles.settleTableDesc}>{t('settle.detail.e.desc')}</p>
              <DataTable columns={settle.heldColumns} rows={settleHeldRows} bare />
            </div>
            {/* wrapCells: "대상 기간"이 Figma처럼 두 줄로 꺾이게(말줄임 방지) */}
            <DataTable
              title={t('settle.hist.tableTitle')}
              columns={settle.historyColumns}
              rows={settleHistoryRows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
              wrapCells
            />
          </>
        ) : (
          <>
            {/* 관리자 메모 탭 — 리더 화면(81:25195)과 동일 디자인 패밀리라 같은 구성으로 표시 */}
            <div className={`${styles.sectionBox} ${styles.memoBox}`}>
              <h3 className={styles.sectionTitle}>{t('hqLeaderSales.memo.title')}</h3>
              <p className={styles.memoDesc}>{t('hqLeaderSales.memo.desc')}</p>
              <textarea className={styles.memoTextarea} aria-label={t('hqLeaderSales.memo.title')} />
            </div>
            <div className={styles.memoFooter}>
              <button type="button" className={styles.rangeChip}>
                {t('hqSettle.reqDetail.btn.save')}
              </button>
              <span className={styles.memoCounter}>{MEMO_COUNTER_SAMPLE}</span>
            </div>
          </>
        )}

        <div className={styles.actionRow}>
          <button type="button" className={styles.confirmButton}>
            {t('hqLeaderSales.confirmButton')}
          </button>
        </div>
      </Card>
    </div>
  )
}
