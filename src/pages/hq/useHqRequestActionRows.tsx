import { useEffect, useMemo, useState } from 'react'
import ActionBadges from '../../components/molecules/ActionBadges'
import Badge from '../../components/atoms/Badge'
import type { TableRow } from '../../components/organisms/DataTable'
import type { AccentKey } from '../../types'
import { useTranslation } from '../../i18n'
import { postHqPageData } from '../../services/korionChongApi'

export type HqRequestStatus = 'review' | 'waiting' | 'infoRequested'

export interface HqRequestActionRow {
  applicationId?: number
  no: string
  appliedAt: string
  parentCode: string
  applicantCode: string
  country: string
  partnerName: string
  subMerchantCount: string
  monthVolume: string
  monthTxCount: string
  status: HqRequestStatus | null
}

type StatusMeta = Record<HqRequestStatus, { label: string; accent: AccentKey }>

interface UseHqRequestActionRowsOptions<TRow extends HqRequestActionRow> {
  rows: TRow[]
  statusMeta: StatusMeta
  approveLabel: string
  rejectLabel: string
  endpointBase: string
}

const ACTION_PATH = {
  approve: 'approve',
  reject: 'reject',
  review: 'review',
  waiting: 'waiting',
  requestInfo: 'request-info',
} as const

export function useHqRequestActionRows<TRow extends HqRequestActionRow>({
  rows,
  statusMeta,
  approveLabel,
  rejectLabel,
  endpointBase,
}: UseHqRequestActionRowsOptions<TRow>) {
  const { t } = useTranslation()
  const [localRows, setLocalRows] = useState<TRow[]>(rows)
  const [loadingActionId, setLoadingActionId] = useState<number | null>(null)

  useEffect(() => {
    setLocalRows(rows)
  }, [rows])

  const sortedRows = useMemo(() => {
    const numericNo = (value: string) => Number(value.replace(/\D/g, '')) || 0
    return [...localRows].sort((a, b) => {
      const dateCompare = b.appliedAt.localeCompare(a.appliedAt)
      return dateCompare !== 0 ? dateCompare : numericNo(b.no) - numericNo(a.no)
    })
  }, [localRows])

  const actionLabels = useMemo(
    () => [approveLabel, rejectLabel, statusMeta.review.label, statusMeta.waiting.label, statusMeta.infoRequested.label],
    [approveLabel, rejectLabel, statusMeta.infoRequested.label, statusMeta.review.label, statusMeta.waiting.label],
  )
  const actionAccentByLabel: Record<string, AccentKey> = {
    [approveLabel]: 'green',
    [rejectLabel]: 'red',
    [statusMeta.review.label]: 'cyan',
    [statusMeta.waiting.label]: 'orange',
    [statusMeta.infoRequested.label]: 'purple',
  }

  const runRemoteAction = async (row: TRow, action: keyof typeof ACTION_PATH, reason?: string) => {
    if (!row.applicationId) return
    setLoadingActionId(row.applicationId)
    try {
      await postHqPageData(`${endpointBase}/${row.applicationId}/${ACTION_PATH[action]}`, {
        reason,
        requestId: `hq-request-${action}-${row.applicationId}-${Date.now()}`,
      })
    } catch {
      // Fallback/mock 데이터 화면에서도 액션 클릭 피드백은 유지한다.
    } finally {
      setLoadingActionId(null)
    }
  }

  const handleAction = (row: TRow, label: string) => {
    if (row.applicationId && loadingActionId === row.applicationId) return
    const rowId = requestRowId(row)

    if (label === approveLabel) {
      setLocalRows((prev) => prev.filter((item) => requestRowId(item) !== rowId))
      void runRemoteAction(row, 'approve')
      return
    }

    if (label === rejectLabel) {
      const reason = window.prompt(t('hqRequestLeader.prompt.rejectReason'))
      if (reason === null) return
      setLocalRows((prev) => prev.filter((item) => requestRowId(item) !== rowId))
      void runRemoteAction(row, 'reject', reason.trim())
      return
    }

    if (label === statusMeta.review.label) {
      setLocalRows((prev) => updateStatus(prev, rowId, 'review'))
      void runRemoteAction(row, 'review')
      return
    }

    if (label === statusMeta.waiting.label) {
      setLocalRows((prev) => updateStatus(prev, rowId, 'waiting'))
      void runRemoteAction(row, 'waiting')
      return
    }

    if (label === statusMeta.infoRequested.label) {
      const reason = window.prompt(t('hqRequestLeader.prompt.infoReason'))
      if (!reason?.trim()) return
      setLocalRows((prev) => updateStatus(prev, rowId, 'infoRequested'))
      void runRemoteAction(row, 'requestInfo', reason.trim())
    }
  }

  const tableRows: TableRow[] = sortedRows.map((row, index) => {
    const activeLabel = row.status ? statusMeta[row.status].label : null
    const activeStatus = row.status ? statusMeta[row.status] : null
    const solidByLabel: Record<string, boolean> = Object.fromEntries(actionLabels.map((label) => [label, label !== activeLabel]))
    const displayNo = sortedRows.length - index

    return {
      id: requestRowId(row),
      cells: {
        no: displayNo,
        appliedAt: row.appliedAt,
        parentCode: row.parentCode,
        applicantCode: row.applicantCode,
        country: row.country,
        partnerName: row.partnerName,
        subMerchantCount: row.subMerchantCount,
        monthVolume: row.monthVolume,
        monthTxCount: row.monthTxCount,
        status: activeStatus ? <Badge accent={activeStatus.accent} size="md" shape="rect">{activeStatus.label}</Badge> : '-',
        action: (
          <ActionBadges
            labels={actionLabels}
            accentByLabel={actionAccentByLabel}
            size="md"
            shape="rect"
            solidByLabel={solidByLabel}
            onLabelClick={(label) => handleAction(row, label)}
          />
        ),
      },
    }
  })

  return {
    rows: tableRows,
    loadingActionId,
  }
}

function updateStatus<TRow extends HqRequestActionRow>(rows: TRow[], rowId: string, status: HqRequestStatus) {
  return rows.map((row) => (requestRowId(row) === rowId ? { ...row, status } : row))
}

function requestRowId(row: HqRequestActionRow) {
  return [row.no, row.appliedAt, row.parentCode, row.applicantCode, row.country, row.partnerName].join('|')
}
