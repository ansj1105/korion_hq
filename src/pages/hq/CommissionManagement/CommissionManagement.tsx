import { useEffect, useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import { useCommission, type FeeRow } from './useCommission'
import CommissionFeeModal from './CommissionFeeModal'
import styles from './CommissionManagement.module.css'

/*
 * HqCommissionManagement (page) — 본사어드민 · 수수료/정산 · 수수료 관리
 * ------------------------------------------------------------------
 * 기본/국가별/결제 방식별/자산별 수수료 정책을 관리하는 화면 (Figma 81:22758).
 * KPI 4개 + 전체국가 이벤트 카드 2개 + "국가별 수수료 설정" 테이블.
 * "국가 수수료 추가" 클릭 → 추가 모드 모달 / 행(상세) 클릭 → 수정 모드 모달.
 * 토글·입력·저장 동작은 협의 전이라 UI 상태만(CLAUDE.md 1번).
 */
export default function HqCommissionManagement() {
  const { t } = useTranslation()
  const { kpis, columns, rows: rawRows, countries, statusLabel, globalFee, globalEventEnabled, globalScope, makeModalData, editLabel, deleteLabel, saveFee, deleteFee, isLoading, error } = useCommission()
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)
  const [selectedCode, setSelectedCode] = useState<string | null>(null)
  const [eventEnabled, setEventEnabled] = useState(globalEventEnabled)
  const [scope, setScope] = useState<'COUNTRY_ALL' | 'LEADER_ONLY'>(globalScope)

  useEffect(() => {
    setEventEnabled(globalEventEnabled)
    setScope(globalScope)
  }, [globalEventEnabled, globalScope])

  // Figma에서 굵게 표시되는 셀(국가코드~적용 코인수)만 감싸는 헬퍼
  const strong = (value: string) => <span className={styles.cellStrong}>{value}</span>
  const selectedRow = rawRows.find((row) => (row.countryCode ?? row.code) === selectedCode)

  const openEdit = (row: FeeRow) => {
    setSelectedCode(row.countryCode ?? row.code)
    setModalMode('edit')
  }

  const rows: TableRow[] = rawRows.map((r) => ({
    id: r.countryCode ?? r.code,
    cells: {
      no: r.no,
      country: r.country,
      code: strong(r.code),
      baseFee: strong(r.baseFee),
      online: strong(r.online),
      offline: strong(r.offline),
      event: strong(r.event),
      actualFee: strong(r.actualFee),
      coinCount: strong(r.coinCount),
      status: <Badge accent={r.statusAccent ?? 'green'} size="md" shape="rect">{statusLabel[r.status]}</Badge>,
      action: (
        <div onClick={(event) => event.stopPropagation()}>
          <ActionBadges
            labels={[editLabel, deleteLabel]}
            size="md"
            shape="rect"
            onLabelClick={(label) => {
              if (label === editLabel) {
                openEdit(r)
                return
              }
              void deleteFee(r.countryCode ?? r.code)
            }}
          />
        </div>
      ),
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqCommission.title')}>
        <p className={styles.subtitle}>{t('hqCommission.subtitle')}</p>
      </PageHeader>

      {/* KPI 4개 — 감싸는 박스 없이 4열 독립 카드 */}
      <div className={styles.kpiGrid}>
        {kpis.map((k) => (
          <div key={k.id} className={styles.kpiCard}>
            <span className={styles.kpiLabel}>{k.label}</span>
            <span className={styles.kpiValue}>{k.value}</span>
            <span className={styles.kpiNote}>{k.note}</span>
          </div>
        ))}
      </div>

      {/* 전체국가 이벤트/프로모션 카드 2개 (설정 + 유의사항) */}
      <div className={styles.globalRow}>
        <div className={styles.globalCard}>
          <div className={styles.globalHead}>
            <span className={styles.globalLabel}>{t('hqCommission.global.eventPromo')}</span>
            <button
              type="button"
              className={eventEnabled ? styles.toggleOn : styles.toggleOff}
              aria-pressed={eventEnabled}
              onClick={() => setEventEnabled((current) => !current)}
            >
              {eventEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
          <div className={styles.feeInputRow}>
            <span className={styles.feeInput}>{globalFee}</span>
            <span className={styles.feeUnit}>%</span>
          </div>
          <span className={styles.globalLabel}>{t('hqCommission.global.scopeLabel')}</span>
          {/* 적용 범위 알약 — Figma상 우측(리더 소속만)만 활성 톤. 표시 전용 */}
          <div className={styles.scopeRow}>
            <button
              type="button"
              className={scope === 'COUNTRY_ALL' ? styles.scopePill : `${styles.scopePill} ${styles.scopePillDim}`}
              aria-pressed={scope === 'COUNTRY_ALL'}
              onClick={() => setScope('COUNTRY_ALL')}
            >
              {t('hqCommission.global.scopeAll')}
            </button>
            <button
              type="button"
              className={scope === 'LEADER_ONLY' ? styles.scopePill : `${styles.scopePill} ${styles.scopePillDim}`}
              aria-pressed={scope === 'LEADER_ONLY'}
              onClick={() => setScope('LEADER_ONLY')}
            >
              {t('hqCommission.global.scopeLeader')}
            </button>
          </div>
        </div>

        <div className={styles.globalCard}>
          <span className={styles.globalLabel}>{t('hqCommission.global.eventPromo')}</span>
          <ol className={styles.ruleList}>
            <li>{t('hqCommission.global.rule1')}</li>
            <li>{t('hqCommission.global.rule2')}</li>
          </ol>
        </div>
      </div>

      {/* 국가별 수수료 설정 — 제목 좌측 + 툴바/CTA 우측(Figma 배치) */}
      <DataTable
        title={t('hqCommission.section')}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        searchKeys={['country', 'code', 'status']}
        filterKeys={['country', 'status']}
        exportUrl="/api/hq/commission-fees/export"
        toolbarExtra={
          <button
            type="button"
            className={styles.addButton}
            onClick={() => {
              setSelectedCode(null)
              setModalMode('add')
            }}
          >
            {t('hqCommission.btn.addCountryFee')}
          </button>
        }
        fill
        mutedText
        headerBar
        tallToolbar
        paginated
        pageSize={10}
        onRowClick={(id) => {
          const row = rawRows.find((item) => (item.countryCode ?? item.code) === id)
          if (row) openEdit(row)
        }}
      />
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* 국가 수수료 추가/수정 모달 — 사이드바 제외 콘텐츠 영역 중앙 */}
      {modalMode && (
        <CommissionFeeModal
          variant={modalMode}
          data={makeModalData(modalMode === 'edit' ? selectedRow : undefined)}
          countries={countries}
          onClose={() => setModalMode(null)}
          onSubmit={(payload) => saveFee(modalMode, payload)}
        />
      )}
    </div>
  )
}
