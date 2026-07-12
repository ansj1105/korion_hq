import type { CSSProperties, ReactNode } from 'react'
import styles from './DataTable.module.css'

/** 테이블 컬럼 정의 */
export interface Column {
  /** 행 데이터 객체에서 이 컬럼 값을 찾을 키 */
  key: string
  /** 헤더에 표시할 라벨 */
  label: string
  /** CSS grid 트랙 폭 (예: '0.5fr', '120px'). 기본 '1fr' */
  width?: string
  /** 셀 정렬 */
  align?: 'left' | 'right' | 'center'
}

/** 테이블 한 행 — id(리스트 key) + 컬럼별 셀 내용(문자열 또는 React 노드) */
export interface TableRow {
  id: string
  cells: Record<string, ReactNode>
}

interface DataTableProps {
  columns: Column[]
  rows: TableRow[]
  /** 테이블 제목 (예: "파트너별 매출"). 없으면 미표시 */
  title?: string
  /** 제목 우측에 붙는 부가 요소 (예: 선택된 파트너명). 없으면 미표시 */
  titleRight?: ReactNode
  /** 상단 툴바 버튼 라벨들 (예: ['검색','필터','Excel']). 동작 없는 UI. 없으면 툴바 미표시 */
  toolbar?: string[]
  /** 툴바 버튼들 뒤(우측 끝)에 붙는 페이지 전용 요소 — 국가/지역 설정의 "국가 추가" CTA처럼 기본 칩과 다른 버튼을 끼울 때 사용 */
  toolbarExtra?: ReactNode
  /** true면 flex 컬럼 부모 안에서 남은 세로 높이를 채운다 (단일 테이블 목록 화면용) */
  fill?: boolean
  /** true면 카드 외형(배경/테두리/그림자) 없이 표만 렌더 (패널 내부 서브 테이블용) */
  bare?: boolean
  /** 행 클릭 콜백 — 지정하면 행 전체가 클릭 가능(커서/호버) 해지고 클릭 시 row.id를 넘긴다 */
  onRowClick?: (id: string) => void
  /** true면 제목 우측에 툴바가 바로 붙는다(기본은 제목↔툴바 양끝 정렬) */
  inlineToolbar?: boolean
  /** true면 제목/헤더/셀 글자 크기·색을 본사어드민 Figma 정확값(18px 제목, 11px 헤더·셀, 흐린 셀 색)으로 적용 */
  mutedText?: boolean
  /** true면 글자색은 그대로 두고 크기만 키운다(16px 제목, 11px 헤더·셀) — 거래 로그 표처럼 흰 글씨 유지 + 크기만 다른 화면 */
  largeText?: boolean
  /** true면 본사어드민 대시보드 전용 남색 지브라 + 헤더 배경을 적용(mutedText의 보라빛 지브라와 다른 색) */
  navyZebra?: boolean
  /** true면 글자 크기/색은 기본값(흰 글씨) 그대로 두고 행 배경만 한 줄씩 번갈아 표시 — mutedText는 글자색까지 흐려져서 안 맞는 화면(국가별 대시보드 표 등)용 */
  zebra?: boolean
  /** true면 행 최소폭(880px)·가로 스크롤을 없애 부모 폭에 맞춰 fr 비율대로 줄어든다 — 패널 안에서 표+보조박스가 나란히 놓여 좌우 스크롤이 생기면 안 되는 화면용 */
  fluid?: boolean
  /**
   * true면 셀 내용을 말줄임(…) 대신 다음 줄로 줄바꿈한다(행 높이가 늘어남).
   * 컬럼이 많아 가로폭은 컨테이너에 고정하되 긴 값은 잘리지 않고 끝까지 보여야 하는 표(예: 전체 결제 로그)용.
   */
  wrapCells?: boolean
  /** true면 헤더 행에 채워진 둥근 바(배경)를 준다 — 신청서 관리 표처럼 컬럼 헤더가 하나의 바로 보이는 Figma 디자인용 */
  headerBar?: boolean
  /** true면 툴바 버튼 세로 패딩을 9px(높이 34)로 키운다 — 정산 신청 목록 Figma 실측(mutedText 기본 5px보다 큼) */
  tallToolbar?: boolean
}

/*
 * DataTable (organism)
 * ------------------------------------------------------------------
 * 목록 화면들이 공유하는 데이터 테이블. 컬럼 정의와 행 데이터를 주입받아 그린다.
 * - 헤더/행이 같은 grid 컬럼(--cols)을 공유해 정렬이 항상 맞는다.
 * - 액션 버튼·상태 배지 등은 행 데이터의 셀에 React 노드로 직접 넣어 유연하게 표현.
 * - 정렬/검색/필터 등 동작은 작업 범위 밖(정적 표시).
 */
export default function DataTable({ columns, rows, title, titleRight, toolbar, toolbarExtra, fill, bare, onRowClick, inlineToolbar, mutedText, largeText, navyZebra, zebra, fluid, wrapCells, headerBar, tallToolbar }: DataTableProps) {
  // 컬럼 폭을 모아 grid-template-columns 값을 만든다
  const cols = columns.map((c) => c.width ?? '1fr').join(' ')
  const gridStyle = { '--cols': cols } as CSSProperties

  const wrapClass = [
    styles.wrap,
    fill && styles.fill,
    bare && styles.bare,
    mutedText && styles.mutedText,
    largeText && styles.largeText,
    navyZebra && styles.navyZebra,
    fluid && styles.fluid,
    wrapCells && styles.wrapCells,
    headerBar && styles.headerBar,
    tallToolbar && styles.tallToolbar,
    // mutedText는 이미 자체 지브라를 포함하므로 중복 적용해도 색이 같아 영향 없음
    (zebra || mutedText) && styles.zebra,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapClass}>
      {(title || toolbar || toolbarExtra) && (
        <div className={inlineToolbar ? `${styles.tableHead} ${styles.tableHeadInline}` : styles.tableHead}>
          {/* 제목 + (선택) 제목 우측 부가요소 */}
          <div className={styles.titleCluster}>
            {title && <h3 className={styles.tableTitle}>{title}</h3>}
            {titleRight}
          </div>
          {(toolbar || toolbarExtra) && (
            <div className={styles.toolbar}>
              {toolbar?.map((label) => (
                <button key={label} type="button" className={styles.toolbarButton}>
                  {label}
                </button>
              ))}
              {toolbarExtra}
            </div>
          )}
        </div>
      )}

      {/* 헤더 행 */}
      <div className={styles.headerRow} style={gridStyle}>
        {columns.map((c) => (
          <div key={c.key} className={styles.headerCell} style={{ textAlign: c.align }}>
            {c.label}
          </div>
        ))}
      </div>

      {/* 데이터 행들 (onRowClick 지정 시 행 전체가 클릭 가능) */}
      {rows.map((row) => (
        <div
          key={row.id}
          className={onRowClick ? `${styles.row} ${styles.rowClickable}` : styles.row}
          style={gridStyle}
          onClick={onRowClick ? () => onRowClick(row.id) : undefined}
        >
          {columns.map((c) => (
            <div key={c.key} className={styles.cell} style={{ textAlign: c.align }}>
              {row.cells[c.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
