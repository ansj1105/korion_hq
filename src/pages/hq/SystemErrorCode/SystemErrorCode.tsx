import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatCard from '../../../components/molecules/StatCard'
import ActionBadges from '../../../components/molecules/ActionBadges'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useSystemErrorCode } from './useSystemErrorCode'
import ErrorCodeFormOverlay from './ErrorCodeFormOverlay'
import styles from './SystemErrorCode.module.css'

/*
 * SystemErrorCode (page) — 본사어드민 · 시스템 설정 · 오류 코드 설정
 * ------------------------------------------------------------------
 * Figma 81:20738 기준: 제목/설명 → 오류 KPI 4장(4열) →
 * "관라자 안내" 카드(호박색 테두리) → 오류 코드 목록 표(툴바 우측에 "오류코드 추가" CTA).
 * 국가/지역 설정(81:20189)과 동일 골격이라 같은 구성 요소를 재사용한다.
 * 검색/필터/추가 등 동작은 작업 범위 밖(CLAUDE.md 1번) — UI 상태만 구현.
 */
export default function SystemErrorCode() {
  const { t } = useTranslation()
  const { kpis, columns, rows: rawRows } = useSystemErrorCode()
  // "오류코드 추가" 클릭 → 등록 폼 오버레이(Figma 81:29775)
  const [addOpen, setAddOpen] = useState(false)

  /*
   * 강조색 — Figma 실측: 심각도 "위험"=#ff4e4e(빨강), 상태 "활성"=#09c809(초록).
   * "주의"는 기본 흐린 셀 색 그대로. 상태 문자열은 데이터(enum)라 번역하지 않고
   * 색만 표시 계층에서 입힌다.
   */
  const SEVERITY_COLOR: Record<string, string> = {
    위험: '#ff4e4e',
  }
  const STATUS_COLOR: Record<string, string> = {
    활성: '#09c809',
  }

  // 액션 배지(상세)는 중립 회색 솔리드 — accentByLabel을 빈 매핑으로 줘 중립색으로 통일
  const actionBadges = (
    <ActionBadges labels={[t('common.detail')]} accentByLabel={{}} solid equalWidth size="xs" />
  )

  // Figma 시안은 번호가 전부 "0001"이라 리스트 key는 코드+인덱스로 보강
  const rows: TableRow[] = rawRows.map((r, i) => ({
    id: `${r.code}-${i}`,
    cells: {
      no: r.no,
      registeredAt: r.registeredAt,
      code: r.code,
      name: r.name,
      category: r.category,
      severity: <span style={{ color: SEVERITY_COLOR[r.severity] }}>{r.severity}</span>,
      userMessage: r.userMessage,
      autoAction: r.autoAction,
      status: <span style={{ color: STATUS_COLOR[r.status] }}>{r.status}</span>,
      action: actionBadges,
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqSystemErrorCode.title')}>
        <p className={styles.pageDesc}>{t('hqSystemErrorCode.desc')}</p>
      </PageHeader>

      {/* 오류 KPI 그리드 — Figma 실측 4열 1행 */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <StatCard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* 관리자 안내 카드 — 호박색 테두리(국가/지역 설정의 안내 카드와 동일 골격) */}
      <section className={styles.noticeCard}>
        <h2 className={styles.noticeTitle}>{t('hqSystemErrorCode.notice.title')}</h2>
        <p className={styles.noticeDesc}>{t('hqSystemErrorCode.notice.desc')}</p>
      </section>

      {/* 오류 코드 목록 표 — 툴바 우측 끝에 보라 "오류코드 추가" CTA(Figma 113×33 솔리드) */}
      <DataTable
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        toolbarExtra={
          <button type="button" className={styles.addButton} onClick={() => setAddOpen(true)}>
            {t('hqSystemErrorCode.btn.addErrorCode')}
          </button>
        }
        columns={columns}
        rows={rows}
        mutedText
        headerBar
        wrapCells
      />

      <ErrorCodeFormOverlay open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  )
}
