import { useEffect, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { FeeCountryOption, FeeModalData } from './useCommission'
import styles from './CommissionFeeModal.module.css'

interface CommissionFeeModalProps {
  variant: 'add' | 'edit'
  data: FeeModalData
  countries: FeeCountryOption[]
  onClose: () => void
  onSubmit: (payload: FeeModalData) => Promise<void>
}

export default function CommissionFeeModal({ variant, data, countries, onClose, onSubmit }: CommissionFeeModalProps) {
  const { t } = useTranslation()
  const [form, setForm] = useState<FeeModalData>(data)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setForm(data)
  }, [data])

  const update = <K extends keyof FeeModalData>(key: K, value: FeeModalData[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const updateCountry = (countryCode: string) => {
    const country = countries.find((item) => item.code === countryCode)
    setForm((current) => ({
      ...current,
      countryCode,
      country: country?.name ?? current.country,
    }))
  }

  const updateCoin = (index: number, key: 'assetCode' | 'network' | 'tokenStandard' | 'fee', value: string) => {
    setForm((current) => ({
      ...current,
      coins: current.coins.map((coin, coinIndex) =>
        coinIndex === index ? { ...coin, [key]: value, name: `${key === 'assetCode' ? value : coin.assetCode}  ${key === 'network' ? value : coin.network}  ${key === 'tokenStandard' ? value : coin.tokenStandard}` } : coin
      ),
    }))
  }

  const addCoin = () => {
    setForm((current) => ({
      ...current,
      coins: [...current.coins, { assetCode: 'KORI', network: 'TRON', tokenStandard: 'TRC-20', fee: '0.1', name: 'KORI  TRON  TRC-20' }],
    }))
  }

  const removeCoin = (index: number) => {
    setForm((current) => ({
      ...current,
      coins: current.coins.filter((_, coinIndex) => coinIndex !== index),
    }))
  }

  const submit = async () => {
    setIsSaving(true)
    try {
      await onSubmit(form)
      onClose()
    } catch (error) {
      window.alert(error instanceof Error ? error.message : '저장에 실패했습니다.')
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
        aria-label={t('hqCommission.modal.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{t('hqCommission.modal.title')}</h2>
            <p className={styles.desc}>{t('hqCommission.modal.desc')}</p>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.eventBadge}>{form.eventEnabled ? t('hqCommission.modal.eventActive') : t('hqCommission.modal.eventInactive')}</span>
            <button
              type="button"
              className={form.eventEnabled ? styles.toggleOn : styles.toggleOff}
              onClick={() => update('eventEnabled', !form.eventEnabled)}
            >
              {form.eventEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        <div className={styles.body}>
          <div className={styles.formCol}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>{t('hqCommission.modal.countrySelect')}</span>
              <select className={styles.selectBox} value={form.countryCode} onChange={(event) => updateCountry(event.target.value)}>
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>

            <div className={styles.field}>
              <div className={styles.eventRow}>
                <span className={styles.fieldLabel}>{t('hqCommission.modal.eventPromo')}</span>
                <button
                  type="button"
                  className={form.eventEnabled ? styles.toggleOn : styles.toggleOff}
                  onClick={() => update('eventEnabled', !form.eventEnabled)}
                >
                  {form.eventEnabled ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className={styles.feeInputRow}>
                <input
                  className={styles.feeInput}
                  type="number"
                  min="0"
                  step="0.0001"
                  value={form.eventFee}
                  onChange={(event) => update('eventFee', event.target.value)}
                />
                <span className={styles.feeUnit}>%</span>
              </div>
            </div>

            <div className={styles.scopeRow}>
              <button
                type="button"
                className={form.scope === 'COUNTRY_ALL' ? styles.scopePill : `${styles.scopePill} ${styles.scopePillDim}`}
                onClick={() => update('scope', 'COUNTRY_ALL')}
              >
                {t('hqCommission.modal.scopeCountryAll')}
              </button>
              <button
                type="button"
                className={form.scope === 'LEADER_ONLY' ? styles.scopePill : `${styles.scopePill} ${styles.scopePillDim}`}
                onClick={() => update('scope', 'LEADER_ONLY')}
              >
                {t('hqCommission.modal.scopeLeaderOnly')}
              </button>
            </div>

            <div className={styles.feeTriple}>
              {[
                { label: t('hqCommission.modal.baseFee'), key: 'baseFee' as const },
                { label: t('hqCommission.modal.online'), key: 'onlineFee' as const },
                { label: t('hqCommission.modal.offline'), key: 'offlineFee' as const },
              ].map((field) => (
                <label key={field.key} className={styles.field}>
                  <span className={styles.fieldLabel}>{field.label}</span>
                  <div className={styles.feeInputRow}>
                    <input
                      className={styles.feeInput}
                      type="number"
                      min="0"
                      step="0.0001"
                      value={form[field.key]}
                      onChange={(event) => update(field.key, event.target.value)}
                    />
                    <span className={styles.feeUnit}>%</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className={styles.coinCol}>
            <div className={styles.coinHead}>
              <span className={styles.fieldLabel}>{t('hqCommission.modal.coinFee')}</span>
              <button type="button" className={styles.coinAddButton} onClick={addCoin}>
                {t('hqCommission.modal.coinAdd')}
              </button>
            </div>
            <div className={styles.coinBox}>
              {form.coins.map((coin, index) => (
                <div key={`${coin.assetCode}-${coin.network}-${coin.tokenStandard}-${index}`} className={styles.coinRowEditable}>
                  <input
                    className={styles.coinInput}
                    aria-label={t('hqCommission.modal.coinAsset')}
                    value={coin.assetCode}
                    onChange={(event) => updateCoin(index, 'assetCode', event.target.value)}
                  />
                  <input
                    className={styles.coinInput}
                    aria-label={t('hqCommission.modal.coinNetwork')}
                    value={coin.network}
                    onChange={(event) => updateCoin(index, 'network', event.target.value)}
                  />
                  <input
                    className={styles.coinInput}
                    aria-label={t('hqCommission.modal.coinStandard')}
                    value={coin.tokenStandard}
                    onChange={(event) => updateCoin(index, 'tokenStandard', event.target.value)}
                  />
                  <div className={styles.coinFeeEdit}>
                    <input
                      className={styles.coinFeeInput}
                      aria-label={t('hqCommission.modal.coinFeeValue')}
                      type="number"
                      min="0"
                      step="0.0001"
                      value={coin.fee}
                      onChange={(event) => updateCoin(index, 'fee', event.target.value)}
                    />
                    <span>%</span>
                  </div>
                  <button type="button" className={styles.coinRemoveButton} onClick={() => removeCoin(index)}>
                    {t('hqCommission.modal.coinRemove')}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.ghostButton} onClick={onClose}>
            {t('hqCommission.modal.cancel')}
          </button>
          <button type="button" className={styles.submitButton} disabled={isSaving} onClick={submit}>
            {variant === 'add' ? t('hqCommission.modal.add') : t('hqCommission.modal.edit')}
          </button>
        </div>
      </div>
    </div>
  )
}
