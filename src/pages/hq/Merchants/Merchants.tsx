import RequestListPage from '../../../components/templates/RequestListPage'
import ActionBadges from '../../../components/molecules/ActionBadges'
import type { TableRow } from '../../../components/organisms/DataTable'
import type { AccentKey } from '../../../types'
import { useTranslation } from '../../../i18n'
import { useMerchants } from './useMerchants'

/** 가맹점 상태 라벨/색 — 파트너/리더 전체 목록과 동일한 액션 토글 배지 규칙 */
const APPROVED_LABEL = '승인'
const SUSPENDED_LABEL = '정지'
const DETAIL_LABEL = '상세'

/*
 * Figma(81:18117) 시안에서 "정지"가 활성인 행 — APP-2397(이탈리아) 하나뿐.
 * 데이터 파일(useMerchants/merchantsData.json)은 다른 브랜치의 API 연동 영역이라
 * 상태 필드를 추가하지 않고 표시 계층에서만 지정한다(실데이터 연동 시 행 status로 교체).
 */
const SUSPENDED_ROW_KEY = 'APP-2397-이탈리아'

/*
 * Merchants (page) — 본사어드민 · 가맹점 관리 · 가맹점 전체 목록
 * ------------------------------------------------------------------
 * RequestListPage 템플릿 재사용. 리더 어드민의 동명 화면과 컬럼이 달라 별도 작성.
 * 액션 컬럼은 Figma(81:18117) 기준 [승인/정지/상세] 상태 토글 배지 —
 * 활성 승인=녹색 틴트, 활성 정지=빨강 솔리드, 나머지·상세는 항상 solid 회색.
 */
export default function Merchants() {
  const { t } = useTranslation()
  const { stats, columns, rows: rawRows } = useMerchants()

  const labels = [APPROVED_LABEL, SUSPENDED_LABEL, DETAIL_LABEL]

  // Figma 샘플은 신청번호가 중복되는 행이 있어(no만으로는 키가 겹침) 국가+순번을 붙여 id를 만든다
  const rows: TableRow[] = rawRows.map((r, i) => {
    const suspended = `${r.no}-${r.country}` === SUSPENDED_ROW_KEY
    const active = suspended
      ? { label: SUSPENDED_LABEL, accent: 'red' as AccentKey, solid: true }
      : { label: APPROVED_LABEL, accent: 'green' as AccentKey, solid: false }
    const accentByLabel: Record<string, AccentKey> = { [active.label]: active.accent }
    const solidByLabel: Record<string, boolean> = Object.fromEntries(
      labels.map((label) => [label, label === active.label ? active.solid : true]),
    )

    return {
      id: `${r.no}-${r.country}-${i}`,
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
        action: <ActionBadges labels={labels} accentByLabel={accentByLabel} solidByLabel={solidByLabel} equalWidth />,
      },
    }
  })

  return (
    <RequestListPage
      title={t('hqMerchantList.title')}
      statsBare
      stats={stats}
      columns={columns}
      rows={rows}
      tableTitle={t('hqMerchantList.section')}
      toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
      toolbarInline
      tableMutedText
      tableHeaderBar
    />
  )
}
