import type { CSSProperties } from 'react'
import { useTranslation } from '../../../i18n'
import styles from './NoticeSendConfirm.module.css'

/** 모달에 요약 표시할 발송 내용 — 값은 작성 폼 상태에서 그대로 주입(데이터라 번역하지 않음) */
export interface NoticeSendSummary {
  noticeTitle: string
  country: string
  /** 선택된 대상 역할 배지(라벨은 번역 완료본, accent는 Figma 실측색) */
  roles: Array<{ key: string; label: string; accent: string }>
  method: string
  scheduleTime: string
  sender: string
  recipients: string
}

interface Props {
  open: boolean
  summary: NoticeSendSummary
  onCancel: () => void
  onConfirm: () => void
}

/*
 * NoticeSendConfirm — "발송하기" 클릭 시 뜨는 공지 발송 확인 모달 (Figma 81:21491 / 80:6523)
 * ------------------------------------------------------------------
 * 별도 라우트 없이 open prop으로만 제어. 사이드바를 제외한 콘텐츠 영역 중앙에 노출
 * (CollateralDetailOverlay와 동일한 backdrop 방식). backdrop 클릭 또는 '취소'로 닫힘.
 * '발송하기' 확정 동작(발송 내역 라우팅)은 부모가 onConfirm으로 주입한다.
 */
export default function NoticeSendConfirm({ open, summary, onCancel, onConfirm }: Props) {
  const { t } = useTranslation()

  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      {/* stopPropagation: 패널 안 클릭이 backdrop 클릭으로 버블링되지 않도록 */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('hqNoticeSend.confirm.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.title}>{t('hqNoticeSend.confirm.title')}</h2>
        <p className={styles.desc}>{t('hqNoticeSend.confirm.desc')}</p>

        {/* 발송 내용 요약 — 2열 읽기 전용 그리드 (대상 역할 줄만 전체 폭) */}
        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeSend.form.noticeTitle')}</span>
            <span className={styles.fieldValue}>{summary.noticeTitle}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeSend.confirm.targetCountry')}</span>
            <span className={styles.fieldValue}>{summary.country}</span>
          </div>

          <div className={`${styles.field} ${styles.rolesField}`}>
            <span className={styles.fieldLabel}>{t('hqNoticeSend.form.targetRole')}</span>
            <div className={styles.rolesRow}>
              {summary.roles.map((r) => (
                <span key={r.key} style={{ '--chip': r.accent } as CSSProperties} className={styles.roleBadge}>
                  ✓ {r.label}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeSend.confirm.sendMethod')}</span>
            <span className={styles.fieldValue}>{summary.method}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeSend.confirm.scheduleTime')}</span>
            <span className={styles.fieldValue}>{summary.scheduleTime}</span>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeSend.confirm.sender')}</span>
            <span className={styles.fieldValue}>{summary.sender}</span>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeSend.confirm.recipients')}</span>
            <span className={styles.fieldValue}>{summary.recipients}</span>
          </div>
        </div>

        {/* 발송 후 되돌릴 수 없음 경고 (호박색 박스) */}
        <div className={styles.warning}>{t('hqNoticeSend.confirm.warning')}</div>

        <div className={styles.buttons}>
          <button type="button" className={styles.cancelButton} onClick={onCancel}>
            {t('hqNoticeSend.form.cancel')}
          </button>
          <button type="button" className={styles.sendButton} onClick={onConfirm}>
            {t('hqNoticeSend.form.send')}
          </button>
        </div>
      </div>
    </div>
  )
}
