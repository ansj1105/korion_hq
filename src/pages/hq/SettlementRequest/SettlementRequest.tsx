import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Badge from '../../../components/atoms/Badge'
import PageHeader from '../../../components/organisms/PageHeader'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import { postHqPageData } from '../../../services/korionChongApi'
import type { AccentKey } from '../../../types'
import { useSettlementRequest, type RequestRow, type RequestStatus, type SettlementRequestActionCode } from './useSettlementRequest'
import styles from './SettlementRequest.module.css'

const DEFAULT_ACTIONS: SettlementRequestActionCode[] = ['APPROVE', 'REVIEW', 'HOLD', 'REQUEST_INFO', 'REJECT']
const ACTION_ACCENT: Record<SettlementRequestActionCode, AccentKey> = {
  APPROVE: 'green',
  REVIEW: 'cyan',
  HOLD: 'orange',
  REQUEST_INFO: 'purple',
  REJECT: 'red',
}

interface SettlementRequestActionResponse {
  settlementRequestId: number
  status: RequestStatus
  statusAccent?: AccentKey
  sourceStatus?: string
  actions?: SettlementRequestActionCode[]
}

/*
 * HqSettlementRequest (page) — 본사어드민 · 수수료/정산 · 정산 신청(목록)
 * ------------------------------------------------------------------
 * 본사가 파트너와 리더의 정산 신청을 검토/승인/보류하는 목록 화면.
 * 상단 KPI 8개 + "파트너 / 리더 정산 신청 목록" 테이블. 행/‘상세’ 클릭 시 상세 검토 화면으로 이동.
 * 동작은 UI 상태만(라우팅 제외 실제 처리는 범위 밖).
 */
export default function HqSettlementRequest() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { kpis, columns, rows: rawRows, statusLabel, actionLabel, chipAutoInclude, chipExcludeToday, section, subtitle, isLoading, error } =
    useSettlementRequest()
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Pick<SettlementRequestActionResponse, 'status' | 'statusAccent' | 'sourceStatus' | 'actions'>>>({})
  const [actionError, setActionError] = useState<string | null>(null)

  const openDetail = (row: Partial<RequestRow>) => {
    const params = new URLSearchParams()
    if (row.settlementRequestId) params.set('settlementRequestId', String(row.settlementRequestId))
    if (row.recipientType) params.set('type', row.recipientType)
    if (row.partnerName) params.set('name', row.partnerName)
    if (row.country) params.set('country', row.country)
    if (row.sourceStatus) params.set('status', row.sourceStatus)
    navigate(params.size > 0 ? `detail?${params.toString()}` : 'detail')
  }

  const rowSourceById = new Map<string, RequestRow>()
  const handleAction = async (row: RequestRow, action: SettlementRequestActionCode) => {
    if (!row.settlementRequestId) return
    setActionError(null)
    try {
      const response = await postHqPageData<SettlementRequestActionResponse>(
        `/api/hq/settlement-requests/${row.settlementRequestId}/actions`,
        {
          action,
          reason: `HQ settlement request action: ${action}`,
          requestId: `hq-settlement-${Date.now()}`,
        },
      )
      setStatusOverrides((prev) => ({
        ...prev,
        [String(row.settlementRequestId)]: {
          status: response.status,
          statusAccent: response.statusAccent,
          sourceStatus: response.sourceStatus,
          actions: response.actions,
        },
      }))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'API error')
    }
  }

  const rows: TableRow[] = rawRows.map((r, index) => {
    const override = r.settlementRequestId ? statusOverrides[String(r.settlementRequestId)] : undefined
    const status = override?.status ?? r.status
    const statusAccent = override?.statusAccent ?? r.statusAccent ?? statusAccentByStatus(status)
    const sourceStatus = override?.sourceStatus ?? r.sourceStatus
    const actions = override?.actions?.length ? override.actions : r.actions?.length ? r.actions : DEFAULT_ACTIONS
    const actionLabels = actions.map((action) => actionLabel[action])
    const actionAccentByLabel = Object.fromEntries(actions.map((action) => [actionLabel[action], ACTION_ACCENT[action]])) as Record<string, AccentKey>
    return {
      // 신청 ID가 샘플상 중복돼 있어 index로 key를 구분
      id: `${r.id}-${index}`,
      cells: {
        no: r.no ?? String(rawRows.length - index),
        id: r.id,
        date: r.date,
        applicant: r.applicant,
        partnerName: r.partnerName,
        country: r.country,
        period: r.period,
        totalAmount: r.totalAmount,
        partnerProfit: r.partnerProfit,
        directProfit: r.directProfit,
        partnerSettle: r.partnerSettle,
        held: r.held,
        finalAmount: r.finalAmount,
        recipientType: r.recipientType ?? '-',
        sourceStatus: sourceStatus ?? '-',
        status: <Badge accent={statusAccent} size="md" shape="rect">{statusLabel[status]}</Badge>,
        action: (
          <span className={styles.actionStop} onClick={(event) => event.stopPropagation()}>
            <ActionBadges
              labels={actionLabels}
              accentByLabel={actionAccentByLabel}
              size="md"
              shape="rect"
              solid
              onLabelClick={(label) => {
                const action = actions.find((candidate) => actionLabel[candidate] === label)
                if (action) void handleAction(r, action)
              }}
            />
          </span>
        ),
      },
    }
  })
  rows.forEach((row, index) => rowSourceById.set(row.id, rawRows[index]))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqSettle.req.title')}>
        {/* 부제(좌) + 상태 칩(우) 한 줄. 칩은 동작 없는 표시 전용 */}
        <div className={styles.subRow}>
          <p className={styles.subtitle}>{subtitle}</p>
          <div className={styles.chips}>
            <span className={`${styles.chip} ${styles.chipPurple}`}>{chipAutoInclude}</span>
            <span className={`${styles.chip} ${styles.chipCyan}`}>{chipExcludeToday}</span>
          </div>
        </div>
      </PageHeader>

      {/* KPI 8개 — 감싸는 박스 없이 4×2 독립 카드 */}
      <div className={styles.kpiGrid}>
        {kpis.map((k) => (
          <div key={k.id} className={styles.kpiCard}>
            <span className={styles.kpiLabel}>{k.label}</span>
            <span className={styles.kpiValue}>{k.value}</span>
            <span className={styles.kpiNote}>{k.note}</span>
          </div>
        ))}
      </div>

      {/* 리더 정산 신청 목록 — 행 전체 클릭 시 상세 검토로 이동 */}
      <DataTable
        title={section}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('hqSettle.req.toolbar.excel')]}
        searchKeys={['id', 'applicant', 'partnerName', 'country', 'recipientType', 'sourceStatus', 'status']}
        filterKeys={['country', 'status']}
        fill
        inlineToolbar
        mutedText
        onRowClick={(rowId) => {
          openDetail(rowSourceById.get(rowId) ?? {})
        }}
      />
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}
      {actionError && <p className={styles.errorText}>{actionError}</p>}
    </div>
  )
}

function statusAccentByStatus(status: RequestStatus): AccentKey {
  switch (status) {
    case 'done':
      return 'green'
    case 'hold':
      return 'orange'
    case 'infoRequested':
      return 'purple'
    case 'rejected':
      return 'red'
    default:
      return 'cyan'
  }
}
