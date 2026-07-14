import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import { useHqPageData } from '../../../hooks/useHqPageData'

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

const emptyNoticeSendData: NoticeSendPageData = {
  kpis: [],
  filters: {
    countryOptions: [{ value: 'all', label: 'all' }],
    rangeOptions: ['ALL', 'TODAY', '7D', '30D', '90D'],
  },
  form: {
    sender: '',
    sendDate: '',
    sendTime: '',
    timezone: 'KST',
    recipients: '0명',
    noticeTitle: '',
    noticeBody: '',
  },
}

interface UseNoticeSendFilters {
  countryScope: string
  range: HqNoticeSendRange
}

/*
 * useNoticeSend — 본사어드민 "알림 / 공지 - 공지 보내기" 데이터 훅
 * ------------------------------------------------------------------
 * API에서 KPI/필터 옵션을 가져온다. API 실패 시 샘플 JSON을 섞지 않고 빈 상태와 오류를 유지한다.
 */
export function useNoticeSend({ countryScope, range }: UseNoticeSendFilters) {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useHqPageData<NoticeSendPageData>(
    '/api/hq/announcements/send-summary',
    emptyNoticeSendData,
    { countryScope, range },
  )

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

  return { kpis, filters: { countryOptions, rangeOptions }, form: pageData.form, isLoading, error }
}
