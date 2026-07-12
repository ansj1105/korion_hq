import { useNavigate } from 'react-router-dom'
import PageHeader from '../../../components/organisms/PageHeader'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import { useSettlementRequest, type RequestStatus } from './useSettlementRequest'
import styles from './SettlementRequest.module.css'

/** 상태 enum → 표시 색 클래스 (검토=주황 / 완료=초록 / 보류=호박) */
const STATUS_CLASS: Record<RequestStatus, string> = {
  review: styles.stReview,
  done: styles.stDone,
  hold: styles.stHold,
}

/*
 * HqSettlementRequest (page) — 본사어드민 · 수수료/정산 · 정산 신청(목록)
 * ------------------------------------------------------------------
 * 본사가 국가 리더의 정산 신청을 검토/승인/보류하는 목록 화면.
 * 상단 KPI 8개 + "리더 정산 신청 목록" 테이블. 행/‘상세’ 클릭 시 상세 검토 화면으로 이동.
 * 동작은 UI 상태만(라우팅 제외 실제 처리는 범위 밖).
 */
export default function HqSettlementRequest() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { kpis, columns, rows: rawRows, statusLabel, statusAction, detailLabel, chipAutoInclude, chipExcludeToday, section, subtitle } =
    useSettlementRequest()

  // Figma에서 굵게 표시되는 셀(신청일~전체 거래금액)만 감싸는 헬퍼
  const strong = (value: string) => <span className={styles.cellStrong}>{value}</span>
  // Figma처럼 좁은 컬럼(신청 ID/정산 기간)은 말줄임 대신 두 줄로 꺾어 전체 값을 보여준다
  const wrap = (value: string) => <span className={styles.cellWrap}>{value}</span>
  const strongWrap = (value: string) => <span className={`${styles.cellStrong} ${styles.cellWrap}`}>{value}</span>

  const rows: TableRow[] = rawRows.map((r, index) => ({
    // 신청 ID가 샘플상 중복돼 있어 index로 key를 구분
    id: `${r.id}-${index}`,
    cells: {
      id: wrap(r.id),
      date: strong(r.date),
      applicant: strong(r.applicant),
      partnerName: strong(r.partnerName),
      country: strong(r.country),
      period: strongWrap(r.period),
      totalAmount: strong(r.totalAmount),
      partnerProfit: r.partnerProfit,
      directProfit: r.directProfit,
      partnerSettle: r.partnerSettle,
      held: r.held,
      finalAmount: r.finalAmount,
      status: <span className={STATUS_CLASS[r.status]}>{statusLabel[r.status]}</span>,
      action: (
        <ActionBadges
          labels={[detailLabel, statusAction[r.status]]}
          accentByLabel={{}}
          size="xs"
          solid
          equalWidth
          /* Figma: 검토 상태 행의 '검토' 배지만 주황 강조 */
          classNameByLabel={r.status === 'review' ? { [statusAction[r.status]]: styles.badgeReview } : undefined}
        />
      ),
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqSettle.req.title')}>
        {/* 부제(좌) + 상태 칩(우) 한 줄. 칩은 동작 없는 표시 전용 */}
        <div className={styles.subRow}>
          <p className={styles.subtitle}>{subtitle}</p>
          <div className={styles.chips}>
            <span className={`${styles.chip} ${styles.chipPurple}`}>{chipAutoInclude}</span>
            <span className={`${styles.chip} ${styles.chipCyan}`}>{chipExcludeToday}</span>
          </div>
        </div>
      </PageHeader>

      {/* KPI 8개 — 감싸는 박스 없이 4×2 독립 카드 */}
      <div className={styles.kpiGrid}>
        {kpis.map((k) => (
          <div key={k.id} className={styles.kpiCard}>
            <span className={styles.kpiLabel}>{k.label}</span>
            <span className={styles.kpiValue}>{k.value}</span>
            <span className={styles.kpiNote}>{k.note}</span>
          </div>
        ))}
      </div>

      {/* 리더 정산 신청 목록 — 행 전체 클릭 시 상세 검토로 이동 */}
      <DataTable
        title={section}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('hqSettle.req.toolbar.excel')]}
        fill
        inlineToolbar
        mutedText
        headerBar
        tallToolbar
        onRowClick={() => navigate('detail')}
      />
    </div>
  )
}
