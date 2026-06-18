import { useEffect, useState } from 'react'
import { useTranslation } from '../../i18n'
import type { StatCardData } from '../../components/molecules/StatCard'
import type { Column } from '../../components/organisms/DataTable'
import { fetchLeaderPartners } from '../../services/korionChongApi'
import { defaultSessionCountryScope } from '../../services/authSession'
import data from './partnersData.json'

interface StatRaw {
  id: string
  labelKey: string
  value: string
}

/** 파트너 전체 목록 행 원본 데이터 형태 */
export interface PartnerListRow {
  no: string
  partner: string
  name: string
  telegram: string
  region: string
  subCount: string
  volume: string
  txCount: string
  hqStatus: string
  opStatus: string
  lastTx: string
  /** 행마다 다른 액션 라벨 (운영 상태에 따라 정지요청/해제요청 등) */
  actions: string[]
}

/*
 * usePartners — 파트너 전체 목록 데이터 훅
 * ------------------------------------------------------------------
 * partnersData.json(하드코딩)을 읽어 UI 라벨(지표/컬럼명)은 번역해 반환한다.
 * 행 값/액션 라벨은 데이터라 그대로 둔다. 추후 API 연동 시 이 훅 내부만 교체.
 */
export function usePartners() {
  const { t } = useTranslation()
  const [rows, setRows] = useState<PartnerListRow[]>(data.rows as PartnerListRow[])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetchLeaderPartners(defaultSessionCountryScope())
      .then((response) => {
        if (cancelled) return
        setRows(
          response.items.map((partner, index) => ({
            no: String(index + 1),
            partner: `SP-${partner.partnerId}`,
            name: partner.loginId,
            telegram: '-',
            region: [partner.region, partner.city].filter(Boolean).join(' / ') || partner.country,
            subCount: String(partner.merchantCount),
            volume: partner.completedTransactionAmount,
            txCount: '-',
            hqStatus: '승인',
            opStatus: partner.status === 'SALES_PARTNER_APPROVED' ? '활성' : partner.status,
            lastTx: partner.lastActivityAt ?? '-',
            actions: ['상세', '정지요청'],
          }))
        )
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
  }, [])

  const stats: StatCardData[] = (data.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('partnerList.col.no'), width: '0.5fr', align: 'center' },
    { key: 'partner', label: t('partnerList.col.partner'), width: '1.1fr' },
    { key: 'name', label: t('partnerList.col.name'), width: '1.1fr' },
    { key: 'telegram', label: t('partnerList.col.telegram'), width: '1fr' },
    { key: 'region', label: t('partnerList.col.region'), width: '0.8fr' },
    { key: 'subCount', label: t('partnerList.col.subCount'), width: '0.9fr' },
    { key: 'volume', label: t('partnerList.col.volume'), width: '1.1fr' },
    { key: 'txCount', label: t('partnerList.col.txCount'), width: '0.9fr' },
    { key: 'hqStatus', label: t('partnerList.col.hqStatus'), width: '0.9fr' },
    { key: 'opStatus', label: t('partnerList.col.opStatus'), width: '0.8fr' },
    { key: 'lastTx', label: t('partnerList.col.lastTx'), width: '1.3fr' },
    { key: 'action', label: t('partnerList.col.action'), width: '1.2fr' },
  ]

  return { stats, columns, rows, isLoading, error }
}
