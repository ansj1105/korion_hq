import { useTranslation } from '../../i18n'
import type { StatCardData } from '../../components/molecules/StatCard'
import type { Column } from '../../components/organisms/DataTable'
import { useRolePageData } from '../../hooks/useRolePageData'
import data from './merchantsData.json'

interface StatRaw {
  id: string
  labelKey: string
  value: string
}

/** 가맹점 전체 목록 행 원본 데이터 형태 */
export interface MerchantListRow {
  no: string
  city: string
  partner: string
  merchantCode: string
  name: string
  volume: string
  txCount: string
  avgPay: string
  qrUsage: string
  lastTx: string
  /** 행마다 다른 액션 라벨 (운영 상태에 따라 정지요청/해지요청 등) */
  actions: string[]
}

/*
 * useMerchants — 가맹점 전체 목록 데이터 훅
 * ------------------------------------------------------------------
 * merchantsData.json(하드코딩)을 읽어 UI 라벨(지표/컬럼명)은 번역해 반환.
 * 행 값/액션 라벨은 데이터라 그대로 둔다. 추후 API 연동 시 이 훅 내부만 교체.
 */
export function useMerchants() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useRolePageData(
    { leader: '/api/leader/merchants', partner: '/api/partner/merchants' },
    data
  )

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
  }))

  const columns: Column[] = [
    { key: 'no', label: t('merchantList.col.no'), width: '0.5fr', align: 'center' },
    { key: 'city', label: t('merchantList.col.city'), width: '0.8fr' },
    { key: 'partner', label: t('merchantList.col.partner'), width: '1.1fr' },
    { key: 'merchantCode', label: t('merchantList.col.merchantCode'), width: '1.1fr' },
    { key: 'name', label: t('merchantList.col.name'), width: '1fr' },
    { key: 'volume', label: t('merchantList.col.volume'), width: '1fr' },
    { key: 'txCount', label: t('merchantList.col.txCount'), width: '0.9fr' },
    { key: 'avgPay', label: t('merchantList.col.avgPay'), width: '1fr' },
    { key: 'qrUsage', label: t('merchantList.col.qrUsage'), width: '1.3fr' },
    { key: 'lastTx', label: t('merchantList.col.lastTx'), width: '1.3fr' },
    { key: 'action', label: t('merchantList.col.action'), width: '1.2fr' },
  ]

  return { stats, columns, rows: pageData.rows as MerchantListRow[], isLoading, error }
}
