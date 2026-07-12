import { useNavigate } from 'react-router-dom'
import RequestListPage from '../../../components/templates/RequestListPage'
import ActionBadges from '../../../components/molecules/ActionBadges'
import type { TableRow } from '../../../components/organisms/DataTable'
import type { AccentKey } from '../../../types'
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
  const navigate = useNavigate()
  const { stats, columns, rows: rawRows, statusMeta, detailLabel } = useLeaders()

  /*
   * 액션 컬럼은 [승인/정지/상세] 토글 배지 고정. 행의 status로 활성 배지 하나만 색이 켜지고
   * (활성 승인=녹색 틴트, 활성 정지=빨강 솔리드) 나머지·상세는 항상 solid 회색(Figma 기준).
   */
  const rows: TableRow[] = rawRows.map((r) => {
    const labels = [statusMeta.approved.label, statusMeta.suspended.label, detailLabel]
    const active = statusMeta[r.status]
    const accentByLabel: Record<string, AccentKey> = { [active.label]: active.accent }
    const solidByLabel: Record<string, boolean> = Object.fromEntries(
      labels.map((label) => [label, label === active.label ? active.solid : true]),
    )

    return {
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
        action: <ActionBadges labels={labels} accentByLabel={accentByLabel} solidByLabel={solidByLabel} equalWidth />,
      },
    }
  })

  return (
    <RequestListPage
      title={t('hqLeaderList.title')}
      statsBare
      stats={stats}
      columns={columns}
      rows={rows}
      tableTitle={t('hqLeaderList.section')}
      toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
      toolbarInline
      tableMutedText
      tableHeaderBar
      onRowClick={() => navigate('/hq/leaders/sales')}
    />
  )
}
