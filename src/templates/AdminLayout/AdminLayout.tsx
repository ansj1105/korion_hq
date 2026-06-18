import { Navigate, Outlet } from 'react-router-dom'
import Sidebar from '../../components/organisms/Sidebar'
import { ROLES, type Role } from '../../roles'
import { readAuthSession } from '../../services/authSession'
import styles from './AdminLayout.module.css'

interface AdminLayoutProps {
  /** 이 레이아웃이 담당하는 역할 (라우트 서브트리별로 주입) */
  role: Role
}

/*
 * AdminLayout (template)
 * ------------------------------------------------------------------
 * 리더/파트너 어드민이 공유하는 공통 골격: [사이드바] + [콘텐츠 영역].
 * 역할(role)에 해당하는 메뉴/프로필/라벨을 ROLES에서 꺼내 Sidebar에 주입한다.
 * → 레이아웃·사이드바를 역할마다 따로 만들지 않고 하나로 재사용한다.
 */
export default function AdminLayout({ role }: AdminLayoutProps) {
  const session = readAuthSession()
  const { basePath, roleLabelKey, profileLines, nav } = ROLES[role]

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (session.role !== role) {
    return <Navigate to={`${ROLES[session.role].basePath}/dashboard`} replace />
  }

  return (
    <div className={styles.layout}>
      {/* 배경 장식(네온 글로우) — 기능 없음 */}
      <div className={styles.glow} aria-hidden="true" />

      <Sidebar basePath={basePath} roleLabelKey={roleLabelKey} profileLines={profileLines} nav={nav} />

      <main className={styles.content}>
        <div className={styles.contentInner}>
          {/* 현재 라우트에 해당하는 화면이 여기에 렌더링됨 */}
          <Outlet />
        </div>
      </main>
    </div>
  )
}
