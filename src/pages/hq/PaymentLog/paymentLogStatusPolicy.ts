import type { AccentKey } from '../../../types'

export type PaymentLocalStatus = 'LOCAL_PENDING' | 'LOCAL_COMPLETED' | 'LOCAL_FAILED'
export type PaymentSyncStatus = 'SYNC_WAITING' | 'SYNC_SUCCESS' | 'SYNC_FAILED' | 'LONG_WAITING'
export type PaymentVerifyStatus = 'VERIFY_WAITING' | 'VERIFIED' | 'VERIFY_FAILED'
export type PaymentSettlementStatus = 'NOT_SETTLED' | 'SETTLED' | 'HOLD'
export type PaymentRiskStatus = 'NORMAL' | 'RISK' | 'WARNING'

export interface PaymentStatusExample {
  no: string
  title: string
  accent: AccentKey
  statuses: [PaymentLocalStatus, PaymentSyncStatus, PaymentVerifyStatus, PaymentSettlementStatus, PaymentRiskStatus]
}

export interface PaymentStatusActionPolicy {
  status: PaymentSettlementStatus | 'PENDING' | 'FAILED'
  accent: AccentKey
  actions: string[]
}

export const PAYMENT_STATUS_EXAMPLES: PaymentStatusExample[] = [
  {
    no: '예시 1',
    title: '정상 오프라인 대기',
    accent: 'blue',
    statuses: ['LOCAL_PENDING', 'SYNC_WAITING', 'VERIFY_WAITING', 'NOT_SETTLED', 'NORMAL'],
  },
  {
    no: '예시 2',
    title: '정상 온라인 정산 완료',
    accent: 'green',
    statuses: ['LOCAL_COMPLETED', 'SYNC_SUCCESS', 'VERIFIED', 'SETTLED', 'NORMAL'],
  },
  {
    no: '예시 3',
    title: '서명 불일치 리스크',
    accent: 'red',
    statuses: ['LOCAL_FAILED', 'SYNC_FAILED', 'VERIFY_FAILED', 'HOLD', 'RISK'],
  },
  {
    no: '예시 4',
    title: 'APPROVE 누락 장기 대기',
    accent: 'amber',
    statuses: ['LOCAL_PENDING', 'LONG_WAITING', 'VERIFY_WAITING', 'HOLD', 'WARNING'],
  },
]

export const PAYMENT_STATUS_ACTION_POLICIES: PaymentStatusActionPolicy[] = [
  {
    status: 'PENDING',
    accent: 'blue',
    actions: ['Sync 재시도', '강제 보류', '서버 검증 요청'],
  },
  {
    status: 'FAILED',
    accent: 'red',
    actions: ['실패 사유 보기', '리스크 등록', '개발팀 전달'],
  },
  {
    status: 'SETTLED',
    accent: 'green',
    actions: ['정산 영수증', '트랜잭션 해시', '내역 다운로드'],
  },
  {
    status: 'HOLD',
    accent: 'amber',
    actions: ['보류 사유 보기', '보류 해제 요청', '관리자 승인 필요'],
  },
]
