import RequestListPage from '../../components/templates/RequestListPage'
import ActionBadges from '../../components/molecules/ActionBadges'
import type { TableRow } from '../../components/organisms/DataTable'
import {
  usePartnerRequests,
  PARTNER_COLUMNS,
  PARTNER_ACTIONS,
} from './usePartnerRequests'

/*
 * RequestsPartner (page) — 요청 관리 · 파트너 가입 요청
 * ------------------------------------------------------------------
 * 데이터는 usePartnerRequests 훅에서 받고(하드코딩 JSON), 공통 RequestListPage에 주입한다.
 */
export default function RequestsPartner() {
  const { stats, rows: rawRows } = usePartnerRequests()

  // 원본 행 → 테이블 행 변환 (액션 컬럼은 공통 ActionBadges로 렌더링)
  const rows: TableRow[] = rawRows.map((r) => ({
    id: r.code,
    cells: {
      no: r.no,
      code: r.code,
      name: r.name,
      region: r.region,
      subCount: r.subCount,
      volume: r.volume,
      txCount: r.txCount,
      hqStatus: r.hqStatus,
      opStatus: r.opStatus,
      date: r.date,
      action: <ActionBadges labels={PARTNER_ACTIONS} />,
    },
  }))

  return (
    <RequestListPage
      title="요청 관리"
      sectionTitle="파트너 가입 요청"
      sectionDesc="리더가 가입정보를 확인하고 본사에 최종 승인요청하면 본사에서 승인 / 보류 / 거절 / 자료요청을 결정합니다."
      stats={stats}
      columns={PARTNER_COLUMNS}
      rows={rows}
      toolbar={['검색', '필터', 'Excel']}
    />
  )
}
