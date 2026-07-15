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
  const normalized = label.trim().toLowerCase()
  if (!normalized || normalized === '-') return 'cyan'
  if (label.includes('환불') || normalized.includes('refund')) return 'orange'
  if (label.includes('리스크') || label.includes('위험') || normalized.includes('risk')) return 'red'
  if (label.includes('발송취소') || normalized.includes('cancel send') || normalized.includes('cancel delivery')) return 'red'
  if (label.includes('취소') || normalized.includes('cancel')) return 'blue'
  if (label.includes('승인요청') || normalized.includes('request approval') || normalized.includes('approval requested')) return 'purple'
  if (
    label.includes('승인')
    || label.includes('확인')
    || label.includes('해제')
    || label.includes('활성')
    || normalized.includes('approve')
    || normalized.includes('confirm')
    || normalized.includes('release')
    || normalized.includes('activate')
    || normalized.includes('unblock')
  ) return 'green'
  if (
    label.includes('거절')
    || label.includes('삭제')
    || label.includes('해지')
    || label.includes('정지')
    || label.includes('차단')
    || label.includes('제한')
    || label.includes('비활성')
    || normalized.includes('reject')
    || normalized.includes('delete')
    || normalized.includes('terminate')
    || normalized.includes('suspend')
    || normalized.includes('block')
    || normalized.includes('restrict')
    || normalized.includes('disable')
    || normalized.includes('deactivate')
  ) return 'red'
  if (label.includes('보류') || normalized.includes('hold')) return 'blue'
  if (
    label.includes('대기')
    || label.includes('자료')
    || label.includes('검토')
    || label.includes('재검토')
    || label.includes('재설정')
    || normalized.includes('reset')
    || normalized.includes('pending')
    || normalized.includes('waiting')
    || normalized.includes('request info')
    || normalized.includes('need more info')
    || normalized.includes('need_more_info')
    || normalized.includes('review')
  ) return 'orange'
  if (label.includes('수정') || normalized.includes('edit')) return 'blue'
  if (label.includes('회원정보') || normalized.includes('member info') || normalized.includes('recipient')) return 'purple'
  if (label.includes('감사') || normalized.includes('audit')) return 'purple'
  return 'cyan'
}

export function actionCodeBadgeAccent(action: string): AccentKey {
  const normalized = action.trim().toUpperCase()
  if (['APPROVE', 'CONFIRM', 'ACTIVATE', 'PAY', 'COMPLETE'].includes(normalized)) return 'green'
  if (['REJECT', 'DELETE', 'BLOCK', 'BLACKLIST'].includes(normalized)) return 'red'
  if (['HOLD', 'SUSPEND', 'CANCEL'].includes(normalized)) return 'blue'
  if (['REQUEST_INFO', 'REQUEST_MATERIAL', 'APPROVAL_REQUEST'].includes(normalized)) return 'purple'
  if (['REVIEW', 'WAITING', 'PENDING', 'INVESTIGATE'].includes(normalized)) return 'orange'
  if (['DETAIL', 'VIEW', 'MEMBER_INFO', 'EDIT'].includes(normalized)) return 'cyan'
  return actionBadgeAccent(action)
}

export function statusChipColor(status: string) {
  return ACCENT_VAR[statusBadgeAccent(status)]
}
