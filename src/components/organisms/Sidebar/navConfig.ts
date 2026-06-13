import type { NavGroup } from '../../../types'

/*
 * 리더 어드민 사이드바 메뉴 구조 (IA)
 * ------------------------------------------------------------------
 * 출처: Figma 사이드바(node 1:139) + "리더 어드민 - Description" 명세.
 * 라벨/제목은 i18n 키로 저장하고(다국어), 실제 표시 문구는 ko.json/en.json에 있다.
 *
 * [확정] '거래 로그' 하위메뉴는 와이어프레임 내부가 서로 달랐으나(대시보드: 1개 /
 * Description: 3개) 사용자 확정에 따라 Description 기준(3개)으로 통일함.
 * 라우트 경로는 화면 분류표(docs/PROJECT_PLAN.md 8.2)와 일관되게 명명.
 */
export const LEADER_NAV: NavGroup[] = [
  {
    titleKey: 'nav.group.dashboard',
    items: [{ labelKey: 'nav.item.dashboard', path: '/dashboard' }],
  },
  {
    titleKey: 'nav.group.requests',
    items: [
      { labelKey: 'nav.item.requestsPartner', path: '/requests/partner' },
      { labelKey: 'nav.item.requestsMerchant', path: '/requests/merchant' },
    ],
  },
  {
    titleKey: 'nav.group.partners',
    items: [
      { labelKey: 'nav.item.partnersList', path: '/partners' },
      { labelKey: 'nav.item.partnersSales', path: '/partners/sales' },
    ],
  },
  {
    titleKey: 'nav.group.merchants',
    items: [
      { labelKey: 'nav.item.merchantsList', path: '/merchants' },
      { labelKey: 'nav.item.merchantsSales', path: '/merchants/sales' },
    ],
  },
  {
    titleKey: 'nav.group.transactions',
    items: [
      { labelKey: 'nav.item.txAll', path: '/transactions' },
      { labelKey: 'nav.item.txOffline', path: '/transactions/offline' },
      { labelKey: 'nav.item.txFailed', path: '/transactions/failed' },
    ],
  },
  {
    titleKey: 'nav.group.settlement',
    items: [
      { labelKey: 'nav.item.settlementRequest', path: '/settlement/request' },
      { labelKey: 'nav.item.settlementHistory', path: '/settlement/history' },
    ],
  },
  {
    titleKey: 'nav.group.hqNotices',
    items: [{ labelKey: 'nav.item.hqNoticesAll', path: '/hq-notices' }],
  },
  {
    titleKey: 'nav.group.notices',
    items: [
      { labelKey: 'nav.item.noticeSend', path: '/notices/send' },
      { labelKey: 'nav.item.noticeHistory', path: '/notices/history' },
    ],
  },
  {
    titleKey: 'nav.group.settings',
    items: [
      { labelKey: 'nav.item.profile', path: '/settings/profile' },
      { labelKey: 'nav.item.activityLog', path: '/settings/activity-log' },
    ],
  },
]
