# 본사어드민(HQ Admin) 작업 기록

> 시간순 기록. 끝난 항목은 수정하지 않고 새 항목을 추가한다.
> "현재 상태 요약"은 [SUMMARY.md](./SUMMARY.md), "지킬 규칙"은 [CONVENTIONS.md](./CONVENTIONS.md) 참고.

---

## 2026-06-27 — Phase 0: 역할 골격 추가

**한 일**

- `src/roles/types.ts`: `Role` 유니온에 `'hq'` 추가.
- `src/roles/hqNav.ts`(신규): Figma "본사어드민페이지" 사이드바 실제 텍스트 기준 15개 그룹 `NavGroup[]` 정의.
- `src/roles/index.ts`: `ROLES.hq` 등록(`basePath: '/hq'`, `roleLabelKey: 'common.role.hq'`).
- `src/App.tsx`: `/hq` 라우트 서브트리 + `HQ_PAGES`(현재 빈 객체 → 전부 `Placeholder`) 추가.
- `src/i18n/ko.json` / `en.json`: `common.role.hq` + 사이드바 라벨 키 92개(`nav.group.hq*`, `nav.item.hq*`) 추가.
- `src/services/authSession.ts`: `Role` 매핑(`ROLE_BY_API_ROLE`/`API_ROLE_BY_ROLE`)에 `HQ` 추가.

**발견한 이슈와 처리**

1. **타입 버그 발견·수정**: `API_ROLE_BY_ROLE`가 `Record<Role, 'HQ'|'LEADER'|'PARTNER'|'MERCHANT'>`로 타입이 명시돼 있어서, 키마다 실제 값(`'LEADER'` 등)이 아니라 전체 합집합 타입으로 뭉개져 있었다. 그 결과 `apiRoleFor()`의 반환 타입이 항상 4개 값의 합집합이 되어, `hq`를 모르는 기존 로그인 코드(`useRoleLogin.ts`, `'leader'|'partner'|'merchant'`만 다룸)에서 타입 에러가 났다. → `apiRoleFor`를 제네릭으로 바꾸고 `API_ROLE_BY_ROLE` 선언을 `satisfies`로 바꿔 키별 리터럴 타입이 유지되게 수정(`authSession.ts`). **로그인 동작 자체는 바뀌지 않음**, 타입만 정확해짐.
2. **세션 가드 존재 확인**: 루트 프로젝트 때와 달리, 이 레포의 `AdminLayout.tsx`는 `readAuthSession()`으로 실제 세션을 체크해서 없으면 `/login`으로 리다이렉트한다. 따라서 화면 확인 시 URL 직접 접근만으론 안 되고, 브라우저 `localStorage`에 `korion.userId`/`korion.role`을 먼저 심어줘야 한다(아래 검증 항목 참고).

**검증**

- `npm run build`(tsc+vite) 통과.
- Playwright(헤드리스, 이번 검증을 위해 스크래치 디렉터리에 임시 설치 — 레포 의존성에는 추가 안 함)로 `localStorage.korion.role='HQ'` 설정 후 `/hq/dashboard` 접속 → 사이드바 15그룹·46항목이 Figma와 1:1로 정확히 렌더링됨, 콘솔 에러 없음, `/login`으로 안 튕김. 스크린샷으로 스타일(보라색 그룹 강조/시안 active item/프로필 카드)도 기존 리더와 동일하게 적용됨을 확인.
- 기존 leader/partner/merchant 화면·라우트는 변경 없음.

**기타**

- 로그인 허브(`AuthMain.tsx`)에 본사 카드는 추가하지 않음(사용자 결정 — URL 직접 접근만 허용).
- git remote `geon`을 `https://github.com/gun587330/KORIONPAY_PAGE_FRONTEND.git`로 추가(push는 안 함, 사용자가 직접 커밋·푸시 예정). `geon/main`이 현재 브랜치(`headOfficeAdminPage-frontend2`)의 조상 커밋임을 확인 — 이어붙여도 히스토리 충돌 없음.
