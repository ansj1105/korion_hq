import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import ActionBadges from '../../../components/molecules/ActionBadges'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useSystemMaintenance } from './useSystemMaintenance'
import MaintenanceStartOverlay from './MaintenanceStartOverlay'
import styles from './SystemMaintenance.module.css'

/*
 * SystemMaintenance (page) — 본사어드민 · 시스템 설정 · 서비스 점검 모드
 * ------------------------------------------------------------------
 * Figma 81:20487 기준: 제목/설명 → 현재 상태 카드(초록 테두리, "점검 시작" 버튼 +
 * "점검 모드 OFF" 배지) → 점검 이력 표. 다른 시스템 설정 화면과 달리 KPI 그리드가 없다.
 * "점검 시작" 등 동작은 작업 범위 밖(CLAUDE.md 1번) — UI 상태만 구현.
 */
export default function SystemMaintenance() {
  const { t } = useTranslation()
  const { status, columns, rows: rawRows } = useSystemMaintenance()
  // "점검 시작" 클릭 → 점검 범위 설정 폼 오버레이(Figma 81:29906)
  const [startOpen, setStartOpen] = useState(false)

  /*
   * 상태 강조색 — Figma 실측: 예약됨=#ffad33(호박), 정상 종료=#09c809(초록).
   * 관리자 컬럼은 흐린 셀 색이 아니라 흰색(실측). 상태 문자열은 데이터(enum)라
   * 번역하지 않고, 색만 표시 계층에서 입힌다.
   */
  const STATUS_COLOR: Record<string, string> = {
    예약됨: '#ffad33',
    '정상 종료': '#09c809',
  }

  // 행 상태에 따라 액션 배지가 다름(예약됨 → 수정 / 종료 → 상세). 배지는 중립 회색 솔리드
  const actionBadge = (action: 'edit' | 'detail') => (
    <ActionBadges
      labels={[action === 'edit' ? t('hqSystemMaintenance.action.edit') : t('common.detail')]}
      accentByLabel={{}}
      solid
      equalWidth
      size="xs"
    />
  )

  // Figma 시안은 번호가 전부 "0001"이라 리스트 key는 점검 ID로 보강
  const rows: TableRow[] = rawRows.map((r, i) => ({
    id: `${r.maintenanceId}-${i}`,
    cells: {
      no: r.no,
      registeredAt: r.registeredAt,
      maintenanceId: r.maintenanceId,
      scope: r.scope,
      countries: r.countries,
      features: r.features,
      startAt: r.startAt,
      endAt: r.endAt,
      status: <span style={{ color: STATUS_COLOR[r.status] }}>{r.status}</span>,
      admin: <span style={{ color: '#ffffff' }}>{r.admin}</span>,
      action: actionBadge(r.action),
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqSystemMaintenance.title')}>
        <p className={styles.pageDesc}>{t('hqSystemMaintenance.desc')}</p>
      </PageHeader>

      {/* 현재 상태 카드 — 좌: 상태 텍스트 / 우: "점검 시작" 버튼 + 점검 모드 배지 */}
      <section className={styles.statusCard}>
        <div className={styles.statusText}>
          <span className={styles.statusLabel}>{t('hqSystemMaintenance.status.label')}</span>
          <strong className={styles.statusValue}>{status.value}</strong>
          <p className={styles.statusDesc}>{status.desc}</p>
        </div>
        <div className={styles.statusControls}>
          <button type="button" className={styles.startButton} onClick={() => setStartOpen(true)}>
            {t('hqSystemMaintenance.btn.start')}
          </button>
          <span className={styles.modeBadge}>{status.badge}</span>
        </div>
      </section>

      {/* 점검 이력 표 — 이 화면 툴바에는 CTA 없이 검색/필터/엑셀만 */}
      <DataTable
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        columns={columns}
        rows={rows}
        mutedText
        headerBar
        wrapCells
      />

      <MaintenanceStartOverlay open={startOpen} onClose={() => setStartOpen(false)} />
    </div>
  )
}
