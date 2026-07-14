import { useEffect, useState } from 'react'
import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import { fetchHqPageData } from '../../../services/korionChongApi'
import data from './noticeSendData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
}

/** 폼 기본값(발송자/예약 일시/작성 중 제목·본문 예시)은 데이터라 번역하지 않고 그대로 통과한다. */
export interface NoticeSendForm {
  sender: string
  sendDate: string
  sendTime: string
  timezone: string
  /** 발송 확인 모달의 "예상 수신자 수" (Figma 시안 값) */
  recipients: string
  noticeTitle: string
  noticeBody: string
}

export type HqNoticeSendRange = 'ALL' | 'TODAY' | '1D' | '7D' | '30D' | '90D'

interface NoticeSendOption {
  value: string
  label: string
}

interface NoticeSendFilters {
  countryOptions?: NoticeSendOption[]
  rangeOptions?: HqNoticeSendRange[]
}

interface NoticeSendPageData {
  kpis: KpiRaw[]
  filters?: NoticeSendFilters
  form: NoticeSendForm
}

interface UseNoticeSendFilters {
  countryScope: string
  range: HqNoticeSendRange
}

/*
 * useNoticeSend — 본사어드민 "알림 / 공지 - 공지 보내기" 데이터 훅
 * ------------------------------------------------------------------
 * API에서 KPI/필터 옵션을 가져오고, 실패 시 기존 JSON을 fallback으로 사용한다.
 */
export function useNoticeSend({ countryScope, range }: UseNoticeSendFilters) {
  const { t } = useTranslation()
  const [pageData, setPageData] = useState<NoticeSendPageData>(data as NoticeSendPageData)

  useEffect(() => {
    let cancelled = false
    fetchHqPageData<NoticeSendPageData>('/api/hq/announcements/send-summary', { countryScope, range })
      .then((response) => {
        if (!cancelled) setPageData(response)
      })
      .catch(() => {
        if (!cancelled) setPageData(data as NoticeSendPageData)
      })
    return () => {
      cancelled = true
    }
  }, [countryScope, range])

  const kpis: StatCardData[] = pageData.kpis.map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: k.noteKey ? t(k.noteKey) : undefined,
  }))

  const countryOptions = (pageData.filters?.countryOptions ?? [{ value: 'all', label: 'all' }]).map((option) => ({
    value: option.value,
    label: option.value === 'all' ? t('hqDashboard.filter.allCountries') : option.label,
  }))
  const rangeOptions = pageData.filters?.rangeOptions ?? ['ALL', 'TODAY', '7D', '30D', '90D']

  return { kpis, filters: { countryOptions, rangeOptions }, form: pageData.form }
}
