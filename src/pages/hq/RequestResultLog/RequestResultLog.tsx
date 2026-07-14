import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import { useRequestResultLog, type AdminAction } from './useRequestResultLog'
import RequestDetailOverlay from './RequestDetailOverlay'
import styles from './RequestResultLog.module.css'

/** 관리자 행동 enum → 표시 색 클래스 (승인 계열=초록 / 거절 계열=빨강, Figma 기준) */
const ADMIN_ACTION_CLASS: Record<AdminAction, string> = {
  approved: styles.aaGreen,
  approveCancelled: styles.aaGreen,
  rejected: styles.aaRed,
  rejectCancelled: styles.aaRed,
}

const ADMIN_ACTION_ACCENT: Record<AdminAction, 'green' | 'orange' | 'red'> = {
  approved: 'green',
  approveCancelled: 'orange',
  rejected: 'red',
  rejectCancelled: 'orange',
}

/*
 * RequestResultLog (page) — 본사어드민 · 파트너 요청 관리 · 요청 결과 로그 전체내역
 * ------------------------------------------------------------------
 * 승인 요청 4개 화면에서 처리된 결과(승인/거절/취소)의 통합 로그.
 * 관리자 행동 컬럼은 데이터 값이라 글자색만 입힌다(정산 내역 화면과 동일 컨벤션).
 * 액션 배지: 승인 건 → [승인 취소, 상세정보] / 거절 건 → [거절취소, 상세정보] /
 * 이미 취소된 건 → [상세정보]만 (Figma 행별 마크업 기준). 전부 회색 solid.
 * '상세정보' 클릭 시 파트너 정보 오버레이(RequestDetailOverlay)가 열린다. 나머지 배지는 표시 전용.
 */
export default function RequestResultLog() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows, adminActionLabel, actionBadges, section } = useRequestResultLog()
  const [detailOpen, setDetailOpen] = useState(false)

  const detailLabel = t('hqRequestResultLog.action.detail')

  const rows: TableRow[] = rawRows.map((r, index) => {
    const status = r.status ?? r.adminAction

    return {
      // no 값이 Figma 샘플 데이터상 중복돼 있어(복붙 흔적) index를 더해 key를 구분
      id: `${r.no}-${index}`,
      cells: {
        no: r.no,
        appliedAt: r.appliedAt,
        paidAt: r.paidAt,
        requestType: r.requestType,
        parentCode: r.parentCode,
        applicantCode: r.applicantCode,
        country: r.country,
        partnerName: r.partnerName,
        adminAction: <span className={ADMIN_ACTION_CLASS[r.adminAction]}>{adminActionLabel[r.adminAction]}</span>,
        status: <Badge accent={ADMIN_ACTION_ACCENT[status]} size="md" shape="rect">{adminActionLabel[status]}</Badge>,
        action: (
          <ActionBadges
            labels={actionBadges[r.adminAction]}
            accentByLabel={{}}
            size="md"
            shape="rect"
            solid
            equalWidth
            // '상세정보'만 동작(오버레이 열기) — 승인/거절 취소는 표시 전용
            onLabelClick={(label) => label === detailLabel && setDetailOpen(true)}
          />
        ),
      },
    }
  })

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqRequestResultLog.title')} />
      <StatSection stats={stats} bare />
      <DataTable
        title={section}
        columns={columns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        exportUrl="/api/hq/requests/result-log/export"
        paginated
        pageSize={10}
        fill
        inlineToolbar
        mutedText
        headerBar
      />

      {/* 상세정보 오버레이 — 사이드바 제외 영역 중앙에 노출 */}
      <RequestDetailOverlay open={detailOpen} onClose={() => setDetailOpen(false)} />
    </div>
  )
}
