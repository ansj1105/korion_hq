import type { Role, RoleConfig } from './types'
import { HQ_NAV } from './hqNav'
import { LEADER_NAV } from './leaderNav'
import { PARTNER_NAV } from './partnerNav'
import { MERCHANT_NAV } from './merchantNav'

/*
 * 역할 레지스트리 (SSOT)
 * ------------------------------------------------------------------
 * 라우팅(App)·레이아웃(AdminLayout)·사이드바(Sidebar)가 모두 이 값으로 동작한다.
 * 새 역할/메뉴 변경은 여기(+ *Nav.ts)만 고치면 전체에 반영된다.
 * 프로필 줄은 Figma 샘플 데이터라 리터럴로 둔다(번역 대상 아님).
 */
export const ROLES: Record<Role, RoleConfig> = {
  hq: {
    basePath: '/hq',
    roleLabelKey: 'common.role.hq',
    profileLines: [
      { text: 'KORION PAY 본사', variant: 'title' },
      { text: '코드: HQ-ADMIN-001', variant: 'muted' },
    ],
    nav: HQ_NAV,
  },
  leader: {
    basePath: '/leader',
    roleLabelKey: 'common.role.leader',
    profileLines: [
      { text: 'Race / Nigeria', variant: 'title' },
      { text: '코드: NG-LEAD-001', variant: 'muted' },
    ],
    nav: LEADER_NAV,
  },
  partner: {
    basePath: '/partner',
    roleLabelKey: 'common.role.partner',
    profileLines: [
      { text: '리더: Race / NG-LEAD-001', variant: 'parent' },
      { text: 'Grace Kim / Nigeria', variant: 'title' },
      { text: '코드: NG-SP-0001', variant: 'muted' },
    ],
    nav: PARTNER_NAV,
  },
  merchant: {
    basePath: '/merchant',
    roleLabelKey: 'common.role.merchant',
    profileLines: [
      { text: '파트너: Grace Kim / NG-PART-001', variant: 'parent' },
      { text: 'Lagos Mart / Nigeria', variant: 'title' },
      { text: 'NG-MER-0001', variant: 'muted' },
    ],
    nav: MERCHANT_NAV,
  },
}

export type { Role, RoleConfig } from './types'
export { HQ_NAV } from './hqNav'
export { LEADER_NAV } from './leaderNav'
export { PARTNER_NAV } from './partnerNav'
export { MERCHANT_NAV } from './merchantNav'
