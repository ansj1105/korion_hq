import type { ReactNode } from 'react'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  /** 페이지 제목 (예: "요청 관리") */
  title: string
  /** 제목 줄 아래에 들어갈 추가 영역 (예: 대시보드의 기간 탭). 없으면 제목 줄만 표시. */
  children?: ReactNode
}

/*
 * PageHeader (organism)
 * ------------------------------------------------------------------
 * 모든 화면이 공유하는 페이지 헤더: [제목] + (옵션) 아래 영역.
 * children 슬롯으로 화면별 추가 컨트롤(기간 탭 등)을 끼워 넣는다.
 */
export default function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <h1 className={styles.title}>{title}</h1>
      </div>
      {children}
    </header>
  )
}
