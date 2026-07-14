import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import { useRequestResultLog, type AdminAction } from './useRequestResultLog'
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
 * 액션 배지: 승인 건 → [승인 취소, 상세정보] / 거절 건 → [거절취소, 상세정보] /
 * 이미 취소된 건 → [상세정보]만 (Figma 행별 마크업 기준). 전부 회색 solid.
 * '상세정보' 클릭 시 파트너 정보 오버레이(RequestDetailOverlay)가 열린다. 나머지 배지는 표시 전용.
 */
export default function RequestResultLog() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows, adminActionLabel, section } = useRequestResultLog()

  const rows: TableRow[] = rawRows.map((r, index) => {
    return {
      // no 값이 Figma 샘플 데이터상 중복돼 있어(복붙 흔적) index를 더해 key를 구분
      id: `${r.no}-${index}`,
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
      />
    </div>
  )
}
