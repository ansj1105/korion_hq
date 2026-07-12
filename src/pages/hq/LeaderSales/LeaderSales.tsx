import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Card from '../../../components/atoms/Card'
import StatCard from '../../../components/molecules/StatCard'
import InfoGrid from '../../../components/molecules/InfoGrid'
import FilterTabs from '../../../components/molecules/FilterTabs'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import { useLeaderSales } from './useLeaderSales'
import { useLeaderPartners } from './useLeaderPartners'
import { useLeaderMerchants } from './useLeaderMerchants'
import { useLeaderSettlement } from './useLeaderSettlement'
import styles from './LeaderSales.module.css'

/* 탭 인덱스 — "거래내역"이 Figma 기본 선택 탭(인덱스 2), "파트너별"은 0, "가맹점별"은 1, "정산내역"은 3, "관리자 메모"는 4 */
const PARTNERS_TAB_INDEX = 0
const MERCHANTS_TAB_INDEX = 1
const HISTORY_TAB_INDEX = 2
const SETTLEMENT_TAB_INDEX = 3

/* "관리자 메모" 탭 글자수 카운터 — Figma 샘플 표기(실데이터 연동 시 입력 길이로 교체) */
const MEMO_COUNTER_SAMPLE = '50 / 200'

/*
 * LeaderSales (page) — 본사어드민 · 국가 리더 관리 · 국가 리더별 거래내역
 * ------------------------------------------------------------------
 * Figma 좌표를 끝까지 따라가 보니 전체가 하나의 패널(Card) 안에 다음 순서로
 * 들어있었다: 큰 제목 "리더 정보" → 코드 미리보기 → KPI 4개 → A.계정정보 →
 * B.기본/소속정보 → 탭 5개(기본 선택: 거래내역) → [거래내역 탭 전용] KPI 5개 +
 * 전체 거래 로그 표 → 하단 액션 버튼. 탭 5개 모두 Figma 시안 확인 후 구현:
 * 파트너별 81:24823 / 가맹점별 81:25012 / 거래내역 2:6847 / 정산내역 81:25283 /
 * 관리자 메모 81:25195.
 */
export default function LeaderSales() {
  const { t } = useTranslation()
  const { profile, kpiTop, accountInfo, basicInfo, kpiBottom, logColumns, logRows } = useLeaderSales()
  const partners = useLeaderPartners()
  const merchants = useLeaderMerchants()
  const settle = useLeaderSettlement()
  const [tab, setTab] = useState(HISTORY_TAB_INDEX)

  // "파트너별" 탭(Figma 81:24823) — KPI 5개 + 파트너별 정보 표. 액션은 상세 배지 하나(시안 기준)
  const partnerRows: TableRow[] = partners.rows.map((r) => ({
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
      action: <ActionBadges labels={[t('common.detail')]} size="xs" />,
    },
  }))

  // "가맹점별" 탭(Figma 81:25012) — KPI 5개 + 가맹점별 정보 표. 구조는 파트너별 탭과 동일
  const merchantRows: TableRow[] = merchants.rows.map((r) => ({
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

  /*
   * "정산내역" 탭(Figma 81:25283) 상태 강조색 — 예정/가능=청록, 보류/검토중=주황(Figma 실측값).
   * 상태 문자열은 데이터(enum)라 번역하지 않고, 색만 표시 계층에서 입힌다.
   */
  const SETTLE_STATUS_COLOR: Record<string, string> = {
    '자동 예정': '#24e6b8',
    '정산 가능': '#24e6b8',
    '정산 보류': '#ff8a3d',
    '본사 검토중': '#ff8a3d',
  }
  const coloredStatus = (status: string) => (
    <span style={{ color: SETTLE_STATUS_COLOR[status] }}>{status}</span>
  )
  const viewLabel = t('hqSettle.reqDetail.view')

  const settlePartnerRows: TableRow[] = settle.partnerRows.map((r) => ({
    id: r.code,
    cells: { ...r, status: coloredStatus(r.status), detail: viewLabel },
  }))
  const settleMerchantRows: TableRow[] = settle.merchantRows.map((r) => ({
    id: r.code,
    cells: { ...r, status: coloredStatus(r.status), detail: viewLabel },
  }))
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

        {/* 탭 줄 — 좌측 탭 5개 + 우측 "1 D" 기간 버튼(Figma 시안, 동작은 추후 협의라 UI만) */}
        <div className={styles.tabsRow}>
          <FilterTabs labels={tabLabels} activeIndex={tab} onChange={setTab} variant="outline" />
          <button type="button" className={styles.rangeChip}>
            {t('hqLeaderSales.range1d')}
          </button>
        </div>

        {tab === PARTNERS_TAB_INDEX ? (
          <>
            <div className={styles.kpiRow5}>
              {partners.kpi.map((s) => (
                <StatCard key={s.id} {...s} dense />
              ))}
            </div>
            <DataTable
              title={t('hqLeaderSales.partners.tableTitle')}
              columns={partners.columns}
              rows={partnerRows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
            />
          </>
        ) : tab === MERCHANTS_TAB_INDEX ? (
          <>
            <div className={styles.kpiRow5}>
              {merchants.kpi.map((s) => (
                <StatCard key={s.id} {...s} dense />
              ))}
            </div>
            <DataTable
              title={t('hqLeaderSales.merchants.tableTitle')}
              columns={merchants.columns}
              rows={merchantRows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
            />
          </>
        ) : tab === HISTORY_TAB_INDEX ? (
          <>
            <div className={styles.kpiRow5}>
              {kpiBottom.map((s) => (
                <StatCard key={s.id} {...s} dense />
              ))}
            </div>
            <DataTable
              title={t('hqLeaderSales.logTitle')}
              columns={logColumns}
              rows={rows}
              toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
              inlineToolbar
              largeText
            />
          </>
        ) : tab === SETTLEMENT_TAB_INDEX ? (
          <>
            {/* 정산내역 탭(Figma 81:25283) — 1)금액요약 → 2)파트너 자동정산 → 3)직계약 가맹점 → 4)보류·제외 → 정산 내역 표 */}
            <div className={styles.sectionBox}>
              <h3 className={styles.sectionTitle}>{t('hqLeaderSales.settle.sec1')}</h3>
              <InfoGrid items={settle.summary} />
            </div>
            <div className={styles.settleTableBox}>
              <h3 className={styles.settleTableTitle}>{t('hqLeaderSales.settle.sec2')}</h3>
              <p className={styles.settleTableDesc}>{t('settle.detail.c.desc')}</p>
              <DataTable columns={settle.partnerColumns} rows={settlePartnerRows} bare />
            </div>
            <div className={styles.settleTableBox}>
              <h3 className={styles.settleTableTitle}>{t('hqLeaderSales.settle.sec3')}</h3>
              <p className={styles.settleTableDesc}>{t('settle.detail.d.desc')}</p>
              <DataTable columns={settle.merchantColumns} rows={settleMerchantRows} bare />
            </div>
            <div className={styles.settleTableBox}>
              <h3 className={styles.settleTableTitle}>{t('hqLeaderSales.settle.sec4')}</h3>
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
            {/* 관리자 메모 탭(Figma 81:25195) — 메모 입력 블록 + 저장 버튼(좌) / 글자수(우). 저장 동작은 추후 협의라 UI만 */}
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
