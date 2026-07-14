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
export type PartnerDirectRequestStatus = 'review' | 'waiting' | 'infoRequested'

/** 파트너 승인 요청(다이렉트) 행 원본 데이터 형태 */
export interface PartnerDirectRequestRow {
  applicationId?: number
  no: string
  appliedAt: string
  /** 신청자의 상위 리더 코드. 다이렉트 신청이라 없으면 "-" */
  parentCode: string
  applicantCode: string
  country: string
  partnerName: string
  subMerchantCount: string
  monthVolume: string
  monthTxCount: string
  status: PartnerDirectRequestStatus | null
}

interface PartnerDirectRequestPageData {
  stats: StatRaw[]
  rows: PartnerDirectRequestRow[]
}

const emptyPartnerDirectRequestData: PartnerDirectRequestPageData = {
  stats: [],
  rows: [],
}

/*
 * useRequestsPartnerDirect — 본사어드민 "파트너 요청 관리 - 파트너 승인 요청 (다이렉트)" 데이터 훅
 * ------------------------------------------------------------------
 * /api/hq/requests/partner-direct 응답만 사용한다. 실패 시 정적 샘플을 노출하지 않는다.
 */
export function useRequestsPartnerDirect() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error, reload } = useHqPageData<PartnerDirectRequestPageData>(
    '/api/hq/requests/partner-direct',
    emptyPartnerDirectRequestData,
  )

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    delta: s.delta ?? (s.deltaKey ? t(s.deltaKey) : undefined),
    deltaBadge: s.deltaBadge,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqRequestPartnerDirect.col.no'), width: '0.8fr' },
    { key: 'appliedAt', label: t('hqRequestPartnerDirect.col.appliedAt'), width: '0.7fr' },
    { key: 'parentCode', label: t('hqRequestPartnerDirect.col.parentCode'), width: '0.9fr' },
    { key: 'applicantCode', label: t('hqRequestPartnerDirect.col.applicantCode'), width: '0.9fr' },
    { key: 'country', label: t('hqRequestPartnerDirect.col.country'), width: '0.9fr' },
    { key: 'partnerName', label: t('hqRequestPartnerDirect.col.partnerName'), width: '1fr' },
    { key: 'subMerchantCount', label: t('hqRequestPartnerDirect.col.subMerchantCount'), width: '0.8fr' },
    { key: 'monthVolume', label: t('hqRequestPartnerDirect.col.monthVolume'), width: '0.9fr' },
    { key: 'monthTxCount', label: t('hqRequestPartnerDirect.col.monthTxCount'), width: '0.8fr' },
    { key: 'status', label: t('hqRequestPartnerDirect.col.status'), width: '0.8fr' },
    // 영문 모드 라벨(Approve/Reject/Reviewing/Waiting/Info Requested)까지 한 줄에 들어가도록 넉넉히
    { key: 'action', label: t('hqRequestPartnerDirect.col.action'), width: '2.7fr' },
  ]

  /** 상태 키 → 표시 라벨(번역) + 액션 배지 강조색(Figma 기준 셋 다 cyan) */
  const statusMeta: Record<PartnerDirectRequestStatus, { label: string; accent: AccentKey }> = {
    review: { label: t('hqRequestPartnerDirect.status.review'), accent: 'cyan' },
    waiting: { label: t('hqRequestPartnerDirect.status.waiting'), accent: 'orange' },
    infoRequested: { label: t('hqRequestPartnerDirect.status.infoRequested'), accent: 'purple' },
  }

  return {
    stats,
    columns,
    rows: pageData.rows as PartnerDirectRequestRow[],
    statusMeta,
    approveLabel: t('hqRequestPartnerDirect.action.approve'),
    rejectLabel: t('hqRequestPartnerDirect.action.reject'),
    isLoading,
    error,
    reload,
  }
}
