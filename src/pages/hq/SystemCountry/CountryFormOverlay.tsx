import { useEffect, useMemo, useState } from 'react'
import { postHqPageData } from '../../../services/korionChongApi'
import { useTranslation } from '../../../i18n'
import type { CountryOption, CountryRow, LeaderOption, SystemCountryFormOptions, SystemCountryPageData } from './useSystemCountry'
import styles from './CountryFormOverlay.module.css'

type CountryStatus = 'ACTIVE' | 'PREPARING' | 'RESTRICTED'

interface SaveResponse {
  status: string
  countryCode: string
  page: SystemCountryPageData
}

interface Props {
  variant: 'add' | 'detail'
  open: boolean
  onClose: () => void
  country?: CountryRow | null
  formOptions?: SystemCountryFormOptions
  onSaved?: (page: SystemCountryPageData) => void
}

function normalizeCountryOptions(options?: CountryOption[]) {
  return options?.length ? options : [
    { code: 'KR', name: '대한민국', nameEn: 'Korea', timezone: 'UTC+09', currency: 'KRW', language: 'Korean' },
    { code: 'NG', name: 'Nigeria', nameEn: 'Nigeria', timezone: 'UTC+01', currency: 'NGN', language: 'English' },
    { code: 'PH', name: 'Philippines', nameEn: 'Philippines', timezone: 'UTC+08', currency: 'PHP', language: 'English' },
    { code: 'GH', name: 'Ghana', nameEn: 'Ghana', timezone: 'UTC+00', currency: 'GHS', language: 'English' },
    { code: 'VN', name: 'Vietnam', nameEn: 'Vietnam', timezone: 'UTC+07', currency: 'VND', language: 'Vietnamese' },
  ]
}

