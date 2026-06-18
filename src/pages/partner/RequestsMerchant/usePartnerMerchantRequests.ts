import { useTranslation } from '../../../i18n'
import type { AccentKey } from '../../../types'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { usePartnerPageData } from '../../../hooks/usePartnerPageData'
import data from './partnerMerchantData.json'

/** JSON 원본 지표 형태 (라벨은 i18n 키, 태그는 데이터) */
interface StatRaw {
  id: string
  labelKey: string
  value: string
  tag?: string
  tagAccent?: string
}

/** 가맹점 가입 요청 행 원본 데이터 형태 */
export interface PartnerMerchantRow {
  no: string
  code: string
  name: string
  telegram: string
  region: string
  industry: string
  opStatus: string
  date: string
}

/**
 * 행 공통 액션 배지 라벨 (enum/데이터 — 번역 대상 아님).
 * 파트너는 리더에게 "승인요청"을 보낸다(리더 화면의 "승인"과 다름).
 */
export const PARTNER_MERCHANT_ACTIONS = ['승인요청', '거절', '보류', '자료요청', '상세'] as const

/*
 * usePartnerMerchantRequests — 파트너 · 가맹점 가입 요청 데이터 훅
 * ------------------------------------------------------------------
 * 지표/컬럼명(UI)은 번역, 행 값은 데이터 그대로. 컬럼 라벨은 리더와 동일해 merchant.col.* 재사용.
 */
export function usePartnerMerchantRequests() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = usePartnerPageData('/api/partner/merchant-applications', data)

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    tag: s.tag,
    tagAccent: s.tagAccent as AccentKey | undefined,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('merchant.col.no'), width: '0.5fr', align: 'center' },
    { key: 'code', label: t('merchant.col.code'), width: '1.1fr' },
    { key: 'name', label: t('merchant.col.name'), width: '1.2fr' },
    { key: 'telegram', label: t('merchant.col.telegram'), width: '1.1fr' },
    { key: 'region', label: t('merchant.col.region'), width: '0.9fr' },
    { key: 'industry', label: t('merchant.col.industry'), width: '0.9fr' },
    { key: 'opStatus', label: t('merchant.col.opStatus'), width: '0.9fr' },
    { key: 'date', label: t('merchant.col.date'), width: '1.1fr' },
    { key: 'action', label: t('merchant.col.action'), width: '2.2fr' },
  ]

  return { stats, columns, rows: pageData.rows as PartnerMerchantRow[], isLoading, error }
}
