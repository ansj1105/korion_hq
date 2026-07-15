import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatCard from '../../../components/molecules/StatCard'
import ActionBadges from '../../../components/molecules/ActionBadges'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import { fetchHqPageData, postHqPageData } from '../../../services/korionChongApi'
import type { AccentKey } from '../../../types'
import { useSystemErrorCode, type SystemErrorCodePageData } from './useSystemErrorCode'
import ErrorCodeFormOverlay, { type ErrorCodeCreatePayload } from './ErrorCodeFormOverlay'
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
  const { kpis, columns, rows: rawRows, options, setData, isLoading, error } = useSystemErrorCode()
  // "오류코드 추가" 클릭 → 등록 폼 오버레이(Figma 81:29775)
  const [addOpen, setAddOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const severityAccent: Record<string, AccentKey> = {
    INFO: 'blue',
    WARNING: 'amber',
    ERROR: 'orange',
    CRITICAL: 'red',
  }
  const autoActionAccent: Record<string, AccentKey> = {
    NONE: 'blue',
    RETRY: 'blue',
    BLOCK_PAYMENT: 'red',
    HOLD_SETTLEMENT: 'amber',
    REQUEST_REVIEW: 'cyan',
    ESCALATE: 'purple',
  }
  const rows: TableRow[] = rawRows.map((r, i) => ({
    id: r.id ?? `${r.code}-${i}`,
    cells: {
      no: rawRows.length - i,
      registeredAt: r.registeredAt,
      code: r.code,
      name: r.name,
      category: r.category,
      severity: (
        <Badge accent={(r.severityAccent as AccentKey) ?? severityAccent[r.severity] ?? 'blue'} size="md" shape="rect">
          {r.severity}
        </Badge>
      ),
      userMessage: r.userMessage,
      autoAction: (
        <Badge accent={autoActionAccent[r.autoAction] ?? 'blue'} size="md" shape="rect">
          {r.autoAction}
        </Badge>
      ),
      status: (
        <Badge accent={(r.statusAccent as AccentKey) ?? (r.status === 'ACTIVE' ? 'green' : 'blue')} size="md" shape="rect">
          {r.status}
        </Badge>
      ),
      action: (
        <ActionBadges
          labels={r.actions?.length ? r.actions : [t('common.detail')]}
          size="md"
          shape="rect"
        />
      ),
    },
  }))

  async function submitErrorCode(payload: ErrorCodeCreatePayload) {
    setIsSaving(true)
    setSaveError(null)
    try {
      await postHqPageData('/api/hq/payments/error-codes', payload)
      const nextPage = await fetchHqPageData<SystemErrorCodePageData>('/api/hq/payments/error-codes')
      setData(nextPage)
      setAddOpen(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('hqSystemErrorCode.add.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

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
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}

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
        searchKeys={['code', 'name', 'category', 'severity', 'autoAction', 'status', 'userMessage']}
        filterKeys={['category', 'severity', 'autoAction', 'status']}
        exportUrl="/api/hq/payments/error-codes/export"
        mutedText
        headerBar
        wrapCells
        paginated
        pageSize={10}
      />

      <ErrorCodeFormOverlay
        open={addOpen}
        options={options}
        isSaving={isSaving}
        error={saveError}
        onClose={() => setAddOpen(false)}
        onSubmit={submitErrorCode}
      />
    </div>
  )
}
