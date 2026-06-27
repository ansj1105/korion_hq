import type { Role } from '../roles'

const ROLE_BY_API_ROLE: Record<string, Role> = {
  HQ: 'hq',
  LEADER: 'leader',
  PARTNER: 'partner',
  MERCHANT: 'merchant',
}

// satisfies로 둬야 키별 리터럴 타입('LEADER' 등)이 유지된다 — Record<Role, ...>로 명시하면
// 모든 값이 합집합 타입으로 뭉개져서 apiRoleFor()의 반환 타입이 좁혀지지 않는다.
const API_ROLE_BY_ROLE = {
  hq: 'HQ',
  leader: 'LEADER',
  partner: 'PARTNER',
  merchant: 'MERCHANT',
} satisfies Record<Role, 'HQ' | 'LEADER' | 'PARTNER' | 'MERCHANT'>

export interface AuthSession {
  userId: string
  role: Role
  partnerId?: string
  merchantId?: string
  countryScopes?: string
}

// 제네릭으로 두어, 호출부의 role 타입(예: 'leader'|'partner'|'merchant'만 쓰는 로그인 폼)에 맞춰
// 반환 타입도 좁혀진다 — 'hq'를 모르는 기존 호출부가 'HQ'까지 받게 되는 걸 막는다.
export function apiRoleFor<R extends Role>(role: R): (typeof API_ROLE_BY_ROLE)[R] {
  return API_ROLE_BY_ROLE[role]
}

export function readAuthSession(): AuthSession | null {
  const userId = window.localStorage.getItem('korion.userId')
  const apiRole = window.localStorage.getItem('korion.role')
  const role = apiRole ? ROLE_BY_API_ROLE[apiRole] : undefined

  if (!userId || !role) return null

  return {
    userId,
    role,
    partnerId: window.localStorage.getItem('korion.partnerId') ?? undefined,
    merchantId: window.localStorage.getItem('korion.merchantId') ?? undefined,
    countryScopes: window.localStorage.getItem('korion.countryScopes') ?? undefined,
  }
}

export function sessionCountryScopes(session = readAuthSession()) {
  return (
    session?.countryScopes
      ?.split(',')
      .map((scope) => scope.trim())
      .filter(Boolean) ?? []
  )
}

export function defaultSessionCountryScope(fallback = 'KR') {
  return sessionCountryScopes()[0] ?? fallback
}

export function clearAuthSession() {
  [
    'korion.userId',
    'korion.role',
    'korion.leaderId',
    'korion.partnerId',
    'korion.merchantId',
    'korion.countryScopes',
  ].forEach((key) => window.localStorage.removeItem(key))
}
