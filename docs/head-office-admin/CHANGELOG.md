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

---

## 2026-06-27 — Phase 1: 국가 리더/파트너/가맹점 관리 (전체 목록 + 거래내역)

**한 일**

- `src/pages/hq/{Leaders,Partners,Merchants}/`(신규): "전체 목록" 3화면. `RequestListPage` 템플릿 100% 재사용, 신규 컴포넌트 없음. 리더 어드민의 동명 화면(`Partners`, `Merchants`)과 컬럼이 달라(상위 리더 코드 등 국가 가로지르는 본사 시점 컬럼) 별도 작성.
- `src/pages/hq/{LeaderSales,PartnerSales,MerchantSales}/`(신규): "거래내역" 3화면. `App.tsx`의 `HQ_PAGES`에 6개 화면 전부 매핑, `src/i18n/ko.json`/`en.json`에 화면별 키 추가.
- `src/components/molecules/FilterTabs/FilterTabs.tsx`: `activeIndex`/`onChange` optional props 추가해 controlled 모드 지원(기존 호출부는 그대로 uncontrolled로 동작, 영향 없음). 거래내역 화면의 탭(가맹점별/거래내역/정산내역/관리자메모) 전환에 사용.

**발견한 이슈와 처리**

1. **"거래내역" 사이드바 항목이 예상과 다른 화면이었음**: 처음엔 리더 어드민의 `PartnerSales`처럼 매출 테이블 화면일 거라 예상했으나, 실제 Figma 확인 결과 ①전체 거래 로그 표 + ②특정 대상 1명의 프로필(계정정보 + 탭 4개: 가맹점별/거래내역/정산내역/관리자메모)이 같이 있는 복합 화면이었다. 탭 4개의 구체적 내용까지는 Figma에서 다 확인하지 못해, **사용자 확인 후** 탭 UI(클릭 전환)까지만 구현하고 내용은 `common.comingSoon`(구현 예정)으로 둠. 계정정보 InfoGrid는 탭과 무관하게 항상 보이는 부분으로 판단해 실제 내용을 채움.
2. Figma의 KPI 라벨 일부가 복붙 잔재로 문맥과 안 맞았음(가맹점 목록 화면에 "승인된 파트너 수"/"정지된 파트너 수"라고 적혀 있었음) — 더미 데이터 작성 시 "가맹점"으로 바로잡아 사용.

**검증**

- `npm run build` 통과.
- Playwright로 6개 라우트(`/hq/leaders`, `/hq/leaders/sales`, `/hq/partners`, `/hq/partners/sales`, `/hq/merchants`, `/hq/merchants/sales`) 전부 스크린샷 확인. KPI 값·컬럼명·액션배지가 Figma와 일치. 거래내역 화면은 탭 클릭 시 강조가 실제로 이동하는지까지 확인(2번째 탭 클릭 후 재스크린샷).
- 콘솔 에러 없음, 기존 리더/파트너/가맹점 화면 영향 없음.

**다음부터 작업 방식 변경**: 사용자가 화면을 한 번에 여러 개 묶어서 만들지 말고, 메뉴(화면) 단위로 끊어서 하나씩 만들고 직접 확인한 뒤 다음으로 넘어가자고 요청함. Phase 2부터는 이 방식으로 진행.

---

## 2026-06-27 — Phase 1 보완: 액션 배지 색상 Figma와 불일치 수정

사용자가 직접 화면을 확인하고 두 가지를 지적함: ① KPI 박스 주변에 다른 메뉴 토글이 있다, ② 목록 화면 액션 컬럼의 디자인이 Figma와 다르다.

**① 날짜 토글(1D~365D) 관련 — 조사 결과 보고, 확정 안 됨**
Figma 데이터를 다시 받아 확인한 결과, "국가 리더 전체 목록" 프레임(1825px 높이) 안에 "기간 필터 / 1D-365D" 요소가 `top: 1799px`로 절대좌표가 박혀있어 실제로는 화면 맨 아래 가장자리에 거의 다 잘려서 안 보이는 위치였다(고해상도 스크린샷으로 재확인해도 KPI 박스 주변엔 아무것도 안 보임). 대시보드 프레임에서 복붙되며 남은 leftover로 추정 — **사용자에게 어느 화면을 보고 말씀하신 건지 재확인 요청, 다음 턴에서 처리**.

**② 액션 배지 색상 — 확인 및 수정 완료**
`src/components/molecules/ActionBadges/ActionBadges.tsx`가 모든 라벨을 고정 `accent="cyan"`으로 칠하고 있었다. Figma 확인 결과 실제로는 라벨(정확히는 그 행의 상태)에 따라 색이 다름: 승인=초록(`rgba(41,224,133,...)`), 정지/거절=빨강(`#ff4e4e`), 상세=중립 회색(`#736e94`, `Badge`의 무-accent 기본값과 동일). "전체 거래 로그" 표의 상세/환불요청/리스크요청 배지는 전부 시안색이 맞음(`rgba(26,209,255,...)` = `--color-accent-cyan`) — 그 부분은 원래 코드가 맞았음.

- `ActionBadges`에 optional `accentByLabel?: Record<string, AccentKey>` prop 추가. 안 주면 기존처럼 전부 cyan(하위 호환), 주면 매핑 없는 라벨은 `Badge` 기본 중립색으로 빠짐.
- `src/pages/hq/{Leaders,Partners,Merchants}/*.tsx` 3곳에서 `accentByLabel={{ 승인: 'green', 거절: 'red', 정지: 'red' }}` 적용. `LeaderSales`/`PartnerSales`/`MerchantSales`는 원래도 전부 cyan이 맞아 변경 없음.
- 빌드 통과, 스크린샷으로 3화면 모두 색상 일치 확인.
