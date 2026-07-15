import { useTranslation } from '../../i18n'
import type { Column } from '../../components/organisms/DataTable'
import type { MetricCardData } from '../../components/molecules/MetricCard'
import { useRolePageData } from '../../hooks/useRolePageData'
import data from './activityLogData.json'

/** 활동 로그 행 원본 데이터 형태 */
export interface ActivityLogRow {
  no: string
  logId: string
  datetime: string
  type: string
  menu: string
  task: string
  target: string
  ip: string
  device: string
  status: string
}

/** JSON의 KPI 원본 */
interface MetricRaw {
  id: string
  labelKey: string
  value: string
  note?: string
  noteKey?: string
  chip: string
}

/*
 * useActivityLog — 내 권한/설정 · 활동 로그 데이터 훅
 * ------------------------------------------------------------------
 * 상단 KPI 4개 + 활동 로그 테이블. 컬럼명/UI 라벨은 번역, 행 값은 데이터 그대로.
 * KPI 보조라벨은 날짜·시각이면 note(리터럴), 설명이면 noteKey(번역)로 둔다.
 */
export function useActivityLog() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useRolePageData(
    {
      leader: '/api/leader/activity-logs',
      partner: '/api/partner/activity-logs',
      merchant: '/api/merchant/activity-logs',
    },
    data
  )

  const metrics: MetricCardData[] = (pageData.metrics as MetricRaw[]).map((m) => ({
    id: m.id,
    label: t(m.labelKey),
    value: m.value,
    note: m.note ?? (m.noteKey ? t(m.noteKey) : undefined),
    chip: m.chip,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('act.col.no'), width: '0.5fr' },
    { key: 'logId', label: t('act.col.logId'), width: '1fr' },
    { key: 'datetime', label: t('act.col.datetime'), width: '1.4fr' },
    { key: 'type', label: t('act.col.type'), width: '1fr' },
    { key: 'menu', label: t('act.col.menu'), width: '1fr' },
    { key: 'task', label: t('act.col.task'), width: '1.2fr' },
    { key: 'target', label: t('act.col.target'), width: '1fr' },
    { key: 'ip', label: t('act.col.ip'), width: '1fr' },
    { key: 'device', label: t('act.col.device'), width: '0.9fr' },
    { key: 'status', label: t('act.col.status'), width: '0.9fr' },
  ]

  return {
    metrics,
    columns,
    rows: pageData.rows as ActivityLogRow[],
    isLoading,
    error,
  }
}
