import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import type { InfoItem } from '../../../components/molecules/InfoGrid'
import data from './partnerDetailData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
}

/** "가맹점별" 탭 행 원본 데이터 형태 (Figma 81:24063 샘플값 하드코딩) */
export interface PartnerMerchantRow {
  no: string
  partnerCode: string
  merchantCode: string
  city: string
  merchantName: string
  sector: string
  monthVolume: string
  monthTxCount: string
  fee: string
  lastPaidAt: string
  usage: string
}

/*
 * usePartnerDetail — 본사어드민 "파트너별 거래내역" 화면의 "파트너 정보" 상세 패널 데이터 훅
 * ------------------------------------------------------------------
 * Figma 81:24063(가맹점별 탭)·81:24280(거래내역 탭) 기준. 기존 usePartnerSales는
 * 다른 브랜치에서 API 연동 작업이 병렬 진행 중이라 건드리지 않고(거래 로그는 그쪽 것을
 * 그대로 씀), 상세 패널 전용 데이터만 이 훅으로 분리한다. KPI·가맹점별 컬럼 라벨은
 * 문구가 같은 기존 키(hqPartnerSales.kpi.*, hqLeaderSales.merchants.col.*)를 재사용.
 */
export function usePartnerDetail() {
  const { t } = useTranslation()

  const toStats = (items: KpiRaw[]): StatCardData[] =>
    items.map((s) => ({ id: s.id, label: t(s.labelKey), value: s.value }))

  const kpiTop = toStats(data.kpiTop as KpiRaw[])
  const tabKpi = toStats(data.tabKpi as KpiRaw[])

  const accountInfo: InfoItem[] = [
    { label: t('hqPartnerSales.account.loginId'), value: data.account.loginId },
    { label: t('hqPartnerSales.account.password'), value: data.account.password, actionLabel: t('common.reset') },
    { label: t('hqPartnerSales.account.email'), value: data.account.email, actionLabel: t('common.change') },
    { label: t('hqPartnerSales.account.telegram'), value: data.account.telegram },
    { label: t('hqPartnerSales.account.phone'), value: data.account.phone },
    { label: t('hqPartnerSales.account.twitter'), value: data.account.twitter },
    { label: t('hqPartnerSales.account.appliedAt'), value: data.account.appliedAt, valueColor: 'var(--color-accent-green)' },
    { label: t('hqPartnerSales.account.approvedAt'), value: data.account.approvedAt, valueColor: 'var(--color-accent-green)' },
  ]

  // 2번째 줄은 본사 직접 계약 사유(1열) 다음 칸을 비우고 KORION WALLET 주소가 3열에 옴(Figma 실측 — 리더 화면과 동일 배치)
  const basicInfo: InfoItem[] = [
    { label: t('hqPartnerSales.basic.name'), value: data.basic.name },
    { label: t('hqPartnerSales.basic.country'), value: data.basic.country },
    { label: t('hqPartnerSales.basic.region'), value: data.basic.region },
    { label: t('hqPartnerSales.basic.language'), value: data.basic.language },
    { label: t('hqPartnerSales.basic.directContractReason'), value: data.basic.directContractReason },
    { label: '', value: '' },
    { label: t('hqPartnerSales.basic.walletAddress'), value: data.basic.walletAddress },
  ]

  // "가맹점별" 탭 컬럼 — 리더 화면(hqLeaderSales.merchants.col.*)과 같은 문구는 재사용, 도시/업종만 파트너 전용 키
  const merchantColumns: Column[] = [
    { key: 'no', label: t('hqLeaderSales.merchants.col.no'), width: '0.5fr' },
    { key: 'partnerCode', label: t('hqLeaderSales.merchants.col.partnerCode'), width: '1.1fr' },
    { key: 'merchantCode', label: t('hqLeaderSales.merchants.col.merchantCode'), width: '1.1fr' },
    { key: 'city', label: t('hqPartnerSales.merchants.col.city'), width: '0.7fr' },
    { key: 'merchantName', label: t('hqLeaderSales.merchants.col.merchantName'), width: '0.9fr' },
    { key: 'sector', label: t('hqPartnerSales.merchants.col.sector'), width: '0.8fr' },
    { key: 'monthVolume', label: t('hqLeaderSales.merchants.col.monthVolume'), width: '0.9fr' },
    { key: 'monthTxCount', label: t('hqLeaderSales.merchants.col.monthTxCount'), width: '1fr' },
    { key: 'fee', label: t('hqLeaderSales.merchants.col.fee'), width: '0.9fr' },
    { key: 'lastPaidAt', label: t('hqLeaderSales.merchants.col.lastPaidAt'), width: '1fr' },
    { key: 'usage', label: t('hqLeaderSales.merchants.col.usage'), width: '1.4fr' },
    { key: 'action', label: t('hqLeaderSales.merchants.col.action'), width: '0.7fr' },
  ]

  return {
    profile: data.profile,
    kpiTop,
    accountInfo,
    basicInfo,
    tabKpi,
    merchantColumns,
    merchantRows: data.merchantRows as PartnerMerchantRow[],
  }
}
