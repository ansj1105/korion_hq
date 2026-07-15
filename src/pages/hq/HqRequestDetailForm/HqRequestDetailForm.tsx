import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import Badge from '../../../components/atoms/Badge'
import type { AccentKey } from '../../../types'
import { useTranslation } from '../../../i18n'
import { postHqPageData } from '../../../services/korionChongApi'
import type { HqRequestActionRow, HqRequestStatus } from '../useHqRequestActionRows'
import styles from './HqRequestDetailForm.module.css'

type StatusMeta = Record<HqRequestStatus, { label: string; accent: AccentKey }>
type RequestAction = 'approve' | 'reject' | 'review' | 'waiting' | 'requestInfo'

const ACTION_PATH: Record<RequestAction, string> = {
  approve: 'approve',
  reject: 'reject',
  review: 'review',
  waiting: 'waiting',
  requestInfo: 'request-info',
}

const ACTION_RESULT_STATUS: Partial<Record<RequestAction, HqRequestStatus>> = {
  review: 'review',
  waiting: 'waiting',
  requestInfo: 'infoRequested',
}

const REQUIRED_CHECKS = ['identity', 'scope', 'risk'] as const
type RequiredCheck = (typeof REQUIRED_CHECKS)[number]
type DetailItem = { label: string; value?: string | number | null }
type DetailSection = { title: string; items: DetailItem[] }

interface HqRequestDetailFormProps<TRow extends HqRequestActionRow> {
  row: TRow
  title: string
  requestTypeLabel: string
  statusMeta: StatusMeta
  approveLabel: string
  rejectLabel: string
  endpointBase: string
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
  onActionComplete?: () => void
}

