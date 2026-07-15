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
  applicationType?: string
  applicantType?: string
  requestedRole?: string
  contractPath?: string
  loginId?: string
  email?: string
  contact?: string
  contactName?: string
  phone?: string
  telegram?: string
  whatsapp?: string
  parentCode: string
  applicantCode: string
  country: string
  region?: string
  city?: string
  address?: string
  partnerName: string
  businessType?: string
  walletNetwork?: string
  walletAddress?: string
  walletAuthStatus?: string
  integrationPlan?: string
  evidenceNote?: string
  source?: string
  requestId?: string
  attachmentUrl?: string
  attachmentFileName?: string
  attachmentFileSize?: number | string
  attachmentContentType?: string
  attachmentDataUrl?: string
  twitterProfile?: string
  preferredLanguage?: string
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
  onActionComplete?: () => void
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
  onActionComplete,
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
  const runRemoteAction = async (row: TRow, action: keyof typeof ACTION_PATH, reason?: string) => {
    if (!row.applicationId) {
      window.alert('요청 식별자가 없어 처리할 수 없습니다.')
      return false
    }
    setLoadingActionId(row.applicationId)
    try {
      await postHqPageData(`${endpointBase}/${row.applicationId}/${ACTION_PATH[action]}`, {
        reason,
        requestId: `hq-request-${action}-${row.applicationId}-${Date.now()}`,
      })
      onActionComplete?.()
      return true
    } catch (error) {
      const message = error instanceof Error ? error.message : '요청 처리에 실패했습니다.'
      window.alert(message)
      return false
    } finally {
      setLoadingActionId(null)
    }
  }

  const handleAction = async (row: TRow, label: string) => {
    if (row.applicationId && loadingActionId === row.applicationId) return
    const rowId = hqRequestRowId(row)

    if (label === approveLabel) {
      const ok = await runRemoteAction(row, 'approve')
      if (ok) setLocalRows((prev) => prev.filter((item) => hqRequestRowId(item) !== rowId))
      return
    }

    if (label === rejectLabel) {
      const reason = window.prompt(t('hqRequestLeader.prompt.rejectReason'))
      if (reason === null) return
      const ok = await runRemoteAction(row, 'reject', reason.trim())
      if (ok) setLocalRows((prev) => prev.filter((item) => hqRequestRowId(item) !== rowId))
      return
    }

    if (label === statusMeta.review.label) {
      const ok = await runRemoteAction(row, 'review')
      if (ok) setLocalRows((prev) => updateStatus(prev, rowId, 'review'))
      return
    }

    if (label === statusMeta.waiting.label) {
      const ok = await runRemoteAction(row, 'waiting')
      if (ok) setLocalRows((prev) => updateStatus(prev, rowId, 'waiting'))
      return
    }

    if (label === statusMeta.infoRequested.label) {
      const reason = window.prompt(t('hqRequestLeader.prompt.infoReason'))
      if (!reason?.trim()) return
      const ok = await runRemoteAction(row, 'requestInfo', reason.trim())
      if (ok) setLocalRows((prev) => updateStatus(prev, rowId, 'infoRequested'))
    }
  }

  const tableRows: TableRow[] = sortedRows.map((row, index) => {
    const activeStatus = row.status ? statusMeta[row.status] : null
    const displayNo = sortedRows.length - index

    return {
      id: hqRequestRowId(row),
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
            size="md"
            shape="rect"
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
  return rows.map((row) => (hqRequestRowId(row) === rowId ? { ...row, status } : row))
}

export function hqRequestRowId(row: HqRequestActionRow) {
  return [row.no, row.appliedAt, row.parentCode, row.applicantCode, row.country, row.partnerName].join('|')
}
