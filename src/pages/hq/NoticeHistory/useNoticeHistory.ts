import { useEffect, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import { fetchHqPageData } from '../../../services/korionChongApi'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
}

/** 행 데이터(제목/국가/대상/발송방식·상태 enum 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과한다. */
export interface NoticeHistoryRow {
  id?: string | number
  no: string
  sentAt: string
  title: string
  country: string
  target: string
  recipients: string
  method: string
  status: string
  rawStatus?: string
  sender?: string
  success?: string
  fail?: string
  rate?: string
  body?: string
}

export interface NoticeRecipientRow {
  no: number
  recipientType: string
  recipientCode: string
  recipientName: string
  country: string
  deliveryStatus: string
  readStatus: string
  deliveredAt: string
}

/** 상세 오버레이 전용 값(발송자/성공·실패 수/본문) — 목록 행에 없는 항목만 별도 보관 */
export interface NoticeDetailExtra {
  sender: string
  success: string
  fail: string
  rate: string
  body: string
}

export type HqNoticeHistoryRange = 'ALL' | 'TODAY' | '1D' | '7D' | '30D' | '90D'

interface NoticeHistoryOption {
  value: string
  label: string
}

interface NoticeHistoryFilters {
  countryOptions?: NoticeHistoryOption[]
  rangeOptions?: HqNoticeHistoryRange[]
}

interface NoticeHistoryPageData {
  kpis: KpiRaw[]
  filters?: NoticeHistoryFilters
  history: {
    rows: NoticeHistoryRow[]
  }
  detail: NoticeDetailExtra
}

const EMPTY_NOTICE_HISTORY: NoticeHistoryPageData = {
  kpis: [],
  filters: {
    countryOptions: [{ value: 'all', label: 'all' }],
    rangeOptions: ['ALL', 'TODAY', '7D', '30D', '90D'],
  },
  history: { rows: [] },
  detail: {
    sender: '-',
    success: '-',
    fail: '-',
    rate: '-',
    body: '',
  },
}

export function useNoticeHistory(countryScope: string, range: HqNoticeHistoryRange, reloadToken = 0) {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState<NoticeHistoryPageData>(EMPTY_NOTICE_HISTORY)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetchHqPageData<NoticeHistoryPageData>('/api/hq/announcements/history', { countryScope, range })
      .then((response) => {
        if (!cancelled) setPageData(response)
      })
      .catch((requestError) => {
        if (!cancelled) {
          setPageData(EMPTY_NOTICE_HISTORY)
          setError(requestError instanceof Error ? requestError.message : t('common.apiError'))
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [countryScope, range, reloadToken, t])

  const kpis: StatCardData[] = pageData.kpis.map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: k.noteKey ? t(k.noteKey) : undefined,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('hqNoticeHistory.col.no'), width: '72px', align: 'center' },
    { key: 'sentAt', label: t('hqNoticeHistory.col.sentAt'), width: '144px' },
    { key: 'title', label: t('hqNoticeHistory.col.title'), width: '340px' },
    { key: 'country', label: t('hqNoticeHistory.col.country'), width: '120px' },
    { key: 'target', label: t('hqNoticeHistory.col.target'), width: '160px' },
    { key: 'recipients', label: t('hqNoticeHistory.col.recipients'), width: '116px' },
    { key: 'method', label: t('hqNoticeHistory.col.method'), width: '96px' },
    { key: 'status', label: t('hqNoticeHistory.col.status'), width: '112px' },
    { key: 'action', label: t('hqNoticeHistory.col.action'), width: '180px' },
  ]

  const countryOptions = (pageData.filters?.countryOptions ?? EMPTY_NOTICE_HISTORY.filters?.countryOptions ?? []).map((option) => ({
    value: option.value,
    label: option.value === 'all' ? t('hqDashboard.filter.allCountries') : option.label,
  }))
  const rangeOptions = pageData.filters?.rangeOptions ?? EMPTY_NOTICE_HISTORY.filters?.rangeOptions ?? []

  return {
    isLoading,
    error,
    kpis,
    filters: { countryOptions, rangeOptions },
    columns,
    rows: pageData.history.rows,
    detail: pageData.detail,
  }
}
