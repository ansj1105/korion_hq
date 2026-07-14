import type { CSSProperties, ReactNode } from 'react'
import type { AccentKey } from '../../../types'
import { ACCENT_VAR } from '../../../utils/accent'
import styles from './Badge.module.css'

interface BadgeProps {
  children: ReactNode
  /** 강조색. 지정하지 않으면 중립(흐린) 색으로 표시된다. */
  accent?: AccentKey
  /** 'md'는 partners 공통 배지 크기, 'sm'/'xs'는 기존 초소형 테이블 배지, 'cell'은 고정폭 상태 칸 배지 */
  size?: 'sm' | 'xs' | 'cell' | 'md'
  /** partners 공통 상태 배지는 낮은 radius의 rect 형태를 쓴다. */
  shape?: 'pill' | 'rect'
  /** true면 배경/테두리를 틴트(color-mix) 없이 accent 색 100%로 채운다 (신청서 관리의 상태 배지처럼 활성/비활성을 진하게 구분하는 화면용) */
  solid?: boolean
  /** 클릭 핸들러 — 지정하면 커서만 pointer로 바뀐다(요청 결과 로그의 '상세정보'처럼 배지가 버튼 역할을 하는 화면용). 미지정 시 기존처럼 표시 전용 */
  onClick?: () => void
  className?: string
}

/*
 * Badge (atom)
 * ------------------------------------------------------------------
 * 증감 수치(+10), 구분 태그(관리/본사/정산가능/주의) 등에 쓰이는 최소 단위 알약.
 * 색은 accent prop으로만 결정되며, 실제 색 값은 토큰을 거친다(하드코딩 금지 규칙).
 */
export default function Badge({ children, accent, size, shape = 'pill', solid, onClick, className }: BadgeProps) {
  // accent가 있으면 CSS 변수 --accent로 주입 → 모듈 CSS가 글자색/배경에 사용
  const style = accent ? ({ '--accent': ACCENT_VAR[accent] } as CSSProperties) : undefined
  const sizeClass =
    size === 'md' ? styles.medium : size === 'sm' ? styles.small : size === 'xs' ? styles.xs : size === 'cell' ? styles.cell : ''
  const badgeClassName = [
    styles.badge,
    sizeClass,
    shape === 'rect' && styles.rect,
    solid && styles.solid,
    onClick && styles.clickable,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (onClick) {
    return (
      <button type="button" className={badgeClassName} style={style} onClick={onClick}>
        {children}
      </button>
    )
  }

  return (
    <span className={badgeClassName} style={style}>
      {children}
    </span>
  )
}
