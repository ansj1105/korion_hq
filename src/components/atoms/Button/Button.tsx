import type { ButtonHTMLAttributes, ReactNode } from 'react'
import styles from './Button.module.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary: 글로우 CTA / secondary: 보조 (기본 secondary) */
  variant?: 'primary' | 'secondary'
  children: ReactNode
}

/*
 * Button (atom)
 * ------------------------------------------------------------------
 * 공통 버튼. 동작은 화면별로 주입(현재는 UI만이라 핸들러 없을 수 있음).
 */
export default function Button({ variant = 'secondary', className, children, ...rest }: ButtonProps) {
  const base = `${styles.button} ${variant === 'primary' ? styles.primary : styles.secondary}`
  return (
    <button type="button" className={className ? `${base} ${className}` : base} {...rest}>
      {children}
    </button>
  )
}
