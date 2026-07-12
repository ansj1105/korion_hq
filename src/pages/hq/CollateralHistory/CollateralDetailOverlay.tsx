import { useTranslation } from '../../../i18n'
import { useCollateralDetail } from './useCollateralDetail'
import styles from './CollateralDetailOverlay.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

/*
 * CollateralDetailOverlay — 충전/해제 내역 행 클릭 시 뜨는 상세 폼 (Figma 81:29506)
 * ------------------------------------------------------------------
 * 별도 라우트 없이 open prop으로만 제어. 사이드바를 제외한 콘텐츠 영역 중앙에 노출
 * (RequestDetailOverlay와 동일한 backdrop 방식). backdrop 클릭 또는 '닫기' 버튼으로 닫힘.
 * 필드는 전부 읽기 전용 표시이고, '메모 수정' 버튼은 동작 협의 전이라 UI만(1번 규칙).
 */
export default function CollateralDetailOverlay({ open, onClose }: Props) {
  const { t } = useTranslation()
  const { fields, memo } = useCollateralDetail()

  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {/* stopPropagation: 패널 안 클릭이 backdrop 클릭으로 버블링되지 않도록 */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('hqCollateral.detail.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2 className={styles.title}>{t('hqCollateral.detail.title')}</h2>
            <p className={styles.subtitle}>{t('hqCollateral.detail.desc')}</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            {t('common.close')}
          </button>
        </div>

        {/* 읽기 전용 필드 12개 — 2열 그리드 */}
        <div className={styles.fieldGrid}>
          {fields.map((f) => (
            <div key={f.label} className={styles.field}>
              <span className={styles.fieldLabel}>{f.label}</span>
              <span className={styles.fieldValue}>{f.value}</span>
            </div>
          ))}
        </div>

        {/* 처리 사유 / 관리자 메모 박스 */}
        <div className={styles.memoBox}>
          <h3 className={styles.memoTitle}>{t('hqCollateral.detail.memo.title')}</h3>
          <p className={styles.memoBody}>{memo}</p>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.editMemoButton}>
            {t('hqCollateral.detail.btn.editMemo')}
          </button>
        </div>
      </div>
    </div>
  )
}
