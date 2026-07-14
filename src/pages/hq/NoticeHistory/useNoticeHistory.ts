import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import type { Column } from '../../../components/organisms/DataTable'
import data from './noticeHistoryData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
}

/** 행 데이터(제목/국가/대상/발송방식·상태 enum 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 그대로 통과한다. */
export interface NoticeHistoryRow {
  no: string
  sentAt: string
  title: string
  country: string
  target: string
  recipients: string
  method: string
  status: string
}

/** 상세 오버레이 전용 값(발송자/성공·실패 수/본문) — 목록 행에 없는 항목만 별도 보관 */
export interface NoticeDetailExtra {
  sender: string
  success: string
  fail: string
  rate: string
  body: string
}

/*
 * useNoticeHistory — 본사어드민 "알림 / 공지 - 발송 내역" 데이터 훅
 * ------------------------------------------------------------------
 * noticeHistoryData.json(더미)을 읽어 UI 라벨(지표명/컬럼명)만 번역해 반환한다.
 * KPI 5장은 공지 보내기 화면과 동일 항목이라 hqNoticeSend.kpi.* 키를 재사용한다.
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체하면 NoticeHistory.tsx는 그대로 동작한다.
 */
export function useNoticeHistory() {
  const { t } = useTranslation()

  const kpis: StatCardData[] = (data.kpis as KpiRaw[]).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: k.noteKey ? t(k.noteKey) : undefined,
  }))

  // 컬럼 폭은 Figma 실측 px(49/65/405/69/125/69/46/48/128)의 상대 비율
  const columns: Column[] = [
    { key: 'no', label: t('hqNoticeHistory.col.no'), width: '0.5fr' },
    { key: 'sentAt', label: t('hqNoticeHistory.col.sentAt'), width: '0.65fr' },
    { key: 'title', label: t('hqNoticeHistory.col.title'), width: '4.05fr' },
    { key: 'country', label: t('hqNoticeHistory.col.country'), width: '0.7fr' },
    { key: 'target', label: t('hqNoticeHistory.col.target'), width: '1.25fr' },
    { key: 'recipients', label: t('hqNoticeHistory.col.recipients'), width: '0.7fr' },
    { key: 'method', label: t('hqNoticeHistory.col.method'), width: '0.46fr' },
    { key: 'status', label: t('hqNoticeHistory.col.status'), width: '0.48fr' },
    { key: 'action', label: t('hqNoticeHistory.col.action'), width: '1.28fr' },
  ]

  return {
    kpis,
    columns,
    rows: data.history.rows as NoticeHistoryRow[],
    detail: data.detail as NoticeDetailExtra,
  }
}
