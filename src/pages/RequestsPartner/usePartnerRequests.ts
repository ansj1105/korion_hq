import { useTranslation } from '../../i18n'
import type { AccentKey } from '../../types'
import type { StatCardData } from '../../components/molecules/StatCard'
import type { Column } from '../../components/organisms/DataTable'
import { useLeaderPageData } from '../../hooks/useLeaderPageData'
import data from './partnerData.json'

/** JSON 원본 지표 형태 (라벨은 i18n 키) */
interface StatRaw {
  id: string
  labelKey: string
  value: string
  tag?: string
  tagAccent?: string
}

/** 파트너 테이블 행 원본 데이터 형태 */
export interface PartnerRow {
  no: string
  code: string
  name: string
  region: string
  subCount: string
  volume: string
  txCount: string
  hqStatus: string
  opStatus: string
  date: string
}

/** 모든 행 공통 액션 배지 라벨 (enum/데이터 — 번역 대상 아님) */
export const PARTNER_ACTIONS = ['승인요청', '정지요청', '상세'] as const

/*
 * usePartnerRequests — 파트너 가입 요청 데이터 훅
 * ------------------------------------------------------------------
 * partnerData.json(하드코딩)을 읽어, UI 라벨(지표/컬럼명)은 현재 언어로 번역해 반환.
 * 행 값은 데이터라 그대로 둔다. 추후 API 연동 시 이 훅 내부만 교체.
 */
export function usePartnerRequests() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useLeaderPageData('/api/leader/partner-applications', data)

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    tag: s.tag,
    tagAccent: s.tagAccent as AccentKey | undefined,
  }))

  // 컬럼 라벨은 번역, 폭/정렬 등 구조는 고정
  const columns: Column[] = [
    { key: 'no', label: t('partner.col.no'), width: '0.5fr', align: 'center' },
    { key: 'code', label: t('partner.col.code'), width: '1.1fr' },
    { key: 'name', label: t('partner.col.name'), width: '1.1fr' },
    { key: 'region', label: t('partner.col.region'), width: '0.9fr' },
    { key: 'subCount', label: t('partner.col.subCount'), width: '1fr' },
    { key: 'volume', label: t('partner.col.volume'), width: '1.2fr' },
    { key: 'txCount', label: t('partner.col.txCount'), width: '1fr' },
    { key: 'hqStatus', label: t('partner.col.hqStatus'), width: '1fr' },
    { key: 'opStatus', label: t('partner.col.opStatus'), width: '0.9fr' },
    { key: 'date', label: t('partner.col.date'), width: '1.1fr' },
    { key: 'action', label: t('partner.col.action'), width: '1.8fr' },
  ]

  return { stats, columns, rows: pageData.rows as PartnerRow[], isLoading, error }
}
