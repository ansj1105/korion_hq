import type { CSSProperties } from 'react'
import styles from './MetricCard.module.css'

/** MetricCard 한 장의 데이터 모델 */
export interface MetricCardData {
  /** React 리스트 key */
  id: string
  /** 상단 색칩(알약)에 들어가는 지표 이름 (예: "전체 발송 건수") */
  label: string
  /** 큰 값 (예: "128건") — Figma 표기 그대로 */
  value: string
  /** 값 아래 작은 보조 라벨 (예: "누적"). 없으면 미표시 */
  note?: string
  /** 색칩 색상 (Figma 지정 hex). 카드마다 다르므로 데이터로 주입 */
  chip: string
}

/*
 * MetricCard (molecule)
 * ------------------------------------------------------------------
 * "색칩 + 큰 값 + 보조라벨"로 구성된 요약 지표 카드.
 * 발송 내역·활동 로그 등 여러 화면의 상단 KPI에서 공통으로 쓰인다.
 * 색은 디자인 토큰이 아닌 Figma 카드별 고유색이라 chip prop으로 주입한다
 * (컴포넌트 CSS에 색을 박지 않기 위함 — 색 결정은 데이터 훅에 둔다).
 */
export default function MetricCard({ label, value, note, chip }: MetricCardData) {
  const style = { '--chip': chip } as CSSProperties

  return (
    <article className={styles.card}>
      <span
        className={`${styles.label} ${styles.labelTranslucent}`}
        style={style}
      >
        {label}
      </span>
      <span className={styles.value}>{value}</span>
      {note && <span className={styles.note}>{note}</span>}
    </article>
  )
}
