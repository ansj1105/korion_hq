import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../../../i18n'
import { clearAuthSession } from '../../../services/authSession'
import styles from './TopControls.module.css'

/*
 * TopControls (molecule)
 * ------------------------------------------------------------------
 * 모든 화면 우측 상단 컨트롤: 언어 전환 + 로그아웃.
 * - 언어 버튼: 현재 언어를 표시하고, 클릭하면 한↔영을 전환한다(toggleLang).
 * - 로그아웃: 로그인/회원가입 허브(/login)로 이동(실제 세션 로직은 범위 밖).
 */
export default function TopControls() {
  const { t, toggleLang } = useTranslation()
  const navigate = useNavigate()
  const logout = () => {
    clearAuthSession()
    navigate('/login')
  }

  return (
    <div className={styles.controls}>
      <button type="button" className={styles.button} onClick={toggleLang}>
        {t('common.langCurrent')}
      </button>
      <button type="button" className={styles.button} onClick={logout}>
        {t('common.logout')}
      </button>
    </div>
  )
}
