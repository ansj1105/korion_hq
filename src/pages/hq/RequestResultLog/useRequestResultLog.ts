import { useTranslation } from '../../../i18n'
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

/** 관리자 행동 enum — 신청 처리 화면에서 누른 승인/거절/검토/대기/자료요청/보류 액션 이력 */
export type AdminAction = 'approved' | 'approveCancelled' | 'rejected' | 'rejectCancelled' | 'review' | 'waiting' | 'infoRequested' | 'held'

/** 요청 결과 로그 행 원본 데이터 형태 */
export interface RequestResultLogRow {
  no: string
  applicationNo: string
  appliedAt: string
  paidAt: string
  /** 요청 유형(리더 승인/파트너 (리더요청)/파트너 (다이렉트)/가맹점 (다이렉트)) — 데이터 enum이라 번역 안 함 */
  requestType: string
  parentCode: string
  applicantCode: string
  country: string
  partnerName: string
  adminAction: AdminAction
}

interface RequestResultLogPageData {
  stats: StatRaw[]
  rows: RequestResultLogRow[]
}

const emptyRequestResultLogData: RequestResultLogPageData = {
  stats: [],
  rows: [],
}

/*
 * useRequestResultLog — 본사어드민 "파트너 요청 관리 - 요청 결과 로그 전체내역" 데이터 훅
 * ------------------------------------------------------------------
 * /api/hq/requests/result-log 응답만 사용한다.
 * 관리자 행동 값(승인/거절/취소)은 정산 내역 화면의 상태 컨벤션대로 데이터 값 취급(번역 안 함).
 */
export function useRequestResultLog() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData<RequestResultLogPageData>(
    '/api/hq/requests/result-log',
    emptyRequestResultLogData,
  )

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    delta: s.delta ?? (s.deltaKey ? t(s.deltaKey) : undefined),
    deltaBadge: s.deltaBadge,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqRequestResultLog.col.no'), width: '0.5fr' },
    { key: 'applicationNo', label: t('hqRequestResultLog.col.applicationNo'), width: '0.8fr' },
    { key: 'appliedAt', label: t('hqRequestResultLog.col.appliedAt'), width: '0.7fr' },
    { key: 'paidAt', label: t('hqRequestResultLog.col.paidAt'), width: '0.7fr' },
    { key: 'requestType', label: t('hqRequestResultLog.col.requestType'), width: '1.1fr' },
    { key: 'parentCode', label: t('hqRequestResultLog.col.parentCode'), width: '0.9fr' },
    { key: 'applicantCode', label: t('hqRequestResultLog.col.applicantCode'), width: '0.9fr' },
    { key: 'country', label: t('hqRequestResultLog.col.country'), width: '0.9fr' },
    { key: 'partnerName', label: t('hqRequestResultLog.col.partnerName'), width: '1fr' },
    { key: 'adminAction', label: t('hqRequestResultLog.col.adminAction'), width: '0.9fr' },
  ]

  /** 관리자 행동 enum → 표시 라벨(데이터 값이라 번역 안 함, Figma 텍스트 그대로) */
  const adminActionLabel: Record<AdminAction, string> = {
    approved: t('hqRequestResultLog.status.approved'),
    approveCancelled: t('hqRequestResultLog.status.approveCancelled'),
    rejected: t('hqRequestResultLog.status.rejected'),
    rejectCancelled: t('hqRequestResultLog.status.rejectCancelled'),
    review: t('hqRequestResultLog.status.review'),
    waiting: t('hqRequestResultLog.status.waiting'),
    infoRequested: t('hqRequestResultLog.status.infoRequested'),
    held: t('hqRequestResultLog.status.held'),
  }

  return {
    stats,
    columns,
    rows: pageData.rows as RequestResultLogRow[],
    adminActionLabel,
    section: t('hqRequestResultLog.section'),
    isLoading,
    error,
  }
}
