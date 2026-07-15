import type { MouseEvent } from 'react'
import Badge from '../../atoms/Badge'
import type { AccentKey } from '../../../types'
import { actionBadgeAccent } from '../../../utils/badgeAccents'
import styles from './ActionBadges.module.css'

interface ActionBadgesProps {
  /** 표시할 액션 라벨들 (예: ['승인', '거절', '보류', '자료요청', '상세']) */
  labels: readonly string[]
  /**
   * 라벨별 강조색 지정. 지정하지 않거나 매핑에 없는 라벨은 공통 액션 배지 규칙을 따른다.
   * 페이지별 활성 상태와 무관하게 같은 액션 라벨은 모든 화면에서 같은 색을 유지한다.
   */
  accentByLabel?: Record<string, AccentKey>
  /** 배지 크기. 안 주면 기존처럼 'sm'(65% 진한 틴트). 거래 로그 표는 'xs'(17% 옅은 틴트) */
  size?: 'sm' | 'xs' | 'md'
  /** 배지 형태. 기본은 기존 pill, partners 계열 표 액션은 rect를 쓴다. */
  shape?: 'pill' | 'rect'
  /** true면 배지들을 같은 폭(37px)·가운데 정렬로 통일한다(Figma 상태 토글 배지 기준) */
  equalWidth?: boolean
  /**
   * 배지 클릭 핸들러(클릭된 라벨을 넘김). 지정하면 배지가 버튼처럼 동작한다 —
   * 요청 결과 로그의 '상세정보'처럼 특정 배지만 상세 오버레이를 여는 화면용.
   * 미지정 시 기존처럼 표시 전용(기존 호출부 영향 없음).
   */
  onLabelClick?: (label: string) => void
}

/*
 * ActionBadges (molecule)
 * ------------------------------------------------------------------
 * 테이블 액션 컬럼에 들어가는 배지 묶음. onLabelClick이 있으면 버튼, 없으면 표시 전용이다.
 */
export default function ActionBadges({ labels, accentByLabel, size = 'md', shape = 'rect', equalWidth, onLabelClick }: ActionBadgesProps) {
  const className = equalWidth ? `${styles.actions} ${styles.equalWidth}` : styles.actions
  const stopActionPropagation = (event: MouseEvent<HTMLDivElement>) => {
    if (onLabelClick) {
      event.stopPropagation()
    }
  }

  return (
    <div className={className} onClick={stopActionPropagation}>
      {labels.map((label) => (
        <Badge
          key={label}
          accent={accentByLabel?.[label] ?? actionBadgeAccent(label)}
          size={size}
          shape={shape}
          onClick={onLabelClick ? () => onLabelClick(label) : undefined}
        >
          {label}
        </Badge>
      ))}
    </div>
  )
}
