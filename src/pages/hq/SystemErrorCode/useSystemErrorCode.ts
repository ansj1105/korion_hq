import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import data from './systemErrorCodeData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
  dense?: boolean
  alignTop?: boolean
}

/** 행 데이터(코드/카테고리/심각도/상태 enum 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과한다. */
interface ErrorCodeRow {
  no: string
  registeredAt: string
  code: string
  name: string
  category: string
  severity: string
  userMessage: string
  autoAction: string
  status: string
}

/*
 * useSystemErrorCode — 본사어드민 "시스템 설정 - 오류 코드 설정" 데이터 훅
 * ------------------------------------------------------------------
 * systemErrorCodeData.json(더미)을 읽어 UI 라벨(지표명/컬럼명)만 번역해 반환한다.
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체하면 SystemErrorCode.tsx는 그대로 동작한다.
 */
export function useSystemErrorCode() {
  const { t } = useTranslation()

  const kpis: StatCardData[] = (data.kpis as KpiRaw[]).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: k.noteKey ? t(k.noteKey) : undefined,
    deltaPlain: true,
    dense: k.dense,
    alignTop: k.alignTop,
  }))

  // 컬럼 폭은 Figma 실측 px(49/119/75/69/138/69/120/62/48/128)의 상대 비율
  const columns: Column[] = [
    { key: 'no', label: t('hqSystemErrorCode.col.no'), width: '0.75fr' },
    { key: 'registeredAt', label: t('hqSystemErrorCode.col.registeredAt'), width: '1.8fr' },
    { key: 'code', label: t('hqSystemErrorCode.col.code'), width: '1.15fr' },
    { key: 'name', label: t('hqSystemErrorCode.col.name'), width: '1.05fr' },
    { key: 'category', label: t('hqSystemErrorCode.col.category'), width: '2.1fr' },
    { key: 'severity', label: t('hqSystemErrorCode.col.severity'), width: '1.05fr' },
    { key: 'userMessage', label: t('hqSystemErrorCode.col.userMessage'), width: '1.85fr' },
    { key: 'autoAction', label: t('hqSystemErrorCode.col.autoAction'), width: '0.95fr' },
    { key: 'status', label: t('hqSystemErrorCode.col.status'), width: '0.75fr' },
    { key: 'action', label: t('hqSystemErrorCode.col.action'), width: '1.95fr' },
  ]

  return { kpis, columns, rows: data.rows as ErrorCodeRow[] }
}
