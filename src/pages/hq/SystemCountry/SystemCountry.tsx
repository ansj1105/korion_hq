import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatCard from '../../../components/molecules/StatCard'
import ActionBadges from '../../../components/molecules/ActionBadges'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useSystemCountry } from './useSystemCountry'
import CountryFormOverlay from './CountryFormOverlay'
import styles from './SystemCountry.module.css'

/*
 * SystemCountry (page) — 본사어드민 · 시스템 설정 · 국가 / 지역 설정
 * ------------------------------------------------------------------
 * Figma 81:20189 기준: 제목/설명 → 운영 KPI 4장(4열) →
 * "운영 영향 안내" 카드(호박색 테두리) → 국가 목록 표(툴바 우측에 "국가 추가" CTA).
 * 검색/필터/추가 등 동작은 작업 범위 밖(CLAUDE.md 1번) — UI 상태만 구현.
 */
export default function SystemCountry() {
  const { t } = useTranslation()
  const { kpis, columns, rows: rawRows } = useSystemCountry()
  // "국가 추가" 클릭 → 등록 폼(Figma 81:29739) / 행 클릭 → 국가 상세정보 폼(Figma 81:29865)
  const [addOpen, setAddOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)

  /*
   * 상태/결제 강조색 — Figma 실측: 활성·ON=#09c809, 비활성=#ffad33, 제한=#ff4e4e,
   * OFF=흰색(기본 흐린 셀 색과 달라 명시). 토큰 accent와 다른 색조라 직접 지정.
   * 상태 문자열은 데이터(enum)라 번역하지 않고, 색만 표시 계층에서 입힌다.
   */
  const STATUS_COLOR: Record<string, string> = {
    활성: '#09c809',
    비활성: '#ffad33',
    제한: '#ff4e4e',
  }
  const PAYMENT_COLOR: Record<string, string> = {
    ON: '#09c809',
    OFF: '#ffffff',
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
      country: r.country,
      regions: r.regions,
      timezone: r.timezone,
      currency: r.currency,
      language: r.language,
      leader: r.leader,
      partners: r.partners,
      merchants: r.merchants,
      status: <span style={{ color: STATUS_COLOR[r.status] }}>{r.status}</span>,
      payment: <span style={{ color: PAYMENT_COLOR[r.payment] }}>{r.payment}</span>,
      action: actionBadges,
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
        mutedText
        headerBar
        wrapCells
        onRowClick={() => setDetailOpen(true)}
      />

      <CountryFormOverlay variant="add" open={addOpen} onClose={() => setAddOpen(false)} />
      {/* 행(상세) 클릭 상세 폼 — 시안이 단일 샘플이라 어떤 행이든 같은 내용 */}
      <CountryFormOverlay variant="detail" open={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  )
}
