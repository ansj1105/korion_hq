import { isValidElement, useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import { downloadHqExport } from '../../../services/korionChongApi'
import { isHqTestDataVisible } from '../../../services/hqTestData'
import styles from './DataTable.module.css'

const HQ_TEST_DATA_VISIBILITY_KEY = 'korion.hq.showTestData'
const HQ_TEST_DATA_VISIBILITY_EVENT = 'korion:hq-test-data-visibility'

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
  /** 툴바 버튼들 뒤에 붙는 페이지 전용 요소 */
  toolbarExtra?: ReactNode
  /** 검색 대상 컬럼. 없으면 모든 컬럼 텍스트를 검색한다 */
  searchKeys?: string[]
  /** 필터 대상 컬럼. 없으면 테이블 값 분포를 보고 페이지별 필터를 자동 구성한다 */
  filterKeys?: string[]
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
  /** true면 툴바 버튼 세로 패딩을 키운다 */
  tallToolbar?: boolean
  /** true면 헤더 경계 드래그로 열 폭을 조절한다. 기본 true */
  resizable?: boolean
  /** 지정하면 Excel 버튼 클릭 시 현재 화면 행 CSV 대신 서버 export API에서 파일을 내려받는다 */
  exportUrl?: string
  /** true면 필터링된 행을 pageSize 단위로 나눠 하단 페이지네이션을 표시한다 */
  paginated?: boolean
  /** paginated=true일 때 한 페이지에 표시할 행 수. 기본 10 */
  pageSize?: number
}

/*
 * DataTable (organism)
 * ------------------------------------------------------------------
 * 목록 화면들이 공유하는 데이터 테이블. 컬럼 정의와 행 데이터를 주입받아 그린다.
 * - 헤더/행이 같은 grid 컬럼(--cols)을 공유해 정렬이 항상 맞는다.
 * - 액션 버튼·상태 배지 등은 행 데이터의 셀에 React 노드로 직접 넣어 유연하게 표현.
 * - 정렬/검색/필터 등 동작은 작업 범위 밖(정적 표시).
 */
