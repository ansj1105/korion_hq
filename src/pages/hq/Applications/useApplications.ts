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
  deltaTone?: 'cyan' | 'red'
}

/** 신청 상태 — 대기/검토중/확인/위험 중 하나만 활성(Figma 액션 배지 기준) */
export type ApplicationStatus = 'waiting' | 'review' | 'confirmed' | 'risk'

/** 제휴 / 투자 신청 목록 행 원본 데이터 형태 (Figma 샘플값 하드코딩) */
export interface ApplicationListRow {
  no: string
  appliedAt: string
  type: string
  country: string
  region?: string
  city?: string
  contact: string
  company: string
  email: string
  phone?: string
  website?: string
  interest: string
  proposal?: string
  status: ApplicationStatus
}

interface ApplicationsPageData {
  stats: StatRaw[]
  rows: ApplicationListRow[]
}

const emptyApplicationsData: ApplicationsPageData = {
  stats: [],
  rows: [],
}

/*
 * useApplications — 본사어드민 "신청서 관리 - 제휴 / 투자 신청서" 데이터 훅
 * ------------------------------------------------------------------
 * /api/hq/applications 응답만 목록 데이터로 사용한다.
 * API 실패/빈 응답 시 정적 샘플을 노출하지 않는다.
 */
export function useApplications() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error, reload } = useHqPageData<ApplicationsPageData>('/api/hq/applications', emptyApplicationsData)

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
    delta: s.delta ?? (s.deltaKey ? t(s.deltaKey) : undefined),
    deltaBadge: s.deltaBadge,
    deltaTone: s.deltaTone,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqApplications.col.no'), width: '76px', align: 'center' },
    { key: 'appliedAt', label: t('hqApplications.col.appliedAt'), width: '118px' },
    { key: 'type', label: t('hqApplications.col.type'), width: '150px' },
    { key: 'country', label: t('hqApplications.col.country'), width: '136px' },
    { key: 'contact', label: t('hqApplications.col.contact'), width: '136px' },
    { key: 'company', label: t('hqApplications.col.company'), width: '150px' },
    { key: 'email', label: t('hqApplications.col.email'), width: '164px' },
    { key: 'interest', label: t('hqApplications.col.interest'), width: '132px' },
    { key: 'status', label: t('hqApplications.col.status'), width: '120px' },
    { key: 'action', label: t('hqApplications.col.action'), width: '300px' },
  ]

  const statusMeta: Record<ApplicationStatus, { label: string; accent: 'cyan' | 'orange' | 'red' }> = {
    waiting: { label: t('hqApplications.status.waiting'), accent: 'orange' },
    confirmed: { label: t('hqApplications.status.confirmed'), accent: 'cyan' },
    review: { label: t('hqApplications.status.review'), accent: 'cyan' },
    risk: { label: t('hqApplications.status.risk'), accent: 'red' },
  }

  return {
    stats,
    columns,
    rows: pageData.rows as ApplicationListRow[],
    statusMeta,
    deleteLabel: t('hqApplications.action.delete'),
    isLoading,
    error,
    reload,
  }
}
