import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import { deleteHqPageData, fetchHqPageData, postHqPageData, putHqPageData } from '../../../services/korionChongApi'
import data from './commissionData.json'

interface KpiRaw {
  id?: string
  labelKey: string
  value: string
  noteKey?: string
  note?: string
}

export type FeeStatus = 'active' | 'pending' | 'inactive'

export interface FeeCoin {
  assetCode: string
  network: string
  tokenStandard: string
  fee: string
  name?: string
}

export interface FeeCountryOption {
  code: string
  name: string
}

export interface FeeRow {
  no?: string
  country: string
  code: string
  countryCode?: string
  baseFee: string
  baseFeeValue?: string
  online: string
  onlineFee?: string
  offline: string
  offlineFee?: string
  event: string
  eventEnabled?: boolean
  eventFee?: string
  actualFee: string
  coinCount: string
  status: FeeStatus
  statusAccent?: 'green' | 'amber' | 'red'
  scope?: 'COUNTRY_ALL' | 'LEADER_ONLY'
  coins?: FeeCoin[]
}

export interface FeeModalData {
  countryCode: string
  country: string
  eventEnabled: boolean
  eventFee: string
  scope: 'COUNTRY_ALL' | 'LEADER_ONLY'
  baseFee: string
  onlineFee: string
  offlineFee: string
  status: FeeStatus
  coins: FeeCoin[]
}

interface CommissionApiData {
  kpis: KpiRaw[]
  rows: FeeRow[]
  countries?: FeeCountryOption[]
  modal?: Partial<FeeModalData>
  globalFee?: string
}

export interface KpiItem {
  id: string
  label: string
  value: string
  note: string
}

const fallbackData = data as CommissionApiData

export function useCommission() {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState<CommissionApiData>(fallbackData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchHqPageData<CommissionApiData>('/api/hq/commission-fees')
      .then((response) => {
        if (!cancelled) {
          setPageData(normalizePageData(response))
          setError(null)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'API error')
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
        note: k.noteKey ? t(k.noteKey) : k.note ?? '',
      })),
    [pageData.kpis, t]
  )

  const columns: Column[] = [
    { key: 'no', label: t('hqCommission.col.no'), width: '0.55fr', align: 'center' },
    { key: 'country', label: t('hqCommission.col.country'), width: '1.5fr' },
    { key: 'code', label: t('hqCommission.col.code'), width: '0.89fr' },
    { key: 'baseFee', label: t('hqCommission.col.baseFee'), width: '0.97fr' },
    { key: 'online', label: t('hqCommission.col.online'), width: '1.05fr' },
    { key: 'offline', label: t('hqCommission.col.offline'), width: '1.06fr' },
    { key: 'event', label: t('hqCommission.col.event'), width: '1.06fr' },
    { key: 'actualFee', label: t('hqCommission.col.actualFee'), width: '1.15fr' },
    { key: 'coinCount', label: t('hqCommission.col.coinCount'), width: '1.2fr' },
    { key: 'status', label: t('hqCommission.col.status'), width: '1.05fr' },
    { key: 'action', label: t('hqCommission.col.action'), width: '1.35fr' },
  ]

  const statusLabel: Record<FeeStatus, string> = {
    active: t('hqCommission.status.active'),
    pending: t('hqCommission.status.pending'),
    inactive: t('hqCommission.status.inactive'),
  }

  const makeModalData = (row?: FeeRow): FeeModalData => ({
    countryCode: row?.countryCode ?? row?.code ?? pageData.modal?.countryCode ?? 'NG',
    country: row?.country ?? pageData.modal?.country ?? 'Nigeria',
    eventEnabled: row?.eventEnabled ?? pageData.modal?.eventEnabled ?? false,
    eventFee: row?.eventFee ?? pageData.modal?.eventFee ?? '0',
    scope: row?.scope ?? pageData.modal?.scope ?? 'COUNTRY_ALL',
    baseFee: row?.baseFeeValue ?? stripPercent(row?.baseFee) ?? pageData.modal?.baseFee ?? '0.1',
    onlineFee: row?.onlineFee ?? stripPercent(row?.online) ?? pageData.modal?.onlineFee ?? '0.1',
    offlineFee: row?.offlineFee ?? stripPercent(row?.offline) ?? pageData.modal?.offlineFee ?? '0.1',
    status: row?.status ?? pageData.modal?.status ?? 'active',
    coins: row?.coins?.length ? row.coins : pageData.modal?.coins ?? [{ assetCode: 'KORI', network: 'TRON', tokenStandard: 'TRC-20', fee: '0.1', name: 'KORI  TRON  TRC-20' }],
  })

  const saveFee = async (mode: 'add' | 'edit', payload: FeeModalData) => {
    if (mode === 'add' && pageData.rows.some((row) => (row.countryCode ?? row.code) === payload.countryCode)) {
      throw new Error(t('hqCommission.modal.duplicateCountry'))
    }
    const request = {
      countryCode: payload.countryCode,
      country: payload.country,
      eventEnabled: payload.eventEnabled,
      eventFee: numberText(payload.eventFee),
      scope: payload.scope,
      baseFee: numberText(payload.baseFee),
      onlineFee: numberText(payload.onlineFee),
      offlineFee: numberText(payload.offlineFee),
      status: payload.status.toUpperCase(),
      coins: payload.coins.map((coin) => ({
        assetCode: coin.assetCode,
        network: coin.network,
        tokenStandard: coin.tokenStandard,
        fee: numberText(coin.fee),
      })),
    }
    const response = mode === 'add'
      ? await postHqPageData<CommissionApiData>('/api/hq/commission-fees', request)
      : await putHqPageData<CommissionApiData>(`/api/hq/commission-fees/${encodeURIComponent(payload.countryCode)}`, request)
    setPageData(normalizePageData(response))
  }

  const deleteFee = async (countryCode: string) => {
    const response = await deleteHqPageData<CommissionApiData>(`/api/hq/commission-fees/${encodeURIComponent(countryCode)}`)
    setPageData(normalizePageData(response))
  }

  return {
    kpis,
    columns,
    rows: pageData.rows,
    countries: pageData.countries ?? fallbackCountries(pageData.rows),
    statusLabel,
    globalFee: pageData.globalFee ?? fallbackData.globalFee ?? '0.1',
    makeModalData,
    editLabel: t('hqCommission.action.edit'),
    deleteLabel: t('hqCommission.action.delete'),
    saveFee,
    deleteFee,
    error,
  }
}

function normalizePageData(response: CommissionApiData): CommissionApiData {
  return {
    ...response,
    rows: response.rows.map((row, index, rows) => ({
      ...row,
      no: row.no ?? String(rows.length - index),
      countryCode: row.countryCode ?? row.code,
      baseFeeValue: row.baseFeeValue ?? stripPercent(row.baseFee),
      onlineFee: row.onlineFee ?? stripPercent(row.online),
      offlineFee: row.offlineFee ?? stripPercent(row.offline),
      eventFee: row.eventFee ?? stripPercent(row.event),
      status: row.status ?? 'active',
      coins: row.coins ?? [],
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

function fallbackCountries(rows: FeeRow[]): FeeCountryOption[] {
  return rows.map((row) => ({ code: row.countryCode ?? row.code, name: row.country }))
}
