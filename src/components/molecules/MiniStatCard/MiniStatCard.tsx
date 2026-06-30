import type { CSSProperties } from 'react'
import type { AccentKey } from '../../../types'
import { ACCENT_VAR } from '../../../utils/accent'
import styles from './MiniStatCard.module.css'

/** MiniStatCard 한 장의 데이터 모델 */
export interface MiniStatCardData {
  /** React 리스트 key */
  id: string
  /** 작은 라벨 (예: "오프라인 생성 거래") */
  label: string
  /** 큰 값 (예: "328건") — Figma 표기 그대로 */
  value: string
  /** 테두리 강조색. 지정하지 않으면 기본(보라) 테두리 */
  accent?: AccentKey
}

/*
 * MiniStatCard (molecule)
 * ------------------------------------------------------------------
 * 라벨 1줄 + 값 1줄로만 구성된 가장 작은 통계 박스(236x72).
 * 본사어드민 "전체 운영 대시보드"의 실시간 모니터링/정산/리스크 등
 * 여러 섹션에서 4~8장씩 반복되는 미니 KPI에 쓰인다(StatCard보다 더 단순 — 태그/증감줄 없음).
 */
export default function MiniStatCard({ label, value, accent }: MiniStatCardData) {
  const style = accent ? ({ '--accent': ACCENT_VAR[accent] } as CSSProperties) : undefined

  return (
    <article className={styles.card} style={style}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </article>
  )
}
