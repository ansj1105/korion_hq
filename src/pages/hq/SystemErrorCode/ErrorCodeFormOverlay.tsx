import { useTranslation } from '../../../i18n'
import { useErrorCodeForm } from './useErrorCodeForm'
import styles from './ErrorCodeFormOverlay.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

/*
 * ErrorCodeFormOverlay — "오류코드 추가" 버튼 클릭 시 뜨는 등록 폼 (Figma 81:29775)
 * ------------------------------------------------------------------
 * 별도 라우트 없이 open prop으로만 제어. 사이드바를 제외한 콘텐츠 영역 중앙에 노출
 * (SystemCountry의 CountryFormOverlay와 동일한 backdrop 방식). backdrop 클릭 또는 '취소'로 닫힘.
 * 국가 폼과 달리 토글 없이 입력 필드 9개 구성. 입력/추가 동작은 협의 전이라
 * 시안의 예시값을 채운 UI 상태만 구현(CLAUDE.md 1번).
 */
export default function ErrorCodeFormOverlay({ open, onClose }: Props) {
  const { t } = useTranslation()
  const { fields } = useErrorCodeForm()

  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {/* stopPropagation: 패널 안 클릭이 backdrop 클릭으로 버블링되지 않도록 */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('hqSystemErrorCode.add.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.headerText}>
          <h2 className={styles.title}>{t('hqSystemErrorCode.add.title')}</h2>
          <p className={styles.subtitle}>{t('hqSystemErrorCode.add.desc')}</p>
        </div>

        {/* 입력 필드 9개 — 2열 그리드, 마지막 관리자 메모는 좌측 열 단독 (시안 예시값 표시) */}
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
            {t('hqSystemErrorCode.add.cancel')}
          </button>
          <button type="button" className={styles.submitButton}>
            {t('hqSystemErrorCode.add.title')}
          </button>
        </div>
      </div>
    </div>
  )
}
