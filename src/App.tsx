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
import PartnerRequestsMerchant from './pages/partner/RequestsMerchant'
import MerchantDetail from './pages/partner/MerchantDetail'
import PartnerSettlementRequest from './pages/partner/SettlementRequest'
import PartnerNoticeSend from './pages/partner/NoticeSend'
import PartnerProfile from './pages/partner/Profile'
import MerchantProfile from './pages/merchant/Profile'
import MerchantDashboard from './pages/merchant/Dashboard'
import MerchantTransactions from './pages/merchant/Transactions'
import AuthMain from './pages/auth/AuthMain'
import RoleLogin from './pages/auth/RoleLogin'
import RoleSignup from './pages/auth/RoleSignup'
import PartnerSettlementHistory from './pages/partner/SettlementHistory'
import PartnerSettlementDetail from './pages/partner/SettlementDetail'
import HqLeaders from './pages/hq/Leaders'
import HqPartners from './pages/hq/Partners'
import HqMerchants from './pages/hq/Merchants'
import HqLeaderSales from './pages/hq/LeaderSales'
import HqPartnerSales from './pages/hq/PartnerSales'
import HqMerchantSales from './pages/hq/MerchantSales'
import { ROLES } from './roles'
import type { NavGroup } from './types'

/*
 * 구현된 화면의 "상대 경로(basePath 기준) → 컴포넌트" 매핑.
 * 역할별로 따로 둔다. 매핑에 없는 메뉴는 Placeholder("구현 예정")로 라우팅된다.
 */

// 본사어드민 화면 — 단계별(Phase)로 하나씩 채운다(나머지는 Placeholder).
// Phase 1: 국가 리더/파트너/가맹점 "전체 목록"(목록형, 기존 템플릿 100% 재사용).
const HQ_PAGES: Record<string, JSX.Element> = {
  leaders: <HqLeaders />,
  'leaders/sales': <HqLeaderSales />,
  partners: <HqPartners />,
  'partners/sales': <HqPartnerSales />,
  merchants: <HqMerchants />,
  'merchants/sales': <HqMerchantSales />,
}

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

// 가맹점 화면 — 골격 검증 후 하나씩 채운다(나머지는 Placeholder).
const MERCHANT_PAGES: Record<string, JSX.Element> = {
  dashboard: <MerchantDashboard />,
  transactions: <MerchantTransactions />,
  'transactions/refund': <MerchantTransactions variant="refund" />,
  'settlement/history': <SettlementHistory />,
  // 전체 공지(파트너 소식지)는 리더 본사 소식지와 동일 → 재사용.
  'hq-notices': <HqNotices />,
  'settings/profile': <MerchantProfile />,
  'settings/activity-log': <ActivityLog />,
}

// 파트너 화면은 골격 검증 후 하나씩 채운다(나머지는 Placeholder).
const PARTNER_PAGES: Record<string, JSX.Element> = {
  dashboard: <PartnerDashboard />,
  'requests/merchant': <PartnerRequestsMerchant />,
  // 가맹점 전체 목록·가맹점별 매출은 Figma상 리더 화면과 데이터·구조가 동일 →
  // 리더 컴포넌트를 그대로 재사용. (추후 데이터가 달라지면 src/pages/partner/* 로 분리)
  merchants: <Merchants />,
  'merchants/sales': <MerchantSales />,
  'settlement/request': <PartnerSettlementRequest />,
  'settlement/history': <PartnerSettlementHistory />,
  'settlement/history/detail': <PartnerSettlementDetail />,
  // 리더 소식지 페이지 내용은 리더 본사 소식지와 동일(사이드바 그룹명만 다름) → 재사용.
  'hq-notices': <HqNotices />,
  'notices/send': <PartnerNoticeSend />,
  // 발송 내역·활동 로그는 Figma상 리더 화면과 동일 → 리더 컴포넌트 재사용.
  'notices/history': <NoticeHistory />,
  'settings/profile': <PartnerProfile />,
  'settings/activity-log': <ActivityLog />,
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
      {/* 진입("/") → 로그인/회원가입 허브 */}
      <Route index element={<Navigate to="/login" replace />} />

      {/* 공개(사이드바 없는) 인증 화면 */}
      <Route path="/login" element={<AuthMain />} />
      <Route path="/login/:role" element={<RoleLogin />} />
      <Route path="/signup/:role" element={<RoleSignup />} />

      {/* 본사 어드민 — 로그인 허브에 카드를 노출하지 않음(URL 직접 접근만). 화면은 단계적으로 구현. */}
      <Route path={ROLES.hq.basePath} element={<AdminLayout role="hq" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        {navRoutes(ROLES.hq.nav, HQ_PAGES)}
      </Route>

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
        {/* 가맹점 가입 요청의 "상세" → 가맹점 정보 화면 (사이드바엔 없는 하위 경로) */}
        <Route path="requests/merchant/detail" element={<MerchantDetail />} />
        <Route
          path="settlement/history/detail"
          element={
            PARTNER_PAGES['settlement/history/detail'] ?? (
              <Placeholder titleKey="nav.item.settlementHistory" />
            )
          }
        />
      </Route>

      {/* 가맹점 어드민 (화면은 단계적으로 구현) */}
      <Route path={ROLES.merchant.basePath} element={<AdminLayout role="merchant" />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        {navRoutes(ROLES.merchant.nav, MERCHANT_PAGES)}
      </Route>

      {/*
        가맹점 회원가입(Admin Auth 폼)은 사이드바 없는 독립 화면으로 추정되어
        레이아웃 밖 라우트로 분리해 둠. (구현 단계에서 레이아웃 포함 여부 확정)
      */}
      <Route path="/merchant-signup" element={<Placeholder titleKey="page.merchantSignup" />} />

      {/* 정의되지 않은 경로는 로그인 허브로 폴백 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
