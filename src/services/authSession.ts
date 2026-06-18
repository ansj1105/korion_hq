import type { Role } from '../roles'

const ROLE_BY_API_ROLE: Record<string, Role> = {
  LEADER: 'leader',
  PARTNER: 'partner',
  MERCHANT: 'merchant',
}

const API_ROLE_BY_ROLE: Record<Role, 'LEADER' | 'PARTNER' | 'MERCHANT'> = {
  leader: 'LEADER',
  partner: 'PARTNER',
  merchant: 'MERCHANT',
}

export interface AuthSession {
  userId: string
  role: Role
  partnerId?: string
  merchantId?: string
  countryScopes?: string
}

export function apiRoleFor(role: Role) {
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
