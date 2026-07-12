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
  /**
   * 라벨별 solid 지정. 주면 solid prop 대신 라벨마다 개별로 채움/틴트를 정한다.
   * (신청서 관리 액션처럼 활성 "위험"은 solid, 활성 "확인/검토"는 틴트, 나머지는 solid 회색으로
   *  한 셀 안에서 배지마다 채움 방식이 달라야 하는 화면용.)
   */
  solidByLabel?: Record<string, boolean>
  /** true면 배지들을 같은 폭(37px)·가운데 정렬로 통일한다(Figma 상태 토글 배지 기준) */
  equalWidth?: boolean
  /**
   * 라벨별 추가 클래스. 정산 신청 목록처럼 특정 행 상태에서만 배지 하나의 색을
   * 페이지 쪽 스타일로 덮어써야 하는 화면용. 미지정 라벨은 기존 외형 그대로.
   */
  classNameByLabel?: Record<string, string>
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
 * 테이블 액션 컬럼에 들어가는 작은 배지 묶음. 동작 없는 UI(표시 전용).
 */
export default function ActionBadges({ labels, accentByLabel, size = 'sm', solid, solidByLabel, equalWidth, classNameByLabel, onLabelClick }: ActionBadgesProps) {
  const className = equalWidth ? `${styles.actions} ${styles.equalWidth}` : styles.actions
  return (
    <div className={className}>
      {labels.map((label) => (
        <Badge
          key={label}
          accent={accentByLabel ? accentByLabel[label] : 'cyan'}
          size={size}
          solid={solidByLabel ? solidByLabel[label] : solid}
          className={classNameByLabel?.[label]}
          onClick={onLabelClick ? () => onLabelClick(label) : undefined}
        >
          {label}
        </Badge>
      ))}
    </div>
  )
}
