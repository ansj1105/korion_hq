import { useTranslation } from '../../../i18n'
import DistributionDiagram, { type DiagramRow } from './DistributionDiagram'
import type { RateModalData } from './useRateSetting'
import styles from './RateFormModal.module.css'

interface RateFormModalProps {
  /** add: "국가별 배분율 추가" CTA(하단 추가하기) / edit: 행(상세) 클릭(하단 수정하기) */
  variant: 'add' | 'edit'
  data: RateModalData
  diagramRows: DiagramRow[]
  /** 닫기(취소/배경 클릭) — 추가/수정 동작은 협의 전이라 UI만 */
  onClose: () => void
}

/*
 * RateFormModal — "국가별 배분율 설정/추가" 모달 (Figma 81:23083 내 Modal Card, 855×602)
 * ------------------------------------------------------------------
 * 특정 국가에만 별도 배분율을 적용하는 폼. 좌측 네브바를 제외한 콘텐츠 영역 기준
 * 가운데 정렬(수수료 관리 모달과 동일 backdrop 방식). Figma에 추가하기/수정하기 버튼이
 * 함께 있어 CTA 진입(add)/행 진입(edit) 두 모드로 나눠 하단 버튼만 바꾼다.
 * 배분 다이어그램은 페이지와 동일한 DistributionDiagram을 재사용(표시 전용).
 */
export default function RateFormModal({ variant, data, diagramRows, onClose }: RateFormModalProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {/* stopPropagation: 패널 안 클릭이 backdrop 클릭으로 버블링되지 않도록 */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('hqRate.modal.title')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더: 제목/설명(좌) + 이벤트 적용중 배지 · ON 토글(우) */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t('hqRate.modal.title')}</h2>
            <p className={styles.desc}>{t('hqRate.modal.desc')}</p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.eventBadge}>{t('hqRate.modal.eventActive')}</span>
            <span className={styles.toggleOn} aria-hidden>
              ON
            </span>
          </div>
        </div>

        {/* 국가 선택 — 셀렉트 모양(표시 전용, Figma 334×46 + 우측 ▼) */}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('hqRate.modal.countrySelect')}</span>
          <span className={styles.selectBox}>
            {data.country}
            <span className={styles.selectArrow} aria-hidden />
          </span>
        </div>

        {/* 기본 배분 구조 설정 — 페이지 다이어그램 재사용 (제목이 역할 배지와 한 줄) */}
        <div className={styles.diagramSection}>
          <DistributionDiagram
            rows={diagramRows}
            titleSlot={<h3 className={styles.diagramTitle}>{t('hqRate.diagram.title')}</h3>}
          />
        </div>

        {/* 관리자 메모 (표시 전용, Figma 330×46) */}
        <div className={`${styles.field} ${styles.memoField}`}>
          <span className={styles.fieldLabel}>{t('hqRate.modal.adminMemo')}</span>
          <span className={styles.memoBox}>{data.memo}</span>
        </div>

        {/* 하단 버튼 — add: [취소·추가하기] / edit: [취소·수정하기] */}
        <div className={styles.footer}>
          <button type="button" className={styles.ghostButton} onClick={onClose}>
            {t('hqRate.modal.cancel')}
          </button>
          <button type="button" className={styles.submitButton}>
            {variant === 'add' ? t('hqRate.modal.add') : t('hqRate.modal.edit')}
          </button>
        </div>
      </div>
    </div>
  )
}
