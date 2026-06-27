import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import data from './leadersData.json'

interface StatRaw {
  id: string
  labelKey: string
  value: string
}

/** 국가 리더 전체 목록 행 원본 데이터 형태 (Figma 샘플값 하드코딩) */
export interface LeaderListRow {
  no: string
  appliedAt: string
  leaderCode: string
  country: string
  partnerName: string
  subPartnerCount: string
  subMerchantCount: string
  monthVolume: string
  monthTxCount: string
  unsettledFee: string
  actions: string[]
}

/*
 * useLeaders — 본사어드민 "국가 리더 전체 목록" 데이터 훅
 * ------------------------------------------------------------------
 * leadersData.json(더미)을 읽어 UI 라벨(지표/컬럼명)은 번역해 반환한다.
 * 리더 어드민의 usePartners와 컬럼이 달라(리더 코드/파트너명 등) 별도 화면으로 작성.
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체.
 */
export function useLeaders() {
  const { t } = useTranslation()

  const stats: StatCardData[] = (data.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqLeaderList.col.no'), width: '1fr' },
    { key: 'appliedAt', label: t('hqLeaderList.col.appliedAt'), width: '1fr' },
    { key: 'leaderCode', label: t('hqLeaderList.col.leaderCode'), width: '1.1fr' },
    { key: 'country', label: t('hqLeaderList.col.country'), width: '0.9fr' },
    { key: 'partnerName', label: t('hqLeaderList.col.partnerName'), width: '0.9fr' },
    { key: 'subPartnerCount', label: t('hqLeaderList.col.subPartnerCount'), width: '0.9fr' },
    { key: 'subMerchantCount', label: t('hqLeaderList.col.subMerchantCount'), width: '0.9fr' },
    { key: 'monthVolume', label: t('hqLeaderList.col.monthVolume'), width: '1fr' },
    { key: 'monthTxCount', label: t('hqLeaderList.col.monthTxCount'), width: '0.9fr' },
    { key: 'unsettledFee', label: t('hqLeaderList.col.unsettledFee'), width: '1fr' },
    { key: 'action', label: t('hqLeaderList.col.action'), width: '1.3fr' },
  ]

  return { stats, columns, rows: data.rows as LeaderListRow[] }
}
