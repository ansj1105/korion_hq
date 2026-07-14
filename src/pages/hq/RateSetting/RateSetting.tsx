import { useEffect, useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import { useRateSetting, type EventStatus, type RateRow } from './useRateSetting'
import DistributionDiagram, { type DiagramRow } from './DistributionDiagram'
import RateFormModal from './RateFormModal'
import styles from './RateSetting.module.css'

/*
 * HqRateSetting (page) — 본사어드민 · 수수료/정산 · 배분율 설정
 * ------------------------------------------------------------------
 * 본사/리더/파트너/가맹점 수수료 배분 구조를 관리하는 화면 (Figma 81:23083).
 * KPI 7개 + 안내 칩 + 기본 배분 구조 다이어그램(+저장) + 국가별 설정 안내 카드 +
 * "국가별 배분율 설정" 테이블. CTA 클릭 → 추가 모드 / 행(상세) 클릭 → 수정 모드 모달.
 * 저장·추가·수정 동작은 협의 전이라 UI 상태만(CLAUDE.md 1번).
 */
export default function HqRateSetting() {
  const { t } = useTranslation()
  const {
    kpis,
    columns,
    rows: rawRows,
    diagramRows,
    countries,
    statusLabel,
    eventLabel,
    makeModalData,
    saveDiagramRows,
    saveCountryRate,
    deleteCountryRate,
    isLoading,
    error,
  } = useRateSetting()
  // 모달 모드 — null: 닫힘 / add: 국가별 배분율 추가 / edit: 행 상세(수정)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [selectedRow, setSelectedRow] = useState<RateRow | undefined>()
  const [draftDiagramRows, setDraftDiagramRows] = useState<DiagramRow[]>(diagramRows)

  useEffect(() => {
    setDraftDiagramRows(diagramRows)
  }, [diagramRows])

  // Figma에서 굵게 표시되는 셀(국가코드~적용 코인수)만 감싸는 헬퍼
  const strong = (value: string) => <span className={styles.cellStrong}>{value}</span>

  const rows: TableRow[] = rawRows.map((r) => ({
    id: r.code,
    cells: {
      no: r.no,
      country: r.country,
      code: strong(r.code),
      hqFee: strong(r.hqFee),
      leaderFee: strong(r.leaderFee),
      partnerFee: strong(r.partnerFee),
      merchantSettle: strong(r.merchantSettle),
      event: <Badge accent={EVENT_CLASS[r.event] ? 'green' : 'amber'} size="md" shape="rect">{eventLabel[r.event]}</Badge>,
      coinCount: strong(r.coinCount),
      status: <Badge accent={r.statusAccent ?? 'green'} size="md" shape="rect">{statusLabel[r.status]}</Badge>,
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqRate.title')} />

      {/* KPI 7개 — 감싸는 박스 없이 4열 그리드(3개는 다음 줄) */}
      <div className={styles.kpiGrid}>
        {kpis.map((k) => (
          <div key={k.id} className={styles.kpiCard}>
            <span className={styles.kpiLabel}>{k.label}</span>
            <span className={styles.kpiValue}>{k.value}</span>
            <span className={styles.kpiNoteBadge}>{k.note}</span>
          </div>
        ))}
      </div>
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* 안내 칩 — 국가별 설정이 없으면 기본 배분율 적용 */}
      <span className={styles.infoChip}>{t('hqRate.chip')}</span>

      {/* 기본 배분 구조 다이어그램 카드 — Figma상 제목·역할 배지·저장 버튼이 한 줄 */}
      <div className={styles.diagramCard}>
        <DistributionDiagram
          rows={draftDiagramRows}
          titleSlot={<h3 className={styles.diagramTitle}>{t('hqRate.diagram.title')}</h3>}
          editable
          onRowsChange={setDraftDiagramRows}
          action={
            <button type="button" className={styles.saveButton} onClick={() => void saveDiagramRows(draftDiagramRows)}>
              {t('hqRate.diagram.save')}
            </button>
          }
        />
      </div>

      {/* 국가별 설정 안내 카드 (호박색 테두리) */}
      <div className={styles.guideCard}>
        <h3 className={styles.guideTitle}>{t('hqRate.guide.title')}</h3>
        <p className={styles.guideDesc}>{t('hqRate.guide.desc')}</p>
      </div>

      {/* 국가별 배분율 설정 — 제목 좌측 + 툴바/CTA 우측(Figma 배치) */}
      <DataTable
        title={t('hqRate.section')}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        searchKeys={['country', 'code', 'status', 'event']}
        filterKeys={['country', 'event', 'status']}
        exportUrl="/api/hq/distribution-rates/export"
        toolbarExtra={
          <button
            type="button"
            className={styles.addButton}
            onClick={() => {
              setSelectedRow(undefined)
              setModalMode('add')
            }}
          >
            {t('hqRate.btn.add')}
          </button>
        }
        fill
        mutedText
        headerBar
        tallToolbar
        paginated
        pageSize={10}
        onRowClick={(id) => {
          const sourceRow = rawRows.find((item) => (item.countryCode ?? item.code) === id)
          setSelectedRow(sourceRow)
          setModalMode('edit')
        }}
      />

      {/* 국가별 배분율 추가/수정 모달 — 사이드바 제외 콘텐츠 영역 중앙 */}
      {modalMode && (
        <RateFormModal
          variant={modalMode}
          data={makeModalData(selectedRow)}
          countries={countries}
          diagramRows={diagramRows}
          onClose={() => setModalMode(null)}
          onSubmit={(payload) => saveCountryRate(modalMode, payload)}
          onDelete={(countryCode) => deleteCountryRate(countryCode)}
        />
      )}
    </div>
  )
}

/** 이벤트 enum → 강조 여부 (적용중만 초록 강조, 미적용은 일반 굵은 셀) */
const EVENT_CLASS: Record<EventStatus, boolean> = {
  applied: true,
  none: false,
}
