import type { ReactNode } from 'react'
import styles from './DetailSection.module.css'

/** 라벨/값 한 줄 */
export interface DetailRow {
  label: string
  value: string
  /** 값 강조색(토큰 변수). 없으면 기본 텍스트색 */
  valueColor?: string
}

interface DetailSectionProps {
  /** 섹션 제목 (예: "A. 기본 결제 정보") */
  title: string
  /** 라벨/값 줄 목록. children을 주면 무시된다(특수 섹션은 children으로). */
  rows?: DetailRow[]
  /** 특수 본문(스텝퍼·메모 등 표 형태가 아닌 섹션). rows 대신 사용. */
  children?: ReactNode
}

/*
 * DetailSection (molecule)
 * ------------------------------------------------------------------
 * 상세 드로어의 한 섹션 박스: [제목] + [라벨/값 줄 목록 또는 커스텀 본문].
 * 대부분의 섹션이 "라벨 좌측 · 값 우측" 줄의 반복이라 rows로 처리하고,
 * 스텝퍼·메모처럼 표가 아닌 섹션만 children으로 내용을 직접 넣는다.
 */
export default function DetailSection({ title, rows, children }: DetailSectionProps) {
  return (
    <section className={styles.section}>
      <h3 className={styles.title}>{title}</h3>
      {rows ? (
        <div className={styles.rows}>
          {rows.map((r) => (
            <div key={r.label} className={styles.row}>
              <span className={styles.label}>{r.label}</span>
              <span className={styles.value} style={r.valueColor ? { color: r.valueColor } : undefined}>
                {r.value}
              </span>
            </div>
          ))}
        </div>
      ) : (
        children
      )}
    </section>
  )
}
