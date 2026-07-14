import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { ErrorCodeOptions } from './useSystemErrorCode'
import styles from './ErrorCodeFormOverlay.module.css'

export interface ErrorCodeCreatePayload {
  code: string
  name: string
  category: string
  severity: string
  userMessage: string
  adminDescription: string
  autoAction: string
  ownerTeam: string
  httpStatus?: number | null
  retryable: boolean
  settlementBlocked: boolean
  riskHold: boolean
  publicVisible: boolean
  status: string
  memo: string
}

interface Props {
  open: boolean
  options: ErrorCodeOptions
  isSaving?: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: ErrorCodeCreatePayload) => Promise<void>
}

const fallbackOptions: ErrorCodeOptions = {
  categories: ['PAYMENT', 'OFFLINE_SYNC', 'VERIFY', 'SETTLEMENT', 'RISK', 'DEVICE', 'API'],
  severities: ['INFO', 'WARNING', 'ERROR', 'CRITICAL'],
  autoActions: ['NONE', 'RETRY', 'BLOCK_PAYMENT', 'HOLD_SETTLEMENT', 'REQUEST_REVIEW', 'ESCALATE'],
  statuses: ['ACTIVE', 'INACTIVE'],
}

const defaultDraft = {
  code: 'SYNC_FAILED',
  name: '서버 Sync 실패',
  category: 'OFFLINE_SYNC',
  severity: 'WARNING',
  userMessage: '네트워크 복구 후 다시 동기화됩니다.',
  adminDescription: '오프라인 거래가 서버 검증 단계로 전송되지 못함',
  autoAction: 'RETRY',
  ownerTeam: 'SYNC_WORKER',
  httpStatus: '',
  status: 'ACTIVE',
  memo: 'Sync Worker 재시도 대상',
}

function normalizeCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9_]/g, '_').replace(/_+/g, '_').slice(0, 80)
}

