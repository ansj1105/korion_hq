const API_BASE_URL = (import.meta.env.VITE_KORION_CHONG_API_URL ?? '').replace(/\/$/, '')
type Headers = Record<string, string>

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const params = new URLSearchParams()
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.set(key, String(value))
  })
  const suffix = params.toString() ? `?${params.toString()}` : ''
  const normalizedPath = API_BASE_URL.endsWith('/api') && path.startsWith('/api/')
    ? path.slice('/api'.length)
    : path
  return `${API_BASE_URL}${normalizedPath}${suffix}`
}

function leaderHeaders() {
  return {
    'X-Leader-Id':
      window.localStorage.getItem('korion.leaderId') ??
      import.meta.env.VITE_KORION_LEADER_ID ??
      '1',
    'X-Country-Scopes':
      window.localStorage.getItem('korion.countryScopes') ??
      import.meta.env.VITE_KORION_COUNTRY_SCOPES ??
      'KR,JP',
  }
}

function partnerHeaders() {
  return {
    'X-Partner-Id':
      window.localStorage.getItem('korion.partnerId') ??
      import.meta.env.VITE_KORION_PARTNER_ID ??
      '',
    'X-Country-Scopes':
      window.localStorage.getItem('korion.countryScopes') ??
      import.meta.env.VITE_KORION_COUNTRY_SCOPES ??
      '',
  }
}

function merchantHeaders() {
  return {
    'X-Merchant-Id':
      window.localStorage.getItem('korion.merchantId') ??
      import.meta.env.VITE_KORION_MERCHANT_ID ??
      '',
    'X-Country-Scopes':
      window.localStorage.getItem('korion.countryScopes') ??
      import.meta.env.VITE_KORION_COUNTRY_SCOPES ??
      '',
  }
}

export async function getJson<T>(path: string, query?: Record<string, string | number | undefined>, headers?: Headers) {
  const response = await fetch(buildUrl(path, query), {
    headers,
  })
  if (!response.ok) {
    throw new Error(`KORION Chong API ${response.status}`)
  }
  return response.json() as Promise<T>
}

export function fetchLeaderPageData<T>(path: string, query?: Record<string, string | number | undefined>) {
  return getJson<T>(path, query, leaderHeaders())
}

export function fetchPartnerPageData<T>(path: string, query?: Record<string, string | number | undefined>) {
  return getJson<T>(path, query, partnerHeaders())
}

export function fetchMerchantPageData<T>(path: string, query?: Record<string, string | number | undefined>) {
  return getJson<T>(path, query, merchantHeaders())
}

async function postJson<T>(path: string, body: unknown) {
  const response = await fetch(buildUrl(path), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    let detail = ''
    try {
      const payload = (await response.json()) as { code?: string; message?: string }
      detail = payload.code ?? payload.message ?? ''
    } catch {
      detail = ''
    }
    throw new Error(detail || `KORION Chong API ${response.status}`)
  }
  return response.json() as Promise<T>
}

function requestId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export interface LeaderDashboardApiResponse {
  leaderProfile: {
    leaderId: number
    userId: number
    loginId: string
    status: 'COUNTRY_LEADER_APPROVED'
    countryScopes: string[]
  }
  kpis: {
    approvedPartnerCount: number
    approvedMerchantCount: number
    completedTransactionAmount: string
    confirmedCommissionAmount: string
  }
  organizationSummary: {
    partnerCount: number
    merchantCount: number
  }
  monthlyVolume: Array<{
    month: string
    amount: string
    transactionCount: number
  }>
  feeSummary: {
    countryLeaderFee: string
    salesPartnerFee: string
    korionFee: string
  }
  riskAlerts: Array<{
    type: string
    severity: 'low' | 'medium' | 'high'
    message: string
  }>
}

export interface LeaderPartnerApiResponse {
  items: Array<{
    partnerId: number
    userId: number
    loginId: string
    country: string
    region?: string
    city?: string
    status: 'SALES_PARTNER_APPROVED'
    merchantCount: number
    completedTransactionAmount: string
    lastActivityAt?: string
  }>
  page?: {
    page: number
    size: number
    totalItems: number
  }
}

export function fetchLeaderDashboard(period: string, countryScope: string) {
  return getJson<LeaderDashboardApiResponse>('/api/leader/dashboard', {
    period,
    countryScope,
  }, leaderHeaders())
}

export function fetchLeaderPartners(countryScope: string, page = 0, size = 20) {
  return getJson<LeaderPartnerApiResponse>('/api/leader/partners', {
    countryScope,
    status: 'SALES_PARTNER_APPROVED',
    page,
    size,
  }, leaderHeaders())
}

export type SignupAvailabilityField =
  | 'loginId'
  | 'email'
  | 'telegram'
  | 'phone'
  | 'whatsapp'
  | 'walletAddress'

