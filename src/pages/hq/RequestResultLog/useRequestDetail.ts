import { useTranslation } from '../../../i18n'
import type { Column } from '../../../components/organisms/DataTable'
import type { RequestResultLogRow } from './useRequestResultLog'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
}

export interface DetailKpi {
  id: string
  label: string
  value: string
}

/** 상세 필드 1칸 — 라벨(번역) + 값(데이터) + 값 옆 작은 배지/강조색(선택) */
export interface DetailField {
  label: string
  value: string
  /** 값 옆에 붙는 작은 알약 배지 라벨 (예: 초기화/변경) */
  badge?: string
  /** true면 값을 청록 강조색으로 표시(Figma 신청일/승인일) */
  highlight?: boolean
}

/** 가맹점별 정보 행 원본 데이터 형태 */
export interface DetailMerchantRow {
  no: string
  partnerCode: string
  merchantCode: string
  city: string
  merchantName: string
  category: string
  monthSales: string
  monthTxCount: string
  fee: string
  lastPaidAt: string
  usage: string
}

/*
 * useRequestDetail — "요청 결과 로그" 상세정보 오버레이(파트너 정보) 데이터 훅
 * ------------------------------------------------------------------
 * 정적 샘플 상세를 노출하지 않는다. 목록에서 선택한 이력 행의 값만 표시한다.
 */
export function useRequestDetail(row: RequestResultLogRow | null) {
  const { t } = useTranslation()
  const source = {
    leaderCode: row?.parentCode || '-',
    countryName: row?.country || '-',
    partnerCode: row?.applicantCode || '-',
    kpiTop: [] as KpiRaw[],
    kpiBottom: [] as KpiRaw[],
    account: {
      userId: row?.applicantCode || '-',
      password: '******',
      email: '-',
      telegram: '-',
      phone: '-',
      twitter: '-',
      appliedAt: row?.appliedAt || '-',
      approvedAt: row?.paidAt || '-',
    },
    basic: {
      partnerName: row?.partnerName || '-',
      country: row?.country || '-',
      region: '-',
      languages: '-',
      directReason: row?.requestType || '-',
      wallet: '-',
    },
    periodChip: '1D',
    merchants: [] as DetailMerchantRow[],
  }

  const mapKpi = (raw: KpiRaw[]): DetailKpi[] => raw.map((k) => ({ id: k.id, label: t(k.labelKey), value: k.value }))

  /** A. 계정 정보 — 4열 × 2행 순서(Figma 배치 그대로) */
  const accountFields: DetailField[] = [
    { label: t('hqRequestResultLog.detail.field.userId'), value: source.account.userId },
    { label: t('hqRequestResultLog.detail.field.password'), value: source.account.password, badge: t('hqRequestResultLog.detail.badge.reset') },
    { label: t('hqRequestResultLog.detail.field.email'), value: source.account.email, badge: t('hqRequestResultLog.detail.badge.change') },
    { label: t('hqRequestResultLog.detail.field.telegram'), value: source.account.telegram },
    { label: t('hqRequestResultLog.detail.field.phone'), value: source.account.phone },
    { label: t('hqRequestResultLog.detail.field.twitter'), value: source.account.twitter },
    { label: t('hqRequestResultLog.detail.field.appliedAt'), value: source.account.appliedAt, highlight: true },
    { label: t('hqRequestResultLog.detail.field.approvedAt'), value: source.account.approvedAt, highlight: true },
  ]

  /** B. 기본 / 소속 정보 — 1행 4칸 + 2행(사유·지갑 주소) */
  const basicFields: DetailField[] = [
    { label: t('hqRequestResultLog.detail.field.partnerName'), value: source.basic.partnerName },
    { label: t('hqRequestResultLog.detail.field.country'), value: source.basic.country },
    { label: t('hqRequestResultLog.detail.field.region'), value: source.basic.region },
    { label: t('hqRequestResultLog.detail.field.languages'), value: source.basic.languages },
  ]
  const basicWideFields: DetailField[] = [
    { label: t('hqRequestResultLog.detail.field.directReason'), value: source.basic.directReason },
    { label: t('hqRequestResultLog.detail.field.wallet'), value: source.basic.wallet },
  ]

  /** 탭 — Figma상 '가맹점별'만 활성. 내용이 있는 탭이 하나뿐이라 표시 전용 */
  const tabs: string[] = [
    t('hqRequestResultLog.detail.tab.byMerchant'),
    t('hqRequestResultLog.detail.tab.transactions'),
    t('hqRequestResultLog.detail.tab.settlements'),
    t('hqRequestResultLog.detail.tab.adminMemo'),
  ]

  const merchantColumns: Column[] = [
    { key: 'no', label: t('hqRequestResultLog.detail.col.no'), width: '0.5fr' },
    { key: 'partnerCode', label: t('hqRequestResultLog.detail.col.partnerCode'), width: '1fr' },
    { key: 'merchantCode', label: t('hqRequestResultLog.detail.col.merchantCode'), width: '1fr' },
    { key: 'city', label: t('hqRequestResultLog.detail.col.city'), width: '0.7fr' },
    { key: 'merchantName', label: t('hqRequestResultLog.detail.col.merchantName'), width: '0.9fr' },
    { key: 'category', label: t('hqRequestResultLog.detail.col.category'), width: '0.9fr' },
    { key: 'monthSales', label: t('hqRequestResultLog.detail.col.monthSales'), width: '0.9fr' },
    { key: 'monthTxCount', label: t('hqRequestResultLog.detail.col.monthTxCount'), width: '0.9fr' },
    { key: 'fee', label: t('hqRequestResultLog.detail.col.fee'), width: '0.9fr' },
    { key: 'lastPaidAt', label: t('hqRequestResultLog.detail.col.lastPaidAt'), width: '0.9fr' },
    { key: 'usage', label: t('hqRequestResultLog.detail.col.usage'), width: '1.2fr' },
    { key: 'action', label: t('hqRequestResultLog.detail.col.action'), width: '0.7fr' },
  ]

  return {
    leaderCode: source.leaderCode,
    countryName: source.countryName,
    partnerCode: source.partnerCode,
    kpiTop: mapKpi(source.kpiTop),
    kpiBottom: mapKpi(source.kpiBottom),
    accountFields,
    basicFields,
    basicWideFields,
    tabs,
    periodChip: source.periodChip,
    merchantColumns,
    merchantRows: source.merchants,
  }
}
