import { Navigate, Route, Routes } from 'react-router-dom'
import LeaderLayout from './templates/LeaderLayout'
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
import { LEADER_NAV } from './components/organisms/Sidebar/navConfig'

/*
 * 구현 완료된 화면의 path → 컴포넌트 매핑.
 * 여기에 등록된 path는 실제 페이지로, 나머지는 Placeholder로 라우팅된다.
 * 화면을 새로 구현할 때마다 이 맵에 한 줄 추가하면 된다.
 */
const IMPLEMENTED_PAGES: Record<string, JSX.Element> = {
  '/dashboard': <Dashboard />,
  '/requests/partner': <RequestsPartner />,
  '/requests/merchant': <RequestsMerchant />,
  '/partners': <Partners />,
  '/partners/sales': <PartnerSales />,
  '/merchants': <Merchants />,
  '/merchants/sales': <MerchantSales />,
  '/transactions': <TransactionLog variant="all" />,
  '/transactions/offline': <TransactionLog variant="offline" />,
  '/transactions/failed': <TransactionLog variant="failed" />,
  '/settlement/request': <SettlementRequest />,
}

/*
 * App — 라우트 정의
 * ------------------------------------------------------------------
 * 사이드바 메뉴(navConfig)를 단일 출처(SSOT)로 삼아 라우트를 자동 생성한다.
 * → 메뉴와 라우트가 어긋날 일이 없고, 항목 추가 시 navConfig만 고치면 된다.
 *
 * 현재 모든 화면은 Placeholder로 연결돼 있다.
 * 화면을 하나씩 구현하면서 해당 path의 element를 실제 페이지로 교체해 나간다.
 *   (예: '/dashboard' → <Dashboard /> 로 교체)
 */
export default function App() {
  // 사이드바의 모든 그룹을 펼쳐 개별 메뉴 항목 목록으로 변환
  const navItems = LEADER_NAV.flatMap((group) => group.items)

  return (
    <Routes>
      {/* 사이드바가 있는 리더 어드민 공통 레이아웃 */}
      <Route element={<LeaderLayout />}>
        {/* 진입 경로("/")는 대시보드로 이동 */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {navItems.map((item) => (
          <Route
            key={item.path}
            path={item.path}
            // 구현된 화면이면 실제 페이지, 아니면 "구현 예정" Placeholder
            element={IMPLEMENTED_PAGES[item.path] ?? <Placeholder titleKey={item.labelKey} />}
          />
        ))}
      </Route>

      {/*
        가맹점 회원가입(Admin Auth 폼)은 사이드바 없는 독립 화면으로 추정되어
        레이아웃 밖 라우트로 분리해 둠. (구현 단계에서 레이아웃 포함 여부 확정)
      */}
      <Route path="/merchant-signup" element={<Placeholder titleKey="page.merchantSignup" />} />

      {/* 정의되지 않은 경로는 대시보드로 폴백 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
