import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import data from './merchantsData.json'

interface StatRaw {
  id: string
  labelKey: string
  value: string
}

/** 가맹점 전체 목록(본사) 행 원본 데이터 형태 (Figma 샘플값 하드코딩) */
export interface HqMerchantListRow {
  no: string
  leaderCode: string
  partnerCode: string
  country: string
  region: string
  merchantName: string
  businessType: string
  monthVolume: string
  monthTxCount: string
  fee: string
  actions: string[]
}

/*
 * useMerchants (hq) — 본사어드민 "가맹점 전체 목록" 데이터 훅
 * ------------------------------------------------------------------
 * 리더 어드민의 useMerchants와 컬럼이 다름(상위 리더/파트너 코드 컬럼 추가, 신청일 없음 등
 * — 국가를 가로지르는 본사 시점 뷰라 컬럼 구성이 다르다는 게 Figma 확인 결과 확정됨).
 */
export function useMerchants() {
  const { t } = useTranslation()

  const stats: StatCardData[] = (data.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqMerchantList.col.no'), width: '1fr' },
    { key: 'leaderCode', label: t('hqMerchantList.col.leaderCode'), width: '1.1fr' },
    { key: 'partnerCode', label: t('hqMerchantList.col.partnerCode'), width: '1.1fr' },
    { key: 'country', label: t('hqMerchantList.col.country'), width: '0.8fr' },
    { key: 'region', label: t('hqMerchantList.col.region'), width: '0.8fr' },
    { key: 'merchantName', label: t('hqMerchantList.col.merchantName'), width: '1fr' },
    { key: 'businessType', label: t('hqMerchantList.col.businessType'), width: '0.9fr' },
    { key: 'monthVolume', label: t('hqMerchantList.col.monthVolume'), width: '1fr' },
    { key: 'monthTxCount', label: t('hqMerchantList.col.monthTxCount'), width: '0.9fr' },
    { key: 'fee', label: t('hqMerchantList.col.fee'), width: '0.9fr' },
    { key: 'action', label: t('hqMerchantList.col.action'), width: '1.3fr' },
  ]

  return { stats, columns, rows: data.rows as HqMerchantListRow[] }
}
