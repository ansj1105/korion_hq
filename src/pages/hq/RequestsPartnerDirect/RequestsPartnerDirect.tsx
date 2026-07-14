import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Badge from '../../../components/atoms/Badge'
import type { AccentKey } from '../../../types'
import { useTranslation } from '../../../i18n'
import { useRequestsPartnerDirect } from './useRequestsPartnerDirect'
import styles from './RequestsPartnerDirect.module.css'

/*
 * RequestsPartnerDirect (page) — 본사어드민 · 파트너 요청 관리 · 파트너 승인 요청 (다이렉트)
 * ------------------------------------------------------------------
 * 파트너 승인 요청(리더요청)(RequestsPartnerByLeader)과 Figma상 완전히 동일한 화면 —
 * 타이틀/섹션명만 "(다이렉트)"로 다르다. 리더를 거치지 않고 본사로 직접 온 신청 목록.
 * 액션 컬럼: 라벨 5개(승인/거절/검토중/대기/자료요청)는 항상 고정으로 보이고,
 * 그 행의 현재 상태 하나만 색이 켜진다.
 */
export default function RequestsPartnerDirect() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows, statusMeta, approveLabel, rejectLabel } = useRequestsPartnerDirect()

  const rows: TableRow[] = rawRows.map((r, index) => {
    const labels = [approveLabel, rejectLabel, statusMeta.review.label, statusMeta.waiting.label, statusMeta.infoRequested.label]
    const activeLabel = r.status ? statusMeta[r.status].label : null
    const activeStatus = r.status ? statusMeta[r.status] : null
    const accentByLabel: Record<string, AccentKey> = activeLabel ? { [activeLabel]: statusMeta[r.status!].accent } : {}
    // Figma 액션 토글: 현재 상태 하나만 시안 틴트로 "켜지고"(solid=false), 나머지는 회색으로 꽉 채운다(solid=true)
    const solidByLabel: Record<string, boolean> = Object.fromEntries(labels.map((label) => [label, label !== activeLabel]))

    return {
      // no 값이 Figma 샘플 데이터상 중복돼 있어(복붙 흔적) index를 더해 key를 구분
      id: `${r.no}-${index}`,
      cells: {
        no: r.no,
        appliedAt: r.appliedAt,
        parentCode: r.parentCode,
        applicantCode: r.applicantCode,
        country: r.country,
        partnerName: r.partnerName,
        subMerchantCount: r.subMerchantCount,
        monthVolume: r.monthVolume,
        monthTxCount: r.monthTxCount,
        status: activeStatus ? <Badge accent={activeStatus.accent} size="md" shape="rect">{activeStatus.label}</Badge> : '-',
        action: <ActionBadges labels={labels} accentByLabel={accentByLabel} size="md" shape="rect" solidByLabel={solidByLabel} />,
      },
    }
  })

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqRequestPartnerDirect.title')} />
      <StatSection stats={stats} bare />
      <DataTable
        title={t('hqRequestPartnerDirect.section')}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        exportUrl="/api/hq/requests/partner-direct/export"
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
