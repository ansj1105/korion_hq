import { useState, type CSSProperties } from 'react'
import PageHeader from '../../components/organisms/PageHeader'
import Button from '../../components/atoms/Button'
import MetricCard from '../../components/molecules/MetricCard'
import { useTranslation } from '../../i18n'
import { useNoticeSend } from './useNoticeSend'
import styles from './NoticeSend.module.css'

/** 칩 한 개의 정적 정의 (라벨 키 + 색) */
interface ChipDef {
  key: string
  labelKey: string
  chip: string
}

/* 대상 필터 칩 — Figma 색 그대로 (전체:청록 / 파트너:보라 / 가맹점:파랑 / 특정:골드) */
const TARGET_CHIPS: ChipDef[] = [
  { key: 'all', labelKey: 'notice.send.target.all', chip: '#24e6b8' },
  { key: 'partner', labelKey: 'notice.send.target.partner', chip: '#7c5cff' },
  { key: 'merchant', labelKey: 'notice.send.target.merchant', chip: '#2a8bff' },
  { key: 'specific', labelKey: 'notice.send.target.specific', chip: '#f6c85a' },
]

/* 발송 옵션 칩 — 즉시(청록) / 예약(보라) */
const OPTION_CHIPS: ChipDef[] = [
  { key: 'immediate', labelKey: 'notice.send.option.immediate', chip: '#24e6b8' },
  { key: 'scheduled', labelKey: 'notice.send.option.scheduled', chip: '#7c5cff' },
]

/*
 * NoticeSend (page) — 알림 / 공지 · 공지 보내기
 * ------------------------------------------------------------------
 * 플로우: 작성 폼 → [즉시 발송] → 확인 모달 → [발송하기] → 완료 토스트.
 * 데이터(상단 KPI)는 useNoticeSend 훅, 폼의 UI 텍스트는 t()로 출력.
 * 입력/선택은 UI 상태만 처리(백엔드 연동 없음 — 작업 범위 밖).
 */
export default function NoticeSend() {
  const { t } = useTranslation()
  const { metrics } = useNoticeSend()

  const [target, setTarget] = useState('all')
  const [method, setMethod] = useState('immediate')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sent, setSent] = useState(false)

  // 칩 한 개 렌더 (선택 상태에 따라 링 강조)
  const renderChip = (c: ChipDef, selected: boolean, onClick: () => void) => (
    <button
      key={c.key}
      type="button"
      onClick={onClick}
      style={{ '--chip': c.chip } as CSSProperties}
      className={`${styles.chip} ${styles.chipTranslucent} ${
        selected ? styles.chipActive : ''
      }`}
    >
      {t(c.labelKey)}
    </button>
  )

  return (
    <div className={styles.page}>
      <PageHeader title={t('notice.send.title')} />

      {/* 상단 KPI 카드 */}
      <div className={styles.metrics}>
        {metrics.map((m) => (
          <MetricCard key={m.id} {...m} />
        ))}
      </div>

      {/* 공지 작성 폼 */}
      <section className={styles.formCard}>
        <h2 className={styles.cardTitle}>{t('notice.send.cardTitle')}</h2>

        {/* 대상 필터 */}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('notice.send.targetLabel')}</span>
          <div className={styles.chips}>
            {TARGET_CHIPS.map((c) => renderChip(c, target === c.key, () => setTarget(c.key)))}
          </div>
        </div>

        {/* 공지 제목 */}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('notice.send.titleLabel')}</span>
          <input className={styles.input} type="text" placeholder={t('notice.send.titlePlaceholder')} />
        </div>

        {/* 공지 유형 */}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('notice.send.typeLabel')}</span>
          <input className={styles.input} type="text" placeholder={t('notice.send.typePlaceholder')} />
        </div>

        {/* 공지 내용 */}
        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('notice.send.contentLabel')}</span>
          <textarea className={styles.textarea} placeholder={t('notice.send.contentPlaceholder')} />
        </div>

        {/* 발송 옵션(좌) + 예약 발송 시간(우) */}
        <div className={styles.optionRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('notice.send.optionLabel')}</span>
            <div className={styles.chips}>
              {OPTION_CHIPS.map((c) => renderChip(c, method === c.key, () => setMethod(c.key)))}
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('notice.send.scheduleLabel')}</span>
            {/* 즉시 발송 선택 시 예약 시간 입력은 비활성 */}
            <input
              className={`${styles.schedule} ${method === 'immediate' ? styles.scheduleDisabled : ''}`}
              type="text"
              placeholder={t('notice.send.schedulePlaceholder')}
              disabled={method === 'immediate'}
            />
          </div>
        </div>

        {/* 하단 버튼 */}
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
