import { useMemo, useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useRequestsLeader } from './useRequestsLeader'
import HqRequestDetailForm from '../HqRequestDetailForm'
import { hqRequestRowId, useHqRequestActionRows } from '../useHqRequestActionRows'
import styles from './RequestsLeader.module.css'

/*
 * RequestsLeader (page) — 본사어드민 · 파트너 요청 관리 · 리더 승인 요청
 * ------------------------------------------------------------------
 * RequestListPage 템플릿은 테이블 아래 캡션 슬롯이 없어(다른 화면과 공유 중이라
 * 임의로 손대지 않음) 이 화면은 organism(PageHeader/StatSection/DataTable)을 직접 조합한다.
 * 액션 컬럼은 Applications(신청서 관리) 화면과 같은 패턴: 라벨 5개(승인/거절/검토중/대기/
 * 자료요청)는 항상 고정으로 보이고, 그 행의 현재 상태 하나만 색이 켜진다.
 */
export default function RequestsLeader() {
  const { t } = useTranslation()
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const { stats, columns, rows: rawRows, statusMeta, approveLabel, rejectLabel, reload } = useRequestsLeader()
  const { rows } = useHqRequestActionRows({
    rows: rawRows,
    statusMeta,
    approveLabel,
    rejectLabel,
    endpointBase: '/api/hq/requests/leader',
    onActionComplete: reload,
  })
  const selectedRow = useMemo(
    () => rawRows.find((row) => hqRequestRowId(row) === selectedRequestId) ?? null,
    [rawRows, selectedRequestId],
  )

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqRequestLeader.title')} />
      <StatSection stats={stats} bare />
      {selectedRow && (
        <HqRequestDetailForm
          row={selectedRow}
          title={t('hqRequestDetail.title')}
          requestTypeLabel={t('hqRequestLeader.title')}
          statusMeta={statusMeta}
          approveLabel={approveLabel}
          rejectLabel={rejectLabel}
          endpointBase="/api/hq/requests/leader"
          onClose={() => setSelectedRequestId(null)}
          onActionComplete={reload}
        />
      )}
      <DataTable
        title={t('hqRequestLeader.section')}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        exportUrl="/api/hq/requests/leader/export"
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
