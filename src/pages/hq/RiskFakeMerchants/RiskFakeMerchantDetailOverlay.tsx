import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import type { FakeMerchantRow } from './useRiskFakeMerchants'
import styles from '../RiskFakeApplications/RiskFakeApplicationDetailOverlay.module.css'

interface Props {
  merchant: FakeMerchantRow | null
  onClose: () => void
}

export default function RiskFakeMerchantDetailOverlay({ merchant, onClose }: Props) {
  const { t } = useTranslation()
  if (!merchant) return null

  const fields = [
    ['hqRiskFakeMerchants.detail.merchantCode', merchant.merchantCode],
    ['hqRiskFakeMerchants.detail.loginId', merchant.loginId],
    ['hqRiskFakeMerchants.detail.merchantName', merchant.merchantName],
    ['hqRiskFakeMerchants.detail.businessType', merchant.businessType],
    ['hqRiskFakeMerchants.detail.parentCode', merchant.parentCode],
    ['hqRiskFakeMerchants.detail.parentName', merchant.parentName],
    ['hqRiskFakeMerchants.detail.country', merchant.country],
    ['hqRiskFakeMerchants.detail.region', merchant.region],
    ['hqRiskFakeMerchants.detail.city', merchant.city],
    ['hqRiskFakeMerchants.detail.address', merchant.address],
    ['hqRiskFakeMerchants.detail.email', merchant.email],
    ['hqRiskFakeMerchants.detail.phone', merchant.phone],
    ['hqRiskFakeMerchants.detail.telegram', merchant.telegram],
    ['hqRiskFakeMerchants.detail.whatsapp', merchant.whatsapp],
    ['hqRiskFakeMerchants.detail.wallet', merchant.walletRaw],
    ['hqRiskFakeMerchants.detail.walletAuthStatus', merchant.walletAuthStatus],
    ['hqRiskFakeMerchants.detail.appliedAt', merchant.appliedAt],
    ['hqRiskFakeMerchants.detail.approvedAt', merchant.approvedAt],
    ['hqRiskFakeMerchants.detail.lastActivityAt', merchant.lastActivityAt],
    ['hqRiskFakeMerchants.detail.storeAccessStatus', merchant.storeAccessStatus],
  ] as const

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <section className={styles.panel} onClick={(event) => event.stopPropagation()} aria-label={t('hqRiskFakeMerchants.detail.title')}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t('hqRiskFakeMerchants.detail.title')}</h2>
            <p className={styles.subtitle}>{merchant.merchantName} / {merchant.merchantCode}</p>
          </div>
          <Badge accent={merchant.riskAccent} size="md" shape="rect">
            {merchant.riskScore}
          </Badge>
        </div>

        <div className={styles.reasonBox}>
          <span className={styles.sectionLabel}>{t('hqRiskFakeMerchants.detail.reasons')}</span>
          <div className={styles.badges}>
            {merchant.reasons.map((reason) => (
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

        <div className={styles.duplicateGrid}>
          <div><span>{t('hqRiskFakeMerchants.detail.txCount')}</span><strong>{merchant.txCount}</strong></div>
          <div><span>{t('hqRiskFakeMerchants.detail.failedTxCount')}</span><strong>{merchant.failedTxCount}</strong></div>
          <div><span>{t('hqRiskFakeMerchants.detail.heldTxCount')}</span><strong>{merchant.heldTxCount}</strong></div>
          <div><span>{t('hqRiskFakeMerchants.detail.confirmedAmount')}</span><strong>{merchant.confirmedAmount}</strong></div>
          <div><span>{t('hqRiskFakeMerchants.detail.failedAmount')}</span><strong>{merchant.failedAmount}</strong></div>
          <div><span>{t('hqRiskFakeMerchants.detail.duplicateWallet')}</span><strong>{merchant.duplicateWalletCount}</strong></div>
          <div><span>{t('hqRiskFakeMerchants.detail.duplicateEmail')}</span><strong>{merchant.duplicateEmailCount}</strong></div>
          <div><span>{t('hqRiskFakeMerchants.detail.duplicatePhone')}</span><strong>{merchant.duplicatePhoneCount}</strong></div>
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose}>{t('common.close')}</button>
        </div>
      </section>
    </div>
  )
}
