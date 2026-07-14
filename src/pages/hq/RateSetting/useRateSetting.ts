import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import { deleteHqPageData, fetchHqPageData, postHqPageData, putHqPageData } from '../../../services/korionChongApi'
import type { DiagramRow } from './DistributionDiagram'
import data from './rateSettingData.json'

interface KpiRaw {
  id?: string
  labelKey: string
  value: string
  noteKey: string
}

export type RateStatus = 'active' | 'pending' | 'inactive'
export type EventStatus = 'applied' | 'none'

export interface RateRow {
  no?: string
  country: string
  code: string
  countryCode?: string
  hqFee: string
  hqRate?: string
  leaderFee: string
  leaderRate?: string
  partnerFee: string
  partnerRate?: string
  merchantSettle: string
  merchantSettlementEnabled?: boolean
  event: EventStatus
  eventEnabled?: boolean
  coinCount: string
  status: RateStatus
  statusAccent?: 'green' | 'amber' | 'red'
  memo?: string
  adminMemo?: string
}

export interface RateModalData {
  countryCode: string
  country: string
  eventEnabled: boolean
  hqRate: string
  leaderRate: string
  partnerRate: string
  merchantSettlementEnabled: boolean
  coinCount: string
  status: RateStatus
  adminMemo: string
}

export interface RateCountryOption {
  code: string
  name: string
}

export interface KpiItem {
  id: string
  label: string
  value: string
  note: string
}

interface RateSettingApiData {
  kpis: KpiRaw[]
  diagram: DiagramRow[]
  rows: RateRow[]
  countries?: RateCountryOption[]
  modal?: Partial<RateModalData>
}

const fallbackData = data as RateSettingApiData

