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
export type MerchantDirectRequestStatus = 'review' | 'waiting' | 'infoRequested'

/** 가맹점 승인 요청(다이렉트) 행 원본 데이터 형태 (Figma 샘플값 하드코딩) */
export interface MerchantDirectRequestRow {
  applicationId?: number
  no: string
  appliedAt: string
  /** 신청자의 상위(리더/파트너) 코드. 다이렉트 신청이라 없으면 "-" */
  parentCode: string
  applicantCode: string
  country: string
  partnerName: string
  subMerchantCount: string
  monthVolume: string
  monthTxCount: string
  status: MerchantDirectRequestStatus | null
}

interface MerchantDirectRequestPageData {
  stats: StatRaw[]
  rows: MerchantDirectRequestRow[]
}

const emptyMerchantDirectRequestData: MerchantDirectRequestPageData = {
  stats: [],
  rows: [],
}

/*
 * useRequestsMerchantDirect — 본사어드민 "파트너 요청 관리 - 가맹점 승인 요청 (다이렉트)" 데이터 훅
 * ------------------------------------------------------------------
 * requestsMerchantDirectData.json(더미)을 읽어 UI 라벨(지표/컬럼명/상태명)은 번역해 반환한다.
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체.
 * 컬럼명 "파트너명"/"하위 가맹점 수"는 가맹점 화면 문맥과 안 맞아 보이지만 Figma 텍스트 그대로 반영.
 */
export function useRequestsMerchantDirect() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error, reload } = useHqPageData<MerchantDirectRequestPageData>(
    '/api/hq/requests/merchant-direct',
    emptyMerchantDirectRequestData,
  )

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    delta: s.delta ?? (s.deltaKey ? t(s.deltaKey) : undefined),
    deltaBadge: s.deltaBadge,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqRequestMerchantDirect.col.no'), width: '0.8fr' },
    { key: 'appliedAt', label: t('hqRequestMerchantDirect.col.appliedAt'), width: '0.7fr' },
    { key: 'parentCode', label: t('hqRequestMerchantDirect.col.parentCode'), width: '0.9fr' },
    { key: 'applicantCode', label: t('hqRequestMerchantDirect.col.applicantCode'), width: '0.9fr' },
    { key: 'country', label: t('hqRequestMerchantDirect.col.country'), width: '0.9fr' },
    { key: 'partnerName', label: t('hqRequestMerchantDirect.col.partnerName'), width: '1fr' },
    { key: 'subMerchantCount', label: t('hqRequestMerchantDirect.col.subMerchantCount'), width: '0.8fr' },
    { key: 'monthVolume', label: t('hqRequestMerchantDirect.col.monthVolume'), width: '0.9fr' },
    { key: 'monthTxCount', label: t('hqRequestMerchantDirect.col.monthTxCount'), width: '0.8fr' },
    { key: 'status', label: t('hqRequestMerchantDirect.col.status'), width: '0.8fr' },
    // 영문 모드 라벨(Approve/Reject/Reviewing/Waiting/Info Requested)까지 한 줄에 들어가도록 넉넉히
    { key: 'action', label: t('hqRequestMerchantDirect.col.action'), width: '2.7fr' },
  ]

  /** 상태 키 → 표시 라벨(번역) + 액션 배지 강조색(Figma 기준 셋 다 cyan) */
  const statusMeta: Record<MerchantDirectRequestStatus, { label: string; accent: AccentKey }> = {
    review: { label: t('hqRequestMerchantDirect.status.review'), accent: 'cyan' },
    waiting: { label: t('hqRequestMerchantDirect.status.waiting'), accent: 'orange' },
    infoRequested: { label: t('hqRequestMerchantDirect.status.infoRequested'), accent: 'purple' },
  }

  return {
    stats,
    columns,
    rows: pageData.rows as MerchantDirectRequestRow[],
    statusMeta,
    approveLabel: t('hqRequestMerchantDirect.action.approve'),
    rejectLabel: t('hqRequestMerchantDirect.action.reject'),
    isLoading,
    error,
    reload,
  }
}
