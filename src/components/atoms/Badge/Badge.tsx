import type { CSSProperties, ReactNode } from 'react'
import type { AccentKey } from '../../../types'
import { ACCENT_VAR } from '../../../utils/accent'
import styles from './Badge.module.css'

interface BadgeProps {
  children: ReactNode
  /** 강조색. 지정하지 않으면 중립(흐린) 색으로 표시된다. */
  accent?: AccentKey
  /** 'sm'이면 초소형(테이블 액션 배지 등 7px, 65% 진한 틴트). 'xs'는 같은 7px이지만 17% 옅은 틴트(거래 로그 액션 배지). 'cell'은 본사어드민 대시보드 표의 상태/처리 칸 알약(12px·높이24·폭~84·라운드12·17%/72% 틴트) */
  size?: 'sm' | 'xs' | 'cell'
  /** true면 배경/테두리를 틴트(color-mix) 없이 accent 색 100%로 채운다 (신청서 관리의 상태 배지처럼 활성/비활성을 진하게 구분하는 화면용) */
  solid?: boolean
}

/*
 * Badge (atom)
 * ------------------------------------------------------------------
 * 증감 수치(+10), 구분 태그(관리/본사/정산가능/주의) 등에 쓰이는 최소 단위 알약.
 * 색은 accent prop으로만 결정되며, 실제 색 값은 토큰을 거친다(하드코딩 금지 규칙).
 */
export default function Badge({ children, accent, size, solid }: BadgeProps) {
  // accent가 있으면 CSS 변수 --accent로 주입 → 모듈 CSS가 글자색/배경에 사용
  const style = accent ? ({ '--accent': ACCENT_VAR[accent] } as CSSProperties) : undefined
  const sizeClass = size === 'sm' ? styles.small : size === 'xs' ? styles.xs : size === 'cell' ? styles.cell : ''
  const className = [styles.badge, sizeClass, solid && styles.solid].filter(Boolean).join(' ')

  return (
    <span className={className} style={style}>
      {children}
    </span>
  )
}
