import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import type { BlacklistRow } from './useRiskBlacklist'
import styles from '../RiskFakeApplications/RiskFakeApplicationDetailOverlay.module.css'

interface Props {
  row: BlacklistRow | null
  onClose: () => void
}

export default function RiskBlacklistDetailOverlay({ row, onClose }: Props) {
  const { t } = useTranslation()
  if (!row) return null

  const fields = [
    ['hqRiskBlacklist.detail.targetType', row.targetType],
    ['hqRiskBlacklist.detail.targetCode', row.targetCode],
    ['hqRiskBlacklist.detail.targetName', row.targetName],
    ['hqRiskBlacklist.detail.country', row.country],
    ['hqRiskBlacklist.detail.parentCode', row.parentCode],
    ['hqRiskBlacklist.detail.parentName', row.parentName],
    ['hqRiskBlacklist.detail.email', row.email],
    ['hqRiskBlacklist.detail.phone', row.phone],
    ['hqRiskBlacklist.detail.wallet', row.walletRaw],
    ['hqRiskBlacklist.detail.entityStatus', row.entityStatus],
    ['hqRiskBlacklist.detail.accessStatus', row.accessStatus],
    ['hqRiskBlacklist.detail.requestStatus', row.requestStatus],
    ['hqRiskBlacklist.detail.latestAt', row.latestAt],
    ['hqRiskBlacklist.detail.riskScore', String(row.riskScore)],
  ] as const

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <section className={styles.panel} onClick={(event) => event.stopPropagation()} aria-label={t('hqRiskBlacklist.detail.title')}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t('hqRiskBlacklist.detail.title')}</h2>
            <p className={styles.subtitle}>{row.targetCode} / {row.targetName}</p>
          </div>
          <Badge accent={row.riskAccent} size="md" shape="rect">
            {row.riskScore}
          </Badge>
        </div>

        <div className={styles.reasonBox}>
          <span className={styles.sectionLabel}>{t('hqRiskBlacklist.detail.reasons')}</span>
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
            <span>{t('hqRiskBlacklist.detail.reason')}</span>
            <textarea value={row.reason || '-'} readOnly />
          </label>
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose}>{t('common.close')}</button>
        </div>
      </section>
    </div>
  )
}
