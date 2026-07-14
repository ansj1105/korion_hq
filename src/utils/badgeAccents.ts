import type { AccentKey } from '../types'
import { ACCENT_VAR } from './accent'

export function statusBadgeAccent(status: string): AccentKey {
  const normalized = status.trim().toLowerCase()
  if (!normalized || normalized === '-') return 'cyan'
  if (status.includes('승인요청') || normalized.includes('approval requested') || normalized.includes('request approval')) return 'purple'
  if (
    status.includes('대기')
    || status.includes('검토')
    || status.includes('자료')
    || status.includes('요청')
    || normalized.includes('pending')
    || normalized.includes('review')
    || normalized.includes('request')
    || normalized.includes('info')
    || normalized.includes('need_more_info')
  ) return 'orange'
  if (status.includes('보류') || status.includes('재확인') || normalized.includes('hold') || normalized.includes('recheck')) return 'blue'
  if (
    status.includes('거절')
    || status.includes('정지')
    || status.includes('블랙')
    || normalized.includes('rejected')
    || normalized.includes('suspended')
    || normalized.includes('black')
  ) return 'red'
  if (status.includes('승인') || status.includes('활성') || status.includes('완료') || normalized.includes('approved') || normalized.includes('active') || normalized.includes('done') || normalized.includes('settled')) return 'green'
  return 'cyan'
}

export function actionBadgeAccent(label: string): AccentKey {
  if (label.includes('환불') || label.includes('Refund')) return 'orange'
  if (label.includes('리스크') || label.includes('위험') || label.includes('Risk')) return 'red'
  if (label.includes('취소') || label.includes('Cancel')) return 'blue'
  if (label.includes('승인요청') || label.includes('Request Approval')) return 'purple'
  if (label.includes('승인') || label.includes('확인') || label.includes('Approve') || label.includes('Confirm')) return 'green'
  if (label.includes('거절') || label.includes('삭제') || label.includes('해지') || label.includes('Reject') || label.includes('Delete')) return 'red'
  if (label.includes('보류') || label.includes('정지') || label.includes('Hold') || label.includes('Suspend')) return 'blue'
  if (label.includes('자료') || label.includes('검토') || label.includes('재검토') || label.includes('Request Info') || label.includes('Review')) return 'orange'
  return 'cyan'
}

export function statusChipColor(status: string) {
  return ACCENT_VAR[statusBadgeAccent(status)]
}
