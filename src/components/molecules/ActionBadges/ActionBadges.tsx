import Badge from '../../atoms/Badge'
import type { AccentKey } from '../../../types'
import styles from './ActionBadges.module.css'

interface ActionBadgesProps {
  /** 표시할 액션 라벨들 (예: ['승인', '거절', '보류', '자료요청', '상세']) */
  labels: readonly string[]
  /**
   * 라벨별 강조색 지정. 안 주면 기존처럼 전부 cyan(기존 호출부 그대로 동작).
   * 주면 매핑에 없는 라벨은 Badge 기본값(중립 회색)으로 빠진다 — 본사어드민처럼
   * "승인=초록/정지·거절=빨강/나머지=중립" 식으로 색이 라벨마다 다른 화면에서 사용.
   */
  accentByLabel?: Record<string, AccentKey>
  /** 배지 크기. 안 주면 기존처럼 'sm'(65% 진한 틴트). 거래 로그 표는 'xs'(17% 옅은 틴트) */
  size?: 'sm' | 'xs'
  /**
   * true면 틴트 없이 색을 100% 채운다(신청서 관리처럼 활성 상태 하나만 색이 있고
   * 나머지는 중립으로 진하게 깔리는 화면용). 안 주면 기존처럼 옅은 틴트.
   */
  solid?: boolean
}

/*
 * ActionBadges (molecule)
 * ------------------------------------------------------------------
 * 테이블 액션 컬럼에 들어가는 작은 배지 묶음. 동작 없는 UI(표시 전용).
 */
export default function ActionBadges({ labels, accentByLabel, size = 'sm', solid }: ActionBadgesProps) {
  return (
    <div className={styles.actions}>
      {labels.map((label) => (
        <Badge key={label} accent={accentByLabel ? accentByLabel[label] : 'cyan'} size={size} solid={solid}>
          {label}
        </Badge>
      ))}
    </div>
  )
}
