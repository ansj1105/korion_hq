import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import styles from '../RiskFakeApplications/RiskFakeApplicationDetailOverlay.module.css'
import type { CountryStatsRow } from './useStatsCountry'

interface StatsCountryDetailOverlayProps {
  row: CountryStatsRow | null
  onClose: () => void
}

export default function StatsCountryDetailOverlay({ row, onClose }: StatsCountryDetailOverlayProps) {
  const { t } = useTranslation()
  if (!row) return null

  const details = [
    ['hqStatsCountry.detail.countryCode', row.countryCode],
    ['hqStatsCountry.detail.leaders', row.leaders],
    ['hqStatsCountry.detail.partners', row.partners],
    ['hqStatsCountry.detail.merchants', row.merchants],
    ['hqStatsCountry.detail.members', row.members],
    ['hqStatsCountry.detail.amount', row.amount],
    ['hqStatsCountry.detail.syncFail', row.syncFail],
    ['hqStatsCountry.detail.growth', row.growth],
  ]

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <section className={styles.panel} role="dialog" aria-modal="true" aria-label={t('hqStatsCountry.detail.title')} onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <p className={styles.subtitle}>{t('hqStatsCountry.detail.eyebrow')}</p>
            <h2 className={styles.title}>{row.countryCode}</h2>
          </div>
        </header>
        <div className={styles.grid}>
          {details.map(([labelKey, value]) => (
            <div key={labelKey} className={styles.field}>
              <span>{t(labelKey)}</span>
              <input value={value} readOnly />
            </div>
          ))}
        </div>
        <div className={styles.badges}>
          <Badge accent="cyan" size="md" shape="rect">{t('hqStatsCountry.detail.rank')} {row.rank}</Badge>
          <Badge accent={row.status === 'attention' ? 'orange' : row.status === 'active' ? 'green' : 'cyan'} size="md" shape="rect">
            {t(`hqStatsCountry.status.${row.status}`)}
          </Badge>
        </div>
        <footer className={styles.footer}>
          <button type="button" onClick={onClose}>{t('common.close')}</button>
        </footer>
      </section>
    </div>
  )
}
