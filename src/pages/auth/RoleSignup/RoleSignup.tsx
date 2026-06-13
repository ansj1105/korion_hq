import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/atoms/Button'
import AuthShell from '../AuthShell'
import { useTranslation } from '../../../i18n'
import data from './signupData.json'
import styles from './RoleSignup.module.css'

interface ModeDef {
  key: string
  labelKey: string
  descKey: string
  type: 'code' | 'hq'
  codePlaceholder?: string
  confirmed?: string
}
const CFG = data as Record<
  string,
  { titleKey: string; subtitleKey: string; modes: ModeDef[]; store: boolean }
>

/** 입력 한 칸 (라벨 + placeholder, 선택적으로 우측 버튼/넓게) */
interface FieldDef {
  labelKey: string
  placeholder: string
  buttonKey?: string
  wide?: boolean
}

/* A. 계정 정보 */
const ACCOUNT_FIELDS: FieldDef[] = [
  { labelKey: 'auth.signup.f.id', placeholder: '중복 확인 필요', buttonKey: 'auth.signup.btn.dupCheck' },
  { labelKey: 'auth.signup.f.email', placeholder: 'example@email.com', buttonKey: 'auth.signup.btn.verify' },
  { labelKey: 'auth.signup.f.pw', placeholder: '8자 이상' },
  { labelKey: 'auth.signup.f.pwConfirm', placeholder: '8자 이상' },
  { labelKey: 'auth.signup.f.telegram', placeholder: '@telegram_id' },
  { labelKey: 'auth.signup.f.phone', placeholder: '+234 000 000 0000' },
  { labelKey: 'auth.signup.f.twitter', placeholder: '선택 입력' },
]

/* B. 기본 / 소속 정보 */
const BASIC_FIELDS: FieldDef[] = [
  { labelKey: 'auth.signup.f.name', placeholder: '예: Samuel O.' },
  { labelKey: 'auth.signup.f.country', placeholder: 'Nigeria' },
  { labelKey: 'auth.signup.f.region', placeholder: 'Lagos Island, Ikeja' },
  { labelKey: 'auth.signup.f.language', placeholder: 'English, Local Language' },
  { labelKey: 'auth.signup.f.hqReason', placeholder: '선택 시 필수', wide: true },
]

/* D. 매장 기본 정보 (가맹점만) */
const STORE_FIELDS: FieldDef[] = [
  { labelKey: 'auth.signup.f.storeName', placeholder: 'Kori Cafe Lagos' },
  { labelKey: 'auth.signup.f.owner', placeholder: '대표자명' },
  { labelKey: 'auth.signup.f.address', placeholder: '주소 입력' },
  { labelKey: 'auth.signup.f.industry', placeholder: '카페 / 리테일' },
]

const AGREEMENTS = ['1', '2', '3', '4', '5', '6']

/*
 * RoleSignup (page) — 역할별 회원가입 (파트너/가맹점)
 * ------------------------------------------------------------------
 * 가입 방식 탭(리더 코드/파트너 코드/본사 직접) + A.계정 / B.기본·소속 / C.Wallet
 *  (+ 가맹점: D.매장 정보) + 동의 체크 + 가입 신청.
 * 백엔드 없음 → 입력은 UI만, "가입 신청"은 확인 모달 → 토스트 → 해당 역할 로그인 화면으로 이동.
 */
