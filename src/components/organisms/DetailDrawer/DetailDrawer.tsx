import type { ReactNode } from 'react'
import { useTranslation } from '../../../i18n'
import styles from './DetailDrawer.module.css'

interface DetailDrawerProps {
  /** 열림 여부. false면 렌더하지 않는다(언마운트). */
  open: boolean
  /** 닫기(배경 클릭 / 닫기 버튼 / ESC 대용 닫기 버튼) 콜백 */
  onClose: () => void
  /** 헤더 제목 (예: "거래 상세 정보") */
  title: string
  /** 제목 아래 헤더 영역에 추가로 들어갈 내용 (식별자/배지/메타줄 등). 없으면 미표시 */
  headerExtra?: ReactNode
  /** 본문(스크롤 영역) */
  children: ReactNode
  /** 하단 고정 푸터(액션 버튼 줄). 없으면 미표시 */
  footer?: ReactNode
}

/*
 * DetailDrawer (organism)
 * ------------------------------------------------------------------
 * 우측에서 열리는 공용 상세 드로어. [반투명 배경] + [고정 헤더] + [스크롤 본문] + [고정 푸터].
 * - 목록 화면의 "상세" 진입에서 재사용할 수 있게 내용은 전부 props/children으로 주입.
 * - 동작은 열기/닫기만(작업 범위: UI). 배경 클릭과 헤더 닫기 버튼으로 닫는다.
 */
export default function DetailDrawer({ open, onClose, title, headerExtra, children, footer }: DetailDrawerProps) {
  const { t } = useTranslation()
  if (!open) return null

  return (
    <div className={styles.overlay}>
      {/* 배경(스크림) 클릭 시 닫힘 */}
      <button type="button" className={styles.scrim} aria-label={t('common.close')} onClick={onClose} />

      <aside className={styles.panel} role="dialog" aria-modal="true" aria-label={title}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <h2 className={styles.title}>{title}</h2>
            <button type="button" className={styles.closeButton} onClick={onClose}>
              {t('common.close')}
            </button>
          </div>
          {headerExtra}
        </header>

        <div className={styles.body}>{children}</div>

        {footer && <footer className={styles.footer}>{footer}</footer>}
      </aside>
    </div>
  )
}
