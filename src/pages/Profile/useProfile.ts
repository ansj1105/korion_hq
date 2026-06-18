import { useTranslation } from '../../i18n'
import { useLeaderPageData } from '../../hooks/useLeaderPageData'
import data from './profileData.json'

/** 상단 상태 칩(라벨 + 색 알약 값) */
export interface StatusItem {
  label: string
  value: string
  chip: string
}
/** 입력 필드(라벨 + 값). wide면 그리드 2칸 차지 */
export interface ProfileField {
  label: string
  value: string
  wide?: boolean
}

interface StatusRaw {
  labelKey: string
  value: string
  chip: string
}
interface FieldRaw {
  labelKey: string
  value: string
  wide?: boolean
}

/*
 * useProfile — 내 권한/설정 · 프로필 정보 데이터 훅
 * ------------------------------------------------------------------
 * 상단 상태 요약 + 계정/소속 정보 필드. 라벨(UI)은 번역, 값(코드·국가·상태 등)은 데이터 그대로.
 * (상태 enum "검토중/대기"도 데이터 값이라 번역하지 않는다.)
 */
export function useProfile() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useLeaderPageData('/api/leader/profile', data)

  const statusItems: StatusItem[] = (pageData.statusItems as StatusRaw[]).map((s) => ({
    label: t(s.labelKey),
    value: s.value,
    chip: s.chip,
  }))

  const toFields = (fields: FieldRaw[]): ProfileField[] =>
    fields.map((f) => ({ label: t(f.labelKey), value: f.value, wide: f.wide }))

  return {
    statusItems,
    code: pageData.code,
    accountFields: toFields(pageData.accountFields as FieldRaw[]),
    basicFields: toFields(pageData.basicFields as FieldRaw[]),
    isLoading,
    error,
  }
}