export default function RoleSignup() {
  const { role } = useParams<{ role: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [mode, setMode] = useState('leader')

  if (!role || !CFG[role]) return <Navigate to="/login" replace />
  const cfg = CFG[role]

  const renderFields = (fields: FieldDef[]) =>
    fields.map((f) => (
      <div key={f.labelKey} className={`${styles.field} ${f.wide ? styles.wide : ''}`}>
        <span className={styles.fieldLabel}>{t(f.labelKey)}</span>
        <div className={styles.inputRow}>
          <input className={styles.input} type="text" placeholder={f.placeholder} />
          {f.buttonKey && (
            <button type="button" className={styles.smallBtn}>
              {t(f.buttonKey)}
            </button>
          )}
        </div>
      </div>
    ))

  return (
    <AuthShell title={t(cfg.titleKey)} subtitle={t(cfg.subtitleKey)}>
      <section className={styles.panel}>
        {/* 가입 방식 카드 — 각 카드에 추천인(코드) 입력란 포함. 선택 시 보더 강조 */}
        <div className={styles.modes}>
          {cfg.modes.map((m) => {
            const selected = mode === m.key
            return (
              <button
                key={m.key}
                type="button"
                className={`${styles.modeCard} ${selected ? styles.modeCardActive : ''}`}
                onClick={() => setMode(m.key)}
              >
                <span className={styles.modeBadge}>{t(m.labelKey)}</span>
                <span className={styles.modeDesc}>{t(m.descKey)}</span>

                {m.type === 'code' ? (
                  {/* 추천인(리더/파트너) 코드 입력 + 코드 확인 버튼.
                      '확인 완료' 상태 배지는 입력란 안 우측에 표시(Figma 기준). */}
                  <div className={styles.codeRow}>
                    <div className={styles.codeInputWrap}>
                      <input
                        className={styles.codeInput}
                        type="text"
                        placeholder={m.codePlaceholder}
                        defaultValue={selected ? m.confirmed : ''}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className={styles.codeConfirmed}>{t('auth.signup.codeConfirmed')}</span>
                    </div>
                    <span className={styles.codeCheckBtn}>{t('auth.signup.btn.codeCheck')}</span>
                  </div>
                ) : (
                  // 본사 직접 계약: 본사 검토 필요 배지
                  <span className={styles.hqBadge}>{t('auth.signup.hqReview')}</span>
                )}
              </button>
            )
          })}
        </div>

        {/* A. 계정 정보 */}
        <h3 className={styles.sectionTitle}>{t('auth.signup.sec.account')}</h3>
        <div className={styles.grid}>{renderFields(ACCOUNT_FIELDS)}</div>

        {/* B. 기본 / 소속 정보 */}
        <h3 className={styles.sectionTitle}>{t('auth.signup.sec.basic')}</h3>
        <div className={styles.grid}>{renderFields(BASIC_FIELDS)}</div>

        {/* C. KORION Wallet 연결 */}
        <h3 className={styles.sectionTitle}>{t('auth.signup.sec.wallet')}</h3>
        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('auth.signup.f.wallet')}</span>
          <div className={styles.inputRow}>
            <input className={styles.input} type="text" placeholder="앱에서 인증번호 확인" />
            <button type="button" className={styles.smallBtn}>
              {t('auth.signup.btn.walletLink')}
            </button>
          </div>
        </div>

        {/* D. 매장 기본 정보 (가맹점만) */}
        {cfg.store && (
          <>
            <h3 className={styles.sectionTitle}>{t('auth.signup.sec.store')}</h3>
            <div className={styles.grid}>{renderFields(STORE_FIELDS)}</div>
            <div className={styles.field}>
              <span className={styles.fieldLabel}>{t('auth.signup.f.storeImage')}</span>
              <div className={styles.inputRow}>
                <input className={styles.input} type="text" readOnly placeholder="사진" />
                <button type="button" className={styles.smallBtn}>
                  {t('profile.req.upload')}
                </button>
              </div>
            </div>
          </>
        )}

        {/* 동의 체크 */}
        <h3 className={styles.sectionTitle}>{t('auth.signup.sec.agree')}</h3>
        <label className={`${styles.agree} ${styles.agreeAll}`}>
          <input type="checkbox" /> {t('auth.signup.agreeAll')}
        </label>
        {AGREEMENTS.map((n) => (
          <label key={n} className={styles.agree}>
            <input type="checkbox" /> {t(`auth.signup.agree.${n}`)}
          </label>
        ))}

        {/* 버튼 */}
        <div className={styles.buttons}>
          <Button variant="secondary" onClick={() => navigate('/login')}>
            {t('auth.signup.cancel')}
          </Button>
          <Button variant="primary" onClick={() => setConfirmOpen(true)}>
            {t('auth.signup.submit')}
          </Button>
        </div>
      </section>

      {/* 확인 모달 */}
      {confirmOpen && (
        <div className={styles.overlay} onClick={() => setConfirmOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>{t('auth.signup.modal.title')}</h3>
            <p className={styles.modalDesc}>{t('auth.signup.modal.desc')}</p>
            <div className={styles.modalButtons}>
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                {t('auth.signup.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setConfirmOpen(false)
                  setDone(true)
                }}
              >
                {t('auth.signup.submit')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 완료 토스트 → 해당 역할 로그인 화면으로 */}
      {done && (
        <div
          className={styles.toast}
          onClick={() => navigate(`/login/${role}`)}
          role="status"
        >
          {t('auth.signup.toast')}
        </div>
      )}
    </AuthShell>
  )
}
