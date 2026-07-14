import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'
import data from './leaderMerchantsData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
}

/** "가맹점별" 탭 행 원본 데이터 형태 (Figma 81:25012 샘플값 하드코딩) */
export interface LeaderMerchantRow {
  no: string
  partnerCode: string
  merchantCode: string
  merchantName: string
  monthVolume: string
  monthTxCount: string
  fee: string
  lastPaidAt: string
  usage: string
}

const emptyLeaderMerchantsData = {
  kpi: [],
  rows: [],
} as typeof data

/*
 * useLeaderMerchants — "국가 리더별 거래내역" 화면의 "가맹점별" 탭 데이터 훅
 * ------------------------------------------------------------------
 * useLeaderPartners와 같은 이유로 파일 분리: 다른 브랜치에서 기존 훅의
 * API 연동 작업이 병렬 진행 중이라 기존 훅의 반환 구조를 건드리면 안 됨.
 * KPI 라벨은 파트너별 탭과 문구가 같아 partners.kpi.* 키를 재사용한다.
 */
export function useLeaderMerchants(leaderCode?: string) {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData(
    `/api/hq/leaders/${encodeURIComponent(leaderCode ?? '')}/sales/merchants`,
    emptyLeaderMerchantsData,
    { leaderCode },
  )

  const kpi: StatCardData[] = (pageData.kpi as KpiRaw[]).map((s) => ({ id: s.id, label: t(s.labelKey), value: s.value }))

  const columns: Column[] = [
    { key: 'no', label: t('hqLeaderSales.merchants.col.no'), width: '0.5fr' },
    { key: 'partnerCode', label: t('hqLeaderSales.merchants.col.partnerCode'), width: '1.1fr' },
    { key: 'merchantCode', label: t('hqLeaderSales.merchants.col.merchantCode'), width: '1.1fr' },
    { key: 'merchantName', label: t('hqLeaderSales.merchants.col.merchantName'), width: '1fr' },
    { key: 'monthVolume', label: t('hqLeaderSales.merchants.col.monthVolume'), width: '0.9fr' },
    { key: 'monthTxCount', label: t('hqLeaderSales.merchants.col.monthTxCount'), width: '1fr' },
    { key: 'fee', label: t('hqLeaderSales.merchants.col.fee'), width: '0.9fr' },
    { key: 'lastPaidAt', label: t('hqLeaderSales.merchants.col.lastPaidAt'), width: '1fr' },
    { key: 'usage', label: t('hqLeaderSales.merchants.col.usage'), width: '1.4fr' },
    { key: 'action', label: t('hqLeaderSales.merchants.col.action'), width: '0.7fr' },
  ]

  return { kpi, columns, rows: pageData.rows as LeaderMerchantRow[], isLoading, error }
}
