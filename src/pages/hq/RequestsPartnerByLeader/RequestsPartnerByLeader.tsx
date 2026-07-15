import { useMemo, useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useRequestsPartnerByLeader } from './useRequestsPartnerByLeader'
import HqRequestDetailForm from '../HqRequestDetailForm'
import { hqRequestRowId, useHqRequestActionRows } from '../useHqRequestActionRows'
import styles from './RequestsPartnerByLeader.module.css'

/*
 * RequestsPartnerByLeader (page) — 본사어드민 · 파트너 요청 관리 · 파트너 승인 요청 (리더요청)
 * ------------------------------------------------------------------
 * 리더 승인 요청(RequestsLeader)과 동일한 레이아웃/패턴의 화면 — Figma상 타이틀과
 * 일부 컬럼명(신청번호/상위 코드/이번달 결제 금액)만 다르다.
 * 액션 컬럼: 라벨 5개(승인/거절/검토중/대기/자료요청)는 항상 고정으로 보이고,
 * 그 행의 현재 상태 하나만 색이 켜진다.
 */
export default function RequestsPartnerByLeader() {
  const { t } = useTranslation()
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const { stats, columns, rows: rawRows, statusMeta, approveLabel, rejectLabel, reload } = useRequestsPartnerByLeader()
  const { rows } = useHqRequestActionRows({
    rows: rawRows,
    statusMeta,
    approveLabel,
    rejectLabel,
    endpointBase: '/api/hq/requests/partner-by-leader',
    onActionComplete: reload,
  })
  const selectedRow = useMemo(
    () => rawRows.find((row) => hqRequestRowId(row) === selectedRequestId) ?? null,
    [rawRows, selectedRequestId],
  )
  const selectedIndex = useMemo(
    () => rawRows.findIndex((row) => hqRequestRowId(row) === selectedRequestId),
    [rawRows, selectedRequestId],
  )
  const previousRow = selectedIndex > 0 ? rawRows[selectedIndex - 1] : null
  const nextRow = selectedIndex >= 0 && selectedIndex < rawRows.length - 1 ? rawRows[selectedIndex + 1] : null

  if (selectedRow) {
    return (
      <div className={styles.page}>
        <PageHeader title={t('hqRequestPartnerByLeader.title')} />
        <HqRequestDetailForm
          row={selectedRow}
          title={t('hqRequestDetail.title')}
          requestTypeLabel={t('hqRequestPartnerByLeader.title')}
          statusMeta={statusMeta}
          approveLabel={approveLabel}
          rejectLabel={rejectLabel}
          endpointBase="/api/hq/requests/partner-by-leader"
          onClose={() => setSelectedRequestId(null)}
          onPrevious={() => previousRow && setSelectedRequestId(hqRequestRowId(previousRow))}
          onNext={() => nextRow && setSelectedRequestId(hqRequestRowId(nextRow))}
          hasPrevious={Boolean(previousRow)}
          hasNext={Boolean(nextRow)}
          onActionComplete={reload}
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqRequestPartnerByLeader.title')} />
      <StatSection stats={stats} bare />
      <DataTable
        title={t('hqRequestPartnerByLeader.section')}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        exportUrl="/api/hq/requests/partner-by-leader/export"
        paginated
        pageSize={10}
        fill
        inlineToolbar
        mutedText
        headerBar
        onRowClick={setSelectedRequestId}
      />
    </div>
  )
}
