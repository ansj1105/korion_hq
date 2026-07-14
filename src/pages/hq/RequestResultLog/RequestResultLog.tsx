import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import { useRequestResultLog, type AdminAction } from './useRequestResultLog'
import RequestDetailOverlay from './RequestDetailOverlay'
import styles from './RequestResultLog.module.css'

const ADMIN_ACTION_ACCENT: Record<AdminAction, 'green' | 'orange' | 'red' | 'cyan' | 'purple'> = {
  approved: 'green',
  approveCancelled: 'orange',
  rejected: 'red',
  rejectCancelled: 'orange',
  review: 'cyan',
  waiting: 'orange',
  infoRequested: 'purple',
  held: 'orange',
}

const REQUEST_TYPE_ACCENT: Record<string, 'cyan' | 'green' | 'purple' | 'orange'> = {
  '파트너 (리더 승인)': 'cyan',
  '파트너 (다이렉트)': 'green',
  '리더 승격 요청': 'purple',
  '가맹점 (다이렉트)': 'orange',
}

/*
 * RequestResultLog (page) — 본사어드민 · 파트너 요청 관리 · 요청 결과 로그 전체내역
 * ------------------------------------------------------------------
 * 승인 요청 4개 화면에서 처리된 결과(승인/거절/취소)의 통합 로그.
 * 관리자 행동 컬럼은 데이터 값이라 글자색만 입힌다(정산 내역 화면과 동일 컨벤션).
 * row 클릭 시 해당 처리 이력의 상세 오버레이를 연다.
 */
export default function RequestResultLog() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows, adminActionLabel, section } = useRequestResultLog()
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)

  const rows: TableRow[] = rawRows.map((r, index) => {
    return {
      id: `${r.applicationNo}-${r.adminAction}-${index}`,
      cells: {
        no: r.no,
        applicationNo: r.applicationNo,
        appliedAt: r.appliedAt,
        paidAt: r.paidAt,
        requestType: (
          <Badge accent={REQUEST_TYPE_ACCENT[r.requestType] ?? 'cyan'} size="md" shape="rect">
            {r.requestType}
          </Badge>
        ),
        parentCode: r.parentCode,
        applicantCode: r.applicantCode,
        country: r.country,
        partnerName: r.partnerName,
        adminAction: (
          <Badge accent={ADMIN_ACTION_ACCENT[r.adminAction]} size="md" shape="rect">
            {adminActionLabel[r.adminAction]}
          </Badge>
        ),
      },
    }
  })
  const selectedRow = selectedRowId
    ? rawRows.find((row, index) => `${row.applicationNo}-${row.adminAction}-${index}` === selectedRowId) ?? null
    : null

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqRequestResultLog.title')} />
      <StatSection stats={stats} bare />
      <DataTable
        title={section}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        exportUrl="/api/hq/requests/result-log/export"
        paginated
        pageSize={10}
        fill
        inlineToolbar
        mutedText
        headerBar
        onRowClick={setSelectedRowId}
      />
      <RequestDetailOverlay row={selectedRow} onClose={() => setSelectedRowId(null)} />
    </div>
  )
}
