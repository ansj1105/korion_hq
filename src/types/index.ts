/*
 * 공용 타입 정의
 * ------------------------------------------------------------------
 * 여러 컴포넌트가 공유하는 타입만 여기에 둔다.
 * 특정 컴포넌트 전용 타입은 해당 컴포넌트 파일 안에 두어 응집도를 높인다.
 */

/**
 * 강조색 키. Figma 리더 어드민에서 쓰이는 포인트 색의 의미 키.
 * tokens.css의 --color-accent-* 와 1:1 대응한다. (매핑은 utils/accent.ts)
 */
export type AccentKey = 'cyan' | 'blue' | 'purple' | 'green' | 'orange' | 'red'

/** 사이드바의 개별 메뉴 항목 (실제 이동 가능한 링크) */
export interface NavItem {
  /** 라벨의 i18n 번역 키 (예: 'nav.item.dashboard') */
  labelKey: string
  /** 이동할 라우트 경로 */
  path: string
}

/** 사이드바의 메뉴 그룹 (카테고리). 제목은 묶음 라벨이며 그 자체로 이동하진 않는다. */
export interface NavGroup {
  /** 그룹 제목의 i18n 번역 키 (예: 'nav.group.requests') */
  titleKey: string
  /** 그룹에 속한 메뉴 항목들 */
  items: NavItem[]
}
