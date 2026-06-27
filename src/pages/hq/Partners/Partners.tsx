import RequestListPage from '../../../components/templates/RequestListPage'
import ActionBadges from '../../../components/molecules/ActionBadges'
import type { TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { usePartners } from './usePartners'

/*
 * Partners (page) — 본사어드민 · 파트너 관리 · 파트너 전체 목록
 * ------------------------------------------------------------------
 * RequestListPage 템플릿 재사용. 리더 어드민의 동명 화면과 컬럼이 달라 별도 작성.
 */
export default function Partners() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows } = usePartners()

  const rows: TableRow[] = rawRows.map((r) => ({
    id: r.no,
    cells: {
      no: r.no,
      appliedAt: r.appliedAt,
      leaderCode: r.leaderCode,
      partnerCode: r.partnerCode,
      country: r.country,
      partnerName: r.partnerName,
      subMerchantCount: r.subMerchantCount,
      monthVolume: r.monthVolume,
      monthTxCount: r.monthTxCount,
      unsettledFee: r.unsettledFee,
      action: <ActionBadges labels={r.actions} accentByLabel={{ 승인: 'green', 거절: 'red', 정지: 'red' }} />,
    },
  }))

  return (
    <RequestListPage
      title={t('hqPartnerList.title')}
      sectionTitle={t('hqPartnerList.section')}
      stats={stats}
      columns={columns}
      rows={rows}
      toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
    />
  )
}
