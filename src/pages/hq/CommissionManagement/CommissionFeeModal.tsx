import { useTranslation } from '../../../i18n'
import type { FeeModalData } from './useCommission'
import styles from './CommissionFeeModal.module.css'

interface CommissionFeeModalProps {
  /** add: "국가 수수료 추가" CTA(하단 추가하기) / edit: 행(상세) 클릭(하단 수정하기) */
  variant: 'add' | 'edit'
  data: FeeModalData
  /** 닫기(취소/배경 클릭) — 추가/수정 동작은 협의 전이라 UI만 */
  onClose: () => void
}

/*
 * CommissionFeeModal — "수수료 설정/추가" 모달 (Figma 81:22758 내 Modal Card, 780×552)
 * ------------------------------------------------------------------
 * 특정 국가에만 별도 수수료를 적용하는 폼. 좌측 네브바를 제외한 콘텐츠 영역 기준
 * 가운데 정렬(CountryFormOverlay와 동일 backdrop 방식). Figma에 추가하기/수정하기
 * 버튼이 함께 있어 CTA 진입(add)/행 진입(edit) 두 모드로 나눠 하단 버튼만 바꾼다.
 * 입력/토글/선택 동작은 협의 전이라 시안 예시값을 채운 UI 상태만 구현.
 */
export default function CommissionFeeModal({ variant, data, onClose }: CommissionFeeModalProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {/* stopPropagation: 패널 안 클릭이 backdrop 클릭으로 버블링되지 않도록 */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('hqCommission.modal.title')}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더: 제목/설명(좌) + 이벤트 적용중 배지 · ON 토글(우) */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t('hqCommission.modal.title')}</h2>
            <p className={styles.desc}>{t('hqCommission.modal.desc')}</p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.eventBadge}>{t('hqCommission.modal.eventActive')}</span>
            <span className={styles.toggleOn} aria-hidden>
              ON
            </span>
          </div>
        </div>

        <div className={styles.body}>
          {/* 좌측: 국가 선택 + 이벤트/적용 범위 + 수수료 입력 3개 */}
          <div className={styles.formCol}>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqCommission.modal.countrySelect')}</span>
              {/* 셀렉트 모양(표시 전용) — Figma 334×46 + 우측 ▼ */}
              <span className={styles.selectBox}>
                {data.country}
                <span className={styles.selectArrow} aria-hidden />
              </span>
            </div>

            <div className={styles.field}>
              <div className={styles.eventRow}>
                <span className={styles.fieldLabel}>{t('hqCommission.modal.eventPromo')}</span>
                <span className={styles.toggleOn} aria-hidden>
                  ON
                </span>
              </div>
              <div className={styles.feeInputRow}>
                <span className={styles.feeInput}>{data.eventFee}</span>
                <span className={styles.feeUnit}>%</span>
              </div>
            </div>

            {/* 적용 범위 알약 — Figma상 우측(리더 소속만)만 활성 톤. 표시 전용 */}
            <div className={styles.scopeRow}>
              <span className={`${styles.scopePill} ${styles.scopePillDim}`}>{t('hqCommission.modal.scopeCountryAll')}</span>
              <span className={styles.scopePill}>{t('hqCommission.modal.scopeLeaderOnly')}</span>
            </div>

            <div className={styles.feeTriple}>
              {[
                { label: t('hqCommission.modal.baseFee'), value: data.baseFee },
                { label: t('hqCommission.modal.online'), value: data.onlineFee },
                { label: t('hqCommission.modal.offline'), value: data.offlineFee },
              ].map((f) => (
                <div key={f.label} className={styles.field}>
                  <span className={styles.fieldLabel}>{f.label}</span>
                  <div className={styles.feeInputRow}>
                    <span className={styles.feeInput}>{f.value}</span>
                    <span className={styles.feeUnit}>%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 우측: 코인별 수수료 목록 */}
          <div className={styles.coinCol}>
            <div className={styles.coinHead}>
              <span className={styles.fieldLabel}>{t('hqCommission.modal.coinFee')}</span>
              <button type="button" className={styles.coinAddButton}>
                {t('hqCommission.modal.coinAdd')}
              </button>
            </div>
            <div className={styles.coinBox}>
              {data.coins.map((c) => (
                <div key={c.name} className={styles.coinRow}>
                  <span className={styles.coinName}>{c.name}</span>
                  <span className={styles.coinFee}>{c.fee}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 하단 버튼 — add: [취소·추가하기] / edit: [취소·수정하기] */}
        <div className={styles.footer}>
          <button type="button" className={styles.ghostButton} onClick={onClose}>
            {t('hqCommission.modal.cancel')}
          </button>
          <button type="button" className={styles.submitButton}>
            {variant === 'add' ? t('hqCommission.modal.add') : t('hqCommission.modal.edit')}
          </button>
        </div>
      </div>
    </div>
  )
}
