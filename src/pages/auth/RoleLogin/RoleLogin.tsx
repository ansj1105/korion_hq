import { type CSSProperties } from 'react'
import { Navigate } from 'react-router-dom'
import AuthShell from '../AuthShell'
import { useTranslation } from '../../../i18n'
import { useRoleLogin } from './useRoleLogin'
import styles from './RoleLogin.module.css'

export default function RoleLogin() {
  const { t } = useTranslation()
  const {
    roleKey,
    cfg,
    form,
    accessRows,
    isSubmitting,
    error,
    updateField,
    submit,
  } = useRoleLogin()

  if (!roleKey || !cfg) return <Navigate to="/login" replace />

  return (
    <AuthShell title={t(cfg.titleKey)} subtitle={t(cfg.subtitleKey)}>
      <div className={styles.cols}>
        {/* 좌: 로그인 폼 */}
        <section className={styles.card}>
          <span
            className={styles.chip}
            style={{ '--chip': cfg.chip } as CSSProperties}
          >
            {t(cfg.titleKey)}
          </span>
          <p className={styles.cardDesc}>{t(cfg.subtitleKey)}</p>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={`${roleKey}-login-id`}>
              {t('auth.login.id')}
            </label>
            <input
              id={`${roleKey}-login-id`}
              className={styles.input}
              type="text"
              placeholder={t('auth.login.idPlaceholder')}
              value={form.loginId}
              onChange={(event) => updateField('loginId', event.target.value)}
              autoComplete="username"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={`${roleKey}-password`}>
              {t('auth.login.pw')}
            </label>
            <input
              id={`${roleKey}-password`}
              className={styles.input}
              type="password"
              placeholder={t('auth.login.pwPlaceholder')}
              value={form.password}
              onChange={(event) => updateField('password', event.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor={`${roleKey}-two-factor`}>
              {t('auth.login.twofa')}
            </label>
            <input
              id={`${roleKey}-two-factor`}
              className={styles.input}
              type="text"
              placeholder={t('auth.login.twofa')}
              value={form.twoFactorCode}
              onChange={(event) => updateField('twoFactorCode', event.target.value)}
              autoComplete="one-time-code"
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.keep}>
              <input
                type="checkbox"
                checked={form.keepSignedIn}
                onChange={(event) => updateField('keepSignedIn', event.target.checked)}
              />{' '}
              {t('auth.login.keep')}
            </label>
            <span className={styles.findPw}>{t('auth.login.findPw')}</span>
          </div>

          {error && (
            <p className={styles.errorText} role="alert">
              {error}
            </p>
          )}

          <button type="button" className={styles.loginBtn} disabled={isSubmitting} onClick={submit}>
            {isSubmitting ? '...' : t(cfg.buttonKey)}
          </button>
        </section>

        {/* 우: 권한 기반 접근 안내 */}
        <section className={styles.card}>
          <h3 className={styles.accessTitle}>{t('auth.access.title')}</h3>
          <span className={styles.chip} style={{ '--chip': cfg.chip } as CSSProperties}>
            {t(cfg.accessRoleKey)}
          </span>
          <p className={styles.cardDesc}>{t('auth.access.desc')}</p>

          <div className={styles.accessRows}>
            {accessRows.map((r) => (
              <div key={r.labelKey} className={styles.accessRow}>
                <span className={styles.accessLabel}>{t(r.labelKey)}</span>
                <span className={styles.accessValue}>{t(r.valueKey)}</span>
              </div>
            ))}
          </div>

          <p className={styles.accessFooter}>{t('auth.access.footer')}</p>
        </section>
      </div>
    </AuthShell>
  )
}
