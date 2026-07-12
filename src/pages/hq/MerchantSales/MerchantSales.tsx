import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Card from '../../../components/atoms/Card'
import StatCard from '../../../components/molecules/StatCard'
import InfoGrid from '../../../components/molecules/InfoGrid'
import FilterTabs from '../../../components/molecules/FilterTabs'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import { useMerchantSales } from './useMerchantSales'
import { useMerchantSettlement } from './useMerchantSettlement'
import TransactionDetailModal from './TransactionDetailModal'
import styles from './MerchantSales.module.css'

/* 탭 인덱스 — "거래내역"이 Figma 기본 선택 탭(인덱스 0), "정산내역"은 1, "관리자 메모"는 2 */
const HISTORY_TAB_INDEX = 0
const SETTLEMENT_TAB_INDEX = 1
const MEMO_TAB_INDEX = 2

/* "관리자 메모" 탭 글자수 카운터 — Figma 샘플 표기(실데이터 연동 시 입력 길이로 교체) */
const MEMO_COUNTER_SAMPLE = '50 / 200'

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
  const { profile, kpiTop, accountInfo, basicInfo, storeInfo, kpiBottom, logColumns, logRows } = useMerchantSales()
  const [tab, setTab] = useState(HISTORY_TAB_INDEX)
  // 거래내역 탭에서 로그 행 클릭 시 여는 상세 모달(Figma 81:28685) — 퍼블리싱 단계라 어떤 행이든 같은 샘플 상세를 띄운다
  const [txModalOpen, setTxModalOpen] = useState(false)
  const settle = useMerchantSettlement()

  /* "정산내역" 탭(Figma 81:26833) 상태 강조색 — 보류=주황(Figma 실측값, 리더/파트너 화면과 동일 규칙) */
  const SETTLE_STATUS_COLOR: Record<string, string> = {
    '정산 보류': '#ff8a3d',
    '본사 검토중': '#ff8a3d',
  }
  const settleHeldRows: TableRow[] = settle.heldRows.map((r) => ({
    id: r.txNo,
    cells: { ...r, status: <span style={{ color: SETTLE_STATUS_COLOR[r.status] }}>{r.status}</span> },
  }))
  const settleHistoryRows: TableRow[] = settle.historyRows.map((r, i) => ({
    id: `${r.period}-${i}`,
    cells: {
      ...r,
      status: <span style={{ color: SETTLE_STATUS_COLOR[r.status] }}>{r.status}</span>,
      action: <ActionBadges labels={[t('common.detail')]} size="xs" />,
    },
  }))

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

        <FilterTabs labels={tabLabels} activeIndex={tab} onChange={setTab} variant="outline" />

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
              onRowClick={() => setTxModalOpen(true)}
            />
          </>
        ) : tab === SETTLEMENT_TAB_INDEX ? (
          <>
            {/* 정산내역 탭(Figma 81:26833) — 1)금액요약(1행 5열) → 2)보류·제외 거래 (파트너 상세와 동일 구성, 하단 표 없음) */}
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
            {/* wrapCells: "대상 기간"이 두 줄로 꺾이게(말줄임 방지) — 파트너 상세와 동일 */}
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
        ) : tab === MEMO_TAB_INDEX ? (
          <>
            {/* 관리자 메모 탭(Figma 81:26622) — 리더/파트너 화면과 동일 구성: 메모 블록 + 저장(좌)/글자수(우) */}
            <div className={`${styles.sectionBox} ${styles.memoBox}`}>
              <h3 className={styles.sectionTitle}>{t('hqLeaderSales.memo.title')}</h3>
              <p className={styles.memoDesc}>{t('hqLeaderSales.memo.desc')}</p>
              <textarea className={styles.memoTextarea} aria-label={t('hqLeaderSales.memo.title')} />
            </div>
            <div className={styles.memoFooter}>
              <button type="button" className={styles.memoSaveBtn}>
                {t('hqSettle.reqDetail.btn.save')}
              </button>
              <span className={styles.memoCounter}>{MEMO_COUNTER_SAMPLE}</span>
            </div>
          </>
        ) : (
          <p className={styles.tabPlaceholder}>{t('common.comingSoon')}</p>
        )}

        {/* Figma 레이어명은 "본사 정산 요청 보내기"지만, 버튼 안 실제 텍스트는 "확인"뿐이라 그대로 표기 */}
        <div className={styles.actionRow}>
          <button type="button" className={styles.confirmButton}>
            {t('hqMerchantSales.confirmButton')}
          </button>
        </div>
      </Card>

      {txModalOpen && <TransactionDetailModal onClose={() => setTxModalOpen(false)} />}
    </div>
  )
}
