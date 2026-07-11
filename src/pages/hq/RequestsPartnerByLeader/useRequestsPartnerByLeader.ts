import { useTranslation } from '../../../i18n'
import type { AccentKey } from '../../../types'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import data from './requestsPartnerByLeaderData.json'

interface StatRaw {
  id: string
  labelKey: string
  value: string
  deltaKey?: string
}

/** 진행 상태 — 검토중/대기/자료요청 중 하나만 활성(Figma 액션 배지 기준). 신규 접수는 상태 없음(null) */
export type PartnerByLeaderRequestStatus = 'review' | 'waiting' | 'infoRequested'

/** 파트너 승인 요청(리더요청) 행 원본 데이터 형태 (Figma 샘플값 하드코딩) */
export interface PartnerByLeaderRequestRow {
  no: string
  appliedAt: string
  /** 요청을 올린 상위 리더 코드. 없으면 "-" */
  parentCode: string
  applicantCode: string
  country: string
  partnerName: string
  subMerchantCount: string
  monthVolume: string
  monthTxCount: string
  status: PartnerByLeaderRequestStatus | null
}

/*
 * useRequestsPartnerByLeader — 본사어드민 "파트너 요청 관리 - 파트너 승인 요청 (리더요청)" 데이터 훅
 * ------------------------------------------------------------------
 * requestsPartnerByLeaderData.json(더미)을 읽어 UI 라벨(지표/컬럼명/상태명)은 번역해 반환한다.
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체.
 */
export function useRequestsPartnerByLeader() {
  const { t } = useTranslation()

  const stats: StatCardData[] = (data.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    delta: s.deltaKey ? t(s.deltaKey) : undefined,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqRequestPartnerByLeader.col.no'), width: '0.8fr' },
    { key: 'appliedAt', label: t('hqRequestPartnerByLeader.col.appliedAt'), width: '0.7fr' },
    { key: 'parentCode', label: t('hqRequestPartnerByLeader.col.parentCode'), width: '0.9fr' },
    { key: 'applicantCode', label: t('hqRequestPartnerByLeader.col.applicantCode'), width: '0.9fr' },
    { key: 'country', label: t('hqRequestPartnerByLeader.col.country'), width: '0.9fr' },
    { key: 'partnerName', label: t('hqRequestPartnerByLeader.col.partnerName'), width: '1fr' },
    { key: 'subMerchantCount', label: t('hqRequestPartnerByLeader.col.subMerchantCount'), width: '0.8fr' },
    { key: 'monthVolume', label: t('hqRequestPartnerByLeader.col.monthVolume'), width: '0.9fr' },
    { key: 'monthTxCount', label: t('hqRequestPartnerByLeader.col.monthTxCount'), width: '0.8fr' },
    // 영문 모드 라벨(Approve/Reject/Reviewing/Waiting/Info Requested)까지 한 줄에 들어가도록 넉넉히
    { key: 'action', label: t('hqRequestPartnerByLeader.col.action'), width: '3fr' },
  ]

  /** 상태 키 → 표시 라벨(번역) + 액션 배지 강조색(Figma 기준 셋 다 cyan) */
  const statusMeta: Record<PartnerByLeaderRequestStatus, { label: string; accent: AccentKey }> = {
    review: { label: t('hqRequestPartnerByLeader.status.review'), accent: 'cyan' },
    waiting: { label: t('hqRequestPartnerByLeader.status.waiting'), accent: 'cyan' },
    infoRequested: { label: t('hqRequestPartnerByLeader.status.infoRequested'), accent: 'cyan' },
  }

  return {
    stats,
    columns,
    rows: data.rows as PartnerByLeaderRequestRow[],
    statusMeta,
    approveLabel: t('hqRequestPartnerByLeader.action.approve'),
    rejectLabel: t('hqRequestPartnerByLeader.action.reject'),
  }
}
