import RequestListPage from '../../components/templates/RequestListPage'
import ActionBadges from '../../components/molecules/ActionBadges'
import type { TableRow } from '../../components/organisms/DataTable'
import { useTranslation } from '../../i18n'
import { useMerchantRequests, MERCHANT_ACTIONS } from './useMerchantRequests'

/*
 * RequestsMerchant (page) — 요청 관리 · 가맹점 가입 요청
 * ------------------------------------------------------------------
 * 파트너 화면과 동일 템플릿. 데이터는 useMerchantRequests 훅, UI 문구는 t()로.
 */
export default function RequestsMerchant() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows } = useMerchantRequests()

  const rows: TableRow[] = rawRows.map((r) => ({
    id: r.code,
    cells: {
      no: r.no,
      code: r.code,
      name: r.name,
      telegram: r.telegram,
      region: r.region,
      industry: r.industry,
      opStatus: r.opStatus,
      date: r.date,
      action: <ActionBadges labels={MERCHANT_ACTIONS} />,
    },
  }))

  return (
    <RequestListPage
      title={t('requests.title')}
      sectionTitle={t('merchant.sectionTitle')}
      sectionDesc={t('merchant.sectionDesc')}
      stats={stats}
      columns={columns}
      rows={rows}
      toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
    />
  )
}
