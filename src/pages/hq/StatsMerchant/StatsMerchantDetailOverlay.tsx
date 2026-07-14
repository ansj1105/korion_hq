import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import styles from '../RiskFakeApplications/RiskFakeApplicationDetailOverlay.module.css'
import type { MerchantStatsRow } from './useStatsMerchant'

interface StatsMerchantDetailOverlayProps {
  row: MerchantStatsRow | null
  onClose: () => void
}

export default function StatsMerchantDetailOverlay({ row, onClose }: StatsMerchantDetailOverlayProps) {
  const { t } = useTranslation()
  if (!row) return null

  const details = [
    ['hqStatsMerchant.detail.merchantCode', row.merchantCode],
    ['hqStatsMerchant.detail.merchantName', row.merchantName],
    ['hqStatsMerchant.detail.partnerCode', row.partnerCode],
    ['hqStatsMerchant.detail.leaderCode', row.leaderCode],
    ['hqStatsMerchant.detail.country', row.country],
    ['hqStatsMerchant.detail.region', row.region],
    ['hqStatsMerchant.detail.amount', row.amount],
    ['hqStatsMerchant.detail.txCount', row.txCount],
    ['hqStatsMerchant.detail.fee', row.fee],
    ['hqStatsMerchant.detail.unsettledFee', row.unsettledFee],
    ['hqStatsMerchant.detail.syncFail', row.syncFail],
    ['hqStatsMerchant.detail.growth', row.growth],
  ]

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <section className={styles.panel} role="dialog" aria-modal="true" aria-label={t('hqStatsMerchant.detail.title')} onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <p className={styles.subtitle}>{t('hqStatsMerchant.detail.eyebrow')}</p>
            <h2 className={styles.title}>{row.merchantCode}</h2>
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
          <Badge accent="cyan" size="md" shape="rect">{t('hqStatsMerchant.detail.rank')} {row.rank}</Badge>
          <Badge accent={row.status === 'blacklisted' ? 'red' : row.status === 'suspended' ? 'orange' : 'green'} size="md" shape="rect">
            {t(`hqStatsMerchant.status.${row.status}`)}
          </Badge>
        </div>
        <footer className={styles.footer}>
          <button type="button" onClick={onClose}>{t('common.close')}</button>
        </footer>
      </section>
    </div>
  )
}
