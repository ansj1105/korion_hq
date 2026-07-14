import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatCard from '../../../components/molecules/StatCard'
import ActionBadges from '../../../components/molecules/ActionBadges'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import { useSystemMaintenance } from './useSystemMaintenance'
import MaintenanceStartOverlay from './MaintenanceStartOverlay'
import styles from './SystemMaintenance.module.css'
import type { AccentKey } from '../../../types'

/*
 * SystemMaintenance (page) — 본사어드민 · 시스템 설정 · 서비스 점검 모드
 * ------------------------------------------------------------------
 * Figma 81:20487 기준: 제목/설명 → 현재 상태 카드(초록 테두리, "점검 시작" 버튼 +
 * "점검 모드 OFF" 배지) → 점검 이력 표. 다른 시스템 설정 화면과 달리 KPI 그리드가 없다.
 * "점검 시작" 등 동작은 작업 범위 밖(CLAUDE.md 1번) — UI 상태만 구현.
 */
export default function SystemMaintenance() {
  const { t } = useTranslation()
  const { status, kpis, columns, rows: rawRows, isLoading, error } = useSystemMaintenance()
  // "점검 시작" 클릭 → 점검 범위 설정 폼 오버레이(Figma 81:29906)
  const [startOpen, setStartOpen] = useState(false)

  const actionAccent: Record<string, AccentKey> = {
    [t('common.detail')]: 'cyan',
    상세: 'cyan',
    수정: 'blue',
    삭제: 'red',
  }

  // Figma 시안은 번호가 전부 "0001"이라 리스트 key는 점검 ID로 보강
  const rows: TableRow[] = rawRows.map((r, i) => ({
    id: r.id ?? `${r.maintenanceId}-${i}`,
    cells: {
      no: r.no,
      registeredAt: r.registeredAt,
      maintenanceId: r.maintenanceId,
      scope: r.scope,
      countries: r.countries,
      features: r.features,
      startAt: r.startAt,
      endAt: r.endAt,
      status: (
        <Badge accent={(r.statusAccent as AccentKey) ?? (r.status === '점검중' ? 'orange' : 'green')} size="md" shape="rect">
          {r.status}
        </Badge>
      ),
      admin: <span style={{ color: '#ffffff' }}>{r.admin}</span>,
      source: r.source ?? '-',
      action: (
        <ActionBadges
          labels={r.actions?.length ? r.actions : [t('common.detail'), t('hqSystemMaintenance.action.edit'), t('hqSystemMaintenance.action.delete')]}
          accentByLabel={actionAccent}
          solid
          size="md"
          shape="rect"
        />
      ),
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqSystemMaintenance.title')}>
        <p className={styles.pageDesc}>{t('hqSystemMaintenance.desc')}</p>
      </PageHeader>

      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <StatCard key={kpi.id} {...kpi} />
        ))}
      </div>

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
          <Badge accent={(status.accent as AccentKey) ?? 'green'} size="md" shape="rect">
            {status.badge}
          </Badge>
        </div>
      </section>
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* 점검 이력 표 — 이 화면 툴바에는 CTA 없이 검색/필터/엑셀만 */}
      <DataTable
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        columns={columns}
        rows={rows}
        searchKeys={['maintenanceId', 'scope', 'countries', 'features', 'status', 'admin', 'source']}
        filterKeys={['scope', 'countries', 'status', 'source']}
        mutedText
        headerBar
        wrapCells
        paginated
        pageSize={10}
      />

      <MaintenanceStartOverlay open={startOpen} onClose={() => setStartOpen(false)} />
    </div>
  )
}
