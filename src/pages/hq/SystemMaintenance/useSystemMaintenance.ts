import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import data from './systemMaintenanceData.json'

/**
 * 행 데이터(점검 ID/범위/상태 enum 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과한다.
 * action은 행 상태에 따라 달라지는 액션 종류(enum) — 라벨 번역은 표시 계층에서 한다.
 */
interface MaintenanceRow {
  no: string
  registeredAt: string
  maintenanceId: string
  scope: string
  countries: string
  features: string
  startAt: string
  endAt: string
  status: string
  admin: string
  action: 'edit' | 'detail'
}

/** 상태 카드 값(운영 상태/배지/설명)도 상태에 따라 바뀌는 데이터라 JSON에 둔다 */
interface MaintenanceStatus {
  value: string
  badge: string
  desc: string
}

/*
 * useSystemMaintenance — 본사어드민 "시스템 설정 - 서비스 점검 모드" 데이터 훅
 * ------------------------------------------------------------------
 * systemMaintenanceData.json(더미)을 읽어 UI 라벨(컬럼명)만 번역해 반환한다.
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체하면 SystemMaintenance.tsx는 그대로 동작한다.
 */
export function useSystemMaintenance() {
  const { t } = useTranslation()

  // 컬럼 폭은 Figma 실측 px(49/65/75/69/68/69/90/116/85/85/128)의 상대 비율
  const columns: Column[] = [
    { key: 'no', label: t('hqSystemMaintenance.col.no'), width: '0.75fr' },
    { key: 'registeredAt', label: t('hqSystemMaintenance.col.registeredAt'), width: '1fr' },
    { key: 'maintenanceId', label: t('hqSystemMaintenance.col.maintenanceId'), width: '1.15fr' },
    { key: 'scope', label: t('hqSystemMaintenance.col.scope'), width: '1.05fr' },
    { key: 'countries', label: t('hqSystemMaintenance.col.countries'), width: '1.05fr' },
    { key: 'features', label: t('hqSystemMaintenance.col.features'), width: '1.05fr' },
    { key: 'startAt', label: t('hqSystemMaintenance.col.startAt'), width: '1.4fr' },
    { key: 'endAt', label: t('hqSystemMaintenance.col.endAt'), width: '1.8fr' },
    { key: 'status', label: t('hqSystemMaintenance.col.status'), width: '1.3fr' },
    { key: 'admin', label: t('hqSystemMaintenance.col.admin'), width: '1.3fr' },
    { key: 'action', label: t('hqSystemMaintenance.col.action'), width: '1.95fr' },
  ]

  return {
    status: data.status as MaintenanceStatus,
    columns,
    rows: data.rows as MaintenanceRow[],
  }
}
