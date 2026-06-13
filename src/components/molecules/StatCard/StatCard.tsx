import type { AccentKey } from '../../../types'
import Badge from '../../atoms/Badge'
import styles from './StatCard.module.css'

/** StatCard 한 장의 데이터 모델 */
export interface StatCardData {
  /** React 리스트 key */
  id: string
  /** 지표 이름 (예: "활성화 된 파트너") */
  label: string
  /** 표시 값 (예: "136") — Figma 표기 그대로 */
  value: string
  /** 값 옆 태그 (예: "본사"). 없으면 미표시 */
  tag?: string
  /** 태그 강조색 */
  tagAccent?: AccentKey
  /** 라벨 아래 작은 부가설명 (예: 집계 기간). 없으면 미표시 */
  note?: string
}

/*
 * StatCard (molecule)
 * ------------------------------------------------------------------
 * 목록 화면 상단의 요약 지표 카드. 라벨 + 값 + (선택) 태그로 구성.
 * 데이터는 props로만 주입받는다(로직 없음).
 */
export default function StatCard({ label, value, tag, tagAccent, note }: StatCardData) {
  return (
    <article className={styles.card}>
      {/* 라벨 + (부가설명)을 한 줄에 인라인으로 표시 (Figma에선 한 텍스트 한 줄) */}
      <span className={styles.label}>
        {label}
        {note && <span className={styles.note}>{note}</span>}
      </span>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {tag && <Badge accent={tagAccent}>{tag}</Badge>}
      </div>
    </article>
  )
}
