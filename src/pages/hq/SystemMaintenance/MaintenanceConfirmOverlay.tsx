import { useTranslation } from '../../../i18n'
import { useMaintenanceConfirm } from './useMaintenanceConfirm'
import styles from './MaintenanceConfirmOverlay.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

/*
 * MaintenanceConfirmOverlay — 점검 범위 설정 폼의 "점검 시작" 클릭 시 뜨는
 * 재확인 모달 "서비스 점검 시작 확인" (Figma 81:29835)
 * ------------------------------------------------------------------
 * 점검 범위 설정 폼 위에 겹쳐서(z-index 상위) 사이드바를 제외한 콘텐츠 영역 중앙에 노출.
 * backdrop 클릭 또는 '취소'로 이 모달만 닫힌다(설정 폼은 유지).
 * 모달의 "점검 시작" 확정 동작은 시안이 없어 UI만 구현(CLAUDE.md 1번).
 */
export default function MaintenanceConfirmOverlay({ open, onClose }: Props) {
  const { t } = useTranslation()
  const { fields } = useMaintenanceConfirm()

  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {/* stopPropagation: 패널 안 클릭이 backdrop 클릭으로 버블링되지 않도록 */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('hqSystemMaintenance.confirm.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.headerText}>
          <h2 className={styles.title}>{t('hqSystemMaintenance.confirm.title')}</h2>
          <p className={styles.subtitle}>{t('hqSystemMaintenance.confirm.desc')}</p>
        </div>

        {/* 점검 요약 필드 7개 — 2열 그리드, 마지막 관리자는 좌측 열 단독 (시안 예시값 표시) */}
        <div className={styles.fieldGrid}>
          {fields.map((f) => (
            <div key={f.label} className={styles.field}>
              <span className={styles.fieldLabel}>{f.label}</span>
              <span className={styles.fieldValue}>{f.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            {t('hqSystemMaintenance.confirm.cancel')}
          </button>
          <button type="button" className={styles.confirmButton}>
            {t('hqSystemMaintenance.btn.start')}
          </button>
        </div>
      </div>
    </div>
  )
}
