import { useTranslation } from '../../../i18n'
import type { InfoItem } from '../../../components/molecules/InfoGrid'
import type { Column } from '../../../components/organisms/DataTable'
import { usePartnerPageData } from '../../../hooks/usePartnerPageData'
import data from './partnerSettlementDetailData.json'

interface FieldRaw {
  labelKey: string
  value: string
  color?: string
}

/*
 * usePartnerSettlementDetail — 파트너 · 정산 상세 데이터 훅
 * ------------------------------------------------------------------
 * 리더 상세와 달리 섹션이 A·B·C·D(직계약 가맹점 섹션 없음)이고 B는 5필드.
 * A 기본정보 / B 금액요약(InfoGrid), C 가맹점별 자동 정산 / D 보류·제외(서브 테이블).
 */
export function usePartnerSettlementDetail() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = usePartnerPageData('/api/partner/settlements/detail', data)

  const toItems = (fields: FieldRaw[]): InfoItem[] =>
    fields.map((f) => ({ label: t(f.labelKey), value: f.value, valueColor: f.color }))

  const merchantColumns: Column[] = [
    { key: 'name', label: t('pdetail.c.name'), width: '1.2fr' },
    { key: 'code', label: t('pdetail.c.code'), width: '1.1fr' },
    { key: 'amount', label: t('pdetail.c.amount'), width: '1fr' },
    { key: 'fee', label: t('pdetail.c.fee'), width: '1fr' },
    { key: 'status', label: t('pdetail.c.status'), width: '1fr' },
    { key: 'paidDate', label: t('pdetail.c.paidDate'), width: '0.9fr' },
    { key: 'detail', label: t('pdetail.c.detail'), width: '0.7fr' },
  ]

  const heldColumns: Column[] = [
    { key: 'txNo', label: t('pdetail.d.txNo'), width: '1fr' },
    { key: 'merchant', label: t('pdetail.d.merchant'), width: '1.2fr' },
    { key: 'partner', label: t('pdetail.d.partner'), width: '1.1fr' },
    { key: 'reason', label: t('pdetail.d.reason'), width: '1.1fr' },
    { key: 'amount', label: t('pdetail.d.amount'), width: '1fr' },
    { key: 'heldFee', label: t('pdetail.d.heldFee'), width: '1fr' },
    { key: 'status', label: t('pdetail.d.status'), width: '1fr' },
  ]

  return {
    no: pageData.no,
    status: pageData.status,
    basicInfo: toItems(pageData.basicInfo as FieldRaw[]),
    amountSummary: toItems(pageData.amountSummary as FieldRaw[]),
    merchantColumns,
    merchantRows: pageData.merchantRows as Array<Record<string, string>>,
    heldColumns,
    heldRows: pageData.heldRows as Array<Record<string, string>>,
    isLoading,
    error,
  }
}
