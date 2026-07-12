import { useState } from 'react'
import { useTranslation } from '../../../i18n'
import { useMaintenanceStart } from './useMaintenanceStart'
import MaintenanceConfirmOverlay from './MaintenanceConfirmOverlay'
import styles from './MaintenanceStartOverlay.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

/*
 * MaintenanceStartOverlay — "점검 시작" 버튼 클릭 시 뜨는 점검 범위 설정 폼 (Figma 81:29906)
 * ------------------------------------------------------------------
 * 별도 라우트 없이 open prop으로만 제어. 사이드바를 제외한 콘텐츠 영역 중앙에 노출
 * (다른 시스템 설정 오버레이와 동일한 backdrop 방식). backdrop 클릭으로 닫힘.
 * 배지 선택 상태(기능별 점검/즉시 점검 시작)는 시안 고정값 — 선택/입력/저장 동작은
 * 협의 전이라 UI 상태만 구현(CLAUDE.md 1번).
 */
export default function MaintenanceStartOverlay({ open, onClose }: Props) {
  const { t } = useTranslation()
  const { scopes, features, timing, schedule } = useMaintenanceStart()
  // "점검 시작" 클릭 → 재확인 모달(Figma 81:29835)을 이 폼 위에 겹쳐 띄움
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!open) return null

  // 선택(on)=시안 틴트 / 미선택=중립 배지 — Figma 실측 색
  const optionClass = (on: boolean) => (on ? `${styles.option} ${styles.optionOn}` : styles.option)

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {/* stopPropagation: 패널 안 클릭이 backdrop 클릭으로 버블링되지 않도록 */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('hqSystemMaintenance.start.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.headerText}>
          <h2 className={styles.title}>{t('hqSystemMaintenance.start.title')}</h2>
          <p className={styles.subtitle}>{t('hqSystemMaintenance.start.desc')}</p>
        </div>

        {/* 점검 범위 배지 3개 — 시안은 "기능별 점검"만 선택 상태 */}
        <div className={styles.optionGrid}>
          {scopes.map((o) => (
            <span key={o.label} className={optionClass(o.on)}>
              {o.label}
            </span>
          ))}
        </div>

        {/* 기능별 점검 대상 — 전부 체크(✓) 상태 */}
        <h3 className={styles.sectionLabel}>{t('hqSystemMaintenance.start.featureTargets')}</h3>
        <div className={`${styles.optionGrid} ${styles.optionGridDense}`}>
          {features.map((o) => (
            <span key={o.label} className={optionClass(o.on)}>
              {o.on ? `✓ ${o.label}` : o.label}
            </span>
          ))}
        </div>

        {/* 점검 시간 / 안내 문구 섹션 */}
        <div className={styles.scheduleHeader}>
          <h2 className={styles.title2}>{t('hqSystemMaintenance.start.schedule.title')}</h2>
          <p className={styles.subtitle}>{t('hqSystemMaintenance.start.schedule.desc')}</p>
        </div>

        {/* 즉시/예약 배지 — 시안은 "즉시 점검 시작" 선택 상태 */}
        <div className={styles.optionGrid}>
          {timing.map((o) => (
            <span key={o.label} className={optionClass(o.on)}>
              {o.label}
            </span>
          ))}
        </div>

        {/* 시작/종료 날짜·시간 — 날짜(넓게)+시간(좁게) 한 줄 (Figma 140/100) */}
        <div className={styles.timeRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqSystemMaintenance.start.field.startDate')}</span>
            <span className={`${styles.fieldValue} ${styles.dateValue}`}>{schedule.startDate}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqSystemMaintenance.start.field.startTime')}</span>
            <span className={`${styles.fieldValue} ${styles.timeValue}`}>{schedule.startTime}</span>
          </div>
        </div>
        <div className={styles.timeRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqSystemMaintenance.start.field.endDate')}</span>
            <span className={`${styles.fieldValue} ${styles.dateValue}`}>{schedule.endDate}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqSystemMaintenance.start.field.endTime')}</span>
            <span className={`${styles.fieldValue} ${styles.timeValue}`}>{schedule.endTime}</span>
          </div>
        </div>

        {/* 사용자 표시 메시지 — 전체 폭 */}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('hqSystemMaintenance.start.field.userMessage')}</span>
          <span className={styles.fieldValue}>{schedule.userMessage}</span>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.saveButton}>
            {t('hqSystemMaintenance.start.btn.saveReservation')}
          </button>
          <button type="button" className={styles.startButton} onClick={() => setConfirmOpen(true)}>
            {t('hqSystemMaintenance.btn.start')}
          </button>
        </div>

        {/* 재확인 모달 — 이 폼은 유지된 채 위에 겹침 */}
        <MaintenanceConfirmOverlay open={confirmOpen} onClose={() => setConfirmOpen(false)} />
      </div>
    </div>
  )
}
