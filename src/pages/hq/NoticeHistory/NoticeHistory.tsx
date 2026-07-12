import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatCard from '../../../components/molecules/StatCard'
import ActionBadges from '../../../components/molecules/ActionBadges'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useNoticeHistory } from './useNoticeHistory'
import NoticeDetailOverlay from './NoticeDetailOverlay'
import styles from './NoticeHistory.module.css'

/*
 * NoticeHistory (page) — 본사어드민 · 알림/공지 · 발송 내역
 * ------------------------------------------------------------------
 * Figma 81:21342 기준: 제목/설명 → 국가·날짜 필터칩 → KPI 5장(공지 보내기와 동일) →
 * 발송 내역 표(번호/발송일시/공지 제목/국가/발송 대상/수신 대상 수/발송방식/상태/액션).
 * 액션 배지는 상태에 따라 다름: 예약대기 행은 "발송취소"(빨강), 완료 행은 "회원정보".
 * 행(상세) 클릭 시 공지 발송 상세 오버레이(81:29690)가 콘텐츠 영역 중앙에 뜬다.
 */
export default function NoticeHistory() {
  const { t } = useTranslation()
  const { kpis, columns, rows: rawRows, detail } = useNoticeHistory()

  // 클릭된 행 인덱스 — null이면 상세 오버레이 닫힘
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  /*
   * 상태 강조색 — 완료=초록 65% 틴트(토큰 green과 동일 색), 예약대기=호박색 75%(Figma 실측
   * rgba(247,201,72,.75), 토큰에 없어 직접 지정). 상태 문자열은 데이터(enum)라 번역하지
   * 않고, 색만 표시 계층에서 입힌다.
   */
  const STATUS_COLOR: Record<string, string> = {
    완료: 'color-mix(in srgb, var(--color-accent-green) 65%, transparent)',
    예약대기: 'rgba(247, 201, 72, 0.75)',
  }

  // Figma 시안은 번호가 전부 "0001"이라 리스트 key는 인덱스로(행 클릭 → 상세 조회에도 사용)
  const rows: TableRow[] = rawRows.map((r, i) => ({
    id: String(i),
    cells: {
      no: r.no,
      sentAt: r.sentAt,
      title: r.title,
      country: r.country,
      target: r.target,
      recipients: r.recipients,
      method: r.method,
      status: <span style={{ color: STATUS_COLOR[r.status] }}>{r.status}</span>,
      action: (
        /* 예약대기 행만 두 번째 액션이 "발송취소"(빨강 솔리드), 나머지는 "회원정보"(중립) — Figma 실측 */
        <ActionBadges
          labels={
            r.status === '예약대기'
              ? [t('common.detail'), t('hqNoticeHistory.action.cancelSend')]
              : [t('common.detail'), t('hqCollateral.action.memberInfo')]
          }
          accentByLabel={{ [t('hqNoticeHistory.action.cancelSend')]: 'red' }}
          solid
          equalWidth
          size="xs"
        />
      ),
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqNoticeHistory.title')}>
        <p className={styles.pageDesc}>{t('hqNoticeHistory.desc')}</p>
        {/* Figma의 국가/날짜 필터칩 — 동작 없는 UI 표시만 (CLAUDE.md 1번 규칙: 인터랙션은 협의 전까지 보류) */}
        <div className={styles.filterChips}>
          <span className={styles.chip}>{t('hqDashboard.filter.allCountries')}</span>
          <span className={styles.chip}>{t('hqDashboard.filter.today')}</span>
        </div>
      </PageHeader>

      {/* 발송 현황 KPI 그리드 — 공지 보내기 화면과 동일 5장 */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <StatCard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* wrapCells: "발송일시"가 Figma처럼 두 줄(날짜/시간)로 꺾이게(말줄임 방지) */}
      <DataTable
        title={t('hqNoticeHistory.table.title')}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        columns={columns}
        rows={rows}
        mutedText
        headerBar
        wrapCells
        onRowClick={(id) => setSelectedIndex(Number(id))}
      />

      {/* 행 클릭 시 공지 발송 상세 오버레이 — 콘텐츠 영역(사이드바 제외) 중앙 표시 */}
      <NoticeDetailOverlay
        row={selectedIndex === null ? null : rawRows[selectedIndex]}
        extra={detail}
        onClose={() => setSelectedIndex(null)}
      />
    </div>
  )
}
