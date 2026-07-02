import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Button from '../../../components/atoms/Button'
import AuthShell from '../AuthShell'
import { useTranslation } from '../../../i18n'
import {
  checkSignupAvailability,
  createSignupApplication,
  fetchSignupOptions,
  sendEmailVerification,
  validateReferralCode,
  confirmEmailVerification,
  validateWalletAddress,
  type SignupCountryOptionApiResponse,
  type SignupAvailabilityField,
} from '../../../services/korionChongApi'
import data from './signupData.json'
import styles from './RoleSignup.module.css'

interface ModeDef {
  key: string
  labelKey: string
  descKey: string
  type: 'code' | 'hq'
  codePlaceholderKey?: string
  confirmed?: string
}
const CFG = data as Record<
  string,
  { titleKey: string; subtitleKey: string; modes: ModeDef[]; store: boolean }
>

/** 입력 한 칸 (라벨 + placeholder, 선택적으로 우측 버튼/넓게) */
interface FieldDef {
  name: keyof SignupForm
  labelKey: string
  placeholderKey?: string
  type?: string
  buttonKey?: string
  action?: 'availability' | 'sendEmail' | 'confirmEmail'
  availabilityField?: SignupAvailabilityField
  wide?: boolean
}

interface SignupForm {
  loginId: string
  email: string
  emailCode: string
  password: string
  passwordConfirm: string
  telegram: string
  whatsapp: string
  twitter: string
  companyName: string
  contactName: string
  country: string
  region: string
  language: string
  integrationPlan: string
  storeName: string
  ownerName: string
  address: string
  industry: string
  evidenceNote: string
  walletAddress: string
  referralCode: string
}

interface AlertModalState {
  title: string
  message: string
}

interface VerifiedReferralCodeState {
  modeKey: string
  code: string
}

/* A. 계정 정보 */
const EMAIL_SEND_FIELD: FieldDef = {
  name: 'email',
  labelKey: 'auth.signup.f.email',
  placeholderKey: 'auth.signup.placeholder.email',
  buttonKey: 'auth.signup.btn.sendCode',
  action: 'sendEmail',
}
const ACCOUNT_FIELDS: FieldDef[] = [
  { name: 'loginId', labelKey: 'auth.signup.f.id', placeholderKey: 'auth.signup.placeholder.loginId', buttonKey: 'auth.signup.btn.dupCheck', action: 'availability', availabilityField: 'loginId' },
  EMAIL_SEND_FIELD,
  // Screenshot target: keep the email verification code input out of the initial form.
  // It is rendered only after a code is sent.
  // { name: 'emailCode', labelKey: 'auth.signup.f.emailCode', placeholderKey: 'auth.signup.placeholder.emailCode', buttonKey: 'auth.signup.btn.verify', action: 'confirmEmail' },
  { name: 'password', labelKey: 'auth.signup.f.pw', placeholderKey: 'auth.signup.placeholder.password', type: 'password' },
  { name: 'passwordConfirm', labelKey: 'auth.signup.f.pwConfirm', placeholderKey: 'auth.signup.placeholder.password', type: 'password' },
  { name: 'telegram', labelKey: 'auth.signup.f.telegram', placeholderKey: 'auth.signup.placeholder.telegram' },
  { name: 'whatsapp', labelKey: 'auth.signup.f.phone', placeholderKey: 'auth.signup.placeholder.phone' },
  { name: 'twitter', labelKey: 'auth.signup.f.twitter', placeholderKey: 'auth.signup.placeholder.twitter' },
]
const EMAIL_CODE_FIELD: FieldDef = {
  name: 'emailCode',
  labelKey: 'auth.signup.f.emailCode',
  placeholderKey: 'auth.signup.placeholder.emailCode',
  buttonKey: 'auth.signup.btn.verify',
  action: 'confirmEmail',
}

/* B. 기본 / 소속 정보 */
const BASIC_FIELDS: FieldDef[] = [
  { name: 'companyName', labelKey: 'auth.signup.f.name', placeholderKey: 'auth.signup.placeholder.companyName' },
  { name: 'country', labelKey: 'auth.signup.f.country', placeholderKey: 'auth.signup.placeholder.country' },
  { name: 'region', labelKey: 'auth.signup.f.region', placeholderKey: 'auth.signup.placeholder.region' },
  { name: 'language', labelKey: 'auth.signup.f.language', placeholderKey: 'auth.signup.placeholder.language' },
  { name: 'integrationPlan', labelKey: 'auth.signup.f.hqReason', placeholderKey: 'auth.signup.placeholder.hqReason' },
]

/* D. 매장 기본 정보 (가맹점만) */
const STORE_FIELDS: FieldDef[] = [
  { name: 'storeName', labelKey: 'auth.signup.f.storeName', placeholderKey: 'auth.signup.placeholder.storeName' },
  { name: 'ownerName', labelKey: 'auth.signup.f.owner', placeholderKey: 'auth.signup.placeholder.ownerName' },
  { name: 'address', labelKey: 'auth.signup.f.address', placeholderKey: 'auth.signup.placeholder.address' },
  { name: 'industry', labelKey: 'auth.signup.f.industry', placeholderKey: 'auth.signup.placeholder.industry' },
]

