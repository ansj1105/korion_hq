import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import { useCommission, type FeeStatus } from './useCommission'
import CommissionFeeModal from './CommissionFeeModal'
import styles from './CommissionManagement.module.css'

/** 상태 enum → 표시 색 클래스 (활성=초록 / 대기=호박) */
const STATUS_CLASS: Record<FeeStatus, string> = {
  active: styles.stActive,
  pending: styles.stPending,
}

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
  const { kpis, columns, rows: rawRows, statusLabel, globalFee, modalData, detailLabel } = useCommission()
  // 모달 모드 — null: 닫힘 / add: 국가 수수료 추가 / edit: 행 상세(수정)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null)

  // Figma에서 굵게 표시되는 셀(국가코드~적용 코인수)만 감싸는 헬퍼
  const strong = (value: string) => <span className={styles.cellStrong}>{value}</span>

  const rows: TableRow[] = rawRows.map((r) => ({
    id: r.code,
    cells: {
      country: r.country,
      code: strong(r.code),
      baseFee: strong(r.baseFee),
      online: strong(r.online),
      offline: strong(r.offline),
      event: strong(r.event),
      actualFee: strong(r.actualFee),
      coinCount: strong(r.coinCount),
      status: <span className={STATUS_CLASS[r.status]}>{statusLabel[r.status]}</span>,
      action: <ActionBadges labels={[detailLabel]} accentByLabel={{}} size="xs" solid equalWidth />,
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
            {/* 토글 — Figma는 비트맵(초록 ON 스위치)이라 CSS로 재현. 표시 전용 */}
            <span className={styles.toggleOn} aria-hidden>
              ON
            </span>
          </div>
          <div className={styles.feeInputRow}>
            <span className={styles.feeInput}>{globalFee}</span>
            <span className={styles.feeUnit}>%</span>
          </div>
          <span className={styles.globalLabel}>{t('hqCommission.global.scopeLabel')}</span>
          {/* 적용 범위 알약 — Figma상 우측(리더 소속만)만 활성 톤. 표시 전용 */}
          <div className={styles.scopeRow}>
            <span className={`${styles.scopePill} ${styles.scopePillDim}`}>{t('hqCommission.global.scopeAll')}</span>
            <span className={styles.scopePill}>{t('hqCommission.global.scopeLeader')}</span>
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
        toolbarExtra={
          <button type="button" className={styles.addButton} onClick={() => setModalMode('add')}>
            {t('hqCommission.btn.addCountryFee')}
          </button>
        }
        fill
        mutedText
        headerBar
        tallToolbar
        onRowClick={() => setModalMode('edit')}
      />

      {/* 국가 수수료 추가/수정 모달 — 사이드바 제외 콘텐츠 영역 중앙 */}
      {modalMode && <CommissionFeeModal variant={modalMode} data={modalData} onClose={() => setModalMode(null)} />}
    </div>
  )
}