export default function ErrorCodeFormOverlay({ open, options, isSaving, error, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const mergedOptions = useMemo<ErrorCodeOptions>(() => ({
    categories: options.categories?.length ? options.categories : fallbackOptions.categories,
    severities: options.severities?.length ? options.severities : fallbackOptions.severities,
    autoActions: options.autoActions?.length ? options.autoActions : fallbackOptions.autoActions,
    statuses: options.statuses?.length ? options.statuses : fallbackOptions.statuses,
  }), [options])

  const [code, setCode] = useState(defaultDraft.code)
  const [name, setName] = useState(defaultDraft.name)
  const [category, setCategory] = useState(defaultDraft.category)
  const [severity, setSeverity] = useState(defaultDraft.severity)
  const [userMessage, setUserMessage] = useState(defaultDraft.userMessage)
  const [adminDescription, setAdminDescription] = useState(defaultDraft.adminDescription)
  const [autoAction, setAutoAction] = useState(defaultDraft.autoAction)
  const [ownerTeam, setOwnerTeam] = useState(defaultDraft.ownerTeam)
  const [httpStatus, setHttpStatus] = useState(defaultDraft.httpStatus)
  const [status, setStatus] = useState(defaultDraft.status)
  const [memo, setMemo] = useState(defaultDraft.memo)
  const [retryable, setRetryable] = useState(true)
  const [settlementBlocked, setSettlementBlocked] = useState(false)
  const [riskHold, setRiskHold] = useState(false)
  const [publicVisible, setPublicVisible] = useState(true)

  useEffect(() => {
    if (!open) return
    setCode(defaultDraft.code)
    setName(defaultDraft.name)
    setCategory(mergedOptions.categories.includes(defaultDraft.category) ? defaultDraft.category : mergedOptions.categories[0])
    setSeverity(mergedOptions.severities.includes(defaultDraft.severity) ? defaultDraft.severity : mergedOptions.severities[0])
    setUserMessage(defaultDraft.userMessage)
    setAdminDescription(defaultDraft.adminDescription)
    setAutoAction(mergedOptions.autoActions.includes(defaultDraft.autoAction) ? defaultDraft.autoAction : mergedOptions.autoActions[0])
    setOwnerTeam(defaultDraft.ownerTeam)
    setHttpStatus(defaultDraft.httpStatus)
    setStatus(mergedOptions.statuses.includes(defaultDraft.status) ? defaultDraft.status : mergedOptions.statuses[0])
    setMemo(defaultDraft.memo)
    setRetryable(true)
    setSettlementBlocked(false)
    setRiskHold(false)
    setPublicVisible(true)
  }, [mergedOptions, open])

  if (!open) return null

  const canSubmit = Boolean(code && name.trim() && userMessage.trim() && category && severity && autoAction && status) && !isSaving

  async function submit() {
    if (!canSubmit) return
    await onSubmit({
      code,
      name: name.trim(),
      category,
      severity,
      userMessage: userMessage.trim(),
      adminDescription: adminDescription.trim(),
      autoAction,
      ownerTeam: ownerTeam.trim() || 'HQ_OPS',
      httpStatus: httpStatus ? Number(httpStatus) : null,
      retryable,
      settlementBlocked,
      riskHold,
      publicVisible,
      status,
      memo: memo.trim(),
    })
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('hqSystemErrorCode.add.title')}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.headerText}>
          <h2 className={styles.title}>{t('hqSystemErrorCode.add.title')}</h2>
          <p className={styles.subtitle}>{t('hqSystemErrorCode.add.desc')}</p>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqSystemErrorCode.add.field.code')}</span>
            <input className={styles.fieldControl} value={code} placeholder={defaultDraft.code} onChange={(event) => setCode(normalizeCode(event.target.value))} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqSystemErrorCode.add.field.name')}</span>
            <input className={styles.fieldControl} value={name} placeholder={t('hqSystemErrorCode.add.placeholder.name')} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqSystemErrorCode.add.field.category')}</span>
            <select className={styles.fieldControl} value={category} onChange={(event) => setCategory(event.target.value)}>
              {mergedOptions.categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqSystemErrorCode.add.field.severity')}</span>
            <select className={styles.fieldControl} value={severity} onChange={(event) => setSeverity(event.target.value)}>
              {mergedOptions.severities.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqSystemErrorCode.add.field.userMessage')}</span>
            <input className={styles.fieldControl} value={userMessage} placeholder={t('hqSystemErrorCode.add.placeholder.userMessage')} onChange={(event) => setUserMessage(event.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqSystemErrorCode.add.field.autoAction')}</span>
            <select className={styles.fieldControl} value={autoAction} onChange={(event) => setAutoAction(event.target.value)}>
              {mergedOptions.autoActions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqSystemErrorCode.add.field.adminDesc')}</span>
            <input className={styles.fieldControl} value={adminDescription} placeholder={t('hqSystemErrorCode.add.placeholder.adminDesc')} onChange={(event) => setAdminDescription(event.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqPaymentErrorCodes.col.ownerTeam')}</span>
            <input className={styles.fieldControl} value={ownerTeam} onChange={(event) => setOwnerTeam(event.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqPaymentErrorCodes.col.httpStatus')}</span>
            <input className={styles.fieldControl} type="number" min="100" max="599" value={httpStatus} placeholder="400" onChange={(event) => setHttpStatus(event.target.value)} />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqSystemErrorCode.add.field.status')}</span>
            <select className={styles.fieldControl} value={status} onChange={(event) => setStatus(event.target.value)}>
              {mergedOptions.statuses.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <div className={styles.checkGrid}>
            <label className={styles.checkItem}><input type="checkbox" checked={retryable} onChange={(event) => setRetryable(event.target.checked)} /> {t('hqPaymentErrorCodes.flag.retryable')}</label>
            <label className={styles.checkItem}><input type="checkbox" checked={settlementBlocked} onChange={(event) => setSettlementBlocked(event.target.checked)} /> {t('hqPaymentErrorCodes.flag.settlementBlocked')}</label>
            <label className={styles.checkItem}><input type="checkbox" checked={riskHold} onChange={(event) => setRiskHold(event.target.checked)} /> {t('hqPaymentErrorCodes.flag.riskHold')}</label>
            <label className={styles.checkItem}><input type="checkbox" checked={publicVisible} onChange={(event) => setPublicVisible(event.target.checked)} /> {t('hqSystemErrorCode.add.field.publicVisible')}</label>
          </div>
          <label className={`${styles.field} ${styles.memoField}`}>
            <span className={styles.fieldLabel}>{t('hqSystemErrorCode.add.field.memo')}</span>
            <textarea className={`${styles.fieldControl} ${styles.memoControl}`} value={memo} placeholder={t('hqSystemErrorCode.add.placeholder.memo')} onChange={(event) => setMemo(event.target.value)} />
          </label>
        </div>

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={styles.footer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            {t('hqSystemErrorCode.add.cancel')}
          </button>
          <button type="button" className={styles.submitButton} disabled={!canSubmit} onClick={submit}>
            {isSaving ? t('common.loading') : t('hqSystemErrorCode.add.title')}
          </button>
        </div>
      </div>
    </div>
  )
}
