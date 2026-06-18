import { useTranslation } from '../../../i18n'
import { usePartnerPageData } from '../../../hooks/usePartnerPageData'
import data from './partnerProfileData.json'

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
 * usePartnerProfile — 파트너 · 프로필 정보 데이터 훅
 * ------------------------------------------------------------------
 * 리더 프로필과 동일 구조이며 '내 코드'만 파트너 값(NG-SP-0004)으로 다르다.
 * 라벨(UI)은 번역, 값(코드·국가·상태 등)은 데이터 그대로. UI 키는 profile.* 재사용.
 */
export function usePartnerProfile() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = usePartnerPageData('/api/partner/profile', data)

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
