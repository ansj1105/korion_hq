import { useState } from 'react'
import styles from './FilterTabs.module.css'

interface FilterTabsProps {
  /** 탭 라벨 목록 */
  labels: string[]
  /** 기본 선택 인덱스 (기본 0, uncontrolled 모드에서만 사용) */
  defaultIndex?: number
  /** 지정하면 controlled 모드로 동작 — 선택 인덱스를 호출 측 state로 관리(탭별 내용 전환 등에 사용) */
  activeIndex?: number
  /** controlled 모드에서 탭 클릭 시 호출 */
  onChange?: (index: number) => void
  /** 'outline'이면 선택 탭을 보라 채움 대신 시안 테두리로 표시(본사어드민 거래내역 탭). 없으면 기존 보라 채움 */
  variant?: 'outline'
}

/*
 * FilterTabs (molecule)
 * ------------------------------------------------------------------
 * 상태/구분 필터 탭. activeIndex/onChange를 안 주면 기존처럼 로컬 state로
 * 하이라이트만 토글한다(uncontrolled, 기존 호출부 그대로 동작).
 * 본사어드민의 "거래내역" 화면처럼 탭마다 보여줄 내용이 달라지는 경우엔
 * activeIndex/onChange를 넘겨 controlled로 쓴다.
 */
export default function FilterTabs({ labels, defaultIndex = 0, activeIndex, onChange, variant }: FilterTabsProps) {
  const [internalActive, setInternalActive] = useState(defaultIndex)
  const isControlled = activeIndex !== undefined
  const active = isControlled ? activeIndex : internalActive

  const handleClick = (i: number) => {
    if (isControlled) {
      onChange?.(i)
    } else {
      setInternalActive(i)
    }
  }

  const base = variant === 'outline' ? `${styles.tab} ${styles.tabOutline}` : styles.tab
  const activeClass = variant === 'outline' ? styles.tabActiveOutline : styles.tabActive

  return (
    <div className={styles.tabs} role="tablist">
      {labels.map((label, i) => (
        <button
          key={label}
          type="button"
          role="tab"
          aria-selected={i === active}
          className={i === active ? `${base} ${activeClass}` : base}
          onClick={() => handleClick(i)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
