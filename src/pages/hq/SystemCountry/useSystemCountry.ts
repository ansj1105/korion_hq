import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { useHqPageData } from '../../../hooks/useHqPageData'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  delta?: string
  dense?: boolean
  alignTop?: boolean
}

/** 행 데이터(국가명/코드/시간대/상태·결제 enum 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과한다. */
export interface CountryRow {
  id?: string
  no: string
  registeredAt: string
  code: string
  country: string
  regions: string
  timezone: string
  currency: string
  language: string
  leader: string
  leaderCount?: string
  leaderNames?: string
  partners: string
  merchants: string
  status: string
  statusAccent?: string
  payment: string
  paymentAccent?: string
  actions?: string[]
}

export interface CountryOption {
  code: string
  name: string
  nameEn?: string
  timezone: string
  currency: string
  language: string
}

export interface LeaderOption {
  accountId: number
  name: string
  code: string
  countryCode: string
}

export interface SystemCountryFormOptions {
  countryOptions: CountryOption[]
  leaderOptions: LeaderOption[]
}

interface SystemCountryPageData {
  kpis: KpiRaw[]
  rows: CountryRow[]
  formOptions: SystemCountryFormOptions
}

const EMPTY_SYSTEM_COUNTRY: SystemCountryPageData = {
  kpis: [],
  rows: [],
  formOptions: {
    countryOptions: [],
    leaderOptions: [],
  },
}

/*
 * useSystemCountry — 본사어드민 "시스템 설정 - 국가 / 지역 설정" 데이터 훅
 * ------------------------------------------------------------------
 * 실제 HQ API에서 국가 마스터/운영 집계를 받아 UI 라벨만 번역해 반환한다.
 */
export function useSystemCountry() {
  const { t } = useTranslation()
  const { data, setData, isLoading, error } = useHqPageData<SystemCountryPageData>(
    '/api/hq/system/country',
    EMPTY_SYSTEM_COUNTRY,
  )

  const kpis: StatCardData[] = data.kpis.map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: k.delta,
    deltaBadge: Boolean(k.delta),
    dense: k.dense,
    alignTop: k.alignTop,
  }))

  // 컬럼 폭은 Figma 실측 px(49/65/75/69/68/69/46/62/85/48×4/128)의 상대 비율
  const columns: Column[] = [
    { key: 'no', label: t('hqSystemCountry.col.no'), width: '72px', align: 'center' },
    { key: 'registeredAt', label: t('hqSystemCountry.col.registeredAt'), width: '150px' },
    { key: 'code', label: t('hqSystemCountry.col.code'), width: '86px' },
    { key: 'country', label: t('hqSystemCountry.col.country'), width: '140px' },
    { key: 'regions', label: t('hqSystemCountry.col.regions'), width: '170px' },
    { key: 'timezone', label: t('hqSystemCountry.col.timezone'), width: '110px' },
    { key: 'currency', label: t('hqSystemCountry.col.currency'), width: '90px' },
    { key: 'language', label: t('hqSystemCountry.col.language'), width: '110px' },
    { key: 'leader', label: t('hqSystemCountry.col.leader'), width: '96px', align: 'right' },
    { key: 'partners', label: t('hqSystemCountry.col.partners'), width: '96px', align: 'right' },
    { key: 'merchants', label: t('hqSystemCountry.col.merchants'), width: '96px', align: 'right' },
    { key: 'status', label: t('hqSystemCountry.col.status'), width: '110px' },
    { key: 'payment', label: t('hqSystemCountry.col.payment'), width: '110px' },
    { key: 'action', label: t('hqSystemCountry.col.action'), width: '220px' },
  ]

  return { kpis, columns, rows: data.rows, formOptions: data.formOptions, setData, isLoading, error }
}

export type { SystemCountryPageData }
