import RequestListPage from '../../components/templates/RequestListPage'
import ActionBadges from '../../components/molecules/ActionBadges'
import type { TableRow } from '../../components/organisms/DataTable'
import { useTranslation } from '../../i18n'
import { usePartnerRequests, PARTNER_ACTIONS } from './usePartnerRequests'

/*
 * RequestsPartner (page) — 요청 관리 · 파트너 가입 요청
 * ------------------------------------------------------------------
 * 데이터는 usePartnerRequests 훅(하드코딩 JSON)에서, UI 문구는 t()로 받아
 * 공통 RequestListPage에 주입한다.
 */
export default function RequestsPartner() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows } = usePartnerRequests()

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
      title={t('requests.title')}
      sectionTitle={t('partner.sectionTitle')}
      sectionDesc={t('partner.sectionDesc')}
      stats={stats}
      columns={columns}
      rows={rows}
      toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
    />
  )
}
