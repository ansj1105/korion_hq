import { useTranslation } from '../../../i18n'
import { useCountryForm } from './useCountryForm'
import styles from './CountryFormOverlay.module.css'

interface Props {
  /** add: "국가 추가" 등록 폼(Figma 81:29739) / detail: 행 클릭 "국가 상세정보" 폼(Figma 81:29865) */
  variant: 'add' | 'detail'
  open: boolean
  onClose: () => void
}

/*
 * CountryFormOverlay — 국가 등록/상세 폼 오버레이
 * ------------------------------------------------------------------
 * 두 시안(81:29739 국가 추가 / 81:29865 국가 상세정보)은 제목과 하단 버튼만 다르고
 * 필드 구성이 같아 variant 하나로 처리한다.
 * 별도 라우트 없이 open prop으로만 제어. 사이드바를 제외한 콘텐츠 영역 중앙에 노출
 * (CollateralDetailOverlay와 동일한 backdrop 방식). backdrop 클릭 또는 '취소'로 닫힘.
 * 입력/토글/수정·저장 동작은 협의 전이라 시안의 예시값을 채운 UI 상태만 구현(CLAUDE.md 1번).
 */
export default function CountryFormOverlay({ variant, open, onClose }: Props) {
  const { t } = useTranslation()
  const { fields, toggles, memo } = useCountryForm()

  if (!open) return null

  const title = variant === 'add' ? t('hqSystemCountry.btn.addCountry') : t('hqSystemCountry.detail.title')

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {/* stopPropagation: 패널 안 클릭이 backdrop 클릭으로 버블링되지 않도록 */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.headerText}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{t('hqSystemCountry.add.desc')}</p>
        </div>

        {/* 입력 필드 8개 — 2열 그리드 (시안 예시값 표시) */}
        <div className={styles.fieldGrid}>
          {fields.map((f) => (
            <div key={f.label} className={styles.field}>
              <span className={styles.fieldLabel}>{f.label}</span>
              <span className={styles.fieldValue}>{f.value}</span>
            </div>
          ))}

          {/* 결제 허용 / 오프라인 결제 허용 토글 — 시안은 둘 다 ON(초록) */}
          {toggles.map((tg) => (
            <div key={tg.label} className={styles.field}>
              <span className={styles.fieldLabel}>{tg.label}</span>
              <span className={tg.on ? styles.toggleOn : styles.toggleOff} aria-hidden>
                {tg.on ? 'ON' : 'OFF'}
              </span>
            </div>
          ))}

          {/* 관리자 메모 — 첫 번째 열, 다른 인풋보다 높은 박스(Figma 300×90) */}
          <div className={`${styles.field} ${styles.memoField}`}>
            <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.memo')}</span>
            <span className={`${styles.fieldValue} ${styles.memoValue}`}>{memo}</span>
          </div>
        </div>

        {/* 하단 버튼 — add: 우측 [취소·국가 추가] / detail: 좌측 [수정] + 우측 [취소·저장] (Figma 실측 배치) */}
        <div className={variant === 'detail' ? `${styles.footer} ${styles.footerDetail}` : styles.footer}>
          {variant === 'detail' && (
            <button type="button" className={`${styles.ghostButton} ${styles.editButton}`}>
              {t('hqSystemCountry.detail.edit')}
            </button>
          )}
          <button type="button" className={styles.ghostButton} onClick={onClose}>
            {t('hqSystemCountry.add.cancel')}
          </button>
          <button type="button" className={styles.submitButton}>
            {variant === 'add' ? t('hqSystemCountry.btn.addCountry') : t('hqSystemCountry.detail.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
