import { useState, type FormEvent } from 'react'
import { useTranslation } from '../../../i18n'
import type { PaymentErrorCodeCreateRequest, PaymentErrorCodeOptions } from './usePaymentErrorCodes'
import styles from './PaymentErrorCodeFormOverlay.module.css'

interface Props {
  open: boolean
  options: PaymentErrorCodeOptions
  onClose: () => void
  onSubmit: (payload: PaymentErrorCodeCreateRequest) => Promise<void>
}

const initialForm: PaymentErrorCodeCreateRequest = {
  code: '',
  name: '',
  category: 'OFFLINE_SYNC',
  severity: 'WARNING',
  userMessage: '',
  adminDescription: '',
  autoAction: 'RETRY',
  ownerTeam: 'HQ_OPS',
  httpStatus: null,
  retryable: false,
  settlementBlocked: false,
  riskHold: false,
  publicVisible: true,
  status: 'ACTIVE',
  memo: '',
}

export default function PaymentErrorCodeFormOverlay({ open, options, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const [form, setForm] = useState<PaymentErrorCodeCreateRequest>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const update = (key: keyof PaymentErrorCodeCreateRequest, value: string | boolean | number | null) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onSubmit({
        ...form,
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        userMessage: form.userMessage.trim(),
        adminDescription: form.adminDescription.trim(),
        ownerTeam: form.ownerTeam.trim() || 'HQ_OPS',
        memo: form.memo.trim(),
      })
      setForm(initialForm)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('hqPaymentErrorCodes.form.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <form className={styles.panel} role="dialog" aria-modal="true" aria-label={t('hqPaymentErrorCodes.form.title')} onSubmit={submit} onClick={(event) => event.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t('hqPaymentErrorCodes.form.title')}</h2>
          <p className={styles.subtitle}>{t('hqPaymentErrorCodes.form.desc')}</p>
        </div>

        <div className={styles.grid}>
          <label className={styles.field}>
            <span>{t('hqPaymentErrorCodes.form.code')}</span>
            <input value={form.code} onChange={(event) => update('code', event.target.value)} placeholder="SIGNATURE_MISMATCH" required pattern="[A-Za-z][A-Za-z0-9_]{2,79}" />
          </label>
          <label className={styles.field}>
            <span>{t('hqPaymentErrorCodes.form.name')}</span>
            <input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="서명 불일치" required />
          </label>
          <label className={styles.field}>
            <span>{t('hqPaymentErrorCodes.form.category')}</span>
            <select value={form.category} onChange={(event) => update('category', event.target.value)}>
              {options.categories.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>{t('hqPaymentErrorCodes.form.severity')}</span>
            <select value={form.severity} onChange={(event) => update('severity', event.target.value)}>
              {options.severities.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>{t('hqPaymentErrorCodes.form.autoAction')}</span>
            <select value={form.autoAction} onChange={(event) => update('autoAction', event.target.value)}>
              {options.autoActions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>{t('hqPaymentErrorCodes.form.status')}</span>
            <select value={form.status} onChange={(event) => update('status', event.target.value)}>
              {options.statuses.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span>{t('hqPaymentErrorCodes.form.ownerTeam')}</span>
            <input value={form.ownerTeam} onChange={(event) => update('ownerTeam', event.target.value)} />
          </label>
          <label className={styles.field}>
            <span>{t('hqPaymentErrorCodes.form.httpStatus')}</span>
            <input type="number" min={100} max={599} value={form.httpStatus ?? ''} onChange={(event) => update('httpStatus', event.target.value ? Number(event.target.value) : null)} placeholder="409" />
          </label>
          <label className={`${styles.field} ${styles.full}`}>
            <span>{t('hqPaymentErrorCodes.form.userMessage')}</span>
            <textarea value={form.userMessage} onChange={(event) => update('userMessage', event.target.value)} required />
          </label>
          <label className={`${styles.field} ${styles.full}`}>
            <span>{t('hqPaymentErrorCodes.form.adminDescription')}</span>
            <textarea value={form.adminDescription} onChange={(event) => update('adminDescription', event.target.value)} />
          </label>
        </div>

        <div className={styles.checks}>
          <label><input type="checkbox" checked={form.retryable} onChange={(event) => update('retryable', event.target.checked)} /> {t('hqPaymentErrorCodes.form.retryable')}</label>
          <label><input type="checkbox" checked={form.settlementBlocked} onChange={(event) => update('settlementBlocked', event.target.checked)} /> {t('hqPaymentErrorCodes.form.settlementBlocked')}</label>
          <label><input type="checkbox" checked={form.riskHold} onChange={(event) => update('riskHold', event.target.checked)} /> {t('hqPaymentErrorCodes.form.riskHold')}</label>
          <label><input type="checkbox" checked={form.publicVisible} onChange={(event) => update('publicVisible', event.target.checked)} /> {t('hqPaymentErrorCodes.form.publicVisible')}</label>
        </div>

        <label className={styles.field}>
          <span>{t('hqPaymentErrorCodes.form.memo')}</span>
          <textarea value={form.memo} onChange={(event) => update('memo', event.target.value)} />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.footer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>{t('hqPaymentErrorCodes.form.cancel')}</button>
          <button type="submit" className={styles.submitButton} disabled={submitting}>{submitting ? t('hqPaymentErrorCodes.form.submitting') : t('hqPaymentErrorCodes.form.submit')}</button>
        </div>
      </form>
    </div>
  )
}
