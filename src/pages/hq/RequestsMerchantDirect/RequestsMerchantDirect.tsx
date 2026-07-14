import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useRequestsMerchantDirect } from './useRequestsMerchantDirect'
import { useHqRequestActionRows } from '../useHqRequestActionRows'
import styles from './RequestsMerchantDirect.module.css'

/*
 * RequestsMerchantDirect (page) — 본사어드민 · 파트너 요청 관리 · 가맹점 승인 요청 (다이렉트)
 * ------------------------------------------------------------------
 * 파트너 승인 요청(다이렉트)(RequestsPartnerDirect)과 동일 레이아웃 — 타이틀과
 * 데이터(신청자 코드 NG-MER-*, 5행 상위 코드 NG-SP-0001)만 다르다.
 * 액션 컬럼: 라벨 5개(승인/거절/검토중/대기/자료요청)는 항상 고정으로 보이고,
 * 그 행의 현재 상태 하나만 색이 켜진다.
 */
export default function RequestsMerchantDirect() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows, statusMeta, approveLabel, rejectLabel, reload } = useRequestsMerchantDirect()
  const { rows } = useHqRequestActionRows({
    rows: rawRows,
    statusMeta,
    approveLabel,
    rejectLabel,
    endpointBase: '/api/hq/requests/merchant-direct',
    onActionComplete: reload,
  })

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqRequestMerchantDirect.title')} />
      <StatSection stats={stats} bare />
      <DataTable
        title={t('hqRequestMerchantDirect.section')}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        exportUrl="/api/hq/requests/merchant-direct/export"
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
