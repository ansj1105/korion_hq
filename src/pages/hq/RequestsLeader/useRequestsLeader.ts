import { useTranslation } from '../../../i18n'
import type { AccentKey } from '../../../types'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'

interface StatRaw {
  id: string
  labelKey: string
  value: string
  delta?: string
  deltaKey?: string
  deltaBadge?: boolean
}

/** 진행 상태 — 검토중/대기/자료요청 중 하나만 활성(Figma 액션 배지 기준). 신규 접수는 상태 없음(null) */
export type LeaderRequestStatus = 'review' | 'waiting' | 'infoRequested'

/** 리더 승인 요청 행 원본 데이터 형태 */
export interface LeaderRequestRow {
  applicationId?: number
  no: string
  appliedAt: string
  /** 신청자(파트너)의 기존 상위 리더 코드. 없으면 "-" */
  parentCode: string
  applicantCode: string
  country: string
  partnerName: string
  subMerchantCount: string
  monthVolume: string
  monthTxCount: string
  status: LeaderRequestStatus | null
}

interface LeaderRequestPageData {
  stats: StatRaw[]
  rows: LeaderRequestRow[]
}

const emptyLeaderRequestData: LeaderRequestPageData = {
  stats: [],
  rows: [],
}

/*
 * useRequestsLeader — 본사어드민 "파트너 요청 관리 - 리더 승인 요청" 데이터 훅
 * ------------------------------------------------------------------
 * /api/hq/requests/leader 응답만 사용한다. 실패 시 정적 샘플을 노출하지 않는다.
 */
export function useRequestsLeader() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error, reload } = useHqPageData<LeaderRequestPageData>(
    '/api/hq/requests/leader',
    emptyLeaderRequestData,
  )

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    delta: s.delta ?? (s.deltaKey ? t(s.deltaKey) : undefined),
    deltaBadge: s.deltaBadge,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqRequestLeader.col.no'), width: '0.8fr' },
    { key: 'appliedAt', label: t('hqRequestLeader.col.appliedAt'), width: '0.7fr' },
    { key: 'parentCode', label: t('hqRequestLeader.col.parentCode'), width: '0.9fr' },
    { key: 'applicantCode', label: t('hqRequestLeader.col.applicantCode'), width: '0.9fr' },
    { key: 'country', label: t('hqRequestLeader.col.country'), width: '0.9fr' },
    { key: 'partnerName', label: t('hqRequestLeader.col.partnerName'), width: '1fr' },
    { key: 'subMerchantCount', label: t('hqRequestLeader.col.subMerchantCount'), width: '0.8fr' },
    { key: 'monthVolume', label: t('hqRequestLeader.col.monthVolume'), width: '0.9fr' },
    { key: 'monthTxCount', label: t('hqRequestLeader.col.monthTxCount'), width: '0.8fr' },
    { key: 'status', label: t('hqRequestLeader.col.status'), width: '0.8fr' },
    // 영문 모드 라벨(Approve/Reject/Reviewing/Waiting/Info Requested)까지 한 줄에 들어가도록 넉넉히
    { key: 'action', label: t('hqRequestLeader.col.action'), width: '2.7fr' },
  ]

  /** 상태 키 → 표시 라벨(번역) + 액션 배지 강조색(Figma 기준 셋 다 cyan) */
  const statusMeta: Record<LeaderRequestStatus, { label: string; accent: AccentKey }> = {
    review: { label: t('hqRequestLeader.status.review'), accent: 'cyan' },
    waiting: { label: t('hqRequestLeader.status.waiting'), accent: 'orange' },
    infoRequested: { label: t('hqRequestLeader.status.infoRequested'), accent: 'purple' },
  }

  return {
    stats,
    columns,
    rows: pageData.rows as LeaderRequestRow[],
    statusMeta,
    approveLabel: t('hqRequestLeader.action.approve'),
    rejectLabel: t('hqRequestLeader.action.reject'),
    isLoading,
    error,
    reload,
  }
}
