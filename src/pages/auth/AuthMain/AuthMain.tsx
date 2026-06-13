import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import Button from '../../../components/atoms/Button'
import AuthShell from '../AuthShell'
import { useTranslation } from '../../../i18n'
import styles from './AuthMain.module.css'

/** 카드 정의 (로그인/회원가입 공통) */
interface CardDef {
  to: string
  chip: string
  chipSolid?: boolean
  labelKey: string
  descKey: string
  buttonKey: string
  primary?: boolean
}

/* 로그인 카드 3 (리더 보라 / 파트너 파랑 / 가맹점 청록) */
const LOGIN_CARDS: CardDef[] = [
  { to: '/login/leader', chip: '#7b5cff', labelKey: 'auth.card.leaderLogin', descKey: 'auth.card.leaderDesc', buttonKey: 'auth.btn.leaderLogin', primary: true },
  { to: '/login/partner', chip: '#238cff', labelKey: 'auth.card.partnerLogin', descKey: 'auth.card.partnerDesc', buttonKey: 'auth.btn.partnerLogin' },
  { to: '/login/merchant', chip: '#26e6b2', chipSolid: true, labelKey: 'auth.card.merchantLogin', descKey: 'auth.card.merchantDesc', buttonKey: 'auth.btn.merchantLogin' },
]

/* 회원가입 카드 2 (파트너 / 가맹점 — 리더는 본사 발급이라 가입 없음) */
const SIGNUP_CARDS: CardDef[] = [
  { to: '/signup/partner', chip: '#238cff', labelKey: 'auth.card.partnerSignup', descKey: 'auth.card.partnerSignupDesc', buttonKey: 'auth.btn.partnerSignup', primary: true },
  { to: '/signup/merchant', chip: '#238cff', labelKey: 'auth.card.merchantSignup', descKey: 'auth.card.merchantSignupDesc', buttonKey: 'auth.btn.merchantSignup', primary: true },
]

/*
 * AuthMain (page) — 로그인 / 회원가입 메인 허브
 * ------------------------------------------------------------------
 * 탭(로그인/회원가입)으로 역할 카드를 전환한다. 카드 버튼은 역할별 로그인/가입 화면으로 이동.
 * 실제 인증은 없고(백엔드 범위 밖), 카드 → 화면 라우팅만 담당.
 */
export default function AuthMain() {
  const { t } = useTranslation()
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  const cards = tab === 'login' ? LOGIN_CARDS : SIGNUP_CARDS

  return (
    <AuthShell title={t('auth.main.title')} subtitle={t('auth.portalDesc')}>
      <section className={styles.panel}>
        {/* 탭 */}
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
            onClick={() => setTab('login')}
          >
            {t('auth.tab.login')}
          </button>
          <button
            type="button"
            className={`${styles.tab} ${tab === 'signup' ? styles.tabActive : ''}`}
            onClick={() => setTab('signup')}
          >
            {t('auth.tab.signup')}
          </button>
        </div>

        {/* 카드 그리드 (로그인 3 / 회원가입 2) */}
        <div className={tab === 'login' ? styles.loginGrid : styles.signupGrid}>
          {cards.map((c) => (
            <div key={c.to} className={styles.card}>
              <span
                className={`${styles.chip} ${c.chipSolid ? styles.chipSolid : styles.chipTranslucent}`}
                style={{ '--chip': c.chip } as CSSProperties}
              >
                {t(c.labelKey)}
              </span>
              <p className={styles.cardDesc}>{t(c.descKey)}</p>
              <Link to={c.to} className={styles.cardLink}>
                <Button variant={c.primary ? 'primary' : 'secondary'}>{t(c.buttonKey)}</Button>
              </Link>
            </div>
          ))}
        </div>

        {/* 하단 안내 */}
        <div className={styles.notice}>
          <p>{t('auth.notice.1')}</p>
          <p>{t('auth.notice.2')}</p>
          <p>{t('auth.notice.3')}</p>
        </div>
      </section>
    </AuthShell>
  )
}
