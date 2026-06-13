import RequestListPage from '../../components/templates/RequestListPage'
import ActionBadges from '../../components/molecules/ActionBadges'
import type { TableRow } from '../../components/organisms/DataTable'
import {
  useMerchantRequests,
  MERCHANT_COLUMNS,
  MERCHANT_ACTIONS,
} from './useMerchantRequests'

/*
 * RequestsMerchant (page) — 요청 관리 · 가맹점 가입 요청
 * ------------------------------------------------------------------
 * 데이터는 useMerchantRequests 훅에서 받고(하드코딩 JSON), 공통 RequestListPage에 주입한다.
 */
export default function RequestsMerchant() {
  const { stats, rows: rawRows } = useMerchantRequests()

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
      title="요청 관리"
      sectionTitle="가맹점 가입 요청"
      sectionDesc="리더가 가맹점 가입신청자를 확인하고, 최종 승인 결정을 합니다 승인 / 거절 / 보류 / 자료요청을 결정합니다."
      stats={stats}
      columns={MERCHANT_COLUMNS}
      rows={rows}
      toolbar={['검색', '필터', 'Excel']}
    />
  )
}