export default function HqRequestDetailForm<TRow extends HqRequestActionRow>({
  row,
  title,
  requestTypeLabel,
  statusMeta,
  approveLabel,
  rejectLabel,
  endpointBase,
  onClose,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
  onActionComplete,
}: HqRequestDetailFormProps<TRow>) {
  const { t } = useTranslation()
  const [memo, setMemo] = useState('')
  const [checks, setChecks] = useState<Set<RequiredCheck>>(() => new Set())
  const [currentStatus, setCurrentStatus] = useState<HqRequestStatus | null>(row.status)
  const [submittingAction, setSubmittingAction] = useState<RequestAction | null>(null)
  const allChecked = REQUIRED_CHECKS.every((key) => checks.has(key))
  const status = currentStatus ? statusMeta[currentStatus] : null

  useEffect(() => {
    setMemo('')
    setChecks(new Set())
    setCurrentStatus(row.status)
  }, [row])

  const summaryItems = useMemo(
    () => [
      { label: t('hqRequestDetail.summary.type'), value: requestTypeLabel, accent: '#1ad1ff' },
      { label: t('hqRequestDetail.summary.no'), value: row.no, accent: '#8f47ff' },
      { label: t('hqRequestDetail.summary.applicantCode'), value: row.applicantCode, accent: '#1ad1ff' },
      { label: t('hqRequestDetail.summary.parentCode'), value: row.parentCode || '-', accent: '#8f47ff' },
      { label: t('hqRequestDetail.summary.country'), value: row.country, accent: '#1ad1ff' },
      { label: t('hqRequestDetail.summary.status'), value: status?.label ?? t('hqRequestDetail.status.new'), accent: undefined },
    ],
    [requestTypeLabel, row.applicantCode, row.country, row.no, row.parentCode, status?.label, t],
  )

  const detailSections: DetailSection[] = [
    {
      title: t('hqRequestDetail.section.account'),
      items: [
        { label: t('hqRequestDetail.field.applicationId'), value: row.applicationId },
        { label: t('hqRequestDetail.field.loginId'), value: row.loginId },
        { label: t('hqRequestDetail.field.email'), value: row.email },
        { label: t('hqRequestDetail.field.contactName'), value: row.contactName ?? row.contact },
        { label: t('hqRequestDetail.field.phone'), value: row.phone },
        { label: t('hqRequestDetail.field.telegram'), value: row.telegram },
        { label: t('hqRequestDetail.field.whatsapp'), value: row.whatsapp },
      ],
    },
    {
      title: t('hqRequestDetail.section.basic'),
      items: [
        { label: t('hqRequestDetail.field.appliedAt'), value: row.appliedAt },
        { label: t('hqRequestDetail.field.applicationType'), value: row.applicationType },
        { label: t('hqRequestDetail.field.applicantType'), value: row.applicantType },
        { label: t('hqRequestDetail.field.requestedRole'), value: row.requestedRole },
        { label: t('hqRequestDetail.field.contractPath'), value: row.contractPath },
        { label: t('hqRequestDetail.field.source'), value: row.source },
        { label: t('hqRequestDetail.field.requestId'), value: row.requestId },
      ],
    },
    {
      title: t('hqRequestDetail.section.org'),
      items: [
        { label: t('hqRequestDetail.field.parentCode'), value: row.parentCode },
        { label: t('hqRequestDetail.field.applicantCode'), value: row.applicantCode },
        { label: t('hqRequestDetail.field.partnerName'), value: row.partnerName },
        { label: t('hqRequestDetail.field.country'), value: row.country },
        { label: t('hqRequestDetail.field.region'), value: row.region },
        { label: t('hqRequestDetail.field.city'), value: row.city },
        { label: t('hqRequestDetail.field.address'), value: row.address },
        { label: t('hqRequestDetail.field.businessType'), value: row.businessType },
        { label: t('hqRequestDetail.field.preferredLanguage'), value: row.preferredLanguage },
        { label: t('hqRequestDetail.field.twitterProfile'), value: row.twitterProfile },
      ],
    },
    {
      title: t('hqRequestDetail.section.wallet'),
      items: [
        { label: t('hqRequestDetail.field.walletNetwork'), value: row.walletNetwork },
        { label: t('hqRequestDetail.field.walletAddress'), value: row.walletAddress },
        { label: t('hqRequestDetail.field.walletAuthStatus'), value: row.walletAuthStatus },
      ],
    },
    {
      title: t('hqRequestDetail.section.metrics'),
      items: [
        { label: t('hqRequestDetail.field.subMerchantCount'), value: row.subMerchantCount },
        { label: t('hqRequestDetail.field.monthVolume'), value: row.monthVolume },
        { label: t('hqRequestDetail.field.monthTxCount'), value: row.monthTxCount },
      ],
    },
    {
      title: t('hqRequestDetail.section.plan'),
      items: [
        { label: t('hqRequestDetail.field.integrationPlan'), value: row.integrationPlan },
        { label: t('hqRequestDetail.field.evidenceNote'), value: row.evidenceNote },
      ],
    },
  ]

  const attachmentItems: DetailItem[] = [
    { label: t('hqRequestDetail.field.attachmentFileName'), value: row.attachmentFileName },
    { label: t('hqRequestDetail.field.attachmentFileSize'), value: formatFileSize(row.attachmentFileSize) },
    { label: t('hqRequestDetail.field.attachmentContentType'), value: row.attachmentContentType },
  ]
  const hasAttachment = Boolean(hasText(row.attachmentUrl) || hasText(row.attachmentDataUrl) || attachmentItems.some((item) => displayValue(item.value) !== '-'))

  const toggleCheck = (key: RequiredCheck, checked: boolean) => {
    setChecks((prev) => {
      const next = new Set(prev)
      if (checked) next.add(key)
      else next.delete(key)
      return next
    })
  }

  const runAction = async (action: RequestAction) => {
    if (!row.applicationId) {
      window.alert(t('hqRequestDetail.error.missingId'))
      return
    }
    if (action === 'approve' && !allChecked) {
      window.alert(t('hqRequestDetail.error.reviewRequired'))
      return
    }
    if ((action === 'reject' || action === 'requestInfo') && !memo.trim()) {
      window.alert(t('hqRequestDetail.error.memoRequired'))
      return
    }
    setSubmittingAction(action)
    try {
      await postHqPageData(`${endpointBase}/${row.applicationId}/${ACTION_PATH[action]}`, {
        reason: memo.trim(),
        requestId: `hq-request-detail-${action}-${row.applicationId}-${Date.now()}`,
      })
      const nextStatus = ACTION_RESULT_STATUS[action]
      if (nextStatus) setCurrentStatus(nextStatus)
      onActionComplete?.()
      if (action === 'approve' || action === 'reject') {
        onClose()
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('hqRequestDetail.error.actionFailed')
      window.alert(message)
    } finally {
      setSubmittingAction(null)
    }
  }

  return (
    <section className={styles.detailForm} aria-label={title}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.desc}>{t('hqRequestDetail.desc')}</p>
        </div>
        {status && <Badge accent={status.accent} size="md" shape="rect">{status.label}</Badge>}
      </div>

      <div className={styles.summaryBar}>
        {summaryItems.map((item) => (
          <div key={item.label} className={styles.summaryItem}>
            <span className={styles.summaryLabel}>{item.label}</span>
            <span className={styles.summaryValue} style={item.accent ? ({ '--accent': item.accent } as CSSProperties) : undefined}>
              {item.value || '-'}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.formSections}>
        {detailSections.map((section) => (
          <div key={section.title} className={styles.section}>
            <h4 className={styles.sectionTitle}>{section.title}</h4>
            <div className={styles.fieldGrid}>
              {section.items.map((item) => (
                <div key={item.label} className={styles.field}>
                  <span className={styles.fieldLabel}>{item.label}</span>
                  <span className={styles.fieldValue}>{displayValue(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {hasAttachment && (
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>{t('hqRequestDetail.section.attachment')}</h4>
            <div className={styles.fieldGrid}>
              {attachmentItems.map((item) => (
                <div key={item.label} className={styles.field}>
                  <span className={styles.fieldLabel}>{item.label}</span>
                  <span className={styles.fieldValue}>{displayValue(item.value)}</span>
                </div>
              ))}
            </div>
            <div className={styles.attachmentLinks}>
              {hasText(row.attachmentDataUrl) && (
                <a className={styles.attachmentLink} href={row.attachmentDataUrl} download={row.attachmentFileName || 'application-attachment'}>
                  {t('hqRequestDetail.attachment.download')}
                </a>
              )}
              {hasText(row.attachmentUrl) && (
                <a className={styles.attachmentLink} href={row.attachmentUrl} target="_blank" rel="noreferrer">
                  {t('hqRequestDetail.attachment.open')}
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>{t('hqRequestDetail.section.checklist')}</h4>
        <div className={styles.stepBox}>
          {REQUIRED_CHECKS.map((key) => (
            <label key={key} className={styles.checkItem}>
              <input
                type="checkbox"
                checked={checks.has(key)}
                onChange={(event) => toggleCheck(key, event.target.checked)}
              />
              <span>{t(`hqRequestDetail.check.${key}`)}</span>
            </label>
          ))}
          <label className={styles.checkItem}>
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(event) => {
                const checked = event.target.checked
                setChecks(checked ? new Set(REQUIRED_CHECKS) : new Set())
              }}
            />
            <span>{t('hqRequestDetail.check.all')}</span>
          </label>
        </div>
      </div>

      <label className={styles.section}>
        <span className={styles.sectionTitle}>{t('hqRequestDetail.section.memo')}</span>
        <textarea
          className={styles.memo}
          value={memo}
          onChange={(event) => setMemo(event.target.value)}
          placeholder={t('hqRequestDetail.memo.placeholder')}
          rows={4}
        />
      </label>

      <div className={styles.floatingBar}>
        <div className={styles.floatingGroup}>
          <button type="button" className={styles.ghostButton} onClick={onClose}>
            {t('common.allList')}
          </button>
          <button type="button" className={styles.ghostButton} onClick={onPrevious} disabled={!hasPrevious}>
            {t('common.previous')}
          </button>
          <button type="button" className={styles.ghostButton} onClick={onNext} disabled={!hasNext}>
            {t('common.next')}
          </button>
        </div>
        <div className={styles.floatingGroup}>
          <button type="button" className={styles.actionButton} disabled={Boolean(submittingAction)} onClick={() => void runAction('waiting')}>
            {statusMeta.waiting.label}
          </button>
          <button type="button" className={styles.actionButton} disabled={Boolean(submittingAction)} onClick={() => void runAction('review')}>
            {statusMeta.review.label}
          </button>
          <button type="button" className={styles.actionButton} disabled={Boolean(submittingAction)} onClick={() => void runAction('requestInfo')}>
            {statusMeta.infoRequested.label}
          </button>
        </div>
        <div className={styles.floatingGroup}>
          <button type="button" className={styles.dangerButton} disabled={Boolean(submittingAction)} onClick={() => void runAction('reject')}>
            {rejectLabel}
          </button>
          <button type="button" className={styles.primaryButton} disabled={Boolean(submittingAction)} onClick={() => void runAction('approve')}>
            {approveLabel}
          </button>
        </div>
      </div>
    </section>
  )
}

function displayValue(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'string' && value.trim() === '-') return '-'
  return String(value)
}

function hasText(value?: string | null): value is string {
  return Boolean(value && value.trim() && value.trim() !== '-')
}

function formatFileSize(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return undefined
  const numeric = Number(value)
  if (!Number.isFinite(numeric) || numeric <= 0) return String(value)
  if (numeric < 1024) return `${numeric} B`
  if (numeric < 1024 * 1024) return `${(numeric / 1024).toFixed(1)} KB`
  return `${(numeric / 1024 / 1024).toFixed(1)} MB`
}
