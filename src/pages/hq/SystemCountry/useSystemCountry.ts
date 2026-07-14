import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import data from './systemCountryData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
  dense?: boolean
  alignTop?: boolean
}

/** 행 데이터(국가명/코드/시간대/상태·결제 enum 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과한다. */
interface CountryRow {
  no: string
  registeredAt: string
  code: string
  country: string
  regions: string
  timezone: string
  currency: string
  language: string
  leader: string
  partners: string
  merchants: string
  status: string
  payment: string
}

/*
 * useSystemCountry — 본사어드민 "시스템 설정 - 국가 / 지역 설정" 데이터 훅
 * ------------------------------------------------------------------
 * systemCountryData.json(더미)을 읽어 UI 라벨(지표명/컬럼명)만 번역해 반환한다.
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체하면 SystemCountry.tsx는 그대로 동작한다.
 */
export function useSystemCountry() {
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

  // 컬럼 폭은 Figma 실측 px(49/65/75/69/68/69/46/62/85/48×4/128)의 상대 비율
  const columns: Column[] = [
    { key: 'no', label: t('hqSystemCountry.col.no'), width: '0.75fr' },
    { key: 'registeredAt', label: t('hqSystemCountry.col.registeredAt'), width: '1fr' },
    { key: 'code', label: t('hqSystemCountry.col.code'), width: '1.15fr' },
    { key: 'country', label: t('hqSystemCountry.col.country'), width: '1.05fr' },
    { key: 'regions', label: t('hqSystemCountry.col.regions'), width: '1.05fr' },
    { key: 'timezone', label: t('hqSystemCountry.col.timezone'), width: '1.05fr' },
    { key: 'currency', label: t('hqSystemCountry.col.currency'), width: '0.7fr' },
    { key: 'language', label: t('hqSystemCountry.col.language'), width: '0.95fr' },
    { key: 'leader', label: t('hqSystemCountry.col.leader'), width: '1.3fr' },
    { key: 'partners', label: t('hqSystemCountry.col.partners'), width: '0.75fr' },
    { key: 'merchants', label: t('hqSystemCountry.col.merchants'), width: '0.75fr' },
    { key: 'status', label: t('hqSystemCountry.col.status'), width: '0.75fr' },
    { key: 'payment', label: t('hqSystemCountry.col.payment'), width: '0.75fr' },
    { key: 'action', label: t('hqSystemCountry.col.action'), width: '1.95fr' },
  ]

  return { kpis, columns, rows: data.rows as CountryRow[] }
}
