import { useTranslation } from '../../../i18n'
import type { StatCardData } from '../../../components/molecules/StatCard'
import data from './noticeSendData.json'

interface KpiRaw {
  id: string
  labelKey: string
  value: string
  noteKey?: string
}

/** 폼 기본값(발송자/예약 일시/작성 중 제목·본문 예시)은 데이터라 번역하지 않고 그대로 통과한다. */
export interface NoticeSendForm {
  sender: string
  sendDate: string
  sendTime: string
  timezone: string
  /** 발송 확인 모달의 "예상 수신자 수" (Figma 시안 값) */
  recipients: string
  noticeTitle: string
  noticeBody: string
}

/*
 * useNoticeSend — 본사어드민 "알림 / 공지 - 공지 보내기" 데이터 훅
 * ------------------------------------------------------------------
 * noticeSendData.json(더미)을 읽어 KPI 라벨/부가설명(UI 텍스트)만 번역해 반환한다.
 * 추후 실 연동 시 이 훅 내부만 API 호출로 교체하면 NoticeSend.tsx는 그대로 동작한다.
 */
export function useNoticeSend() {
  const { t } = useTranslation()

  const kpis: StatCardData[] = (data.kpis as KpiRaw[]).map((k) => ({
    id: k.id,
    label: t(k.labelKey),
    value: k.value,
    delta: k.noteKey ? t(k.noteKey) : undefined,
  }))

  return { kpis, form: data.form as NoticeSendForm }
}
