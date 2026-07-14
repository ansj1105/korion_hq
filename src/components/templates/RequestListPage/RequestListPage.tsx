import type { ReactNode } from 'react'
import PageHeader from '../../organisms/PageHeader'
import StatSection from '../../organisms/StatSection'
import DataTable, { type Column, type TableRow } from '../../organisms/DataTable'
import type { StatCardData } from '../../molecules/StatCard'
import styles from './RequestListPage.module.css'

interface RequestListPageProps {
  /** 페이지 헤더 제목 (예: "요청 관리") */
  title: string
  /** 섹션 박스 제목 (예: "파트너 가입 요청"). 제목 없는 화면도 있어 선택값 */
  sectionTitle?: string
  /** 섹션 설명 문구 (없는 화면도 있어 선택값) */
  sectionDesc?: string
  /** 상단 지표 카드 목록 */
  stats: StatCardData[]
  /** 테이블 컬럼 정의 */
  columns: Column[]
  /** 테이블 행 (액션 셀 포함, 호출 측에서 구성) */
  rows: TableRow[]
  /** 테이블 제목 (있는 화면만 — 예: "가맹점별 거래") */
  tableTitle?: string
  /** 테이블 툴바 버튼 라벨 */
  toolbar?: string[]
  /** 테이블 툴바 뒤에 붙는 화면 전용 컨트롤 */
  toolbarExtra?: ReactNode
  /** 행 클릭 콜백 (지정 시 행 전체 클릭 가능 — 예: 상세로 이동) */
  onRowClick?: (id: string) => void
  /** true면 지표 카드를 Card 박스 없이 그리드만 표시(sectionTitle/sectionDesc 무시됨) */
  statsBare?: boolean
  /** true면 테이블 제목 우측에 툴바가 바로 붙음(기본은 양끝 정렬) */
  toolbarInline?: boolean
  /** true면 테이블 제목/헤더/셀 글자 크기·색을 본사어드민 Figma 정확값으로 적용 */
  tableMutedText?: boolean
  /** true면 테이블 가로폭을 컨테이너에 고정(행 최소폭/가로 스크롤 제거) */
  tableFluid?: boolean
  /** true면 긴 셀 내용을 말줄임 대신 다음 줄로 줄바꿈 */
  tableWrapCells?: boolean
  /** true면 테이블 컬럼 헤더를 채워진 둥근 바로 표시(신청서 관리 Figma 디자인) */
  tableHeaderBar?: boolean
}

/*
 * RequestListPage (template)
 * ------------------------------------------------------------------
 * 목록 화면(가입 요청, 파트너 전체 목록 등)의 공통 레이아웃.
 *   [공통 헤더] + [지표 섹션 박스(StatSection)] + [데이터 테이블 1개]
 * 구조가 같고 데이터만 다르므로 각 화면은 데이터를 props로 넘기기만 한다.
 */
export default function RequestListPage({
  title,
  sectionTitle,
  sectionDesc,
  stats,
  columns,
  rows,
  tableTitle,
  toolbar,
  toolbarExtra,
  onRowClick,
  statsBare,
  toolbarInline,
  tableMutedText,
  tableFluid,
  tableWrapCells,
  tableHeaderBar,
}: RequestListPageProps) {
  return (
    <div className={styles.page}>
      <PageHeader title={title} />
      <StatSection title={sectionTitle} desc={sectionDesc} stats={stats} bare={statsBare} />
      <DataTable
        title={tableTitle}
        columns={columns}
        rows={rows}
        toolbar={toolbar}
        toolbarExtra={toolbarExtra}
        fill
        onRowClick={onRowClick}
        inlineToolbar={toolbarInline}
        mutedText={tableMutedText}
        fluid={tableFluid}
        wrapCells={tableWrapCells}
        headerBar={tableHeaderBar}
      />
    </div>
  )
}
