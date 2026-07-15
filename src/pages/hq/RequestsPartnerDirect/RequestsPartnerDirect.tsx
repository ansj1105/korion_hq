import { useMemo, useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useRequestsPartnerDirect } from './useRequestsPartnerDirect'
import HqRequestDetailForm from '../HqRequestDetailForm'
import { hqRequestRowId, useHqRequestActionRows } from '../useHqRequestActionRows'
import styles from './RequestsPartnerDirect.module.css'

/*
 * RequestsPartnerDirect (page) — 본사어드민 · 파트너 요청 관리 · 파트너 승인 요청 (다이렉트)
 * ------------------------------------------------------------------
 * 파트너 승인 요청(리더요청)(RequestsPartnerByLeader)과 Figma상 완전히 동일한 화면 —
 * 타이틀/섹션명만 "(다이렉트)"로 다르다. 리더를 거치지 않고 본사로 직접 온 신청 목록.
 * 액션 컬럼: 라벨 5개(승인/거절/검토중/대기/자료요청)는 항상 고정으로 보이고,
 * 그 행의 현재 상태 하나만 색이 켜진다.
 */
export default function RequestsPartnerDirect() {
  const { t } = useTranslation()
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const { stats, columns, rows: rawRows, statusMeta, approveLabel, rejectLabel, reload } = useRequestsPartnerDirect()
  const { rows } = useHqRequestActionRows({
    rows: rawRows,
    statusMeta,
    approveLabel,
    rejectLabel,
    endpointBase: '/api/hq/requests/partner-direct',
    onActionComplete: reload,
  })
  const selectedRow = useMemo(
    () => rawRows.find((row) => hqRequestRowId(row) === selectedRequestId) ?? null,
    [rawRows, selectedRequestId],
  )

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqRequestPartnerDirect.title')} />
      <StatSection stats={stats} bare />
      {selectedRow && (
        <HqRequestDetailForm
          row={selectedRow}
          title={t('hqRequestDetail.title')}
          requestTypeLabel={t('hqRequestPartnerDirect.title')}
          statusMeta={statusMeta}
          approveLabel={approveLabel}
          rejectLabel={rejectLabel}
          endpointBase="/api/hq/requests/partner-direct"
          onClose={() => setSelectedRequestId(null)}
          onActionComplete={reload}
        />
      )}
      <DataTable
        title={t('hqRequestPartnerDirect.section')}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        exportUrl="/api/hq/requests/partner-direct/export"
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
