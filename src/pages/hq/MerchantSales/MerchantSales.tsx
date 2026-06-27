import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Card from '../../../components/atoms/Card'
import InfoGrid from '../../../components/molecules/InfoGrid'
import FilterTabs from '../../../components/molecules/FilterTabs'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useTranslation } from '../../../i18n'
import { useMerchantSales } from './useMerchantSales'
import styles from './MerchantSales.module.css'

/*
 * MerchantSales (page) — 본사어드민 · 가맹점 관리 · 가맹점별 거래내역
 * ------------------------------------------------------------------
 * LeaderSales/PartnerSales와 같은 구조(전체 거래 로그 + 특정 가맹점 프로필+탭).
 * 탭 내용은 "구현 예정"으로 둠 — LeaderSales 주석/CHANGELOG.md 참고.
 */
export default function MerchantSales() {
  const { t } = useTranslation()
  const { miniStats, logColumns, logRows, profile, accountInfo } = useMerchantSales()
  const [tab, setTab] = useState(0)

  const rows: TableRow[] = logRows.map((r) => ({
    id: r.txNo,
    cells: {
      txNo: r.txNo,
      partnerCode: r.partnerCode,
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
    t('hqMerchantSales.tab.merchants'),
    t('hqMerchantSales.tab.history'),
    t('hqMerchantSales.tab.settlement'),
    t('hqMerchantSales.tab.memo'),
  ]

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqMerchantSales.title')} />
      <StatSection stats={miniStats} />
      <DataTable
        title={t('hqMerchantSales.logTitle')}
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
        <p className={styles.tabPlaceholder}>{t('common.comingSoon')}</p>
      </Card>
    </div>
  )
}
