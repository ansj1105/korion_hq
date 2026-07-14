import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import type { FakeApplicationRow } from './useRiskFakeApplications'
import styles from './RiskFakeApplicationDetailOverlay.module.css'

interface Props {
  application: FakeApplicationRow | null
  onClose: () => void
}

export default function RiskFakeApplicationDetailOverlay({ application, onClose }: Props) {
  const { t } = useTranslation()
  if (!application) return null

  const fields = [
    ['hqRiskFakeApplications.detail.applicationNo', application.applicationNo],
    ['hqRiskFakeApplications.detail.loginId', application.loginId],
    ['hqRiskFakeApplications.detail.applicantType', application.applicantType],
    ['hqRiskFakeApplications.detail.requestedRole', application.requestedRole],
    ['hqRiskFakeApplications.detail.contractPath', application.contractPath],
    ['hqRiskFakeApplications.detail.referralCode', application.referralCode],
    ['hqRiskFakeApplications.detail.companyName', application.companyName],
    ['hqRiskFakeApplications.detail.contactName', application.contactName],
    ['hqRiskFakeApplications.detail.country', application.country],
    ['hqRiskFakeApplications.detail.region', application.region],
    ['hqRiskFakeApplications.detail.city', application.city],
    ['hqRiskFakeApplications.detail.email', application.email],
    ['hqRiskFakeApplications.detail.phone', application.phone],
    ['hqRiskFakeApplications.detail.telegram', application.telegram],
    ['hqRiskFakeApplications.detail.whatsapp', application.whatsapp],
    ['hqRiskFakeApplications.detail.wallet', application.walletRaw],
    ['hqRiskFakeApplications.detail.walletAuthStatus', application.walletAuthStatus],
    ['hqRiskFakeApplications.detail.appliedAt', application.appliedAt],
    ['hqRiskFakeApplications.detail.updatedAt', application.updatedAt],
    ['hqRiskFakeApplications.detail.attachment', application.attachmentFileName],
  ] as const

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <section className={styles.panel} onClick={(event) => event.stopPropagation()} aria-label={t('hqRiskFakeApplications.detail.title')}>
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t('hqRiskFakeApplications.detail.title')}</h2>
            <p className={styles.subtitle}>{application.companyName} / {application.applicationNo}</p>
          </div>
          <Badge accent={application.riskAccent} size="md" shape="rect">
            {application.riskScore}
          </Badge>
        </div>

        <div className={styles.reasonBox}>
          <span className={styles.sectionLabel}>{t('hqRiskFakeApplications.detail.reasons')}</span>
          <div className={styles.badges}>
            {application.reasons.map((reason) => (
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
            <span>{t('hqRiskFakeApplications.detail.evidenceNote')}</span>
            <textarea value={application.evidenceNote || '-'} readOnly />
          </label>
          <label className={styles.field}>
            <span>{t('hqRiskFakeApplications.detail.integrationPlan')}</span>
            <textarea value={application.integrationPlan || '-'} readOnly />
          </label>
        </div>

        <div className={styles.duplicateGrid}>
          <div><span>{t('hqRiskFakeApplications.detail.duplicateWallet')}</span><strong>{application.duplicateWalletCount}</strong></div>
          <div><span>{t('hqRiskFakeApplications.detail.duplicateEmail')}</span><strong>{application.duplicateEmailCount}</strong></div>
          <div><span>{t('hqRiskFakeApplications.detail.duplicatePhone')}</span><strong>{application.duplicatePhoneCount}</strong></div>
          <div><span>{t('hqRiskFakeApplications.detail.duplicateTelegram')}</span><strong>{application.duplicateTelegramCount}</strong></div>
        </div>

        <div className={styles.footer}>
          <button type="button" onClick={onClose}>{t('common.close')}</button>
        </div>
      </section>
    </div>
  )
}

