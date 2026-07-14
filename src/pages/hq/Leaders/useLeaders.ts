import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'

interface StatRaw {
  id: string
  labelKey: string
  value: string
  deltaKey?: string
}

/** 리더 상태 — 승인/정지 중 하나만 활성(Figma 액션 토글 배지 기준) */
export type LeaderStatus = 'approved' | 'suspended'

/** 국가 리더 전체 목록 행 원본 데이터 형태 */
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
  status: LeaderStatus
}

interface LeaderListPageData {
  stats: StatRaw[]
  rows: LeaderListRow[]
}

const emptyLeaderListData: LeaderListPageData = {
  stats: [],
  rows: [],
}

/*
 * useLeaders — 본사어드민 "국가 리더 전체 목록" 데이터 훅
 * ------------------------------------------------------------------
 * /api/hq/leaders 응답만 사용한다. 리더 어드민의 usePartners와 컬럼이 달라 별도 화면으로 작성.
 */
export function useLeaders() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error, reload } = useHqPageData<LeaderListPageData>('/api/hq/leaders', emptyLeaderListData)

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    delta: s.deltaKey ? t(s.deltaKey) : undefined,
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
    { key: 'status', label: t('hqLeaderList.col.status'), width: '0.8fr', align: 'center' },
    { key: 'action', label: t('hqLeaderList.col.action'), width: '0.8fr', align: 'center' },
  ]

  /*
   * 상태 키 → 표시 라벨 + 액션 배지 강조색 + solid 여부.
   * Figma 기준: 활성 "승인"은 녹색 65% 틴트(size sm, solid=false),
   * 활성 "정지"는 빨강 솔리드(solid=true). 비활성·상세 배지는 호출부에서 항상 solid 회색.
   */
  const statusMeta: Record<LeaderStatus, { label: string; accent: 'green' | 'red'; solid: boolean }> = {
    approved: { label: t('hqLeaderList.status.approved'), accent: 'green', solid: false },
    suspended: { label: t('hqLeaderList.status.suspended'), accent: 'red', solid: true },
  }

  return { stats, columns, rows: pageData.rows as LeaderListRow[], statusMeta, detailLabel: '상세', isLoading, error, reload }
}