const SIGNUP_COUNTRY_FALLBACK_OPTIONS: SignupCountryOptionApiResponse[] = [
  { code: 'NG', nameEn: 'Nigeria', nameKo: '나이지리아', flag: '🇳🇬' },
  { code: 'KR', nameEn: 'Korea (South)', nameKo: '대한민국', flag: '🇰🇷' },
  { code: 'US', nameEn: 'United States', nameKo: '미국', flag: '🇺🇸' },
]
const AGREEMENTS = ['1', '2', '3', '4', '5', '6']
const EMAIL_VERIFICATION_TTL_SECONDS = 300
const LEADER_CODE_PATTERN = /^[A-Z]{2}-LEAD-[0-9]{3}$/
const PARTNER_CODE_PATTERN = /^[A-Z]{2}-SP-[0-9]{3}$/
const LOGIN_ID_PATTERN = /^[A-Za-z0-9]{1,20}$/
const EMAIL_ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_NUMBER_PATTERN = /\d/
const PASSWORD_SPECIAL_PATTERN = /[^A-Za-z0-9]/
const PHONE_NUMBER_PATTERN = /^\+?[0-9\s().-]{7,24}$/
const TWITTER_PROFILE_PATTERN = /^@?[A-Za-z0-9_]{1,30}$/

const normalizeReferralCode = (value: string) => value.trim().toUpperCase()
const isValidEmailAddress = (value: string) => EMAIL_ADDRESS_PATTERN.test(value.trim())
const hasPasswordNumberAndSpecial = (value: string) =>
  value.length >= 8 && PASSWORD_NUMBER_PATTERN.test(value) && PASSWORD_SPECIAL_PATTERN.test(value)
const isValidPhoneNumber = (value: string) => {
  const trimmed = value.trim()
  const digitCount = trimmed.replace(/\D/g, '').length
  return PHONE_NUMBER_PATTERN.test(trimmed) && digitCount >= 7 && digitCount <= 15
}
const textValidationMessageKey = (name: keyof SignupForm, value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (name === 'loginId' && !LOGIN_ID_PATTERN.test(trimmed)) return 'auth.signup.validation.loginIdInvalid'
  if (name === 'whatsapp' && !isValidPhoneNumber(trimmed)) return 'auth.signup.validation.phoneInvalid'
  if (name === 'twitter' && !TWITTER_PROFILE_PATTERN.test(trimmed)) return 'auth.signup.validation.twitterInvalid'
  return ''
}
const formatRemainingTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
  const paddedSeconds = String(seconds % 60).padStart(2, '0')
  return `${minutes}:${paddedSeconds}`
}
const referralPatternForMode = (modeKey: string) => (
  modeKey === 'partner' ? PARTNER_CODE_PATTERN : LEADER_CODE_PATTERN
)
const referralExampleForMode = (modeKey: string) => (
  modeKey === 'partner' ? 'KR-SP-004' : 'KR-LEAD-001'
)

/*
 * RoleSignup (page) — 역할별 회원가입 (파트너/가맹점)
 * ------------------------------------------------------------------
 * 가입 방식 탭(리더 코드/파트너 코드/본사 직접) + A.계정 / B.기본·소속 / C.Wallet
 *  (+ 가맹점: D.매장 정보) + 동의 체크 + 가입 신청.
 * 아이디 중복 확인과 이메일 인증을 통과해야 확인 모달과 가입 신청 제출이 가능하다.
 */
