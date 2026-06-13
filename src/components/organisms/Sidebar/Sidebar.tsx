import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from '../../../i18n'
import { LEADER_NAV } from './navConfig'
import styles from './Sidebar.module.css'

/*
 * Sidebar (organism)
 * ------------------------------------------------------------------
 * 리더 어드민 전 화면이 공유하는 좌측 고정 내비게이션.
 * - 메뉴 구조는 navConfig.ts에서 분리 관리 (UI와 데이터 분리).
 * - 활성 표시는 두 단계로 동작한다 (Figma 디자인 기준):
 *   1) 현재 화면이 속한 "그룹 카드" 전체가 보라색으로 강조된다.
 *   2) 그 안에서 현재 화면에 해당하는 "하위 항목" 텍스트가 시안색으로 강조된다.
 *
 * 표시되는 리더 정보(국가/코드)는 Figma 샘플 값을 그대로 하드코딩.
 * (실제 로그인 사용자 데이터 연동은 작업 범위 밖)
 */
export default function Sidebar() {
  // 현재 경로 — 어떤 그룹이 활성인지 판단하는 데 사용
  const { pathname } = useLocation()
  const { t } = useTranslation()

  return (
    <aside className={styles.sidebar}>
      {/* 상단 브랜드 + 리더 프로필 카드
          (Figma상 브랜드/역할/프로필/전체목록/메뉴가 모두 동일 간격 8의 형제 요소라
           래퍼로 묶지 않고 사이드바의 flex gap이 직접 적용되게 둔다) */}
      <div className={styles.brand}>{t('common.brand')}</div>
      <div className={styles.role}>{t('common.role')}</div>

      <div className={styles.profileCard}>
        <div className={styles.profileCountry}>Race / Nigeria</div>
        <div className={styles.profileCode}>코드: NG-LEAD-001</div>
      </div>

      {/* "전체 목록" — 동작 미확정이라 우선 비클릭 라벨 (Sidebar.module.css 주석 참고) */}
      <div className={styles.allLabel}>{t('common.allList')}</div>

      {/* 메뉴 그룹 목록 */}
      <nav className={styles.nav}>
        {LEADER_NAV.map((group) => {
          // 그룹에 속한 항목 중 하나라도 현재 경로면 그룹 전체를 활성 처리
          const isGroupActive = group.items.some((item) => item.path === pathname)

          return (
            <div
              key={group.titleKey}
              className={isGroupActive ? `${styles.group} ${styles.groupActive}` : styles.group}
            >
              <div
                className={
                  isGroupActive ? `${styles.groupTitle} ${styles.groupTitleActive}` : styles.groupTitle
                }
              >
                {t(group.titleKey)}
              </div>

              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  // NavLink는 현재 URL과 일치할 때 isActive=true → 항목 텍스트를 시안으로 강조
                  className={({ isActive }) =>
                    isActive ? `${styles.item} ${styles.itemActive}` : styles.item
                  }
                >
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
