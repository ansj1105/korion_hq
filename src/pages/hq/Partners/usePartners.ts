import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import data from './partnersData.json'

interface StatRaw {
  id: string
  labelKey: string
  value: string
}

/** 파트너 전체 목록(본사) 행 원본 데이터 형태 (Figma 샘플값 하드코딩) */
export interface HqPartnerListRow {
  no: string
  appliedAt: string
  leaderCode: string
  partnerCode: string
  country: string
  partnerName: string
  subMerchantCount: string
  monthVolume: string
  monthTxCount: string
  unsettledFee: string
  actions: string[]
}

/*
 * usePartners (hq) — 본사어드민 "파트너 전체 목록" 데이터 훅
 * ------------------------------------------------------------------
 * 리더 어드민의 usePartners와 컬럼이 다름(상위 리더 코드 컬럼 추가 등 — 국가를
 * 가로지르는 본사 시점 뷰라 컬럼 구성이 다르다는 게 Figma 확인 결과 확정됨).
 */
export function usePartners() {
  const { t } = useTranslation()

  const stats: StatCardData[] = (data.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqPartnerList.col.no'), width: '1fr' },
    { key: 'appliedAt', label: t('hqPartnerList.col.appliedAt'), width: '1fr' },
    { key: 'leaderCode', label: t('hqPartnerList.col.leaderCode'), width: '1.1fr' },
    { key: 'partnerCode', label: t('hqPartnerList.col.partnerCode'), width: '1.1fr' },
    { key: 'country', label: t('hqPartnerList.col.country'), width: '0.9fr' },
    { key: 'partnerName', label: t('hqPartnerList.col.partnerName'), width: '0.9fr' },
    { key: 'subMerchantCount', label: t('hqPartnerList.col.subMerchantCount'), width: '0.9fr' },
    { key: 'monthVolume', label: t('hqPartnerList.col.monthVolume'), width: '1fr' },
    { key: 'monthTxCount', label: t('hqPartnerList.col.monthTxCount'), width: '0.9fr' },
    { key: 'unsettledFee', label: t('hqPartnerList.col.unsettledFee'), width: '1fr' },
    { key: 'action', label: t('hqPartnerList.col.action'), width: '1.3fr' },
  ]

  return { stats, columns, rows: data.rows as HqPartnerListRow[] }
}