export default function RoleSignup() {
  const { role } = useParams<{ role: string }>()
  const navigate = useNavigate()
  const { lang, t } = useTranslation()

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [done, setDone] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [mode, setMode] = useState('leader')
  const [busy, setBusy] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [alertModal, setAlertModal] = useState<AlertModalState | null>(null)
  const [countryOptions, setCountryOptions] = useState<SignupCountryOptionApiResponse[]>(SIGNUP_COUNTRY_FALLBACK_OPTIONS)
  const [emailVerificationSent, setEmailVerificationSent] = useState(false)
  const [emailVerificationModalOpen, setEmailVerificationModalOpen] = useState(false)
  const [emailVerificationExpiresAtMs, setEmailVerificationExpiresAtMs] = useState<number | null>(null)
  const [emailVerificationRemainingSeconds, setEmailVerificationRemainingSeconds] = useState(0)
  const [verifiedReferralCode, setVerifiedReferralCode] = useState<VerifiedReferralCodeState | null>(null)
  const [checks, setChecks] = useState({
    loginId: false,
    emailVerified: false,
    walletAddress: false,
    referralCode: false,
  })
  const [agreements, setAgreements] = useState<Record<string, boolean>>(
    Object.fromEntries(AGREEMENTS.map((key) => [key, false])),
  )
  const [form, setForm] = useState<SignupForm>({
    loginId: '',
    email: '',
    emailCode: '',
    password: '',
    passwordConfirm: '',
    telegram: '',
    whatsapp: '',
    twitter: '',
    companyName: '',
    contactName: '',
    country: '',
    region: '',
    language: '',
    integrationPlan: '',
    storeName: '',
    ownerName: '',
    address: '',
    industry: '',
    evidenceNote: '',
    walletAddress: '',
    referralCode: '',
  })

  useEffect(() => {
    let cancelled = false
    fetchSignupOptions()
      .then((response) => {
        if (cancelled) return
        setCountryOptions(response.countries.length > 0 ? response.countries : SIGNUP_COUNTRY_FALLBACK_OPTIONS)
      })
      .catch(() => {
        if (!cancelled) setCountryOptions(SIGNUP_COUNTRY_FALLBACK_OPTIONS)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!emailVerificationExpiresAtMs || checks.emailVerified) {
      setEmailVerificationRemainingSeconds(0)
      return
    }
    const refreshRemainingSeconds = () => {
      const nextSeconds = Math.max(0, Math.ceil((emailVerificationExpiresAtMs - Date.now()) / 1000))
      setEmailVerificationRemainingSeconds(nextSeconds)
      if (nextSeconds === 0) {
        setEmailVerificationExpiresAtMs(null)
      }
    }
    refreshRemainingSeconds()
    const intervalId = window.setInterval(refreshRemainingSeconds, 1000)
    return () => window.clearInterval(intervalId)
  }, [checks.emailVerified, emailVerificationExpiresAtMs])

  if (!role || !CFG[role]) return <Navigate to="/login" replace />
  const cfg = CFG[role]
  const requestId = `signup-${role}-${form.loginId || form.email || 'draft'}`
  const allAgreementsChecked = AGREEMENTS.every((key) => agreements[key])
  const isReferralCodeConfirmedForMode = (modeKey: string) => (
    checks.referralCode
    && verifiedReferralCode?.modeKey === modeKey
    && verifiedReferralCode.code === normalizeReferralCode(form.referralCode)
  )
  const activeReferralCodeConfirmed = isReferralCodeConfirmedForMode(mode)
  const emailCodeVisible = emailVerificationModalOpen && emailVerificationSent && !checks.emailVerified
  const showFormStatusNotice = statusMessage === t('auth.signup.email.verified')
    || statusMessage === t('auth.signup.wallet.verifiedAlert')
    || statusMessage.startsWith(t('auth.signup.submitCompleteMessage'))

  const updateField = (name: keyof SignupForm, value: string) => {
    setForm((current) => ({ ...current, [name]: value }))
    if (name === 'loginId') setChecks((current) => ({ ...current, loginId: false }))
    if (name === 'email') {
      setChecks((current) => ({ ...current, emailVerified: false }))
      setEmailVerificationSent(false)
      setEmailVerificationModalOpen(false)
      setEmailVerificationExpiresAtMs(null)
      setEmailVerificationRemainingSeconds(0)
    }
    if (name === 'walletAddress') {
      setChecks((current) => ({ ...current, walletAddress: false }))
      setStatusMessage('')
    }
    if (name === 'referralCode') {
      setChecks((current) => ({ ...current, referralCode: false }))
      setVerifiedReferralCode(null)
    }
  }

  const runAction = async (field: FieldDef) => {
    setStatusMessage('')
    setBusy(true)
    try {
      if (field.action === 'availability' && field.availabilityField) {
        const value = form[field.name]
        if (!value.trim()) throw new Error(t('auth.signup.validation.valueRequiredBeforeCheck'))
        if (field.availabilityField === 'loginId' && !LOGIN_ID_PATTERN.test(value.trim())) {
          throw new Error(t('auth.signup.validation.loginIdInvalid'))
        }
        const result = await checkSignupAvailability(field.availabilityField, value.trim())
        if (field.availabilityField === 'loginId') {
          setChecks((current) => ({ ...current, loginId: result.available }))
          setAlertModal({
            title: t('auth.signup.availability.loginIdTitle'),
            message: result.available
              ? t('auth.signup.availability.loginIdAvailable')
              : t('auth.signup.availability.loginIdDuplicate'),
          })
        }
        setStatusMessage(result.available
          ? t('auth.signup.availability.available')
          : t('auth.signup.availability.duplicate'))
      }
      if (field.action === 'sendEmail') {
        if (!form.email.trim()) throw new Error(t('auth.signup.email.required'))
        if (!isValidEmailAddress(form.email)) throw new Error(t('auth.signup.email.invalid'))
        setChecks((current) => ({ ...current, emailVerified: false }))
        const response = await sendEmailVerification(form.email.trim(), requestId)
        const parsedExpiresAt = Date.parse(response.expiresAt)
        const expiresAtMs = Number.isFinite(parsedExpiresAt)
          ? parsedExpiresAt
          : Date.now() + EMAIL_VERIFICATION_TTL_SECONDS * 1000
        setEmailVerificationSent(true)
        setEmailVerificationExpiresAtMs(expiresAtMs)
        setEmailVerificationRemainingSeconds(Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000)))
        setEmailVerificationModalOpen(true)
        setStatusMessage('')
      }
      if (field.action === 'confirmEmail') {
        if (!form.email.trim() || !form.emailCode.trim()) throw new Error(t('auth.signup.email.codeRequired'))
        const response = await confirmEmailVerification(form.email.trim(), form.emailCode.trim(), requestId)
        setChecks((current) => ({ ...current, emailVerified: response.verified }))
        if (response.verified) {
          setEmailVerificationExpiresAtMs(null)
          setEmailVerificationRemainingSeconds(0)
          setEmailVerificationModalOpen(false)
          setAlertModal({
            title: t('auth.signup.email.verifyTitle'),
            message: t('auth.signup.email.verifiedAlert'),
          })
          setStatusMessage(t('auth.signup.email.verified'))
        } else {
          setAlertModal({
            title: t('auth.signup.email.verifyTitle'),
            message: t('auth.signup.email.invalidCodeAlert'),
          })
          setStatusMessage(t('auth.signup.email.invalidCodeAlert'))
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.signup.requestFailed')
      if (field.action === 'sendEmail') {
        const displayMessage = emailVerificationErrorMessage(message)
        setAlertModal({
          title: t('auth.signup.email.verifyTitle'),
          message: displayMessage,
        })
        setStatusMessage(displayMessage)
        return
      }
      if (field.action === 'confirmEmail') {
        setChecks((current) => ({ ...current, emailVerified: false }))
        setAlertModal({
          title: t('auth.signup.email.verifyTitle'),
          message: message === t('auth.signup.email.codeRequired')
            ? message
            : t('auth.signup.email.invalidCodeAlert'),
        })
      }
      if (field.action === 'availability' && field.availabilityField === 'loginId') {
        setChecks((current) => ({ ...current, loginId: false }))
        setAlertModal({
          title: t('auth.signup.availability.loginIdTitle'),
          message,
        })
      }
      setStatusMessage(message)
    } finally {
      setBusy(false)
    }
  }

  const checkReferral = async (code: string) => {
    const normalizedCode = normalizeReferralCode(code)
    setStatusMessage('')
    if (!normalizedCode) {
      setChecks((current) => ({ ...current, referralCode: false }))
      setVerifiedReferralCode(null)
      setStatusMessage(t('auth.signup.referral.required').replace('{example}', referralExampleForMode(mode)))
      return
    }
    if (!referralPatternForMode(mode).test(normalizedCode)) {
      setChecks((current) => ({ ...current, referralCode: false }))
      setVerifiedReferralCode(null)
      setStatusMessage(t('auth.signup.referral.invalidFormat').replace('{example}', referralExampleForMode(mode)))
      return
    }
    setForm((current) => ({ ...current, referralCode: normalizedCode }))
    setBusy(true)
    try {
      const result = await validateReferralCode(normalizedCode)
      setChecks((current) => ({ ...current, referralCode: result.valid }))
      setVerifiedReferralCode(result.valid ? { modeKey: mode, code: normalizedCode } : null)
      setAlertModal({
        title: t('auth.signup.referral.checkTitle'),
        message: result.valid
          ? t('auth.signup.referral.verifiedAlert')
          : t('auth.signup.referral.invalid'),
      })
      setStatusMessage(result.valid ? t('auth.signup.referral.valid') : t('auth.signup.referral.invalid'))
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.signup.referral.apiError')
      setChecks((current) => ({ ...current, referralCode: false }))
      setVerifiedReferralCode(null)
      setAlertModal({
        title: t('auth.signup.referral.apiErrorTitle'),
        message,
      })
      setStatusMessage(message)
    } finally {
      setBusy(false)
    }
  }

  const checkWalletAddress = async () => {
    setStatusMessage('')
    setBusy(true)
    try {
      if (!form.walletAddress.trim()) throw new Error(t('auth.signup.wallet.required'))
      const applicantType = role === 'merchant' ? 'MERCHANT' : 'PARTNER'
      const result = await validateWalletAddress(
        applicantType,
        form.email.trim(),
        form.walletAddress.trim(),
        requestId,
      )
      setChecks((current) => ({ ...current, walletAddress: result.verified }))
      if (!result.verified) {
        throw new Error(t('auth.signup.wallet.invalidAlert'))
      }
      setAlertModal({
        title: t('auth.signup.wallet.verifyTitle'),
        message: t('auth.signup.wallet.verifiedAlert'),
      })
      setStatusMessage(t('auth.signup.wallet.verifiedAlert'))
    } catch (error) {
      setChecks((current) => ({ ...current, walletAddress: false }))
      const message = error instanceof Error && error.message === t('auth.signup.wallet.required')
        ? error.message
        : t('auth.signup.wallet.invalidAlert')
      setAlertModal({
        title: t('auth.signup.wallet.verifyTitle'),
        message,
      })
      setStatusMessage(message)
    } finally {
      setBusy(false)
    }
  }

  const normalizeCountry = (value: string) => {
    const code = value.trim().toUpperCase()
    return /^[A-Z]{2}$/.test(code) ? code : undefined
  }

  const submitApplication = async () => {
    setStatusMessage('')
    setBusy(true)
    try {
      const validationError = validateBeforeConfirm()
      if (validationError) {
        throw new Error(validationError)
      }
      const applicantType = role === 'merchant' ? 'MERCHANT' : 'PARTNER'
      const companyName = applicantType === 'MERCHANT'
        ? form.storeName.trim()
        : form.companyName.trim()
      const contactName = applicantType === 'MERCHANT'
        ? form.ownerName.trim()
        : form.contactName.trim() || form.companyName.trim()
      const directContractReason = form.integrationPlan.trim()
      if (!form.loginId.trim() || !form.email.trim() || !form.password || !companyName || !contactName) {
        throw new Error(t('auth.signup.validation.requiredBasics'))
      }
      if (form.password !== form.passwordConfirm) {
        throw new Error(t('auth.signup.password.mismatch'))
      }
      if (!hasPasswordNumberAndSpecial(form.password)) {
        throw new Error(t('auth.signup.password.requireNumberSpecial'))
      }
      if (mode === 'hq' && !directContractReason) {
        throw new Error(t('auth.signup.validation.hqReasonRequired'))
      }
      if (mode !== 'hq' && !activeReferralCodeConfirmed) {
        throw new Error(t('auth.signup.validation.referralRequired'))
      }
      const response = await createSignupApplication({
        applicantType,
        loginId: form.loginId.trim(),
        password: form.password,
        email: form.email.trim(),
        companyName,
        contactName,
        phone: form.whatsapp.trim() || undefined,
        telegram: form.telegram.trim() || undefined,
        whatsapp: form.whatsapp.trim() || undefined,
        referralCode: mode === 'hq' ? undefined : form.referralCode.trim() || undefined,
        country: normalizeCountry(form.country),
        region: form.region.trim() || undefined,
        city: undefined,
        address: form.address.trim() || undefined,
        businessType: form.industry.trim() || undefined,
        walletAddress: form.walletAddress.trim() || undefined,
        integrationPlan: mode === 'hq' ? directContractReason : undefined,
        evidenceNote: form.evidenceNote.trim() || undefined,
        requestId,
      })
      setConfirmOpen(false)
      setDone(false)
      setAlertModal({
        title: t('auth.signup.submitCompleteTitle'),
        message: t('auth.signup.submitCompleteMessage'),
      })
      setStatusMessage(`${t('auth.signup.submitCompleteMessage')} (${response.status})`)
    } catch (error) {
      const message = error instanceof Error ? error.message : t('auth.signup.submitFailed')
      setStatusMessage(message)
      setAlertModal({
        title: t('auth.signup.validation.title'),
        message,
      })
    } finally {
      setBusy(false)
    }
  }

  const validateBeforeConfirm = () => {
    const applicantType = role === 'merchant' ? 'MERCHANT' : 'PARTNER'
    const companyName = applicantType === 'MERCHANT' ? form.storeName.trim() : form.companyName.trim()
    const contactName = applicantType === 'MERCHANT' ? form.ownerName.trim() : form.contactName.trim() || form.companyName.trim()
    if (!form.loginId.trim()) {
      return t('auth.signup.validation.loginIdRequired')
    }
    if (!checks.loginId) {
      return t('auth.signup.validation.loginIdCheckRequired')
    }
    if (!form.email.trim()) {
      return t('auth.signup.email.required')
    }
    if (!checks.emailVerified) {
      return t('auth.signup.validation.emailVerifyRequired')
    }
    if (!form.password) {
      return t('auth.signup.validation.passwordRequired')
    }
    if (!form.passwordConfirm) {
      return t('auth.signup.validation.passwordConfirmRequired')
    }
    if (form.password !== form.passwordConfirm) {
      return t('auth.signup.password.mismatch')
    }
    if (!hasPasswordNumberAndSpecial(form.password)) {
      return t('auth.signup.password.requireNumberSpecial')
    }
    if (!form.telegram.trim()) {
      return t('auth.signup.validation.telegramRequired')
    }
    const phoneValidationKey = textValidationMessageKey('whatsapp', form.whatsapp)
    if (!form.whatsapp.trim()) {
      return t('auth.signup.validation.phoneRequired')
    }
    if (phoneValidationKey) {
      return t(phoneValidationKey)
    }
    const twitterValidationKey = textValidationMessageKey('twitter', form.twitter)
    if (twitterValidationKey) {
      return t(twitterValidationKey)
    }
    if (!companyName) {
      return applicantType === 'MERCHANT'
        ? t('auth.signup.validation.storeNameRequired')
        : t('auth.signup.validation.companyNameRequired')
    }
    if (!contactName) {
      return t('auth.signup.validation.contactNameRequired')
    }
    if (!form.country.trim()) {
      return t('auth.signup.validation.countryRequired')
    }
    if (!normalizeCountry(form.country)) {
      return t('auth.signup.validation.countryInvalid')
    }
    if (!form.region.trim()) {
      return t('auth.signup.validation.regionRequired')
    }
    if (!form.language.trim()) {
      return t('auth.signup.validation.languageRequired')
    }
    if (!form.walletAddress.trim() || !checks.walletAddress) {
      return t('auth.signup.wallet.requiredCheck')
    }
    if (mode !== 'hq' && (!form.referralCode.trim() || !activeReferralCodeConfirmed)) {
      return t('auth.signup.validation.referralRequired')
    }
    if (mode === 'hq' && !form.integrationPlan.trim()) {
      return t('auth.signup.validation.hqReasonRequired')
    }
    if (applicantType === 'MERCHANT' && (!form.address.trim() || !form.industry.trim())) {
      return t('auth.signup.validation.storeAddressIndustryRequired')
    }
    if (applicantType === 'MERCHANT' && !form.evidenceNote.trim()) {
      return t('auth.signup.validation.evidenceRequired')
    }
    if (!allAgreementsChecked) {
      return t('auth.signup.validation.agreementsRequired')
    }
    return ''
  }

  const fieldValidationMessageKey = (name: keyof SignupForm) => {
    const immediateValidationKey = textValidationMessageKey(name, form[name])
    if (immediateValidationKey) return immediateValidationKey
    if (!submitAttempted) return ''

    const applicantType = role === 'merchant' ? 'MERCHANT' : 'PARTNER'
    if (name === 'loginId') {
      if (!form.loginId.trim()) return 'auth.signup.validation.loginIdRequired'
      if (!checks.loginId) return 'auth.signup.validation.loginIdCheckRequired'
    }
    if (name === 'email') {
      if (!form.email.trim()) return 'auth.signup.email.required'
      if (!isValidEmailAddress(form.email)) return 'auth.signup.email.invalid'
      if (!checks.emailVerified) return 'auth.signup.validation.emailVerifyRequired'
    }
    if (name === 'emailCode' && emailCodeVisible && !form.emailCode.trim()) {
      return 'auth.signup.email.codeRequired'
    }
    if (name === 'password') {
      if (!form.password) return 'auth.signup.validation.passwordRequired'
      if (!hasPasswordNumberAndSpecial(form.password)) return 'auth.signup.password.requireNumberSpecial'
    }
    if (name === 'passwordConfirm') {
      if (!form.passwordConfirm) return 'auth.signup.validation.passwordConfirmRequired'
      if (form.password !== form.passwordConfirm) return 'auth.signup.password.mismatch'
    }
    if (name === 'telegram') {
      if (!form.telegram.trim()) return 'auth.signup.validation.telegramRequired'
    }
    if (name === 'whatsapp') {
      if (!form.whatsapp.trim()) return 'auth.signup.validation.phoneRequired'
      if (!isValidPhoneNumber(form.whatsapp)) return 'auth.signup.validation.phoneInvalid'
    }
    if (name === 'companyName' && applicantType === 'PARTNER' && !form.companyName.trim()) {
      return 'auth.signup.validation.companyNameRequired'
    }
    if (name === 'storeName' && applicantType === 'MERCHANT' && !form.storeName.trim()) {
      return 'auth.signup.validation.storeNameRequired'
    }
    if (name === 'ownerName' && applicantType === 'MERCHANT' && !form.ownerName.trim()) {
      return 'auth.signup.validation.contactNameRequired'
    }
    if (name === 'country') {
      if (!form.country.trim()) return 'auth.signup.validation.countryRequired'
      if (!normalizeCountry(form.country)) return 'auth.signup.validation.countryInvalid'
    }
    if (name === 'region' && !form.region.trim()) return 'auth.signup.validation.regionRequired'
    if (name === 'language' && !form.language.trim()) return 'auth.signup.validation.languageRequired'
    if (name === 'integrationPlan' && mode === 'hq' && !form.integrationPlan.trim()) {
      return 'auth.signup.validation.hqReasonRequired'
    }
    if (name === 'address' && applicantType === 'MERCHANT' && !form.address.trim()) {
      return 'auth.signup.validation.storeAddressIndustryRequired'
    }
    if (name === 'industry' && applicantType === 'MERCHANT' && !form.industry.trim()) {
      return 'auth.signup.validation.storeAddressIndustryRequired'
    }
    if (name === 'evidenceNote' && applicantType === 'MERCHANT' && !form.evidenceNote.trim()) {
      return 'auth.signup.validation.evidenceRequired'
    }
    if (name === 'walletAddress' && (!form.walletAddress.trim() || !checks.walletAddress)) {
      return 'auth.signup.wallet.requiredCheck'
    }
    return ''
  }

  const referralValidationMessage = () => {
    if (!submitAttempted || mode === 'hq' || activeReferralCodeConfirmed) return ''
    return t('auth.signup.validation.referralRequired')
  }

  const emailVerificationErrorMessage = (message: string) => {
    if (message === 'EMAIL_DELIVERY_NOT_CONFIGURED') return t('auth.signup.email.deliveryNotConfigured')
    if (message === 'EMAIL_DELIVERY_FAILED') return t('auth.signup.email.deliveryFailed')
    return message
  }

  const selectSignupMode = (modeKey: string) => {
    if (modeKey !== mode) {
      setForm((current) => ({ ...current, referralCode: '' }))
      setChecks((current) => ({ ...current, referralCode: false }))
      setVerifiedReferralCode(null)
    }
    setMode(modeKey)
  }

  const openHqReviewNotice = () => {
    setAlertModal({
      title: t('auth.signup.hqReview'),
      message: t('auth.signup.hqReviewReasonRequiredAlert'),
    })
  }

  const openConfirmModal = () => {
    setSubmitAttempted(true)
    const error = validateBeforeConfirm()
    if (error) {
      setStatusMessage(error)
      setAlertModal({
        title: t('auth.signup.validation.title'),
        message: error,
      })
      return
    }
    setStatusMessage('')
    setConfirmOpen(true)
  }

  const handleCancel = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/login')
  }

  const toggleAgreement = (key: string, checked: boolean) => {
    setAgreements((current) => ({ ...current, [key]: checked }))
  }

  const toggleAllAgreements = (checked: boolean) => {
    setAgreements(Object.fromEntries(AGREEMENTS.map((key) => [key, checked])))
  }

  const countryOptionLabel = (option: SignupCountryOptionApiResponse) => {
    const countryName = lang === 'en'
      ? option.nameEn || option.nameKo
      : option.nameKo || option.nameEn
    return [option.flag, option.code, countryName].filter(Boolean).join(' · ')
  }

  const renderFields = (fields: FieldDef[]) =>
    fields.map((f) => {
      const isCountry = f.name === 'country'
      const isEmailCode = f.name === 'emailCode'
      const isEmailSendButton = f.action === 'sendEmail'
      const isEmailConfirmButton = f.action === 'confirmEmail'
      const fieldValidationKey = fieldValidationMessageKey(f.name)
      const buttonLabelKey = isEmailSendButton
        ? checks.emailVerified
          ? 'auth.signup.btn.emailVerified'
          : emailVerificationSent
            ? 'auth.signup.btn.resendCode'
            : f.buttonKey
        : isEmailConfirmButton && checks.emailVerified
          ? 'auth.signup.btn.emailVerified'
          : f.buttonKey
      const buttonDisabled = busy || ((isEmailSendButton || isEmailConfirmButton) && checks.emailVerified)
      const hasFieldError = Boolean(fieldValidationKey)
      const fieldErrorId = `${String(f.name)}-error`
      return (
        <div key={f.labelKey} className={`${styles.formField} ${f.wide ? styles.formFieldWide : ''}`}>
          <span className={styles.fieldLabel}>{t(f.labelKey)}</span>
          <div className={styles.fieldControlRow}>
            {isCountry ? (
              <select
                className={`${styles.fieldControl} ${hasFieldError ? styles.fieldControlError : ''}`}
                value={form.country}
                onChange={(e) => updateField('country', e.target.value)}
                aria-label={t(f.labelKey)}
                aria-invalid={hasFieldError || undefined}
                aria-describedby={hasFieldError ? fieldErrorId : undefined}
              >
                <option value="">{t('auth.signup.placeholder.countrySelect')}</option>
                {countryOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {countryOptionLabel(option)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className={`${styles.fieldControl} ${hasFieldError ? styles.fieldControlError : ''}`}
                type={f.type ?? 'text'}
                placeholder={f.placeholderKey ? t(f.placeholderKey) : ''}
                value={form[f.name]}
                onChange={(e) => updateField(f.name, e.target.value)}
                aria-label={t(f.labelKey)}
                aria-invalid={hasFieldError || undefined}
                aria-describedby={hasFieldError ? fieldErrorId : undefined}
              />
            )}
            {f.buttonKey && (
              <button type="button" className={styles.fieldActionButton} disabled={buttonDisabled} onClick={() => runAction(f)}>
                {t(buttonLabelKey ?? f.buttonKey)}
              </button>
            )}
          </div>
          {hasFieldError && (
            <span id={fieldErrorId} className={styles.fieldError}>
              {t(fieldValidationKey)}
            </span>
          )}
          {isEmailCode && emailVerificationRemainingSeconds > 0 && !checks.emailVerified && (
            <span className={styles.fieldHint} aria-live="polite">
              {t('auth.signup.email.remaining')} {formatRemainingTime(emailVerificationRemainingSeconds)}
            </span>
          )}
          {isEmailCode && checks.emailVerified && (
            <span className={styles.fieldSuccess}>{t('auth.signup.email.verified')}</span>
          )}
        </div>
      )
    })

  return (
    <AuthShell title={t(cfg.titleKey)} subtitle={t(cfg.subtitleKey)}>
      <section className={styles.signupPanel}>
        {/* 가입 방식 카드 — 각 카드에 추천인(코드) 입력란 포함. 선택 시 보더 강조 */}
        <div className={styles.modeCardGrid}>
          {cfg.modes.map((m) => {
            const selected = mode === m.key
            return (
              <button
                key={m.key}
                type="button"
                className={`${styles.modeCard} ${selected ? styles.modeCardActive : styles.modeCardInactive}`}
                aria-pressed={selected}
                onClick={() => selectSignupMode(m.key)}
              >
                <span className={styles.modeBadge}>{t(m.labelKey)}</span>
                <span className={styles.modeDescription}>{t(m.descKey)}</span>

                {m.type === 'code' ? (
                  // 추천인(리더/파트너) 코드 입력 + 코드 확인 버튼.
                  // '확인 완료' 상태 배지는 입력란 안 우측에 겹쳐 표시(Figma 기준).
                  <>
                    <div className={styles.referralCodeRow}>
                      <div className={styles.referralCodeInputWrap}>
                        <input
                          className={styles.referralCodeInput}
                          type="text"
                          placeholder={m.confirmed ?? (m.codePlaceholderKey ? t(m.codePlaceholderKey) : '')}
                          value={selected ? form.referralCode : ''}
                          readOnly={!selected}
                          tabIndex={selected ? 0 : -1}
                          aria-disabled={!selected}
                          onClick={(e) => {
                            if (selected) e.stopPropagation()
                          }}
                          onChange={(e) => {
                            if (selected) updateField('referralCode', e.target.value)
                          }}
                        />
                        {selected && isReferralCodeConfirmedForMode(m.key) && (
                          <span className={styles.referralCodeConfirmedBadge}>{t('auth.signup.codeConfirmed')}</span>
                        )}
                      </div>
                      <span
                        className={`${styles.referralCodeCheckButton} ${styles.codeCheckBtn}`}
                        role="button"
                        tabIndex={selected ? 0 : -1}
                        aria-disabled={!selected}
                        onClick={(e) => {
                          if (!selected) return
                          e.stopPropagation()
                          checkReferral(form.referralCode)
                        }}
                        onKeyDown={(e) => {
                          if (!selected) return
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            e.stopPropagation()
                            checkReferral(form.referralCode)
                          }
                        }}
                      >
                        {t('auth.signup.btn.codeCheck')}
                      </span>
                    </div>
                    {selected && referralValidationMessage() && (
                      <span className={styles.modeFieldError}>{referralValidationMessage()}</span>
                    )}
                  </>
                ) : (
                  // 본사 직접 계약: 본사 검토 필요 배지
                  <span
                    className={styles.hqReviewBadge}
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation()
                      selectSignupMode(m.key)
                      openHqReviewNotice()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        e.stopPropagation()
                        selectSignupMode(m.key)
                        openHqReviewNotice()
                      }
                    }}
                  >
                    {t('auth.signup.hqReview')}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* A. 계정 정보 */}
        <h3 className={styles.sectionTitle}>{t('auth.signup.sec.account')}</h3>
        <div className={styles.formFieldGrid}>{renderFields(ACCOUNT_FIELDS)}</div>

        {/* B. 기본 / 소속 정보 */}
        <h3 className={styles.sectionTitle}>{t('auth.signup.sec.basic')}</h3>
        <div className={styles.formFieldGrid}>{renderFields(BASIC_FIELDS)}</div>

        {/* C. KORION Wallet 연결 */}
        <h3 className={styles.sectionTitle}>{t('auth.signup.sec.wallet')}</h3>
        <div className={styles.formField}>
          <span className={styles.fieldLabel}>{t('auth.signup.f.wallet')}</span>
          <div className={`${styles.fieldControlRow} ${styles.walletControlRow}`}>
            <input
              className={`${styles.fieldControl} ${fieldValidationMessageKey('walletAddress') ? styles.fieldControlError : ''}`}
              type="text"
              placeholder={t('auth.signup.placeholder.wallet')}
              value={form.walletAddress}
              onChange={(e) => updateField('walletAddress', e.target.value)}
              aria-invalid={Boolean(fieldValidationMessageKey('walletAddress')) || undefined}
              aria-describedby={fieldValidationMessageKey('walletAddress') ? 'walletAddress-error' : undefined}
            />
            <button type="button" className={styles.fieldActionButton} disabled={busy || checks.walletAddress} onClick={checkWalletAddress}>
              {checks.walletAddress ? t('auth.signup.btn.walletVerified') : t('auth.signup.btn.walletLink')}
            </button>
          </div>
          {fieldValidationMessageKey('walletAddress') && (
            <span id="walletAddress-error" className={styles.fieldError}>
              {t(fieldValidationMessageKey('walletAddress'))}
            </span>
          )}
        </div>

        {showFormStatusNotice && <div className={styles.formStatusNotice}>{statusMessage}</div>}

        {/* D. 매장 기본 정보 (가맹점만) */}
        {cfg.store && (
          <>
            <h3 className={styles.sectionTitle}>{t('auth.signup.sec.store')}</h3>
            <div className={styles.formFieldGrid}>{renderFields(STORE_FIELDS)}</div>
            <div className={styles.formField}>
              <span className={styles.fieldLabel}>{t('auth.signup.f.evidence')}</span>
              <div className={styles.fieldControlRow}>
                <input
                  className={`${styles.fieldControl} ${fieldValidationMessageKey('evidenceNote') ? styles.fieldControlError : ''}`}
                  type="text"
                  placeholder={t('auth.signup.placeholder.evidence')}
                  value={form.evidenceNote}
                  onChange={(e) => updateField('evidenceNote', e.target.value)}
                  aria-label={t('auth.signup.f.evidence')}
                  aria-invalid={Boolean(fieldValidationMessageKey('evidenceNote')) || undefined}
                  aria-describedby={fieldValidationMessageKey('evidenceNote') ? 'evidenceNote-error' : undefined}
                />
              </div>
              {fieldValidationMessageKey('evidenceNote') && (
                <span id="evidenceNote-error" className={styles.fieldError}>
                  {t(fieldValidationMessageKey('evidenceNote'))}
                </span>
              )}
            </div>
          </>
        )}

        {/* 동의 체크 */}
        <h3 className={styles.sectionTitle}>{t('auth.signup.sec.agree')}</h3>
        <label className={[
          styles.agreementItem,
          styles.agreementAllItem,
          allAgreementsChecked ? styles.agreementAllItemActive : '',
        ].filter(Boolean).join(' ')}>
          <input
            type="checkbox"
            checked={allAgreementsChecked}
            onChange={(e) => toggleAllAgreements(e.target.checked)}
            aria-label={t('auth.signup.agreeAll')}
          /> {t('auth.signup.agreeAll')}
        </label>
        {AGREEMENTS.map((n) => (
          <label
            key={n}
            className={[
              styles.agreementItem,
              agreements[n] ? styles.agreementItemChecked : '',
            ].filter(Boolean).join(' ')}
          >
            <input
              type="checkbox"
              checked={agreements[n]}
              onChange={(e) => toggleAgreement(n, e.target.checked)}
              aria-label={t(`auth.signup.agree.${n}`)}
            /> {t(`auth.signup.agree.${n}`)}
          </label>
        ))}

        {/* 버튼 */}
        <div className={styles.formFooterActions}>
          <Button variant="secondary" onClick={handleCancel}>
            {t('auth.signup.cancel')}
          </Button>
          <Button variant="primary" onClick={openConfirmModal}>
            {t('auth.signup.submit')}
          </Button>
        </div>
      </section>

      {/* 확인 모달 */}
      {confirmOpen && (
        <div className={styles.dialogOverlay} onClick={() => setConfirmOpen(false)}>
          <div className={styles.dialogPanel} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.dialogTitle}>{t('auth.signup.modal.title')}</h3>
            <p className={styles.dialogDescription}>{t('auth.signup.modal.desc')}</p>
            <div className={styles.dialogActions}>
              <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
                {t('auth.signup.cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={submitApplication}
              >
                {t('auth.signup.submit')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {emailCodeVisible && (
        <div className={styles.dialogOverlay} onClick={() => setEmailVerificationModalOpen(false)}>
          <div
            className={styles.dialogPanel}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="signup-email-code-title"
          >
            <h3 id="signup-email-code-title" className={styles.dialogTitle}>{t('auth.signup.email.verifyTitle')}</h3>
            <p className={styles.dialogDescription}>{t('auth.signup.email.sent')}</p>
            <label className={styles.dialogField} htmlFor="signup-email-code">
              <span className={styles.fieldLabel}>{t('auth.signup.f.emailCode')}</span>
              <input
                id="signup-email-code"
                className={`${styles.fieldControl} ${fieldValidationMessageKey('emailCode') ? styles.fieldControlError : ''}`}
                type="text"
                inputMode="numeric"
                placeholder={t('auth.signup.placeholder.emailCode')}
                value={form.emailCode}
                onChange={(e) => updateField('emailCode', e.target.value)}
                aria-invalid={Boolean(fieldValidationMessageKey('emailCode')) || undefined}
                aria-describedby={fieldValidationMessageKey('emailCode') ? 'signup-email-code-error' : undefined}
              />
            </label>
            {fieldValidationMessageKey('emailCode') && (
              <span id="signup-email-code-error" className={styles.fieldError}>
                {t(fieldValidationMessageKey('emailCode'))}
              </span>
            )}
            {emailVerificationRemainingSeconds > 0 && (
              <span className={styles.fieldHint} aria-live="polite">
                {t('auth.signup.email.remaining')} {formatRemainingTime(emailVerificationRemainingSeconds)}
              </span>
            )}
            <div className={styles.dialogActions}>
              <Button variant="secondary" onClick={() => setEmailVerificationModalOpen(false)}>
                {t('auth.signup.cancel')}
              </Button>
              <Button variant="secondary" disabled={busy} onClick={() => runAction(EMAIL_SEND_FIELD)}>
                {t('auth.signup.btn.resendCode')}
              </Button>
              <Button variant="primary" disabled={busy} onClick={() => runAction(EMAIL_CODE_FIELD)}>
                {t('auth.signup.btn.verify')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {alertModal && (
        <div className={styles.dialogOverlay} onClick={() => setAlertModal(null)}>
          <div
            className={styles.dialogPanel}
            onClick={(e) => e.stopPropagation()}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="signup-alert-title"
          >
            <h3 id="signup-alert-title" className={styles.dialogTitle}>{alertModal.title}</h3>
            <p className={styles.dialogDescription}>{alertModal.message}</p>
            <div className={styles.dialogActions}>
              <Button variant="primary" onClick={() => setAlertModal(null)}>
                {t('auth.signup.alert.confirm')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 완료 토스트 → 해당 역할 로그인 화면으로 */}
      {done && (
        <div
          className={styles.successToast}
          onClick={() => navigate(`/login/${role}`)}
          role="status"
        >
          {t('auth.signup.toast')}
        </div>
      )}
    </AuthShell>
  )
}