export function useRateSetting() {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState<RateSettingApiData>(fallbackData)

  useEffect(() => {
    let cancelled = false
    fetchHqPageData<RateSettingApiData>('/api/hq/distribution-rates')
      .then((response) => {
        if (!cancelled) setPageData(normalizeRateSetting(response))
      })
      .catch(() => {
        if (!cancelled) setPageData(normalizeRateSetting(fallbackData))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const kpis: KpiItem[] = useMemo(
    () =>
      pageData.kpis.map((k) => ({
        id: k.id ?? k.labelKey,
        label: t(k.labelKey),
        value: k.value,
        note: t(k.noteKey),
      })),
    [pageData.kpis, t]
  )

  const columns: Column[] = [
    { key: 'no', label: t('hqRate.col.no'), width: '0.55fr', align: 'center' },
    { key: 'country', label: t('hqRate.col.country'), width: '1.5fr' },
    { key: 'code', label: t('hqRate.col.code'), width: '0.89fr' },
    { key: 'hqFee', label: t('hqRate.col.hqFee'), width: '0.97fr' },
    { key: 'leaderFee', label: t('hqRate.col.leaderFee'), width: '1.05fr' },
    { key: 'partnerFee', label: t('hqRate.col.partnerFee'), width: '1.06fr' },
    { key: 'merchantSettle', label: t('hqRate.col.merchantSettle'), width: '1.43fr' },
    { key: 'event', label: t('hqRate.col.event'), width: '1.15fr' },
    { key: 'coinCount', label: t('hqRate.col.coinCount'), width: '1.2fr' },
    { key: 'status', label: t('hqRate.col.status'), width: '1.2fr' },
  ]

  const statusLabel: Record<RateStatus, string> = {
    active: t('hqRate.status.active'),
    pending: t('hqRate.status.pending'),
    inactive: t('hqRate.status.inactive'),
  }
  const eventLabel: Record<EventStatus, string> = {
    applied: t('hqRate.event.applied'),
    none: t('hqRate.event.none'),
  }

  const saveDiagramRows = async (rows: DiagramRow[]) => {
    const response = await postHqPageData<RateSettingApiData>('/api/hq/distribution-rates', {
      routes: rows.map((row) => ({
        routeKey: row.routeKey,
        routeType: row.routeType,
        hqRate: row.hqRate ?? '0',
        leaderRate: row.leaderRate ?? '0',
        partnerRate: row.partnerRate ?? '0',
        merchantRate: row.merchantRate ?? '0',
      })),
    })
    setPageData(normalizeRateSetting(response))
  }

  const makeModalData = (row?: RateRow): RateModalData => ({
    countryCode: row?.countryCode ?? row?.code ?? pageData.modal?.countryCode ?? 'NG',
    country: row?.country ?? pageData.modal?.country ?? 'Nigeria',
    eventEnabled: row?.eventEnabled ?? pageData.modal?.eventEnabled ?? false,
    hqRate: row?.hqRate ?? stripPercent(row?.hqFee) ?? pageData.modal?.hqRate ?? '50',
    leaderRate: row?.leaderRate ?? stripPercent(row?.leaderFee) ?? pageData.modal?.leaderRate ?? '25',
    partnerRate: row?.partnerRate ?? stripPercent(row?.partnerFee) ?? pageData.modal?.partnerRate ?? '25',
    merchantSettlementEnabled: row?.merchantSettlementEnabled ?? pageData.modal?.merchantSettlementEnabled ?? true,
    coinCount: row?.coinCount ?? pageData.modal?.coinCount ?? '0',
    status: row?.status ?? pageData.modal?.status ?? 'active',
    adminMemo: row?.adminMemo ?? row?.memo ?? pageData.modal?.adminMemo ?? '',
  })

  const saveCountryRate = async (mode: 'add' | 'edit', payload: RateModalData) => {
    if (mode === 'add' && pageData.rows.some((row) => (row.countryCode ?? row.code) === payload.countryCode)) {
      throw new Error(t('hqRate.modal.duplicateCountry'))
    }
    const request = {
      countryCode: payload.countryCode,
      country: payload.country,
      hqRate: numberText(payload.hqRate),
      leaderRate: numberText(payload.leaderRate),
      partnerRate: numberText(payload.partnerRate),
      merchantSettlementEnabled: payload.merchantSettlementEnabled,
      eventEnabled: payload.eventEnabled,
      coinCount: Number(numberText(payload.coinCount)),
      status: payload.status.toUpperCase(),
      adminMemo: payload.adminMemo,
    }
    const response = mode === 'add'
      ? await postHqPageData<RateSettingApiData>('/api/hq/distribution-rates/countries', request)
      : await putHqPageData<RateSettingApiData>(`/api/hq/distribution-rates/countries/${encodeURIComponent(payload.countryCode)}`, request)
    setPageData(normalizeRateSetting(response))
  }

  const deleteCountryRate = async (countryCode: string) => {
    const response = await deleteHqPageData<RateSettingApiData>(`/api/hq/distribution-rates/countries/${encodeURIComponent(countryCode)}`)
    setPageData(normalizeRateSetting(response))
  }

  return {
    kpis,
    columns,
    rows: pageData.rows,
    diagramRows: pageData.diagram,
    countries: pageData.countries ?? fallbackCountries(pageData.rows),
    statusLabel,
    eventLabel,
    makeModalData,
    saveDiagramRows,
    saveCountryRate,
    deleteCountryRate,
  }
}

function normalizeRateSetting(response: RateSettingApiData): RateSettingApiData {
  return {
    ...response,
    diagram: response.diagram.map((row, index) => enrichDiagramRow(row, index)),
    rows: response.rows.map((row, index, rows) => ({
      ...row,
      no: row.no ?? String(rows.length - index),
      countryCode: row.countryCode ?? row.code,
      hqRate: row.hqRate ?? stripPercent(row.hqFee),
      leaderRate: row.leaderRate ?? stripPercent(row.leaderFee),
      partnerRate: row.partnerRate ?? stripPercent(row.partnerFee),
      eventEnabled: row.eventEnabled ?? row.event === 'applied',
      status: row.status ?? 'active',
      statusAccent: row.statusAccent ?? 'green',
    })),
  }
}

function stripPercent(value?: string) {
  if (!value || value === '-') return undefined
  return value.replace('%', '').trim()
}

function numberText(value: string) {
  const normalized = value.replace('%', '').trim()
  return normalized || '0'
}

function fallbackCountries(rows: RateRow[]): RateCountryOption[] {
  return rows.map((row) => ({ code: row.countryCode ?? row.code, name: row.country }))
}

function enrichDiagramRow(row: DiagramRow, index: number): DiagramRow {
  const routeKeys = ['PARTNER_ROUTED', 'LEADER_DIRECT_MERCHANT', 'HQ_DIRECT_PARTNER', 'HQ_DIRECT_MERCHANT']
  const routeTypes = ['PARTNER_ROUTED', 'LEADER_DIRECT', 'HQ_DIRECT_PARTNER', 'HQ_DIRECT_MERCHANT']
  const enriched: DiagramRow = {
    ...row,
    routeKey: row.routeKey ?? routeKeys[index],
    routeType: row.routeType ?? routeTypes[index],
    hqRate: row.hqRate ?? '0',
    leaderRate: row.leaderRate ?? '0',
    partnerRate: row.partnerRate ?? '0',
    merchantRate: row.merchantRate ?? '0',
  }
  row.cells.forEach((cell) => {
    if (cell.value === undefined) return
    if (cell.color === 'hq') enriched.hqRate = cell.value
    if (cell.color === 'leader') enriched.leaderRate = cell.value
    if (cell.color === 'partner') enriched.partnerRate = cell.value
    if (cell.color === 'merchant') enriched.merchantRate = cell.value
  })
  return enriched
}
