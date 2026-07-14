import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useRequestsPartnerByLeader } from './useRequestsPartnerByLeader'
import { useHqRequestActionRows } from '../useHqRequestActionRows'
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
  const { stats, columns, rows: rawRows, statusMeta, approveLabel, rejectLabel } = useRequestsPartnerByLeader()
  const { rows } = useHqRequestActionRows({
    rows: rawRows,
    statusMeta,
    approveLabel,
    rejectLabel,
    endpointBase: '/api/hq/requests/partner-by-leader',
  })

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
      />
    </div>
  )
}