export interface AvailabilityApiResponse {
  available: boolean
  field: SignupAvailabilityField
  resultCode: 'AVAILABLE' | 'DUPLICATE'
  messageKey: string
}

export interface ReferralCodeValidationApiResponse {
  valid: boolean
  code: string
  codeType?: string
  ownerPartnerId?: number
  country?: string
  city?: string
  resultCode: string
  messageKey: string
}

export interface SignupCountryOptionApiResponse {
  code: string
  nameEn: string
  nameKo?: string | null
  flag?: string | null
}

export interface SignupOptionsApiResponse {
  countries: SignupCountryOptionApiResponse[]
}

export interface SignupApplicationApiRequest {
  applicantType: 'PARTNER' | 'MERCHANT'
  loginId: string
  password: string
  email: string
  companyName: string
  contactName: string
  phone?: string
  telegram?: string
  whatsapp?: string
  referralCode?: string
  country?: string
  region?: string
  city?: string
  address?: string
  businessType?: string
  walletAddress?: string
  integrationPlan?: string
  evidenceNote?: string
  requestId?: string
}

export interface SignupApplicationApiResponse {
  applicationId: number
  status: 'REQUESTED'
  resultCode: 'SIGNUP_APPLICATION_SUBMITTED'
  messageKey: string
  walletStored: boolean
}

export interface EmailVerificationSendApiResponse {
  resultCode: 'EMAIL_VERIFICATION_SENT'
  messageKey: string
  expiresAt: string
}

export interface EmailVerificationConfirmApiResponse {
  verified: boolean
  resultCode: 'EMAIL_VERIFIED'
  messageKey: string
}

export interface WalletLinkVerifyApiResponse {
  verified: boolean
  authStatus: 'VERIFIED'
  resultCode: 'WALLET_VERIFIED'
  messageKey: string
}

export interface WalletAddressValidateApiResponse {
  verified: boolean
  walletNetwork: 'TRON' | 'BTC' | 'EVM'
  authStatus: 'VERIFIED'
  resultCode: 'WALLET_ADDRESS_VERIFIED'
  messageKey: string
}

export interface LoginApiRequest {
  loginId: string
  password: string
  role: 'LEADER' | 'PARTNER' | 'MERCHANT'
  twoFactorCode?: string
  requestId?: string
}

export interface LoginApiResponse {
  authenticated: boolean
  userId: number
  role: 'LEADER' | 'PARTNER' | 'MERCHANT'
  partnerId?: number | null
  merchantId?: number | null
  countryScopes: string[]
  redirectPath: '/leader/dashboard' | '/partner/dashboard' | '/merchant/dashboard'
  requiresTwoFactor: boolean
  sessionExpiresAt?: string | null
  resultCode: 'LOGIN_SUCCESS'
  messageKey: string
}

export function login(payload: Omit<LoginApiRequest, 'requestId'>) {
  return postJson<LoginApiResponse>('/api/auth/login', {
    ...payload,
    requestId: requestId(`login-${payload.role.toLowerCase()}`),
  })
}

export function checkSignupAvailability(field: SignupAvailabilityField, value: string) {
  return getJson<AvailabilityApiResponse>('/api/auth/availability', { field, value })
}

export function validateReferralCode(code: string) {
  return getJson<ReferralCodeValidationApiResponse>(`/api/auth/referral-codes/${encodeURIComponent(code)}/validate`)
}

export function fetchSignupOptions() {
  return getJson<SignupOptionsApiResponse>('/api/auth/signup-options')
}

export function sendEmailVerification(email: string, requestId?: string, locale?: 'ko' | 'en') {
  return postJson<EmailVerificationSendApiResponse>('/api/auth/email-verifications/send', {
    email,
    requestId,
    locale,
  })
}

export function confirmEmailVerification(email: string, code: string, requestId?: string) {
  return postJson<EmailVerificationConfirmApiResponse>('/api/auth/email-verifications/confirm', {
    email,
    code,
    requestId,
  })
}

export function verifyWalletLink(
  applicantType: 'PARTNER' | 'MERCHANT',
  email: string,
  walletAddress: string,
  nonce: string,
  signature: string,
  requestId?: string,
) {
  return postJson<WalletLinkVerifyApiResponse>('/api/auth/wallet-links/verify', {
    applicantType,
    email,
    walletAddress,
    nonce,
    signature,
    requestId,
  })
}

export function validateWalletAddress(
  applicantType: 'PARTNER' | 'MERCHANT',
  email: string,
  walletAddress: string,
  requestId?: string,
) {
  return postJson<WalletAddressValidateApiResponse>('/api/auth/wallet-addresses/validate', {
    applicantType,
    email,
    walletAddress,
    requestId,
  })
}

export function createSignupApplication(payload: SignupApplicationApiRequest) {
  return postJson<SignupApplicationApiResponse>('/api/auth/signup-applications', payload)
}
