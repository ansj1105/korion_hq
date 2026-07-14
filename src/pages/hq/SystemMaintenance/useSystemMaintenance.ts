import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  delta?: string
}

/**
 * 행 데이터(점검 ID/범위/상태 enum 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과한다.
 * action은 행 상태에 따라 달라지는 액션 종류(enum) — 라벨 번역은 표시 계층에서 한다.
 */
export interface MaintenanceRow {
  id?: string
  no: string
  registeredAt: string
  maintenanceId: string
  scope: string
  countries: string
  features: string
  startAt: string
  endAt: string
  status: string
  statusAccent?: string
  admin: string
  source?: string
  userMessage?: string
  actions?: string[]
}

/** 상태 카드 값(운영 상태/배지/설명)도 상태에 따라 바뀌는 데이터라 JSON에 둔다 */
interface MaintenanceStatus {
  value: string
  badge: string
  desc: string
  accent?: string
  userMessage?: string
}

export interface SystemMaintenancePageData {
  status: MaintenanceStatus
  kpis: KpiRaw[]
  rows: MaintenanceRow[]
}

const EMPTY_SYSTEM_MAINTENANCE: SystemMaintenancePageData = {
  status: {
    value: '-',
    badge: '-',
    desc: '',
    accent: 'green',
  },
  kpis: [],
  rows: [],
}

/*
 * useSystemMaintenance — 본사어드민 "시스템 설정 - 서비스 점검 모드" 데이터 훅
 * ------------------------------------------------------------------
 * HQ API에서 app_config 기반 점검 모드 설정을 받아 UI 라벨(컬럼명)만 번역해 반환한다.
 */
export function useSystemMaintenance() {
  const { t } = useTranslation()
  const { data, setData, isLoading, error } = useHqPageData<SystemMaintenancePageData>(
    '/api/hq/system/maintenance-mode',
    EMPTY_SYSTEM_MAINTENANCE,
  )

  const kpis: StatCardData[] = data.kpis.map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: k.delta,
    deltaBadge: Boolean(k.delta),
    dense: true,
    alignTop: true,
  }))

  // 컬럼 폭은 Figma 실측 px(49/65/75/69/68/69/90/116/85/85/128)의 상대 비율
  const columns: Column[] = [
    { key: 'no', label: t('hqSystemMaintenance.col.no'), width: '72px', align: 'center' },
    { key: 'registeredAt', label: t('hqSystemMaintenance.col.registeredAt'), width: '150px' },
    { key: 'maintenanceId', label: t('hqSystemMaintenance.col.maintenanceId'), width: '150px' },
    { key: 'scope', label: t('hqSystemMaintenance.col.scope'), width: '110px' },
    { key: 'countries', label: t('hqSystemMaintenance.col.countries'), width: '120px' },
    { key: 'features', label: t('hqSystemMaintenance.col.features'), width: '220px' },
    { key: 'startAt', label: t('hqSystemMaintenance.col.startAt'), width: '140px' },
    { key: 'endAt', label: t('hqSystemMaintenance.col.endAt'), width: '140px' },
    { key: 'status', label: t('hqSystemMaintenance.col.status'), width: '120px' },
    { key: 'admin', label: t('hqSystemMaintenance.col.admin'), width: '110px' },
    { key: 'source', label: t('hqSystemMaintenance.col.source'), width: '120px' },
    { key: 'action', label: t('hqSystemMaintenance.col.action'), width: '220px' },
  ]

  return {
    status: data.status,
    kpis,
    columns,
    rows: data.rows,
    setData,
    isLoading,
    error,
  }
}