function requestId() {
  return `hq-system-country-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function CountryFormOverlay({ variant, open, onClose, country, formOptions, onSaved }: Props) {
  const { t } = useTranslation()
  const countryOptions = useMemo(() => normalizeCountryOptions(formOptions?.countryOptions), [formOptions?.countryOptions])
  const [code, setCode] = useState(countryOptions[0]?.code ?? '')
  const selectedOption = countryOptions.find((option) => option.code === code) ?? countryOptions[0]
  const leaders = useMemo<LeaderOption[]>(() => (
    formOptions?.leaderOptions?.filter((leader) => leader.countryCode === code) ?? []
  ), [code, formOptions?.leaderOptions])

  const [name, setName] = useState(selectedOption?.name ?? '')
  const [regions, setRegions] = useState('')
  const [timezone, setTimezone] = useState(selectedOption?.timezone ?? '')
  const [currency, setCurrency] = useState(selectedOption?.currency ?? '')
  const [language, setLanguage] = useState(selectedOption?.language ?? '')
  const [leaderAccountId, setLeaderAccountId] = useState('')
  const [status, setStatus] = useState<CountryStatus>('ACTIVE')
  const [paymentAllowed, setPaymentAllowed] = useState(true)
  const [offlinePaymentAllowed, setOfflinePaymentAllowed] = useState(true)
  const [memo, setMemo] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || variant !== 'add') return
    const option = selectedOption
    setName(option?.name ?? '')
    setTimezone(option?.timezone ?? '')
    setCurrency(option?.currency ?? '')
    setLanguage(option?.language ?? '')
    setLeaderAccountId('')
    setError(null)
  }, [code, open, selectedOption, variant])

  if (!open) return null

  const title = variant === 'add' ? t('hqSystemCountry.btn.addCountry') : t('hqSystemCountry.detail.title')
  const isActive = status === 'ACTIVE'
  const canSubmit = Boolean(code && name && timezone && currency && language && regions.trim()) && !isSaving

  const detailFields = variant === 'detail' && country ? [
    { label: t('hqSystemCountry.add.field.name'), value: country.country },
    { label: t('hqSystemCountry.add.field.code'), value: country.code },
    { label: t('hqSystemCountry.add.field.regions'), value: country.regions },
    { label: t('hqSystemCountry.add.field.timezone'), value: country.timezone },
    { label: t('hqSystemCountry.add.field.currency'), value: country.currency },
    { label: t('hqSystemCountry.add.field.language'), value: country.language },
    { label: t('hqSystemCountry.col.leader'), value: country.leader },
    { label: t('hqSystemCountry.col.status'), value: country.status },
  ] : []

  async function handleSubmit() {
    if (!canSubmit) return
    setIsSaving(true)
    setError(null)
    try {
      const response = await postHqPageData<SaveResponse>('/api/hq/system/country', {
        code,
        name,
        regions: regions.trim(),
        timezone,
        currency,
        language,
        leaderAccountId: leaderAccountId ? Number(leaderAccountId) : null,
        status,
        paymentAllowed: isActive && paymentAllowed,
        offlinePaymentAllowed: isActive && offlinePaymentAllowed,
        memo: memo.trim(),
        requestId: requestId(),
      })
      onSaved?.(response.page)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t('hqSystemCountry.add.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.headerText}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{t('hqSystemCountry.add.desc')}</p>
        </div>

        {variant === 'add' ? (
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.code')}</span>
              <select className={styles.fieldControl} value={code} onChange={(event) => setCode(event.target.value)}>
                {countryOptions.map((option) => (
                  <option key={option.code} value={option.code}>{option.code}</option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.name')}</span>
              <input className={styles.fieldControl} value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.regions')}</span>
              <input
                className={styles.fieldControl}
                value={regions}
                placeholder={t('hqSystemCountry.add.placeholder.regions')}
                onChange={(event) => setRegions(event.target.value)}
              />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.timezone')}</span>
              <input className={styles.fieldControl} value={timezone} onChange={(event) => setTimezone(event.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.currency')}</span>
              <input className={styles.fieldControl} value={currency} onChange={(event) => setCurrency(event.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.language')}</span>
              <input className={styles.fieldControl} value={language} onChange={(event) => setLanguage(event.target.value)} />
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.leader')}</span>
              <select className={styles.fieldControl} value={leaderAccountId} onChange={(event) => setLeaderAccountId(event.target.value)}>
                <option value="">{t('hqSystemCountry.add.option.noLeader')}</option>
                {leaders.map((leader) => (
                  <option key={leader.accountId} value={leader.accountId}>{leader.name} / {leader.code}</option>
                ))}
              </select>
            </label>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.status')}</span>
              <select className={styles.fieldControl} value={status} onChange={(event) => setStatus(event.target.value as CountryStatus)}>
                <option value="ACTIVE">{t('hqSystemCountry.add.status.ACTIVE')}</option>
                <option value="PREPARING">{t('hqSystemCountry.add.status.PREPARING')}</option>
                <option value="RESTRICTED">{t('hqSystemCountry.add.status.RESTRICTED')}</option>
              </select>
            </label>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.paymentAllowed')}</span>
              <button
                type="button"
                className={`${styles.toggleButton} ${isActive && paymentAllowed ? styles.toggleButtonOn : styles.toggleButtonOff}`}
                aria-pressed={isActive && paymentAllowed}
                disabled={!isActive}
                onClick={() => setPaymentAllowed((current) => !current)}
              >
                {isActive && paymentAllowed ? 'ON' : 'OFF'}
              </button>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.offlinePaymentAllowed')}</span>
              <button
                type="button"
                className={`${styles.toggleButton} ${isActive && offlinePaymentAllowed ? styles.toggleButtonOn : styles.toggleButtonOff}`}
                aria-pressed={isActive && offlinePaymentAllowed}
                disabled={!isActive}
                onClick={() => setOfflinePaymentAllowed((current) => !current)}
              >
                {isActive && offlinePaymentAllowed ? 'ON' : 'OFF'}
              </button>
            </div>
            <label className={`${styles.field} ${styles.memoField}`}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.memo')}</span>
              <textarea
                className={`${styles.fieldControl} ${styles.memoControl}`}
                value={memo}
                placeholder={t('hqSystemCountry.add.placeholder.memo')}
                onChange={(event) => setMemo(event.target.value)}
              />
            </label>
          </div>
        ) : (
          <div className={styles.fieldGrid}>
            {detailFields.map((field) => (
              <div key={field.label} className={styles.field}>
                <span className={styles.fieldLabel}>{field.label}</span>
                <span className={styles.fieldValue}>{field.value}</span>
              </div>
            ))}
            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.paymentAllowed')}</span>
              <span className={country?.payment === 'ON' ? styles.toggleOn : styles.toggleOff} aria-hidden>
                {country?.payment === 'ON' ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.offlinePaymentAllowed')}</span>
              <span className={country?.payment === 'ON' ? styles.toggleOn : styles.toggleOff} aria-hidden>
                {country?.payment === 'ON' ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className={`${styles.field} ${styles.memoField}`}>
              <span className={styles.fieldLabel}>{t('hqSystemCountry.add.field.memo')}</span>
              <span className={`${styles.fieldValue} ${styles.memoValue}`}>{country ? `${country.country} / ${country.code} · ${country.regions}` : '-'}</span>
            </div>
          </div>
        )}

        {error && <p className={styles.errorText}>{error}</p>}

        <div className={variant === 'detail' ? `${styles.footer} ${styles.footerDetail}` : styles.footer}>
          {variant === 'detail' && (
            <button type="button" className={`${styles.ghostButton} ${styles.editButton}`}>
              {t('hqSystemCountry.detail.edit')}
            </button>
          )}
          <button type="button" className={styles.ghostButton} onClick={onClose}>
            {t('hqSystemCountry.add.cancel')}
          </button>
          <button
            type="button"
            className={styles.submitButton}
            disabled={variant === 'add' ? !canSubmit : false}
            onClick={variant === 'add' ? handleSubmit : undefined}
          >
            {isSaving ? t('common.loading') : variant === 'add' ? t('hqSystemCountry.btn.addCountry') : t('hqSystemCountry.detail.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
