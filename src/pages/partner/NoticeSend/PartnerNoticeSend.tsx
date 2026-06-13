import { useState, type CSSProperties } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import Button from '../../../components/atoms/Button'
import MetricCard from '../../../components/molecules/MetricCard'
import { useTranslation } from '../../../i18n'
import { usePartnerNoticeSend } from './usePartnerNoticeSend'
import styles from './PartnerNoticeSend.module.css'

interface ChipDef {
  key: string
  labelKey: string
  chip: string
  solid?: boolean
}

/* 파트너 대상 필터 — 본인이 유치한 가맹점만 대상이라 칩 1개(가맹점) */
const TARGET_CHIPS: ChipDef[] = [{ key: 'merchant', labelKey: 'notice.send.target.merchant', chip: '#2a8bff' }]

/* 발송 옵션 칩 — 즉시(청록) / 예약(보라) */
const OPTION_CHIPS: ChipDef[] = [
  { key: 'immediate', labelKey: 'notice.send.option.immediate', chip: '#24e6b8', solid: true },
  { key: 'scheduled', labelKey: 'notice.send.option.scheduled', chip: '#7c5cff' },
]

/*
 * PartnerNoticeSend (page) — 파트너 · 알림/공지 · 공지 보내기
 * ------------------------------------------------------------------
 * 리더 공지 보내기와 동일 플로우(작성 폼 → 확인 모달 → 토스트)지만
 * 파트너는 KPI 3개(발송 가능 파트너 없음), 대상 필터가 '가맹점' 1개뿐.
 * 폼 UI 텍스트는 리더와 동일 문구라 notice.send.* 키를 그대로 재사용.
 */
export default function PartnerNoticeSend() {
  const { t } = useTranslation()
  const { metrics } = usePartnerNoticeSend()

  const [target, setTarget] = useState('merchant')
  const [method, setMethod] = useState('immediate')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sent, setSent] = useState(false)

  const renderChip = (c: ChipDef, selected: boolean, onClick: () => void) => (
    <button
      key={c.key}
      type="button"
      onClick={onClick}
      style={{ '--chip': c.chip } as CSSProperties}
      className={`${styles.chip} ${c.solid ? styles.chipSolid : styles.chipTranslucent} ${
        selected ? styles.chipActive : ''
      }`}
    >
      {t(c.labelKey)}
    </button>
  )

  return (
    <div className={styles.page}>
      <PageHeader title={t('notice.send.title')} />

      {/* 상단 KPI 카드 3개 */}
      <div className={styles.metrics}>
        {metrics.map((m) => (
          <MetricCard key={m.id} {...m} />
        ))}
      </div>

      {/* 공지 작성 폼 */}
      <section className={styles.formCard}>
        <h2 className={styles.cardTitle}>{t('notice.send.cardTitle')}</h2>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('notice.send.targetLabel')}</span>
          <div className={styles.chips}>
            {TARGET_CHIPS.map((c) => renderChip(c, target === c.key, () => setTarget(c.key)))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('notice.send.titleLabel')}</span>
          <input className={styles.input} type="text" placeholder={t('notice.send.titlePlaceholder')} />
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('notice.send.typeLabel')}</span>
          <input className={styles.input} type="text" placeholder={t('notice.send.typePlaceholder')} />
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('notice.send.contentLabel')}</span>
          <textarea className={styles.textarea} placeholder={t('notice.send.contentPlaceholder')} />
        </div>

        <div className={styles.optionRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('notice.send.optionLabel')}</span>
            <div className={styles.chips}>
              {OPTION_CHIPS.map((c) => renderChip(c, method === c.key, () => setMethod(c.key)))}
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('notice.send.scheduleLabel')}</span>
            <input
              className={`${styles.schedule} ${method === 'immediate' ? styles.scheduleDisabled : ''}`}
              type="text"
              placeholder={t('notice.send.schedulePlaceholder')}
              disabled={method === 'immediate'}
            />
          </div>
        </div>

        <div className={styles.buttons}>
          <Button variant="secondary">{t('notice.send.cancel')}</Button>
          <Button variant="secondary">{t('notice.send.draft')}</Button>
          <Button variant="primary" onClick={() => setConfirmOpen(true)}>
            {t('notice.send.send')}
          </Button>
        </div>
      </section>

      {/* 확인 모달 */}
      {confirmOpen && (
        <div className={styles.overlay} onClick={() => setConfirmOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{t('notice.send.modal.title')}</h3>
            <p className={styles.modalDesc}>{t('notice.send.modal.desc')}</p>
            <div className={styles.modalButtons}>
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                {t('notice.send.modal.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setConfirmOpen(false)
                  setSent(true)
                }}
              >
                {t('notice.send.modal.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 완료 토스트 */}
      {sent && <div className={styles.toast}>{t('notice.send.toast')}</div>}
    </div>
  )
}