export default function DataTable({ columns, rows, title, titleRight, toolbar, toolbarExtra, searchKeys, filterKeys, fill, bare, onRowClick, inlineToolbar, mutedText, largeText, navyZebra, zebra, fluid, wrapCells, headerBar, tallToolbar, resizable = true, exportUrl, paginated, pageSize = 10 }: DataTableProps) {
  const [searchDraft, setSearchDraft] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [currentPage, setCurrentPage] = useState(1)
  const [showTestData, setShowTestData] = useState(isHqTestDataVisible)
  const [columnWidthOverrides, setColumnWidthOverrides] = useState<Record<string, number>>({})
  const columnKeySignature = columns.map((column) => column.key).join('|')
  const resizeStateRef = useRef<{
    key: string
    startX: number
    startWidth: number
  } | null>(null)
  // 컬럼 폭을 모아 grid-template-columns 값을 만든다
  const cols = columns.map((c) => {
    const override = columnWidthOverrides[c.key]
    return override ? `${override}px` : c.width ?? '1fr'
  }).join(' ')
  const tableMinWidth = fluid ? undefined : computeTableMinWidth(columns, columnWidthOverrides)
  const gridStyle = {
    '--cols': cols,
    ...(tableMinWidth ? { '--table-min-width': `${tableMinWidth}px` } : {}),
  } as CSSProperties
  const searchEnabled = Boolean(toolbar?.some(isSearchToolbarLabel))
  const filterEnabled = Boolean(toolbar?.some(isFilterToolbarLabel))
  const englishToolbar = hasEnglishToolbar(toolbar)
  const searchableKeys = searchKeys?.length ? searchKeys : columns.map((column) => column.key)
  const filterOptions = useMemo(() => {
    if (!filterEnabled) return []
    return buildFilterOptions(columns, rows, filterKeys)
  }, [columns, filterEnabled, filterKeys, rows])
  const activeFilterCount = Object.values(filters).filter(Boolean).length
  const displayRows = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()
    return rows.filter((row) => {
      if (!showTestData && isTestDataRow(row)) return false
      if (normalizedSearchTerm) {
        const matchesSearch = searchableKeys.some((key) =>
          cellText(row.cells[key]).toLowerCase().includes(normalizedSearchTerm)
        )
        if (!matchesSearch) return false
      }
      return filterOptions.every((filter) => {
        const selected = filters[filter.key]
        if (!selected) return true
        return cellText(row.cells[filter.key]) === selected
      })
    })
  }, [filterOptions, filters, rows, searchTerm, searchableKeys, showTestData])
  const totalPages = paginated ? Math.max(1, Math.ceil(displayRows.length / pageSize)) : 1
  const visibleRows = paginated ? displayRows.slice((currentPage - 1) * pageSize, currentPage * pageSize) : displayRows

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

  useEffect(() => {
    setColumnWidthOverrides((prev) => {
      const next: Record<string, number> = {}
      const keys = new Set(columns.map((column) => column.key))
      for (const [key, width] of Object.entries(prev)) {
        if (keys.has(key)) {
          next[key] = width
        }
      }
      return next
    })
  }, [columnKeySignature])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const resizeState = resizeStateRef.current
      if (!resizeState) return
      const nextWidth = Math.max(72, Math.round(resizeState.startWidth + event.clientX - resizeState.startX))
      setColumnWidthOverrides((prev) => ({ ...prev, [resizeState.key]: nextWidth }))
    }
    const handleMouseUp = () => {
      resizeStateRef.current = null
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, filters, pageSize, paginated, showTestData])

  useEffect(() => {
    const syncTestDataVisibility = () => setShowTestData(isHqTestDataVisible())
    window.addEventListener('storage', syncTestDataVisibility)
    window.addEventListener(HQ_TEST_DATA_VISIBILITY_EVENT, syncTestDataVisibility)
    return () => {
      window.removeEventListener('storage', syncTestDataVisibility)
      window.removeEventListener(HQ_TEST_DATA_VISIBILITY_EVENT, syncTestDataVisibility)
    }
  }, [])

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  const beginColumnResize = (event: ReactMouseEvent, column: Column) => {
    event.preventDefault()
    event.stopPropagation()
    if (!resizable) return
    resizeStateRef.current = {
      key: column.key,
      startX: event.clientX,
      startWidth: columnWidthOverrides[column.key] ?? parseColumnPixelWidth(column.width) ?? event.currentTarget.parentElement?.getBoundingClientRect().width ?? 120,
    }
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const applySearch = () => setSearchTerm(searchDraft)
  const toggleTestDataVisibility = () => {
    const next = !showTestData
    window.localStorage.setItem(HQ_TEST_DATA_VISIBILITY_KEY, next ? 'true' : 'false')
    setShowTestData(next)
    window.dispatchEvent(new Event(HQ_TEST_DATA_VISIBILITY_EVENT))
  }

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
              {searchEnabled && (
                <input
                  aria-label={getSearchPlaceholder(toolbar)}
                  className={styles.searchInput}
                  placeholder={getSearchPlaceholder(toolbar)}
                  type="search"
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      applySearch()
                    }
                  }}
                />
              )}
              {toolbar?.map((label) => {
                const isSearch = isSearchToolbarLabel(label)
                const isFilter = isFilterToolbarLabel(label)
                const isExcel = isExcelToolbarLabel(label)
                return (
                  <button
                    key={label}
                    type="button"
                    className={styles.toolbarButton}
                    onClick={() => {
                      if (isSearch) {
                        applySearch()
                        return
                      }
                      if (isFilter) {
                        setFilterOpen((current) => !current)
                        return
                      }
                      if (isExcel) {
                        if (exportUrl) {
                          void downloadHqExport(exportUrl, buildCsvFilename(title))
                          return
                        }
                        downloadTableCsv({ columns, rows: displayRows, filename: buildCsvFilename(title) })
                      }
                    }}
                  >
                    {label}
                    {isFilter && activeFilterCount > 0 && <span className={styles.toolbarBadge}>{activeFilterCount}</span>}
                  </button>
                )
              })}
              <button
                type="button"
                className={showTestData ? styles.toolbarButton : `${styles.toolbarButton} ${styles.testDataHiddenButton}`}
                aria-pressed={showTestData}
                onClick={toggleTestDataVisibility}
                title={englishToolbar ? 'Toggle test data rows' : '테스트 데이터 행 표시 여부를 전환합니다'}
              >
                {englishToolbar ? (showTestData ? 'Test data ON' : 'Test data OFF') : (showTestData ? '테스트 데이터 ON' : '테스트 데이터 OFF')}
              </button>
              {toolbarExtra}
            </div>
          )}
        </div>
      )}

      {filterOpen && filterEnabled && (
        <div className={styles.filterPanel}>
          {filterOptions.length > 0 ? (
            <>
              {filterOptions.map((filter) => (
                <label key={filter.key} className={styles.filterField}>
                  <span className={styles.filterLabel}>{filter.label}</span>
                  <select
                    className={styles.filterSelect}
                    value={filters[filter.key] ?? ''}
                    onChange={(event) => {
                      const value = event.target.value
                      setFilters((prev) => ({ ...prev, [filter.key]: value }))
                    }}
                  >
                    <option value="">{englishToolbar ? 'All' : '전체'}</option>
                    {filter.options.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <button type="button" className={styles.filterResetButton} onClick={() => setFilters({})}>
                {englishToolbar ? 'Reset' : '초기화'}
              </button>
            </>
          ) : (
            <span className={styles.filterEmpty}>{englishToolbar ? 'No available filters.' : '적용 가능한 필터 항목이 없습니다.'}</span>
          )}
        </div>
      )}

      {/* 헤더 행 */}
      <div className={styles.headerRow} style={gridStyle}>
        {columns.map((c) => (
          <div key={c.key} className={styles.headerCell} style={{ textAlign: c.align, justifyContent: getHeaderJustifyContent(c.align) }}>
            <span className={styles.headerLabel}>{c.label}</span>
            {resizable && (
              <button
                type="button"
                className={styles.resizeHandle}
                aria-label={`${c.label} column resize`}
                onMouseDown={(event) => beginColumnResize(event, c)}
                onClick={(event) => event.stopPropagation()}
              />
            )}
          </div>
        ))}
      </div>

      {/* 데이터 행들 (onRowClick 지정 시 행 전체가 클릭 가능) */}
      {visibleRows.map((row) => (
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
      {paginated && totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Pagination">
          <button
            type="button"
            className={styles.pageButton}
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            ‹
          </button>
          {paginationPages(currentPage, totalPages).map((page) => (
            <button
              key={page}
              type="button"
              className={page === currentPage ? `${styles.pageButton} ${styles.pageButtonActive}` : styles.pageButton}
              aria-current={page === currentPage ? 'page' : undefined}
              aria-label={`Page ${page}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className={styles.pageButton}
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          >
            ›
          </button>
        </nav>
      )}
    </div>
  )
}

function paginationPages(currentPage: number, totalPages: number) {
  const pages = new Set<number>([1, totalPages, currentPage])
  if (currentPage > 1) pages.add(currentPage - 1)
  if (currentPage < totalPages) pages.add(currentPage + 1)
  return Array.from(pages).sort((a, b) => a - b)
}

interface FilterOption {
  key: string
  label: string
  options: string[]
}

function buildFilterOptions(columns: Column[], rows: TableRow[], filterKeys?: string[]): FilterOption[] {
  const allowedKeys = filterKeys?.length ? new Set(filterKeys) : undefined
  return columns
    .filter((column) => {
      if (allowedKeys) return allowedKeys.has(column.key)
      return !isFilterExcludedColumn(column)
    })
    .map((column) => {
      const values = Array.from(
        new Set(rows.map((row) => cellText(row.cells[column.key]).trim()).filter((value) => value && value !== '-'))
      )
      return {
        key: column.key,
        label: column.label,
        options: values.sort((a, b) => a.localeCompare(b)),
      }
    })
    .filter((filter) => filter.options.length >= 2 && filter.options.length <= 12)
}

function isFilterExcludedColumn(column: Column) {
  const key = column.key.toLowerCase()
  const label = column.label.toLowerCase()
  return /^(no|number|num|id|actions?|action|detail|details)$/.test(key)
    || ['번호', 'no', 'no.', '액션', '상세', 'detail', 'details'].includes(label)
    || key.includes('amount')
    || key.includes('price')
    || key.includes('fee')
    || key.includes('count')
    || key.includes('date')
    || key.includes('time')
}

function cellText(value: ReactNode): string {
  if (value === null || value === undefined || typeof value === 'boolean') return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.map(cellText).join(' ')
  if (isValidElement(value)) {
    return cellText((value.props as { children?: ReactNode }).children)
  }
  return ''
}

function isTestDataRow(row: TableRow) {
  return Object.values(row.cells).some((value) => {
    const text = cellText(value)
    return /\[TEST\]|TEST_DATA|TEST DATA|TTEST|test-/i.test(text)
  })
}

function isSearchToolbarLabel(label: string) {
  const normalized = label.trim().toLowerCase()
  return normalized === '검색' || normalized === 'search'
}

function isFilterToolbarLabel(label: string) {
  const normalized = label.trim().toLowerCase()
  return normalized === '필터' || normalized === 'filter'
}

function isExcelToolbarLabel(label: string) {
  const normalized = label.trim().toLowerCase()
  return normalized === 'excel' || normalized === '엑셀' || normalized === '액셀' || normalized.includes('excel')
}

function getSearchPlaceholder(toolbar?: string[]) {
  return hasEnglishToolbar(toolbar) ? 'Search table' : '검색어를 입력해주세요'
}

function hasEnglishToolbar(toolbar?: string[]) {
  return Boolean(toolbar?.some((label) => /search|filter|excel/i.test(label)))
}

function buildCsvFilename(title?: string) {
  const safeTitle = (title || 'data-table').replace(/[\\/:*?"<>|]/g, '-').trim()
  const date = new Date().toISOString().slice(0, 10)
  return `${safeTitle || 'data-table'}-${date}.csv`
}

function downloadTableCsv({ columns, rows, filename }: { columns: Column[]; rows: TableRow[]; filename: string }) {
  const lines = [
    columns.map((column) => escapeCsvValue(column.label)).join(','),
    ...rows.map((row) => columns.map((column) => escapeCsvValue(cellText(row.cells[column.key]))).join(',')),
  ]
  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function escapeCsvValue(value: string) {
  const normalized = value.replace(/\r?\n/g, ' ').trim()
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, '""')}"`
  }
  return normalized
}

function parseColumnPixelWidth(width?: string) {
  if (!width) return undefined
  const match = width.trim().match(/^(\d+(?:\.\d+)?)px$/)
  if (!match) return undefined
  return Number(match[1])
}

function estimateColumnWidthValue(width?: string) {
  const pixelWidth = parseColumnPixelWidth(width)
  if (pixelWidth) return pixelWidth

  const minmaxPixelWidth = width?.match(/minmax\(\s*(\d+(?:\.\d+)?)px/i)
  const frWidth = width?.match(/(\d+(?:\.\d+)?)fr/i)
  if (minmaxPixelWidth || frWidth) {
    const minWidth = minmaxPixelWidth ? Number(minmaxPixelWidth[1]) : 0
    const flexibleWidth = frWidth ? Math.round(Number(frWidth[1]) * 112) : 0
    return Math.max(88, minWidth, flexibleWidth)
  }

  return 112
}

function computeTableMinWidth(columns: Column[], overrides: Record<string, number>) {
  const columnTotal = columns.reduce((total, column) => {
    return total + (overrides[column.key] ?? estimateColumnMinWidth(column))
  }, 0)
  const gapTotal = Math.max(0, columns.length - 1) * 8
  const rowPadding = 24

  return Math.max(880, Math.ceil(columnTotal + gapTotal + rowPadding))
}

function estimateColumnMinWidth(column: Column) {
  const explicitWidth = estimateColumnWidthValue(column.width)
  if (column.key === 'action') return Math.max(explicitWidth, 320)
  if (column.key === 'status') return Math.max(explicitWidth, 120)
  if (column.key === 'no') return Math.max(explicitWidth, 56)
  return explicitWidth
}

function getHeaderJustifyContent(align?: Column['align']) {
  if (align === 'center') return 'center'
  if (align === 'right') return 'flex-end'
  return 'flex-start'
}
