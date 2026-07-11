import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import type { InfoItem } from '../../../components/molecules/InfoGrid'
import data from './leaderSalesData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
}

/** 정산 내역 행 원본 데이터 형태 — 리더 본인용 "정산 내역" 화면(SettlementHistory)과 동일 구조 재사용 */
export interface LeaderSettlementRow {
  no: string
  appliedDate: string
  period: string
  totalAmount: string
  leaderAmount: string
  partnerAmount: string
  held: string
  status: string
  paidDate: string
}

/** 거래 로그 행 원본 데이터 형태 (Figma 샘플값 하드코딩) */
export interface LeaderSalesLogRow {
  txNo: string
  partnerCode: string
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
 * Figma 좌표를 끝까지 추적해 확정한 실제 구조(1차 구현과 다름, CHANGELOG 참고):
 *   리더 정보(제목) → 코드 미리보기 → KPI 4개 → A.계정정보 → B.기본/소속정보
 *   → 탭 5개(기본 선택: 거래내역) → [거래내역 탭 전용] KPI 5개 + 전체 거래 로그 표
 * B섹션은 Figma상 "파트너명"이라는 라벨이 그대로 있었는데(파트너별 거래내역 화면을
 * 복붙한 흔적), 리더 화면이라 의미상 "리더명"으로 바로잡아 표기한다.
 */
export function useLeaderSales() {
  const { t } = useTranslation()

  const toStats = (items: KpiRaw[]): StatCardData[] =>
    items.map((s) => ({ id: s.id, label: t(s.labelKey), value: s.value }))

  const kpiTop = toStats(data.kpiTop as KpiRaw[])
  const kpiBottom = toStats(data.kpiBottom as KpiRaw[])

  const accountInfo: InfoItem[] = [
    { label: t('hqLeaderSales.account.loginId'), value: data.account.loginId },
    { label: t('hqLeaderSales.account.password'), value: data.account.password, actionLabel: t('common.reset') },
    { label: t('hqLeaderSales.account.email'), value: data.account.email, actionLabel: t('common.change') },
    { label: t('hqLeaderSales.account.telegram'), value: data.account.telegram },
    { label: t('hqLeaderSales.account.phone'), value: data.account.phone },
    { label: t('hqLeaderSales.account.twitter'), value: data.account.twitter },
    { label: t('hqLeaderSales.account.appliedAt'), value: data.account.appliedAt, valueColor: 'var(--color-accent-green)' },
    { label: t('hqLeaderSales.account.approvedAt'), value: data.account.approvedAt, valueColor: 'var(--color-accent-green)' },
  ]

  // 2번째 줄은 본사 직접 계약 사유(1열) 다음 칸을 비우고 KORION WALLET 주소가 3열에 옴(Figma 실측 — 4열 그리드 중 2열은 빈칸)
  const basicInfo: InfoItem[] = [
    { label: t('hqLeaderSales.basic.name'), value: data.basic.name },
    { label: t('hqLeaderSales.basic.country'), value: data.basic.country },
    { label: t('hqLeaderSales.basic.region'), value: data.basic.region },
    { label: t('hqLeaderSales.basic.language'), value: data.basic.language },
    { label: t('hqLeaderSales.basic.directContractReason'), value: data.basic.directContractReason },
    { label: '', value: '' },
    { label: t('hqLeaderSales.basic.walletAddress'), value: data.basic.walletAddress },
  ]

  // "정산내역" 탭 — 리더 본인용 정산 내역 화면(settle.hist.*)과 동일한 컬럼/라벨을 그대로 재사용
  const settlementColumns: Column[] = [
    { key: 'no', label: t('settle.hist.col.no'), width: '1.4fr' },
    { key: 'appliedDate', label: t('settle.hist.col.appliedDate'), width: '1fr' },
    { key: 'period', label: t('settle.hist.col.period'), width: '1.4fr' },
    { key: 'totalAmount', label: t('settle.hist.col.totalAmount'), width: '1.1fr' },
    { key: 'leaderAmount', label: t('settle.hist.col.leaderAmount'), width: '1fr' },
    { key: 'partnerAmount', label: t('settle.hist.col.partnerAmount'), width: '1fr' },
    { key: 'held', label: t('settle.hist.col.held'), width: '0.9fr' },
    { key: 'status', label: t('settle.hist.col.status'), width: '1fr' },
    { key: 'paidDate', label: t('settle.hist.col.paidDate'), width: '1fr' },
    { key: 'action', label: t('settle.hist.col.action'), width: '0.8fr' },
  ]

  const logColumns: Column[] = [
    { key: 'txNo', label: t('hqLeaderSales.col.txNo'), width: '0.6fr' },
    { key: 'partnerCode', label: t('hqLeaderSales.col.partnerCode'), width: '1.1fr' },
    { key: 'txAt', label: t('hqLeaderSales.col.txAt'), width: '1.2fr' },
    { key: 'merchantCode', label: t('hqLeaderSales.col.merchantCode'), width: '1.1fr' },
    { key: 'merchantName', label: t('hqLeaderSales.col.merchantName'), width: '0.9fr' },
    { key: 'amount', label: t('hqLeaderSales.col.amount'), width: '0.9fr' },
    { key: 'method', label: t('hqLeaderSales.col.method'), width: '0.8fr' },
    { key: 'fee', label: t('hqLeaderSales.col.fee'), width: '0.9fr' },
    { key: 'net', label: t('hqLeaderSales.col.net'), width: '0.9fr' },
    { key: 'status', label: t('hqLeaderSales.col.status'), width: '0.8fr' },
    { key: 'syncStatus', label: t('hqLeaderSales.col.syncStatus'), width: '0.9fr' },
    // 액션 컬럼: 배지 3개(상세/환불요청/리스크요청)가 항상 한 줄로 들어갈 최소폭(150px)을 보장하고
    // 그 이상은 1.6fr 비율로 넓어진다. 좁은 화면에선 나머지 텍스트 컬럼이 대신 줄어들어(말줄임)
    // 배지가 잘리거나 삐져나오지 않으면서 표는 가로 스크롤 없이 화면 폭에 맞는다.
    { key: 'action', label: t('hqLeaderSales.col.action'), width: 'minmax(150px, 1.6fr)' },
  ]

  return {
    profile: data.profile,
    kpiTop,
    accountInfo,
    basicInfo,
    kpiBottom,
    logColumns,
    logRows: data.logRows as LeaderSalesLogRow[],
    settlement: data.settlement as { lastSettleDate: string; thisRequestAmount: string; status: string; rows: LeaderSettlementRow[] },
    settlementColumns,
  }
}
