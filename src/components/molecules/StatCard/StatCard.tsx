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
  /** 값 아래 증감 표시줄 (예: "전일 대비 +5", "전일 대비 +5%"). 없으면 미표시 */
  delta?: string
  /** 라벨을 11px/regular로(증감줄 없는 작은 KPI 카드 전용 — 본사어드민 상세화면). delta 유무와 무관하게 줄 수 있음 */
  dense?: boolean
  /** 라벨 색조. 'amber'면 "오늘" 계열 카드처럼 라벨을 호박색으로, 'green'이면 담보금 계열 카드처럼 초록색으로(본사어드민 대시보드류). 기본은 흐린 보조색 */
  labelTone?: 'default' | 'amber' | 'green'
  /** 증감줄 색조. 'red'면 리스크 계열 카드처럼 경고색으로. 기본은 cyan */
  deltaTone?: 'cyan' | 'red'
  /** true면 내용을 세로 중앙이 아니라 위쪽에 붙인다 — 같은 줄(row) 옆 카드보다 줄 수가 적어서(예: 증감줄 없음) 본문이 세로 중앙에 떠 보이는 카드용 */
  alignTop?: boolean
}

/*
 * StatCard (molecule)
 * ------------------------------------------------------------------
 * 목록 화면 상단의 요약 지표 카드. 라벨 + 값 + (선택) 태그 + (선택) 증감줄로 구성.
 * 데이터는 props로만 주입받는다(로직 없음).
 */
export default function StatCard({
  label,
  value,
  tag,
  tagAccent,
  note,
  delta,
  dense,
  labelTone,
  deltaTone,
  alignTop,
}: StatCardData) {
  // delta가 있는 화면(본사어드민 등)만 Figma 정확 비율(238:118)로 고정 — 기존 2줄 카드엔 영향 없음
  const className = [styles.card, delta && styles.cardRatio, dense && styles.cardDense, alignTop && styles.alignTop]
    .filter(Boolean)
    .join(' ')
  const labelToneClass = labelTone === 'amber' ? styles.labelAmber : labelTone === 'green' ? styles.labelGreen : ''
  const labelClassName = labelToneClass ? `${styles.label} ${labelToneClass}` : styles.label
  const deltaClassName = deltaTone === 'red' ? `${styles.delta} ${styles.deltaRed}` : styles.delta
  return (
    <article className={className}>
      {/* 라벨 + (부가설명)을 한 줄에 인라인으로 표시 (Figma에선 한 텍스트 한 줄) */}
      <span className={labelClassName}>
        {label}
        {note && <span className={styles.note}>{note}</span>}
      </span>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value}</span>
        {tag && <Badge accent={tagAccent}>{tag}</Badge>}
      </div>
      {delta && <span className={deltaClassName}>{delta}</span>}
    </article>
  )
}
