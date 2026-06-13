import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './templates/AdminLayout'
import Placeholder from './pages/Placeholder'
import Dashboard from './pages/Dashboard'
import RequestsPartner from './pages/RequestsPartner'
import RequestsMerchant from './pages/RequestsMerchant'
import Partners from './pages/Partners'
import PartnerSales from './pages/PartnerSales'
import Merchants from './pages/Merchants'
import MerchantSales from './pages/MerchantSales'
import TransactionLog from './pages/Transactions'
import SettlementRequest from './pages/SettlementRequest'
import SettlementHistory from './pages/SettlementHistory'
import SettlementDetail from './pages/SettlementDetail'
import HqNotices from './pages/HqNotices'
import NoticeHistory from './pages/NoticeHistory'
import NoticeSend from './pages/NoticeSend'
import ActivityLog from './pages/ActivityLog'
import Profile from './pages/Profile'
import PartnerDashboard from './pages/partner/Dashboard'
import { ROLES } from './roles'
import type { NavGroup } from './types'

/*
 * 구현된 화면의 "상대 경로(basePath 기준) → 컴포넌트" 매핑.
 * 역할별로 따로 둔다. 매핑에 없는 메뉴는 Placeholder("구현 예정")로 라우팅된다.
 */
const LEADER_PAGES: Record<string, JSX.Element> = {
  dashboard: <Dashboard />,
  'requests/partner': <RequestsPartner />,
  'requests/merchant': <RequestsMerchant />,
  partners: <Partners />,
  'partners/sales': <PartnerSales />,
  merchants: <Merchants />,
  'merchants/sales': <MerchantSales />,
  transactions: <TransactionLog variant="all" />,
  'transactions/offline': <TransactionLog variant="offline" />,
  'transactions/failed': <TransactionLog variant="failed" />,
  'settlement/request': <SettlementRequest />,
  'settlement/history': <SettlementHistory />,
  'hq-notices': <HqNotices />,
  'notices/send': <NoticeSend />,
  'notices/history': <NoticeHistory />,
  'settings/profile': <Profile />,
  'settings/activity-log': <ActivityLog />,
}

// 파트너 화면은 골격 검증 후 하나씩 채운다(나머지는 Placeholder).
const PARTNER_PAGES: Record<string, JSX.Element> = {
  dashboard: <PartnerDashboard />,
}

/** nav(그룹/항목) → 상대 경로 자식 라우트 배열. 미구현은 Placeholder. */
function navRoutes(nav: NavGroup[], pages: Record<string, JSX.Element>) {
  return nav
    .flatMap((g) => g.items)
    .map((item) => (
      <Route
        key={item.path}
        path={item.path}
        element={pages[item.path] ?? <Placeholder titleKey={item.labelKey} />}
      />
    ))
}

/*
 * App — 라우트 정의
 * ------------------------------------------------------------------
 * 역할 레지스트리(ROLES)를 SSOT로 삼아 /leader/*, /partner/* 두 서브트리를 생성한다.
 * 각 서브트리는 AdminLayout(role)로 감싸고, 사이드바 메뉴(nav)에서 자식 라우트를 자동 생성한다.
 * 추후 로그인이 생기면 진입 시 역할에 따라 해당 basePath로 분기한다(현재는 leader로 redirect).
 */
export default function App() {
  return (
    <Routes>
      {/* 진입("/") → 현재는 리더 대시보드로. (로그인 도입 시 역할 분기로 교체) */}
      <Route index element={<Navigate to="/leader/dashboard" replace />} />

      {/* 리더 어드민 */}
      <Route path={ROLES.leader.basePath} element={<AdminLayout role="leader" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        {navRoutes(ROLES.leader.nav, LEADER_PAGES)}
        {/* 사이드바엔 없는 상세 화면 (정산 내역의 "상세"에서 진입) */}
        <Route path="settlement/history/detail" element={<SettlementDetail />} />
      </Route>

      {/* 파트너 어드민 (화면은 단계적으로 구현) */}
      <Route path={ROLES.partner.basePath} element={<AdminLayout role="partner" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        {navRoutes(ROLES.partner.nav, PARTNER_PAGES)}
        <Route
          path="settlement/history/detail"
          element={
            PARTNER_PAGES['settlement/history/detail'] ?? (
              <Placeholder titleKey="nav.item.settlementHistory" />
            )
          }
        />
      </Route>

      {/*
        가맹점 회원가입(Admin Auth 폼)은 사이드바 없는 독립 화면으로 추정되어
        레이아웃 밖 라우트로 분리해 둠. (구현 단계에서 레이아웃 포함 여부 확정)
      */}
      <Route path="/merchant-signup" element={<Placeholder titleKey="page.merchantSignup" />} />

      {/* 정의되지 않은 경로는 리더 대시보드로 폴백 */}
      <Route path="*" element={<Navigate to="/leader/dashboard" replace />} />
    </Routes>
  )
}
