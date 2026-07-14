import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import type { SettlementHoldRow } from './useRiskSettlementHold'
import styles from '../RiskFakeApplications/RiskFakeApplicationDetailOverlay.module.css'

interface Props {
  row: SettlementHoldRow | null
  onClose: () => void
}

export default function RiskSettlementHoldDetailOverlay({ row, onClose }: Props) {
  const { t } = useTranslation()
  if (!row) return null

  const fields = [
    ['hqRiskSettlementHold.detail.txNo', row.txNo],
    ['hqRiskSettlementHold.detail.occurredAt', row.occurredAt],
    ['hqRiskSettlementHold.detail.targetType', row.targetType],
    ['hqRiskSettlementHold.detail.targetCode', row.targetCode],
    ['hqRiskSettlementHold.detail.targetName', row.targetName],
    ['hqRiskSettlementHold.detail.merchantCode', row.merchantCode],
    ['hqRiskSettlementHold.detail.merchantName', row.merchantName],
    ['hqRiskSettlementHold.detail.country', row.country],
    ['hqRiskSettlementHold.detail.amount', row.amount],
    ['hqRiskSettlementHold.detail.fee', row.fee],
    ['hqRiskSettlementHold.detail.heldAmount', row.heldAmount],
    ['hqRiskSettlementHold.detail.sourceStatus', row.sourceStatus],
    ['hqRiskSettlementHold.detail.settlementStatus', row.settlementStatus],
    ['hqRiskSettlementHold.detail.riskScore', String(row.riskScore)],
  ] as const

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <section className={styles.panel} onClick={(event) => event.stopPropagation()} aria-label={t('hqRiskSettlementHold.detail.title')}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t('hqRiskSettlementHold.detail.title')}</h2>
            <p className={styles.subtitle}>{row.txNo} / {row.targetCode}</p>
          </div>
          <Badge accent={row.riskAccent} size="md" shape="rect">
            {row.riskScore}
          </Badge>
        </div>

        <div className={styles.reasonBox}>
          <span className={styles.sectionLabel}>{t('hqRiskSettlementHold.detail.reasons')}</span>
          <div className={styles.badges}>
            {row.reasons.map((reason) => (
              <Badge key={reason} accent="orange" size="md" shape="rect">
                {t(reason)}
              </Badge>
            ))}
          </div>
        </div>

        <div className={styles.grid}>
          {fields.map(([labelKey, value]) => (
            <label key={labelKey} className={styles.field}>
              <span>{t(labelKey)}</span>
              <input value={value || '-'} readOnly />
            </label>
          ))}
        </div>

        <div className={styles.memoGrid}>
          <label className={styles.field}>
            <span>{t('hqRiskSettlementHold.detail.holdReason')}</span>
            <textarea value={row.holdReason || '-'} readOnly />
          </label>
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose}>{t('common.close')}</button>
        </div>
      </section>
    </div>
  )
}
