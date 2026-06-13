import type { ReactNode } from 'react'
import { useTranslation } from '../../../i18n'
import styles from './AuthShell.module.css'

interface AuthShellProps {
  /** 큰 화면 제목 (예: "로그인 / 회원가입 메인", "리더 로그인") */
  title: string
  /** 브랜드 아래 한 줄 설명 */
  subtitle: string
  children: ReactNode
}

/*
 * AuthShell (auth 공통 레이아웃)
 * ------------------------------------------------------------------
 * 로그인/회원가입 화면이 공유하는 골격: 배경 글로우 + 브랜드 헤더(+언어 토글) + 제목 + 콘텐츠.
 * 사이드바 없는 공개 화면이라 AdminLayout과 별개의 셸을 둔다.
 */
export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  const { t, toggleLang } = useTranslation()

  return (
    <div className={styles.page}>
      {/* 배경 네온 글로우 (장식, 기능 없음) */}
      <div className={`${styles.glow} ${styles.glowPurple}`} aria-hidden="true" />
      <div className={`${styles.glow} ${styles.glowCyan}`} aria-hidden="true" />

      <div className={styles.inner}>
        <header className={styles.header}>
          <div className={styles.brandRow}>
            <span className={styles.brand}>{t('auth.brand')}</span>
            {/* 언어 토글만 (로그아웃은 로그인 후에만 의미) */}
            <button type="button" className={styles.langButton} onClick={toggleLang}>
              {t('common.langCurrent')}
            </button>
          </div>
          <p className={styles.subtitle}>{subtitle}</p>
          <h1 className={styles.title}>{title}</h1>
        </header>

        {children}
      </div>
    </div>
  )
}
