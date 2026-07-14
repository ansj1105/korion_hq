import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Badge from '../../../components/atoms/Badge'
import type { AccentKey } from '../../../types'
import { useTranslation } from '../../../i18n'
import { useRequestsLeader } from './useRequestsLeader'
import styles from './RequestsLeader.module.css'

/*
 * RequestsLeader (page) — 본사어드민 · 파트너 요청 관리 · 리더 승인 요청
 * ------------------------------------------------------------------
 * RequestListPage 템플릿은 테이블 아래 캡션 슬롯이 없어(다른 화면과 공유 중이라
 * 임의로 손대지 않음) 이 화면은 organism(PageHeader/StatSection/DataTable)을 직접 조합한다.
 * 액션 컬럼은 Applications(신청서 관리) 화면과 같은 패턴: 라벨 5개(승인/거절/검토중/대기/
 * 자료요청)는 항상 고정으로 보이고, 그 행의 현재 상태 하나만 색이 켜진다.
 */
export default function RequestsLeader() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows, statusMeta, approveLabel, rejectLabel } = useRequestsLeader()

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
        action: <ActionBadges labels={labels} accentByLabel={accentByLabel} size="xs" solidByLabel={solidByLabel} equalWidth />,
      },
    }
  })

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqRequestLeader.title')} />
      <StatSection stats={stats} bare />
      <DataTable
        title={t('hqRequestLeader.section')}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        fill
        inlineToolbar
        mutedText
        headerBar
      />
    </div>
  )
}
