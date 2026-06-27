import RequestListPage from '../../../components/templates/RequestListPage'
import ActionBadges from '../../../components/molecules/ActionBadges'
import type { TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useMerchants } from './useMerchants'

/*
 * Merchants (page) — 본사어드민 · 가맹점 관리 · 가맹점 전체 목록
 * ------------------------------------------------------------------
 * RequestListPage 템플릿 재사용. 리더 어드민의 동명 화면과 컬럼이 달라 별도 작성.
 */
export default function Merchants() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows } = useMerchants()

  const rows: TableRow[] = rawRows.map((r) => ({
    id: r.no,
    cells: {
      no: r.no,
      leaderCode: r.leaderCode,
      partnerCode: r.partnerCode,
      country: r.country,
      region: r.region,
      merchantName: r.merchantName,
      businessType: r.businessType,
      monthVolume: r.monthVolume,
      monthTxCount: r.monthTxCount,
      fee: r.fee,
      action: <ActionBadges labels={r.actions} accentByLabel={{ 승인: 'green', 거절: 'red', 정지: 'red' }} />,
    },
  }))

  return (
    <RequestListPage
      title={t('hqMerchantList.title')}
      sectionTitle={t('hqMerchantList.section')}
      stats={stats}
      columns={columns}
      rows={rows}
      toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
    />
  )
}
