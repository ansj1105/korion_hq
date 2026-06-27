import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Card from '../../../components/atoms/Card'
import InfoGrid from '../../../components/molecules/InfoGrid'
import FilterTabs from '../../../components/molecules/FilterTabs'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import { useLeaderSales } from './useLeaderSales'
import styles from './LeaderSales.module.css'

/*
 * LeaderSales (page) — 본사어드민 · 국가 리더 관리 · 국가 리더별 거래내역
 * ------------------------------------------------------------------
 * ① 전체 거래 로그 표 + ② 특정 리더 1명의 프로필(탭 4개)로 구성된 화면.
 * 탭(가맹점별/거래내역/정산내역/관리자메모)은 클릭으로 전환되지만, Figma에서
 * 탭별 구체 내용까지는 다 확인하지 못해 이번 단계는 UI 전환만 두고
 * 내용은 "구현 예정"으로 둔다(사용자 확인됨, CHANGELOG.md Phase 1 참고).
 */
export default function LeaderSales() {
  const { t } = useTranslation()
  const { miniStats, logColumns, logRows, profile, accountInfo } = useLeaderSales()
  const [tab, setTab] = useState(0)

  const rows: TableRow[] = logRows.map((r) => ({
    id: r.txNo,
    cells: {
      txNo: r.txNo,
      leaderCode: r.leaderCode,
      txAt: r.txAt,
      merchantCode: r.merchantCode,
      merchantName: r.merchantName,
      amount: r.amount,
      method: r.method,
      fee: r.fee,
      net: r.net,
      status: r.status,
      syncStatus: r.syncStatus,
      action: <ActionBadges labels={r.actions} />,
    },
  }))

  const tabLabels = [
    t('hqLeaderSales.tab.merchants'),
    t('hqLeaderSales.tab.history'),
    t('hqLeaderSales.tab.settlement'),
    t('hqLeaderSales.tab.memo'),
  ]

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqLeaderSales.title')} />
      <StatSection stats={miniStats} />
      <DataTable
        title={t('hqLeaderSales.logTitle')}
        columns={logColumns}
        rows={rows}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
      />

      <Card className={styles.profilePanel}>
        <div className={styles.profileHead}>
          <span className={styles.profileCode}>{profile.code}</span>
          <span className={styles.profileMeta}>{profile.country}</span>
          <span className={styles.profileMeta}>{profile.parent}</span>
        </div>

        <InfoGrid items={accountInfo} />

        <FilterTabs labels={tabLabels} activeIndex={tab} onChange={setTab} />
        {/* "가맹점별" 탭(0)도 구체 내용 미확인 — 4개 탭 전부 전환 UI만 두고 내용은 추후 채움 */}
        <p className={styles.tabPlaceholder}>{t('common.comingSoon')}</p>
      </Card>
    </div>
  )
}
