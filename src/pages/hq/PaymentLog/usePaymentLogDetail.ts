import { useTranslation } from '../../../i18n'
import type { AccentKey } from '../../../types'
import type { DetailRow } from '../../../components/molecules/DetailSection'
import type { PaymentLogRow } from './usePaymentLog'

/** 헤더 상태 배지 1개 */
export interface DetailStatus {
  label: string
  accent?: AccentKey
}

/** Sync 스텝퍼 1단계 */
export interface SyncStep {
  label: string
  state: 'done' | 'active' | 'pending'
}

/** 하단 푸터 액션 버튼 1개 */
export interface FooterAction {
  label: string
  variant: 'primary' | 'secondary' | 'danger'
}

/*
 * usePaymentLogDetail — 전체 결제 로그 "상세" 드로어 데이터 훅
 * ------------------------------------------------------------------
 * 선택된 결제 로그 행의 실제 목록 데이터를 상세 드로어로 확장한다.
 * 행과 무관한 정적 샘플 JSON을 보여주지 않는다.
 */
export function usePaymentLogDetail(row: PaymentLogRow | null) {
  const { t } = useTranslation()

  const value = (input?: string | number | null) => (input === undefined || input === null || input === '' ? '-' : String(input))
  const makeRows = (rows: Array<[string, string | number | undefined | null]>): DetailRow[] =>
    rows.map(([labelKey, rowValue]) => ({ label: t(labelKey), value: value(rowValue) }))

  const statuses: DetailStatus[] = row
    ? [{ label: row.statusLabel ?? row.status ?? '-', accent: row.statusAccent }]
    : []

  const syncSteps: SyncStep[] = [
    { label: 'LOCAL', state: row ? 'done' : 'pending' },
    { label: 'SYNC', state: row?.syncStatus === '완료' ? 'done' : row ? 'active' : 'pending' },
    { label: 'VERIFY', state: row?.statusLabel === '정산완료' || row?.status === '완료' ? 'done' : 'pending' },
  ]

  const footerActions: FooterAction[] = [
    { label: t('common.confirm'), variant: 'primary' },
  ]

  return {
    title: t('hqPaymentLog.detail.title'),
    // 헤더 식별자 + 메타줄(라벨은 번역, 값은 데이터)
    header: {
      id: value(row?.txId ?? row?.id),
      statuses,
      meta: [
        `${t('hqPaymentLog.detail.meta.method')}: ${value(row?.method)}`,
        `${t('hqPaymentLog.detail.meta.connection')}: ${value(row?.connection)}`,
        `${t('hqPaymentLog.detail.meta.country')}: ${value(row?.country)}`,
        `${t('hqPaymentLog.detail.meta.createdAt')}: ${value(row?.datetime)}`,
      ].join(' · '),
    },
    sections: {
      basic: {
        title: t('hqPaymentLog.detail.section.a'),
        rows: makeRows([
          ['hqPaymentLog.col.txId', row?.txId],
          ['hqPaymentLog.col.sessionId', row?.sessionId],
          ['hqPaymentLog.col.datetime', row?.datetime],
          ['hqPaymentLog.col.method', row?.method],
          ['hqPaymentLog.col.connection', row?.connection],
          ['hqPaymentLog.col.status', row?.statusLabel ?? row?.status],
        ]),
      },
      parties: {
        title: t('hqPaymentLog.detail.section.b'),
        rows: makeRows([
          ['hqPaymentLog.col.leaderCode', row?.leaderCode],
          ['hqPaymentLog.col.partnerCode', row?.partnerCode],
          ['hqPaymentLog.col.country', row?.country],
          ['hqPaymentLog.col.merchantName', row?.merchantName],
          ['hqPaymentLog.col.payer', row?.payer],
        ]),
      },
      localBlock: {
        title: t('hqPaymentLog.detail.section.c'),
        rows: makeRows([
          ['hqPaymentLog.col.no', row?.no],
          ['hqPaymentLog.col.sessionId', row?.sessionId],
          ['hqPaymentLog.col.connection', row?.connection],
        ]),
      },
      proof: {
        title: t('hqPaymentLog.detail.section.d'),
        rows: makeRows([
          ['hqPaymentLog.col.txId', row?.txId],
          ['hqPaymentLog.col.syncStatus', row?.syncStatus],
        ]),
      },
      sync: {
        title: t('hqPaymentLog.detail.section.e'),
        steps: syncSteps,
        statusLine: `${value(row?.syncStatus)} / ${value(row?.statusLabel ?? row?.status)}`,
      },
      fee: {
        title: t('hqPaymentLog.detail.section.f'),
        rows: makeRows([
          ['hqPaymentLog.col.amount', row?.amount],
          ['hqPaymentLog.col.fee', row?.fee],
          ['hqPaymentLog.col.netAmount', row?.netAmount],
        ]),
      },
      risk: {
        title: t('hqPaymentLog.detail.section.g'),
        rows: makeRows([
          ['hqPaymentLog.col.status', row?.statusLabel ?? row?.status],
          ['hqPaymentLog.col.action', row?.actions?.join(', ')],
        ]),
      },
      memo: {
        title: t('hqPaymentLog.detail.section.h'),
        placeholder: t('hqPaymentLog.detail.memo.placeholder'),
        logs: [],
      },
    },
    footerActions,
  }
}
