import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import type { InfoItem } from '../../../components/molecules/InfoGrid'
import data from './leaderSalesData.json'

interface StatRaw {
  id: string
  labelKey: string
  value: string
}

/** 거래 로그 행 원본 데이터 형태 (Figma 샘플값 하드코딩) */
export interface LeaderSalesLogRow {
  txNo: string
  leaderCode: string
  txAt: string
  merchantCode: string
  merchantName: string
  amount: string
  method: string
  fee: string
  net: string
  status: string
  syncStatus: string
  actions: string[]
}

/*
 * useLeaderSales — 본사어드민 "국가 리더별 거래내역" 데이터 훅
 * ------------------------------------------------------------------
 * Figma 확인 결과 이 화면은 ①전체 거래 로그 표 + ②특정 리더 1명의 프로필(탭 4개)로 구성.
 * 탭 내용(가맹점별/거래내역/정산내역/관리자메모)은 Figma에서 구체 내용을 다 못 확인해서
 * 이번 단계는 탭 UI(클릭 전환)까지만 두고 내용은 "구현 예정"으로 둔다(사용자 확인됨).
 * 계정 정보(아이디/이메일 등)는 탭과 무관하게 항상 보이는 부분으로 확인되어 InfoGrid로 둠.
 */
export function useLeaderSales() {
  const { t } = useTranslation()

  const miniStats: StatCardData[] = (data.miniStats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
  }))

  const logColumns: Column[] = [
    { key: 'txNo', label: t('hqLeaderSales.col.txNo'), width: '0.6fr' },
    { key: 'leaderCode', label: t('hqLeaderSales.col.leaderCode'), width: '1.1fr' },
    { key: 'txAt', label: t('hqLeaderSales.col.txAt'), width: '1.2fr' },
    { key: 'merchantCode', label: t('hqLeaderSales.col.merchantCode'), width: '1.1fr' },
    { key: 'merchantName', label: t('hqLeaderSales.col.merchantName'), width: '0.9fr' },
    { key: 'amount', label: t('hqLeaderSales.col.amount'), width: '0.9fr' },
    { key: 'method', label: t('hqLeaderSales.col.method'), width: '0.8fr' },
    { key: 'fee', label: t('hqLeaderSales.col.fee'), width: '0.9fr' },
    { key: 'net', label: t('hqLeaderSales.col.net'), width: '0.9fr' },
    { key: 'status', label: t('hqLeaderSales.col.status'), width: '0.8fr' },
    { key: 'syncStatus', label: t('hqLeaderSales.col.syncStatus'), width: '0.9fr' },
    { key: 'action', label: t('hqLeaderSales.col.action'), width: '1.6fr' },
  ]

  const profile = data.profile
  const accountInfo: InfoItem[] = [
    { label: t('hqLeaderSales.account.loginId'), value: profile.account.loginId },
    { label: t('hqLeaderSales.account.password'), value: profile.account.password },
    { label: t('hqLeaderSales.account.email'), value: profile.account.email },
    { label: t('hqLeaderSales.account.telegram'), value: profile.account.telegram },
    { label: t('hqLeaderSales.account.phone'), value: profile.account.phone },
    { label: t('hqLeaderSales.account.twitter'), value: profile.account.twitter },
    { label: t('hqLeaderSales.account.appliedAt'), value: profile.account.appliedAt },
  ]

  return {
    miniStats,
    logColumns,
    logRows: data.logRows as LeaderSalesLogRow[],
    profile: { code: profile.code, country: profile.country, parent: profile.parent },
    accountInfo,
  }
}
