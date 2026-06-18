import { useTranslation } from '../../i18n'
import type { StatCardData } from '../../components/molecules/StatCard'
import type { Column } from '../../components/organisms/DataTable'
import { useLeaderPageData } from '../../hooks/useLeaderPageData'
import data from './transactionsData.json'

/** 거래 로그 변형: 전체 / 오프라인 / 실패·취소·환불 */
export type TxVariant = 'all' | 'offline' | 'failed'

interface StatRaw {
  id: string
  labelKey: string
  value: string
}

/** 행마다 공통 액션 (변형별로 다름). enum/데이터라 번역 대상 아님. */
const ACTIONS: Record<TxVariant, string[]> = {
  all: ['상세', '환불요청', '리스크요청'],
  offline: ['상세', '환불요청', '취소요청'],
  failed: ['상세'],
}

/*
 * useTransactions — 거래 로그 데이터 훅 (변형 1개를 받아 해당 화면 데이터 반환)
 * ------------------------------------------------------------------
 * 지표 8개는 3변형 공통. 컬럼은 변형마다 다르며 UI 라벨은 번역한다.
 * 행 데이터의 필드명은 컬럼 key와 동일하게 맞춰져 있어 일반 매핑이 가능하다.
 * 추후 API 연동 시 이 훅 내부만 교체.
 */
export function useTransactions(variant: TxVariant) {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useLeaderPageData('/api/leader/transactions', data, {
    variant,
  })

  const stats: StatCardData[] = (pageData.stats as StatRaw[]).map((s) => ({
    id: s.id,
    label: t(s.labelKey),
    value: s.value,
  }))

  // 변형별 컬럼 정의 (라벨은 번역)
  const columnsByVariant: Record<TxVariant, Column[]> = {
    all: [
      { key: 'txNo', label: t('tx.all.col.txNo'), width: '0.7fr', align: 'center' },
      { key: 'partner', label: t('tx.all.col.partner'), width: '1fr' },
      { key: 'datetime', label: t('tx.all.col.datetime'), width: '1.2fr' },
      { key: 'merchantCode', label: t('tx.all.col.merchantCode'), width: '1.1fr' },
      { key: 'merchantName', label: t('tx.all.col.merchantName'), width: '1fr' },
      { key: 'amount', label: t('tx.all.col.amount'), width: '1fr' },
      { key: 'method', label: t('tx.all.col.method'), width: '0.8fr' },
      { key: 'fee', label: t('tx.all.col.fee'), width: '0.9fr' },
      { key: 'netAmount', label: t('tx.all.col.netAmount'), width: '1fr' },
      { key: 'txStatus', label: t('tx.all.col.txStatus'), width: '0.9fr' },
      { key: 'syncStatus', label: t('tx.all.col.syncStatus'), width: '0.9fr' },
      // 배지 3개(상세/환불요청/리스크요청)가 한 줄에 들어가도록 최소폭 보장
      { key: 'action', label: t('tx.all.col.action'), width: 'minmax(150px, 1.6fr)' },
    ],
    offline: [
      { key: 'txNo', label: t('tx.offline.col.txNo'), width: '0.7fr', align: 'center' },
      { key: 'datetime', label: t('tx.offline.col.datetime'), width: '1.2fr' },
      { key: 'merchantName', label: t('tx.offline.col.merchantName'), width: '1fr' },
      { key: 'method', label: t('tx.offline.col.method'), width: '0.8fr' },
      { key: 'offlineProof', label: t('tx.offline.col.offlineProof'), width: '1fr' },
      { key: 'syncStatus', label: t('tx.offline.col.syncStatus'), width: '0.9fr' },
      { key: 'retry', label: t('tx.offline.col.retry'), width: '0.7fr' },
      { key: 'errorCode', label: t('tx.offline.col.errorCode'), width: '1fr' },
      { key: 'amount', label: t('tx.offline.col.amount'), width: '1fr' },
      { key: 'manualReview', label: t('tx.offline.col.manualReview'), width: '0.9fr' },
      // 배지 3개(상세/환불요청/취소요청)가 한 줄에 들어가도록 최소폭 보장
      { key: 'action', label: t('tx.offline.col.action'), width: 'minmax(150px, 1.6fr)' },
    ],
    failed: [
      { key: 'txNo', label: t('tx.failed.col.txNo'), width: '0.7fr', align: 'center' },
      { key: 'datetime', label: t('tx.failed.col.datetime'), width: '1.2fr' },
      { key: 'partner', label: t('tx.failed.col.partner'), width: '1fr' },
      { key: 'merchantCode', label: t('tx.failed.col.merchantCode'), width: '1.1fr' },
      { key: 'merchantName', label: t('tx.failed.col.merchantName'), width: '1fr' },
      { key: 'amount', label: t('tx.failed.col.amount'), width: '1fr' },
      { key: 'failType', label: t('tx.failed.col.failType'), width: '1fr' },
      { key: 'errorCode', label: t('tx.failed.col.errorCode'), width: '1fr' },
      { key: 'reason', label: t('tx.failed.col.reason'), width: '1.2fr' },
      { key: 'status', label: t('tx.failed.col.status'), width: '1fr' },
      { key: 'action', label: t('tx.failed.col.action'), width: '0.8fr' },
    ],
  }

  return {
    title: t(`tx.title.${variant}`),
    tableTitle: t(`tx.tableTitle.${variant}`),
    stats,
    columns: columnsByVariant[variant],
    rows: pageData[variant].rows as Array<Record<string, string>>,
    actions: ACTIONS[variant],
    isLoading,
    error,
  }
}
