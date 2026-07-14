import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import type { DuplicateRow } from './useRiskDuplicates'
import styles from '../RiskFakeApplications/RiskFakeApplicationDetailOverlay.module.css'

interface Props {
  duplicate: DuplicateRow | null
  onClose: () => void
}

export default function RiskDuplicateDetailOverlay({ duplicate, onClose }: Props) {
  const { t } = useTranslation()
  if (!duplicate) return null

  const fields = [
    ['hqRiskDuplicates.detail.valueType', duplicate.valueType],
    ['hqRiskDuplicates.detail.duplicateValue', duplicate.duplicateValueRaw],
    ['hqRiskDuplicates.detail.duplicateCount', String(duplicate.duplicateCount)],
    ['hqRiskDuplicates.detail.affectedRoles', duplicate.affectedRoles],
    ['hqRiskDuplicates.detail.countries', duplicate.countries],
    ['hqRiskDuplicates.detail.latestAt', duplicate.latestAt],
    ['hqRiskDuplicates.detail.riskyStatusCount', String(duplicate.riskyStatusCount)],
    ['hqRiskDuplicates.detail.riskScore', String(duplicate.riskScore)],
  ] as const

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <section className={styles.panel} onClick={(event) => event.stopPropagation()} aria-label={t('hqRiskDuplicates.detail.title')}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t('hqRiskDuplicates.detail.title')}</h2>
            <p className={styles.subtitle}>{duplicate.valueType} / {duplicate.duplicateValue}</p>
          </div>
          <Badge accent={duplicate.riskAccent} size="md" shape="rect">
            {duplicate.riskScore}
          </Badge>
        </div>

        <div className={styles.reasonBox}>
          <span className={styles.sectionLabel}>{t('hqRiskDuplicates.detail.reasons')}</span>
          <div className={styles.badges}>
            {duplicate.reasons.map((reason) => (
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
            <span>{t('hqRiskDuplicates.detail.membersSummary')}</span>
            <textarea value={duplicate.membersSummary || '-'} readOnly />
          </label>
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose}>{t('common.close')}</button>
        </div>
      </section>
    </div>
  )
}
