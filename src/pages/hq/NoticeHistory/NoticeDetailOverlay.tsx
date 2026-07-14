import { useTranslation } from '../../../i18n'
import type { NoticeDetailExtra, NoticeHistoryRow } from './useNoticeHistory'
import styles from './NoticeDetailOverlay.module.css'

interface Props {
  /** 클릭된 발송 내역 행 — null이면 오버레이 미표시 */
  row: NoticeHistoryRow | null
  /** 목록 행에 없는 상세 전용 값(발송자/성공·실패 수/본문) */
  extra: NoticeDetailExtra
  onClose: () => void
}

/*
 * NoticeDetailOverlay — 발송 내역 행 클릭 시 뜨는 공지 발송 상세 폼 (Figma 81:29690)
 * ------------------------------------------------------------------
 * 별도 라우트 없이 row prop으로만 제어. 사이드바를 제외한 콘텐츠 영역 중앙에 노출
 * (CollateralDetailOverlay와 동일한 backdrop 방식). backdrop 클릭 또는 '취소'로 닫힘.
 * 공지 ID/발송일시/국가 등은 클릭한 행 값을 그대로 표시하고,
 * '발송취소'/'발송하기' 버튼은 동작 협의 전이라 UI만(CLAUDE.md 1번 규칙).
 */
export default function NoticeDetailOverlay({ row, extra, onClose }: Props) {
  const { t } = useTranslation()

  if (!row) return null

  // 상태 배지 색 — 예약대기=호박(Figma 실측 #fbbf24 계열), 완료=초록. 상태 문자열은 데이터라 번역하지 않음
  const badgeClass = row.status === '예약대기' ? styles.badgeAmber : styles.badgeGreen

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {/* stopPropagation: 패널 안 클릭이 backdrop 클릭으로 버블링되지 않도록 */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('hqNoticeHistory.detail.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>{t('hqNoticeHistory.detail.title')}</h2>
          <span className={`${styles.badge} ${badgeClass}`}>{row.status}</span>
        </div>

        {/* 발송 정보 2열 그리드 — 값은 클릭한 행 + 상세 전용 값(성공/실패 등) */}
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeSend.form.sender')}</span>
            <span className={styles.fieldValue}>{extra.sender}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeHistory.detail.noticeId')}</span>
            <span className={styles.fieldValue}>{row.no}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeSend.confirm.sendMethod')}</span>
            <span className={styles.fieldValue}>{row.method}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeHistory.col.sentAt')}</span>
            <span className={styles.fieldValue}>{row.sentAt}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeHistory.detail.countryTarget')}</span>
            <span className={styles.fieldValue}>{row.country}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeHistory.detail.expectedRecipients')}</span>
            <span className={styles.fieldValue}>{row.recipients}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeHistory.detail.success')}</span>
            <span className={styles.fieldValue}>{extra.success}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeHistory.detail.fail')}</span>
            <span className={styles.fieldValue}>{extra.fail}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeHistory.detail.rate')}</span>
            <span className={styles.fieldValue}>{extra.rate}</span>
          </div>
        </div>

        {/* 공지 제목 — 전체 폭 값 박스 */}
        <div className={`${styles.field} ${styles.titleField}`}>
          <span className={styles.fieldLabel}>{t('hqNoticeSend.form.noticeTitle')}</span>
          <span className={styles.fieldValue}>{row.title}</span>
        </div>

        {/* 공지 본문 — 큰 읽기 전용 박스 (Figma h341 / radius 16) */}
        <div className={`${styles.field} ${styles.bodyField}`}>
          <span className={styles.fieldLabel}>{t('hqNoticeSend.form.noticeBody')}</span>
          <div className={styles.contentBox}>{extra.body}</div>
        </div>

        {/* 하단 버튼 — 좌측 "발송취소"(빨강) + 가운데 "취소"/"발송하기" (Figma 배치) */}
        <div className={styles.footer}>
          <button type="button" className={styles.cancelSendButton}>
            {t('hqNoticeHistory.action.cancelSend')}
          </button>
          <div className={styles.centerButtons}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              {t('hqNoticeSend.form.cancel')}
            </button>
            <button type="button" className={styles.sendButton}>
              {t('hqNoticeSend.form.send')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
