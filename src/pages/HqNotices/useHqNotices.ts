import { useTranslation } from '../../i18n'
import type { Column } from '../../components/organisms/DataTable'
import { useRolePageData } from '../../hooks/useRolePageData'
import data from './hqNoticesData.json'

/** 본사 소식지 행 원본 데이터 형태 */
export interface HqNoticeRow {
  no: string
  author: string
  target: string
  title: string
  sentDate: string
  read: string
}

/*
 * useHqNotices — 본사 소식지(전체공지) 데이터 훅
 * ------------------------------------------------------------------
 * 컬럼 라벨(UI)은 번역, 행 값(공지ID·작성자·제목 등)은 데이터 그대로.
 * 실데이터 연동 시 이 훅 내부만 API 호출로 교체하면 화면은 그대로 동작한다.
 */
export function useHqNotices() {
  const { t } = useTranslation()
  const { data: pageData, isLoading, error } = useRolePageData(
    {
      leader: '/api/leader/hq-notices',
      partner: '/api/partner/hq-notices',
      merchant: '/api/merchant/hq-notices',
    },
    data
  )

  const columns: Column[] = [
    { key: 'no', label: t('hq.col.no'), width: '1fr' },
    { key: 'author', label: t('hq.col.author'), width: '1fr' },
    { key: 'target', label: t('hq.col.target'), width: '1fr' },
    { key: 'title', label: t('hq.col.title'), width: '1.8fr' },
    { key: 'sentDate', label: t('hq.col.sentDate'), width: '1fr' },
    { key: 'read', label: t('hq.col.read'), width: '1fr' },
    { key: 'action', label: t('hq.col.action'), width: '1fr' },
  ]

  return {
    columns,
    rows: pageData.rows as HqNoticeRow[],
    isLoading,
    error,
  }
}
