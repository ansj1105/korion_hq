import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { login, type LoginApiResponse } from '../../../services/korionChongApi'
import { apiRoleFor } from '../../../services/authSession'
import data from './roleLoginData.json'

export type RoleKey = 'leader' | 'partner' | 'merchant'

type RoleConfig = {
  titleKey: string
  subtitleKey: string
  buttonKey: string
  accessRoleKey: string
  chip: string
}

type LoginForm = {
  loginId: string
  password: string
  twoFactorCode: string
  keepSignedIn: boolean
}

const ROLE_CFG = data as Record<RoleKey, RoleConfig>

function persistLogin(response: LoginApiResponse) {
  window.localStorage.setItem('korion.userId', String(response.userId))
  window.localStorage.setItem('korion.role', response.role)

  if (response.partnerId != null) {
    window.localStorage.setItem('korion.leaderId', String(response.partnerId))
    window.localStorage.setItem('korion.partnerId', String(response.partnerId))
  }
  if (response.merchantId != null) {
    window.localStorage.setItem('korion.merchantId', String(response.merchantId))
  }
  if (response.countryScopes.length > 0) {
    window.localStorage.setItem('korion.countryScopes', response.countryScopes.join(','))
  }
}

export function useRoleLogin() {
  const { role } = useParams<{ role: string }>()
  const navigate = useNavigate()
  const roleKey = role && role in ROLE_CFG ? (role as RoleKey) : null
  const cfg = roleKey ? ROLE_CFG[roleKey] : null
  const [form, setForm] = useState<LoginForm>({
    loginId: '',
    password: '',
    twoFactorCode: '',
    keepSignedIn: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const accessRows = useMemo(() => {
    if (!cfg) return []
    return [
      { labelKey: 'auth.access.row.access', valueKey: cfg.accessRoleKey },
      { labelKey: 'auth.access.row.security', valueKey: 'auth.access.val.security' },
      { labelKey: 'auth.access.row.session', valueKey: 'auth.access.val.session' },
      { labelKey: 'auth.access.row.history', valueKey: 'auth.access.val.history' },
    ]
  }, [cfg])

  const updateField = (name: keyof LoginForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [name]: value }))
  }

  const submit = async () => {
    if (!roleKey) return
    setError(null)
    if (!form.loginId.trim() || !form.password) {
      setError('아이디와 비밀번호를 입력하세요.')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await login({
        loginId: form.loginId.trim(),
        password: form.password,
        role: apiRoleFor(roleKey),
      })
      persistLogin(response)
      navigate(response.redirectPath)
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 요청 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    roleKey,
    cfg,
    form,
    accessRows,
    isSubmitting,
    error,
    updateField,
    submit,
  }
}
