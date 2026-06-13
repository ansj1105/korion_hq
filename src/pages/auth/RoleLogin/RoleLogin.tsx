import { type CSSProperties } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/atoms/Button'
import AuthShell from '../AuthShell'
import { useTranslation } from '../../../i18n'
import data from './roleLoginData.json'
import styles from './RoleLogin.module.css'

type RoleKey = 'leader' | 'partner' | 'merchant'
const ROLE_CFG = data as Record<string, { titleKey: string; subtitleKey: string; buttonKey: string; accessRoleKey: string; chip: string }>

/*
 * RoleLogin (page) — 역할별 로그인 (리더/파트너/가맹점)
 * ------------------------------------------------------------------
 * 좌: 로그인 폼(입력 UI만), 우: 권한 기반 접근 안내 패널. 구조 동일·역할 데이터만 다름.
 * 백엔드 없음 → "로그인" 버튼은 검증 없이 해당 역할 어드민 대시보드로 라우팅한다.
 */
export default function RoleLogin() {
  const { role } = useParams<{ role: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  // 잘못된 역할이면 허브로
  if (!role || !ROLE_CFG[role]) return <Navigate to="/login" replace />
  const cfg = ROLE_CFG[role]

  // 권한 안내 패널 행 (접속 권한만 역할별, 나머지는 공통)
  const accessRows = [
    { label: t('auth.access.row.access'), value: t(cfg.accessRoleKey) },
    { label: t('auth.access.row.security'), value: t('auth.access.val.security') },
    { label: t('auth.access.row.session'), value: t('auth.access.val.session') },
    { label: t('auth.access.row.history'), value: t('auth.access.val.history') },
  ]

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
            <span className={styles.fieldLabel}>{t('auth.login.id')}</span>
            <input className={styles.input} type="text" placeholder={t('auth.login.idPlaceholder')} />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('auth.login.pw')}</span>
            <input className={styles.input} type="password" placeholder={t('auth.login.pwPlaceholder')} />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('auth.login.twofa')}</span>
            <input className={styles.input} type="text" placeholder={t('auth.login.twofa')} />
          </div>

          <div className={styles.formRow}>
            <label className={styles.keep}>
              <input type="checkbox" /> {t('auth.login.keep')}
            </label>
            <span className={styles.findPw}>{t('auth.login.findPw')}</span>
          </div>

          {/* 백엔드 없음 → 검증 없이 역할 대시보드로 이동 */}
          <Button variant="primary" onClick={() => navigate(`/${role}/dashboard`)}>
            {t(cfg.buttonKey)}
          </Button>
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
              <div key={r.label} className={styles.accessRow}>
                <span className={styles.accessLabel}>{r.label}</span>
                <span className={styles.accessValue}>{r.value}</span>
              </div>
            ))}
          </div>

          <p className={styles.accessFooter}>{t('auth.access.footer')}</p>
        </section>
      </div>
    </AuthShell>
  )
}

export type { RoleKey }
