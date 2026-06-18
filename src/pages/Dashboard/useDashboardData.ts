import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '../../i18n'
import type { AccentKey } from '../../types'
import type { KpiCardData } from '../../components/molecules/KpiCard'
import {
  fetchLeaderDashboard,
  fetchLeaderPartners,
  type LeaderDashboardApiResponse,
  type LeaderPartnerApiResponse,
} from '../../services/korionChongApi'
import { sessionCountryScopes } from '../../services/authSession'
import data from './dashboardData.json'

type CountryScope = {
  code: string
  label: string
}

type LeaderProfile = {
  leaderId: string
  displayName: string
  countryScopes: CountryScope[]
  defaultCountryScope: string
}

type KpiRaw = {
  id: string
  labelKey: string
  value: string
  delta?: string
  tag?: string
  accent: string
}

type PartnerSummary = {
  id: string
  name: string
  country: string
  merchantCount: number
  monthlyVolume: string
  fee: string
  risk: string
}

type MerchantSummary = {
  id: string
  name: string
  country: string
  partnerName: string
  monthlyVolume: string
  fee: string
  risk: string
}

type MonthlyVolume = {
  month: string
  volume: string
  txCount: string
}

type FeeSummary = {
  label: string
  amount: string
  delta: string
}

type RiskAlert = {
  id: string
  severity: 'low' | 'medium' | 'high'
  title: string
  message: string
  target: string
}

type DashboardPeriodData = {
  kpis: KpiRaw[]
  organizationSummary: {
    partners: PartnerSummary[]
    merchants: MerchantSummary[]
  }
  monthlyVolume: MonthlyVolume[]
  feeSummary: FeeSummary[]
  riskAlerts: RiskAlert[]
}

type DashboardApiData = {
  leaderProfile: LeaderProfile
  countries: Record<string, { periods: Record<string, DashboardPeriodData> }>
}

const apiData = data as DashboardApiData

function currentYearMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function mapDashboardApi(
  dashboard: LeaderDashboardApiResponse,
  partners: LeaderPartnerApiResponse,
  countryScope: string,
  period: string
): DashboardApiData {
  const countryScopes = dashboard.leaderProfile.countryScopes.map((code) => ({
    code,
    label: code,
  }))

  return {
    leaderProfile: {
      leaderId: String(dashboard.leaderProfile.leaderId),
      displayName: dashboard.leaderProfile.loginId,
      countryScopes,
      defaultCountryScope: countryScope,
    },
    countries: {
      [countryScope]: {
        periods: {
          [period]: {
            kpis: [
              {
                id: 'partners',
                labelKey: 'dashboard.kpi.salesPartner',
                value: String(dashboard.kpis.approvedPartnerCount),
                accent: 'cyan',
              },
              {
                id: 'merchants',
                labelKey: 'dashboard.kpi.subMerchant',
                value: String(dashboard.kpis.approvedMerchantCount),
                accent: 'green',
              },
              {
                id: 'monthly-volume',
                labelKey: 'dashboard.kpi.monthlyVolume',
                value: dashboard.kpis.completedTransactionAmount,
                accent: 'cyan',
              },
              {
                id: 'fee',
                labelKey: 'dashboard.kpi.expectedFee',
                value: dashboard.kpis.confirmedCommissionAmount,
                tag: '정산',
                accent: 'purple',
              },
            ],
            organizationSummary: {
              partners: partners.items.map((partner) => ({
                id: String(partner.partnerId),
                name: partner.loginId,
                country: partner.country,
                merchantCount: partner.merchantCount,
                monthlyVolume: partner.completedTransactionAmount,
                fee: '-',
                risk: '정상',
              })),
              merchants: [],
            },
            monthlyVolume: dashboard.monthlyVolume.map((item) => ({
              month: item.month,
              volume: item.amount,
              txCount: String(item.transactionCount),
            })),
            feeSummary: [
              { label: '리더 예상 수수료', amount: dashboard.feeSummary.countryLeaderFee, delta: '-' },
              { label: '파트너 귀속 수수료', amount: dashboard.feeSummary.salesPartnerFee, delta: '-' },
              { label: '본사 귀속 수수료', amount: dashboard.feeSummary.korionFee, delta: '-' },
            ],
            riskAlerts: dashboard.riskAlerts.map((alert, index) => ({
              id: `${alert.type}-${index}`,
              severity: alert.severity,
              title: alert.type,
              message: alert.message,
              target: countryScope,
            })),
          },
          '30D': apiData.countries.KR.periods['30D'],
        },
      },
    },
  }
}

/*
 * useDashboardData — 국가 리더 대시보드 데이터 훅
 * ------------------------------------------------------------------
 * 현재는 mock API JSON을 읽는다. 실 API 연결 시 이 훅 내부만
 * /leader/dashboard API 호출로 교체하면 화면과 권한 검증 흐름은 유지된다.
 *
 * Permission invariant:
 * - 국가 리더는 LeaderProfile.countryScopes에 포함된 국가만 조회 가능하다.
 * - 범위 밖 countryScope가 들어오면 defaultCountryScope로 되돌리고 invalidScope를 반환한다.
 */
export function useDashboardData(period = currentYearMonth(), requestedCountryScope?: string) {
  const { t } = useTranslation()
  const [remoteData, setRemoteData] = useState<DashboardApiData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sourceData = remoteData ?? apiData
  const leaderProfile = sourceData.leaderProfile
  const sessionScopes = sessionCountryScopes()
  const sessionCountryScopeItems = sessionScopes.map((code) => ({ code, label: code }))
  const countryScopes =
    sessionCountryScopeItems.length > 0 ? sessionCountryScopeItems : leaderProfile.countryScopes
  const allowedScopes = new Set(countryScopes.map((scope) => scope.code))
  const fallbackScope = countryScopes[0]?.code ?? leaderProfile.defaultCountryScope
  const scopedLeaderProfile = {
    ...leaderProfile,
    countryScopes,
    defaultCountryScope: fallbackScope,
  }
  const selectedCountryScope =
    requestedCountryScope && allowedScopes.has(requestedCountryScope)
      ? requestedCountryScope
      : fallbackScope
  const invalidScope = Boolean(requestedCountryScope && requestedCountryScope !== selectedCountryScope)
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    Promise.all([
      fetchLeaderDashboard(period, selectedCountryScope),
      fetchLeaderPartners(selectedCountryScope),
    ])
      .then(([dashboard, partners]) => {
        if (!cancelled) setRemoteData(mapDashboardApi(dashboard, partners, selectedCountryScope, period))
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'API error')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [period, selectedCountryScope])

  const countryData =
    sourceData.countries[selectedCountryScope] ??
    sourceData.countries[fallbackScope] ??
    apiData.countries[apiData.leaderProfile.defaultCountryScope]
  const periodData = countryData.periods[period] ?? countryData.periods['30D']

  const kpis: KpiCardData[] = useMemo(
    () =>
      periodData.kpis.map((k) => ({
        id: k.id,
        label: t(k.labelKey), // UI 라벨만 번역
        value: k.value,
        delta: k.delta,
        tag: k.tag,
        accent: k.accent as AccentKey,
      })),
    [periodData.kpis, t]
  )

  return {
    kpis,
    leaderProfile: scopedLeaderProfile,
    selectedCountryScope,
    invalidScope,
    organizationSummary: periodData.organizationSummary,
    monthlyVolume: periodData.monthlyVolume,
    feeSummary: periodData.feeSummary,
    riskAlerts: periodData.riskAlerts,
    isLoading,
    error,
  }
}
