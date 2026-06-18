import { useTranslation } from '../../i18n'
import type { StatCardData } from '../../components/molecules/StatCard'
import type { Column } from '../../components/organisms/DataTable'
import { useLeaderPageData } from '../../hooks/useLeaderPageData'
import data from './merchantData.json'

/** JSON 원본 지표 형태 (라벨은 i18n 키) */
interface StatRaw {
  id: string
  labelKey: string
  value: string
}

/** 가맹점 테이블 행 원본 데이터 형태 */
export interface MerchantRow {
  no: string
  code: string
  name: string
  telegram: string
  region: string
  industry: string
  opStatus: string
  date: string
}

/** 모든 행 공통 액션 배지 라벨 (enum/데이터 — 번역 대상 아님) */
export const MERCHANT_ACTIONS = ['승인', '거절', '보류', '자료요청', '상세'] as const

/*
 * useMerchantRequests — 가맹점 가입 요청 데이터 훅
 * ------------------------------------------------------------------
 * merchantData.json(하드코딩)을 읽어, UI 라벨(지표/컬럼명)은 번역해 반환한다.
 * 행 값은 데이터라 그대로 둔다. 추후 API 연동 시 이 훅 내부만 교체.
 */
export function useMerchantRequests() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useLeaderPageData('/api/leader/merchant-applications', data)

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
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

  return { stats, columns, rows: pageData.rows as MerchantRow[], isLoading, error }
}
