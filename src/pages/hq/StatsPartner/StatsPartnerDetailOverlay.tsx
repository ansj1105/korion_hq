import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import styles from '../RiskFakeApplications/RiskFakeApplicationDetailOverlay.module.css'
import type { PartnerStatsRow } from './useStatsPartner'

interface StatsPartnerDetailOverlayProps {
  row: PartnerStatsRow | null
  onClose: () => void
}

export default function StatsPartnerDetailOverlay({ row, onClose }: StatsPartnerDetailOverlayProps) {
  const { t } = useTranslation()
  if (!row) return null

  const details = [
    ['hqStatsPartner.detail.partnerCode', row.partnerCode],
    ['hqStatsPartner.detail.partnerName', row.partnerName],
    ['hqStatsPartner.detail.leaderCode', row.leaderCode],
    ['hqStatsPartner.detail.country', row.country],
    ['hqStatsPartner.detail.subMerchantCount', row.subMerchantCount],
    ['hqStatsPartner.detail.amount', row.amount],
    ['hqStatsPartner.detail.txCount', row.txCount],
    ['hqStatsPartner.detail.partnerFee', row.partnerFee],
    ['hqStatsPartner.detail.unsettledFee', row.unsettledFee],
    ['hqStatsPartner.detail.syncFail', row.syncFail],
    ['hqStatsPartner.detail.growth', row.growth],
  ]

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <section className={styles.panel} role="dialog" aria-modal="true" aria-label={t('hqStatsPartner.detail.title')} onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <p className={styles.subtitle}>{t('hqStatsPartner.detail.eyebrow')}</p>
            <h2 className={styles.title}>{row.partnerCode}</h2>
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
          <Badge accent="cyan" size="md" shape="rect">{t('hqStatsPartner.detail.rank')} {row.rank}</Badge>
          <Badge accent={row.status === 'blacklisted' ? 'red' : row.status === 'suspended' ? 'orange' : 'green'} size="md" shape="rect">
            {t(`hqStatsPartner.status.${row.status}`)}
          </Badge>
        </div>
        <footer className={styles.footer}>
          <button type="button" onClick={onClose}>{t('common.close')}</button>
        </footer>
      </section>
    </div>
  )
}
