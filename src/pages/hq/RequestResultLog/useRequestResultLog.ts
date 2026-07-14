import { useEffect, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { fetchHqPageData } from '../../../services/korionChongApi'
import data from './requestResultLogData.json'

interface StatRaw {
  id: string
  labelKey: string
  value: string
  delta?: string
  deltaKey?: string
  deltaBadge?: boolean
}

/** 관리자 행동 enum — 승인/거절과 각각의 취소. 취소된 건은 되돌리기 배지가 없다(상세정보만) */
export type AdminAction = 'approved' | 'approveCancelled' | 'rejected' | 'rejectCancelled'

/** 요청 결과 로그 행 원본 데이터 형태 (Figma 샘플값 하드코딩) */
export interface RequestResultLogRow {
  no: string
  appliedAt: string
  paidAt: string
  /** 요청 유형(리더 승인/파트너 (리더요청)/파트너 (다이렉트)/가맹점 (다이렉트)) — 데이터 enum이라 번역 안 함 */
  requestType: string
  parentCode: string
  applicantCode: string
  country: string
  partnerName: string
  adminAction: AdminAction
  status?: AdminAction
}

/*
 * useRequestResultLog — 본사어드민 "파트너 요청 관리 - 요청 결과 로그 전체내역" 데이터 훅
 * ------------------------------------------------------------------
 * requestResultLogData.json(더미)을 읽어 UI 라벨(지표/컬럼명/배지)은 번역해 반환한다.
 * 관리자 행동 값(승인/거절/취소)은 정산 내역 화면의 상태 컨벤션대로 데이터 값 취급(번역 안 함).
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체.
 */
export function useRequestResultLog() {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState(data)

  useEffect(() => {
    let cancelled = false
    fetchHqPageData<typeof data>('/api/hq/requests/result-log')
      .then((response) => {
        if (!cancelled) setPageData(response)
      })
      .catch(() => {
        if (!cancelled) setPageData(data)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    delta: s.delta ?? (s.deltaKey ? t(s.deltaKey) : undefined),
    deltaBadge: s.deltaBadge,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqRequestResultLog.col.no'), width: '0.8fr' },
    { key: 'appliedAt', label: t('hqRequestResultLog.col.appliedAt'), width: '0.7fr' },
    { key: 'paidAt', label: t('hqRequestResultLog.col.paidAt'), width: '0.7fr' },
    { key: 'requestType', label: t('hqRequestResultLog.col.requestType'), width: '1.1fr' },
    { key: 'parentCode', label: t('hqRequestResultLog.col.parentCode'), width: '0.9fr' },
    { key: 'applicantCode', label: t('hqRequestResultLog.col.applicantCode'), width: '0.9fr' },
    { key: 'country', label: t('hqRequestResultLog.col.country'), width: '0.9fr' },
    { key: 'partnerName', label: t('hqRequestResultLog.col.partnerName'), width: '1fr' },
    { key: 'adminAction', label: t('hqRequestResultLog.col.adminAction'), width: '0.9fr' },
    { key: 'status', label: t('hqRequestResultLog.col.status'), width: '0.8fr' },
    // 배지 2개(취소 + 상세정보) 영문 라벨까지 들어가도록 넉넉히
    { key: 'action', label: t('hqRequestResultLog.col.action'), width: '1.4fr' },
  ]

  /** 관리자 행동 enum → 표시 라벨(데이터 값이라 번역 안 함, Figma 텍스트 그대로) */
  const adminActionLabel: Record<AdminAction, string> = {
    approved: t('hqRequestResultLog.status.approved'),
    approveCancelled: t('hqRequestResultLog.status.approveCancelled'),
    rejected: t('hqRequestResultLog.status.rejected'),
    rejectCancelled: t('hqRequestResultLog.status.rejectCancelled'),
  }

  /** 관리자 행동 enum → 행 액션 배지 라벨(번역 UI). 취소된 건은 상세정보만 남는다 */
  const actionBadges: Record<AdminAction, string[]> = {
    approved: [t('hqRequestResultLog.action.cancelApprove'), t('hqRequestResultLog.action.detail')],
    approveCancelled: [t('hqRequestResultLog.action.detail')],
    rejected: [t('hqRequestResultLog.action.cancelReject'), t('hqRequestResultLog.action.detail')],
    rejectCancelled: [t('hqRequestResultLog.action.detail')],
  }

  return {
    stats,
    columns,
    rows: pageData.rows as RequestResultLogRow[],
    adminActionLabel,
    actionBadges,
    section: t('hqRequestResultLog.section'),
  }
}
