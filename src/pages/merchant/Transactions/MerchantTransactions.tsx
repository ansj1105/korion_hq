import SalesPage, { type SalesTable } from '../../../components/templates/SalesPage'
import type { TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useMerchantSales } from '../../MerchantSales/useMerchantSales'

/*
 * MerchantTransactions (page) — 가맹점 · 거래 로그 · 전체 거래 내역
 * ------------------------------------------------------------------
 * Figma상 KPI 8 + '가맹점 매출' 테이블 1개. 이 데이터(지표/행)는 리더 가맹점별 매출의
 * 지표 + 가맹점 매출(t2) 테이블과 동일하여 useMerchantSales 훅을 재사용한다.
 * (리더 화면은 테이블 2개지만, 가맹점 화면은 가맹점 매출 테이블 1개만 표시.)
 */
interface MerchantTransactionsProps {
  variant?: 'all' | 'refund'
}

export default function MerchantTransactions({ variant = 'all' }: MerchantTransactionsProps) {
  const { t } = useTranslation()
  const { stats, t2 } = useMerchantSales(variant)
  const toolbar = [t('common.search'), t('common.filter'), t('common.excel')]

  const rows: TableRow[] = t2.rows.map((r) => ({
    id: r.merchantCode,
    cells: {
      no: r.no,
      partner: r.partner,
      merchantCode: r.merchantCode,
      merchantName: r.merchantName,
      amount: r.amount,
      monthCount: r.monthCount,
      recentPay: r.recentPay,
      fee: r.fee,
      unsettledFee: r.unsettledFee,
      recentPay2: r.recentPay2,
      qrUsage: r.qrUsage,
    },
  }))

  const tables: SalesTable[] = [{ id: 't2', title: t2.title, columns: t2.columns, rows, toolbar }]

  return (
    <SalesPage
      title={t('merchantList.title')}
      sectionTitle={t('merchantSales.section')}
      stats={stats}
      tables={tables}
    />
  )
}
