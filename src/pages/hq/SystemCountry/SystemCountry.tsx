import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatCard from '../../../components/molecules/StatCard'
import ActionBadges from '../../../components/molecules/ActionBadges'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import { useSystemCountry } from './useSystemCountry'
import CountryFormOverlay from './CountryFormOverlay'
import styles from './SystemCountry.module.css'
import type { AccentKey } from '../../../types'
import type { CountryRow } from './useSystemCountry'

/*
 * SystemCountry (page) — 본사어드민 · 시스템 설정 · 국가 / 지역 설정
 * ------------------------------------------------------------------
 * Figma 81:20189 기준: 제목/설명 → 운영 KPI 4장(4열) →
 * "운영 영향 안내" 카드(호박색 테두리) → 국가 목록 표(툴바 우측에 "국가 추가" CTA).
 * 검색/필터/추가 등 동작은 작업 범위 밖(CLAUDE.md 1번) — UI 상태만 구현.
 */
export default function SystemCountry() {
  const { t } = useTranslation()
  const { kpis, columns, rows: rawRows, formOptions, setData, isLoading, error } = useSystemCountry()
  // "국가 추가" 클릭 → 등록 폼(Figma 81:29739) / 행 클릭 → 국가 상세정보 폼(Figma 81:29865)
  const [addOpen, setAddOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<CountryRow | null>(rawRows[0] ?? null)

  const actionAccent: Record<string, AccentKey> = {
    [t('common.detail')]: 'cyan',
    수정: 'blue',
    제한: 'red',
    활성: 'green',
  }

  // Figma 시안은 번호가 전부 "0001"이라 리스트 key는 코드+인덱스로 보강
  const rows: TableRow[] = rawRows.map((r, i) => ({
    id: r.id ?? `${r.code}-${i}`,
    cells: {
      no: r.no,
      registeredAt: r.registeredAt,
      code: r.code,
      country: r.country,
      regions: r.regions,
      timezone: r.timezone,
      currency: r.currency,
      language: r.language,
      leader: r.leader,
      partners: r.partners,
      merchants: r.merchants,
      status: <Badge accent={(r.statusAccent as AccentKey) ?? (r.status === '활성' ? 'green' : 'orange')} size="md" shape="rect">{r.status}</Badge>,
      payment: <Badge accent={(r.paymentAccent as AccentKey) ?? (r.payment === 'ON' ? 'green' : 'red')} size="md" shape="rect">{r.payment}</Badge>,
      action: <ActionBadges labels={r.actions ?? [t('common.detail')]} accentByLabel={actionAccent} solid size="md" shape="rect" />,
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqSystemCountry.title')}>
        <p className={styles.pageDesc}>{t('hqSystemCountry.desc')}</p>
      </PageHeader>

      {/* 전체 운영 KPI 그리드 — Figma 실측 4열 1행 */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <StatCard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* 운영 영향 안내 카드 — 호박색 테두리, 제목까지 호박색(담보금 화면 안내 카드와 다른 점) */}
      <section className={styles.noticeCard}>
        <h2 className={styles.noticeTitle}>{t('hqSystemCountry.notice.title')}</h2>
        <p className={styles.noticeDesc}>{t('hqSystemCountry.notice.desc')}</p>
      </section>
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* 국가 목록 표 — 툴바 우측 끝에 보라 "국가 추가" CTA(Figma 92×33 솔리드) */}
      <DataTable
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        toolbarExtra={
          <button type="button" className={styles.addButton} onClick={() => setAddOpen(true)}>
            {t('hqSystemCountry.btn.addCountry')}
          </button>
        }
        columns={columns}
        rows={rows}
        searchKeys={['code', 'country', 'regions', 'timezone', 'currency', 'language', 'leader']}
        filterKeys={['status', 'payment', 'currency', 'language', 'timezone']}
        exportUrl="/api/hq/system/country/export"
        mutedText
        headerBar
        wrapCells
        paginated
        pageSize={10}
        onRowClick={(id) => {
          setSelectedCountry(rawRows.find((row, index) => (row.id ?? `${row.code}-${index}`) === id) ?? null)
          setDetailOpen(true)
        }}
      />

      <CountryFormOverlay
        variant="add"
        open={addOpen}
        onClose={() => setAddOpen(false)}
        formOptions={formOptions}
        onSaved={setData}
      />
      <CountryFormOverlay
        variant="detail"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        country={selectedCountry}
        formOptions={formOptions}
      />
    </div>
  )
}
