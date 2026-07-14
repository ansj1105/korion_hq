import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'
import data from './leaderPartnersData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
}

/** "파트너별" 탭 행 원본 데이터 형태 (Figma 81:24823 샘플값 하드코딩) */
export interface LeaderPartnerRow {
  no: string
  code: string
  partnerName: string
  telegramId: string
  region: string
  subMerchantCount: string
  monthVolume: string
  monthTxCount: string
  unsettledFee: string
  lastActive: string
}

const emptyLeaderPartnersData = {
  kpi: [],
  rows: [],
} as typeof data

/*
 * useLeaderPartners — "국가 리더별 거래내역" 화면의 "파트너별" 탭 데이터 훅
 * ------------------------------------------------------------------
 * useLeaderSales에 합치지 않고 파일을 분리한 이유: 다른 브랜치에서 기존 훅의
 * API 연동 작업이 병렬 진행 중이라 기존 훅의 반환 구조를 건드리면 안 됨.
 * 추후 실데이터 연동 시 이 훅 내부만 API 호출로 교체하면 된다.
 */
export function useLeaderPartners(leaderCode?: string) {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData(
    `/api/hq/leaders/${encodeURIComponent(leaderCode ?? '')}/sales/partners`,
    emptyLeaderPartnersData,
    { leaderCode },
  )

  const kpi: StatCardData[] = (pageData.kpi as KpiRaw[]).map((s) => ({ id: s.id, label: t(s.labelKey), value: s.value }))

  const columns: Column[] = [
    { key: 'no', label: t('hqLeaderSales.partners.col.no'), width: '0.5fr' },
    { key: 'code', label: t('hqLeaderSales.partners.col.code'), width: '1.1fr' },
    { key: 'partnerName', label: t('hqLeaderSales.partners.col.partnerName'), width: '1fr' },
    { key: 'telegramId', label: t('hqLeaderSales.partners.col.telegramId'), width: '1fr' },
    { key: 'region', label: t('hqLeaderSales.partners.col.region'), width: '0.8fr' },
    { key: 'subMerchantCount', label: t('hqLeaderSales.partners.col.subMerchantCount'), width: '1fr' },
    { key: 'monthVolume', label: t('hqLeaderSales.partners.col.monthVolume'), width: '1fr' },
    { key: 'monthTxCount', label: t('hqLeaderSales.partners.col.monthTxCount'), width: '1.1fr' },
    { key: 'unsettledFee', label: t('hqLeaderSales.partners.col.unsettledFee'), width: '1fr' },
    { key: 'lastActive', label: t('hqLeaderSales.partners.col.lastActive'), width: '1fr' },
    { key: 'action', label: t('hqLeaderSales.partners.col.action'), width: '0.7fr' },
  ]

  return { kpi, columns, rows: pageData.rows as LeaderPartnerRow[], isLoading, error }
}
