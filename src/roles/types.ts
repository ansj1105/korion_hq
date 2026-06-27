import type { NavGroup } from '../types'

/** 어드민 역할 — 추후 로그인 시 이 값으로 진입 어드민을 분기한다. */
export type Role = 'hq' | 'leader' | 'partner' | 'merchant'

/**
 * 사이드바 프로필 카드의 한 줄.
 * variant로 표시 스타일을 구분한다(상위 리더 줄 / 본인 국가 줄 / 코드 줄).
 * 값은 Figma 샘플 데이터라 리터럴로 둔다(번역하지 않음).
 */
export interface ProfileLine {
  text: string
  variant: 'parent' | 'title' | 'muted'
}

/** 역할 한 개의 어드민 구성(SSOT) — 라우팅·사이드바가 이 값으로 동작한다. */
export interface RoleConfig {
  /** 라우트 prefix (예: '/leader', '/partner') */
  basePath: string
  /** 역할 라벨의 i18n 키 (예: 'common.role.leader') */
  roleLabelKey: string
  /** 사이드바 프로필 카드 줄 (Figma 샘플 값) */
  profileLines: ProfileLine[]
  /** 사이드바 메뉴 구조 (항목 path는 basePath 기준 상대 경로) */
  nav: NavGroup[]
}
