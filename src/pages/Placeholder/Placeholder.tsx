import { useTranslation } from '../../i18n'
import styles from './Placeholder.module.css'

interface PlaceholderProps {
  /** 화면 제목의 i18n 키 (사이드바 메뉴 키와 동일) */
  titleKey: string
}

/*
 * Placeholder (page)
 * ------------------------------------------------------------------
 * 아직 구현하지 않은 화면용 임시 페이지.
 * 라우팅·네비게이션을 먼저 동작시키되, 내용은 임의로 채우지 않고
 * "구현 예정"임을 정직하게 표시한다. (화면별로 순차 구현하며 실제 페이지로 교체)
 */
export default function Placeholder({ titleKey }: PlaceholderProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>{t(titleKey)}</h1>
      <p className={styles.note}>{t('common.comingSoon')}</p>
    </div>
  )
}
