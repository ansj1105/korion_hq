import { useHqPageData } from '../../../hooks/useHqPageData'

export function usePartnerMemo(partnerCode?: string) {
  return useHqPageData(
    `/api/hq/partners/${encodeURIComponent(partnerCode ?? '')}/sales/memo`,
    { memo: '' },
    { partnerCode },
  )
}
