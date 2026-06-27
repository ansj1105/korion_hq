import type { NavGroup } from '../types'

/*
 * 본사어드민(HQ) 사이드바 메뉴 구조 (IA)
 * ------------------------------------------------------------------
 * 출처: Figma "본사어드민페이지" 섹션의 "전체 목록 사이드바" 실제 텍스트(2026-06-27 스크린샷으로 검증).
 * ⚠️ Figma 레이어 이름은 복붙 흔적으로 실제 내용과 다른 경우가 많았다 — 이 파일의 라벨은
 *    레이어 이름이 아니라 스크린샷으로 확인한 실제 텍스트 기준이다(docs/head-office-admin/SUMMARY.md 5번 참고).
 *
 * 경로(path)는 역할 basePath('/hq') 기준 **상대 경로**다.
 * 계층: 본사(HQ) → 국가리더(leader) → 파트너(partner) → 가맹점(merchant) — 본사가 최상위.
 */
export const HQ_NAV: NavGroup[] = [
  {
    titleKey: 'nav.group.hqDashboard',
    items: [
      { labelKey: 'nav.item.hqDashboardOverview', path: 'dashboard' },
      { labelKey: 'nav.item.hqDashboardByCountry', path: 'dashboard/by-country' },
    ],
  },
  {
    titleKey: 'nav.group.hqApplications',
    items: [{ labelKey: 'nav.item.hqApplicationPartnership', path: 'applications' }],
  },
  {
    titleKey: 'nav.group.hqPartnerRequests',
    items: [
      { labelKey: 'nav.item.hqRequestLeader', path: 'requests/leader' },
      { labelKey: 'nav.item.hqRequestPartnerByLeader', path: 'requests/partner-by-leader' },
      { labelKey: 'nav.item.hqRequestPartnerDirect', path: 'requests/partner-direct' },
      { labelKey: 'nav.item.hqRequestMerchantDirect', path: 'requests/merchant-direct' },
    ],
  },
  {
    titleKey: 'nav.group.hqLeaders',
    items: [
      { labelKey: 'nav.item.hqLeadersList', path: 'leaders' },
      { labelKey: 'nav.item.hqLeaderSales', path: 'leaders/sales' },
    ],
  },
  {
    titleKey: 'nav.group.hqPartners',
    items: [
      { labelKey: 'nav.item.hqPartnersList', path: 'partners' },
      { labelKey: 'nav.item.hqPartnerSales', path: 'partners/sales' },
    ],
  },
  {
    titleKey: 'nav.group.hqMerchants',
    items: [
      { labelKey: 'nav.item.hqMerchantsList', path: 'merchants' },
      { labelKey: 'nav.item.hqMerchantSales', path: 'merchants/sales' },
    ],
  },
  {
    titleKey: 'nav.group.hqPaymentMonitoring',
    items: [
      { labelKey: 'nav.item.hqPaymentLogAll', path: 'payments/logs' },
      { labelKey: 'nav.item.hqPaymentSyncIssues', path: 'payments/sync-issues' },
      { labelKey: 'nav.item.hqPaymentErrorCodes', path: 'payments/error-codes' },
    ],
  },
  {
    titleKey: 'nav.group.hqSettlement',
    items: [
      { labelKey: 'nav.item.hqSettlementRequest', path: 'settlement/request' },
      { labelKey: 'nav.item.hqSettlementHistory', path: 'settlement/history' },
      { labelKey: 'nav.item.hqCommissionManagement', path: 'settlement/commission' },
      { labelKey: 'nav.item.hqCommissionRateSetting', path: 'settlement/rate-setting' },
    ],
  },
  {
    titleKey: 'nav.group.hqCollateral',
    items: [{ labelKey: 'nav.item.hqCollateralHistory', path: 'collateral/history' }],
  },
  {
    titleKey: 'nav.group.hqRisk',
    items: [
      { labelKey: 'nav.item.hqRiskFakeApplications', path: 'risk/fake-applications' },
      { labelKey: 'nav.item.hqRiskFakeMerchants', path: 'risk/fake-merchants' },
      { labelKey: 'nav.item.hqRiskDuplicates', path: 'risk/duplicates' },
      { labelKey: 'nav.item.hqRiskSettlementHold', path: 'risk/settlement-hold' },
      { labelKey: 'nav.item.hqRiskBlacklist', path: 'risk/blacklist' },
    ],
  },
  {
    titleKey: 'nav.group.hqStats',
    items: [
      { labelKey: 'nav.item.hqStatsByCountry', path: 'stats/country' },
      { labelKey: 'nav.item.hqStatsByPartner', path: 'stats/partner' },
      { labelKey: 'nav.item.hqStatsByMerchant', path: 'stats/merchant' },
      { labelKey: 'nav.item.hqStatsByPaymentMethod', path: 'stats/payment-method' },
    ],
  },
  {
    // 리더 사이드바의 'nav.group.hqNotices'(본사 소식지 수신 화면)와 의미가 달라(본사 자신이 발송) 별도 키 사용
    titleKey: 'nav.group.hqAnnouncements',
    items: [
      { labelKey: 'nav.item.hqAnnouncementSend', path: 'announcements/send' },
      { labelKey: 'nav.item.hqAnnouncementHistory', path: 'announcements/history' },
    ],
  },
  {
    titleKey: 'nav.group.hqAdmin',
    items: [
      { labelKey: 'nav.item.hqAdminAccounts', path: 'admin/accounts' },
      { labelKey: 'nav.item.hqAdminPermissionGroups', path: 'admin/permission-groups' },
      { labelKey: 'nav.item.hqAdminCountryAccess', path: 'admin/country-access' },
      { labelKey: 'nav.item.hqAdminLoginSecurity', path: 'admin/login-security' },
      { labelKey: 'nav.item.hqAdminTwoFactor', path: 'admin/two-factor' },
    ],
  },
  {
    titleKey: 'nav.group.hqSystem',
    items: [
      { labelKey: 'nav.item.hqSystemCountry', path: 'system/country' },
      { labelKey: 'nav.item.hqSystemErrorCode', path: 'system/error-code' },
      { labelKey: 'nav.item.hqSystemSecurityPolicy', path: 'system/security-policy' },
      { labelKey: 'nav.item.hqSystemMaintenanceMode', path: 'system/maintenance-mode' },
    ],
  },
  {
    titleKey: 'nav.group.hqLogs',
    items: [
      { labelKey: 'nav.item.hqLogAdminAll', path: 'logs/admin' },
      { labelKey: 'nav.item.hqLogApproval', path: 'logs/approval' },
      { labelKey: 'nav.item.hqLogSettlement', path: 'logs/settlement' },
      { labelKey: 'nav.item.hqLogPermissionChange', path: 'logs/permission-change' },
      { labelKey: 'nav.item.hqLogSecurity', path: 'logs/security' },
    ],
  },
]
