import RequestListPage from '../../../components/templates/RequestListPage'
import ActionBadges from '../../../components/molecules/ActionBadges'
import type { TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useLeaders } from './useLeaders'

/*
 * Leaders (page) — 본사어드민 · 국가 리더 관리 · 국가 리더 전체 목록
 * ------------------------------------------------------------------
 * 리더 어드민의 Partners 화면과 같은 RequestListPage 템플릿을 재사용하지만,
 * 컬럼이 다르다(리더 코드/하위 파트너 수 등 — Figma 확인 결과 리더용 화면과 별개 데이터).
 */
export default function Leaders() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows } = useLeaders()

  // 액션은 행마다 다름(승인/정지/상세 또는 거절/상세)
  const rows: TableRow[] = rawRows.map((r) => ({
    id: r.no,
    cells: {
      no: r.no,
      appliedAt: r.appliedAt,
      leaderCode: r.leaderCode,
      country: r.country,
      partnerName: r.partnerName,
      subPartnerCount: r.subPartnerCount,
      subMerchantCount: r.subMerchantCount,
      monthVolume: r.monthVolume,
      monthTxCount: r.monthTxCount,
      unsettledFee: r.unsettledFee,
      action: <ActionBadges labels={r.actions} accentByLabel={{ 승인: 'green', 거절: 'red', 정지: 'red' }} />,
    },
  }))

  return (
    <RequestListPage
      title={t('hqLeaderList.title')}
      sectionTitle={t('hqLeaderList.section')}
      stats={stats}
      columns={columns}
      rows={rows}
      toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
    />
  )
}
