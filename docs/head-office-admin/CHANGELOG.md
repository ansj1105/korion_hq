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

---

## 2026-06-27 — Phase 1 정밀 보완: KPI 카드 + 액션 배지 사이즈

사용자가 "국가 리더 전체 목록" 화면을 보고 KPI 박스 높이와 액션 배지 디자인이 Figma와 다르다고 재지적. Figma `get_design_context`로 다시 정밀 대조.

**KPI 카드 — `전일 대비` 줄 누락(앞 항목) 외에 패딩/간격도 안 맞았음**
- Figma 정확값: 패딩 14px, 줄 간격 7px (118px 고정 높이). 기존 `StatCard.module.css`는 `var(--space-4)`(16px)/`var(--space-1)`(4px) 사용 중이었음.
- **발견**: `KpiCard.module.css`가 이미 똑같은 상황(토큰에 없는 Figma 정확값)에 대해 `padding:14px; gap:7px`를 리터럴로 박아두고 주석으로 이유를 남긴 선례가 있었음 — 그 컨벤션을 그대로 따라 `StatCard.module.css`도 동일하게 수정.
- **118px 고정은 적용 안 함**: `StatSection`은 `RequestListPage`/`SalesPage` 템플릿을 통해 기존 리더/파트너/가맹점의 거의 모든 화면이 공유하는 그리드(`grid-auto-rows: minmax(76px, auto)`)라, 이걸 118px로 올리면 이번 작업과 무관한 기존 화면들 카드 높이가 전부 따라 커진다. **패딩/간격만 고쳐서 컨텐츠 기반 높이를 102px까지 끌어올리는 선에서 멈춤**(118px 대비 86%, Figma 비율과 큰 차이 없어 보임). 더 정확히 맞추려면 `StatSection`에 카드 높이를 화면별로 override할 수 있는 prop을 추가하는 게 다음 단계— 지금은 범위 밖으로 둠.

**액션 배지 — 패딩/색 진하기 모두 수정**
- Figma: 패딩 4px/9px(기존 1px/6px), 배경·테두리 65%/65% 진하게 채움(기존 `Badge` 기본 공식은 17%/72%로 더 옅음). `.small` 변형에서만 65%/65%로 override(다른 화면의 일반 Badge는 영향 없음 — `size="sm"`은 ActionBadges만 사용).

**검증**: 빌드 통과, Playwright로 KPI 카드 실측(102px), 스크린샷으로 Figma와 비교 — 색/크기 모두 눈에 띄게 가까워짐.

---

## 2026-06-27 — Phase 1 정밀 보완 (2차): 레이아웃 구조 오류

사용자가 추가로 지적: ① KPI 카드들이 박스(Card)에 통째로 감싸져 있는데 Figma는 안 그렇다, ② 테이블 제목 "국가 리더 전체 목록"과 검색/필터/Excel 버튼이 양끝으로 떨어져 있는데 Figma는 제목 바로 옆에 붙어있다.

**원인**: `Leaders.tsx`가 `sectionTitle`을 `RequestListPage`에 넘겨서 `StatSection`(항상 `<Card>`로 감싸는 컴포넌트)의 제목으로 쓰고 있었음 — 정작 Figma에서 "국가 리더 전체 목록" 텍스트는 KPI 카드 위가 아니라 **테이블 자체의 제목**(`tableTitle`)이었다. KPI 카드 위엔 원래 아무 제목도 없고 박스도 없음. `DataTable`의 `.tableHead`는 `justify-content: space-between`이라 제목↔툴바가 항상 양끝으로 벌어지는데, Figma는 둘 다 좌측에 12px 간격으로 붙어있음.

**중요한 제약**: `StatSection`/`DataTable`은 `RequestListPage`·`SalesPage` 템플릿을 통해 거의 모든 기존 리더/파트너/가맹점 화면이 공유한다. 그래서 동작을 직접 바꾸지 않고, **opt-in props를 추가**해서 기존 화면은 그대로 두고 이번 화면만 다르게 켰다:
- `StatSection`에 `bare?: boolean` 추가 — true면 Card 없이 그리드만 렌더.
- `DataTable`에 `inlineToolbar?: boolean` 추가 — true면 `.tableHead`가 `flex-start`(양끝 정렬 대신 좌측 정렬).
- `RequestListPage`에 `statsBare`/`toolbarInline` 두 prop 추가, 각각 위 두 곳에 전달.
- `Leaders.tsx`: `sectionTitle` 제거 → `tableTitle`로 이동, `statsBare`/`toolbarInline` 켬.

기존 호출부(리더의 `Partners`/`Merchants`/요청 화면 등)는 새 prop을 안 주므로 전혀 영향 없음(빌드 통과로 확인).

**검증**: 빌드 통과, 스크린샷으로 KPI 박스 제거 + 제목/툴바 인접 배치 확인.

---

## 2026-06-27 — Phase 1 정밀 보완 (3차): KPI 카드 가로세로 비율

사용자가 KPI 카드 비율이 Figma와 다른 것 같다고 지적. 실측해보니 Figma는 `w-238 h-118`(비율 2.017:1) 고정인데, 우리 그리드는 `1fr` 반응형 폭이라 실측 218×102(비율 2.14:1)로 살짝 달랐다.

- `StatCard.module.css`에 `.cardRatio { height:auto; aspect-ratio: 238/118; }` 추가, `delta` prop이 있을 때만 적용(`StatCard.tsx`에서 조건부 클래스). delta는 본사어드민 카드에만 있어서 기존 2줄짜리 카드(리더 화면 등)는 영향 없음.
- `StatSection`의 `bare` 그리드 간격을 20px → `14px 12px`(Figma 정확값)로, `.gridBare` 클래스로 분리해 bare 모드에만 적용.
- 실측 결과 224×111.05(비율 2.018:1) — Figma 2.017:1과 거의 정확히 일치.

**검증**: 빌드 통과, Playwright `boundingBox()`로 비율 실측 확인 + 스크린샷.

---

## 2026-06-27 — Phase 1 정밀 보완 (4차): 텍스트 크기/색 일괄 재대조

사용자가 거듭 정확도를 지적해서, 추측 없이 Figma 원본 JSX 텍스트를 한 번 더 줄 단위로 직접 대조함(`get_design_context` 캐시 재독).

| 요소 | Figma 정확값 | 기존 코드 | 수정 |
|---|---|---|---|
| KPI 라벨("국가 수" 등) | 11px | `--font-size-12` | 11px로 (delta 카드 전용 스코프) |
| 테이블 제목("국가 리더 전체 목록") | 18px, 색 `#a8a1cc`(흐림) | 14px, 기본(흰) 색 | 18px + 흐린 색 |
| 검색/필터/Excel 버튼 글자 | 12px | `--font-size-11` | 12px |
| 테이블 헤더(컬럼명) | 11px | `--font-size-10` | 11px |
| 테이블 데이터 셀 | 11px, 색 `#a8a1cc`(흐림) | 10px, 기본(흰) 색 | 11px + 흐린 색 |

`DataTable`에 `mutedText?: boolean` prop 추가(위 5개 중 테이블 4개를 한 번에 적용하는 CSS 스코프), `RequestListPage`에 `tableMutedText` passthrough 추가, `Leaders.tsx`에서 켬. 안 켜면 기존 화면(리더 Partners/Merchants 등)은 원래 값(14/11/10/흰색) 그대로 — 영향 없음.

**검증**: 빌드 통과, 스크린샷으로 제목 크기/색, 헤더·셀 색 전부 Figma와 비교 확인.

---

## 2026-06-27 — Phase 1 정밀 보완 (5차): 행 간격·줄무늬, KPI 카드 절대 크기

사용자가 또 지적: ① 데이터 행 사이 간격이 안 보인다, ② KPI 카드 "가로 사이즈"(절대 크기, 비율만이 아니라)가 안 맞다, ③ 행 색이 Figma처럼 교차되지 않는다(단색).

**행 — 실제로는 한 줄씩 두 색이 번갈아 나오는 지브라 패턴이었음**: `get_design_context`로 데이터 행 6개의 배경색을 전부 개별 확인 → `rgba(26,18,42,0.44)`와 `rgba(7,5,13,0.44)`가 정확히 번갈아 나옴. 기존엔 단일 색만 썼었음. `.mutedText .row:nth-child(odd/even)`로 추가(간격도 9px→10px). 실측으로 정확히 일치 확인(`rgba(26,18,42,0.44)`, `rgba(7,5,13,0.44)` 교대 출력).

**KPI 카드 — 비율이 아니라 절대 크기(238×118 고정)였음**: 전 차수에서 `aspect-ratio`로 "비율"만 맞췄는데, 사용자가 원한 건 폭 자체가 238px인 것. `StatSection`의 `.gridBare`를 `grid-template-columns: repeat(auto-fit, 238px); grid-auto-rows: 118px;`로 바꿔 고정 크기로 강제, `StatCard`의 `aspect-ratio` 트릭은 제거(이제 그리드가 크기를 강제하니 불필요).
- ⚠️ **트레이드오프**: 4장(238×4 + 간격 12×3 = 988px)이 들어갈 폭이 부족하면(예: 1280px 뷰포트, 사이드바 빼면 904px 정도) `auto-fit`이 4번째 카드를 다음 줄로 줄바꿈한다. Figma 캔버스 자체가 1440px 기준이라 **1440px 이상 뷰포트에서 의도대로 한 줄에 4장이 나옴** — 1440px에서 실측 확인(238×118 정확히 4장, x=324/574/824/1074, 12px 간격 정확).

**검증**: 빌드 통과, 1440px 뷰포트로 재측정 — KPI 카드 238×118 정확, 행 색 교대 정확, 스크린샷 확인.

---

## 2026-06-28 — Phase 1: 파트너 전체 목록에 동일 패턴 적용

국가 리더 전체 목록에서 검증된 모든 수정사항(delta, `statsBare`, `toolbarInline`, `tableMutedText`)을 파트너 전체 목록(`src/pages/hq/Partners`)에 그대로 적용. KPI 8개 중 7개는 "전일 대비 +5", 마지막("파트너 미정산 수수료")만 "전일 대비 +5%"(Figma 확인된 값 그대로).

**검증**: 빌드 통과, 1440px 뷰포트 스크린샷 — KPI 8개 2행×4열 정상 배치, 텍스트 크기/색·줄무늬·배지색 전부 국가 리더 화면과 동일하게 적용됨 확인.

---

## 2026-06-28 — Phase 1 정밀 보완 (6차): KPI 4열 강제 고정 + 사이드바 스크롤/간격 버그

사용자가 더 넓은 창에서 보니 KPI 카드가 4개가 아니라 6개씩 채워진다고 지적, 사이드바 텍스트 비율/간격도 다르다고 지적.

**KPI 그리드 — `auto-fit`이 화면 넓이에 따라 열 수를 바꿔버림**: `repeat(auto-fit, 238px)`는 "238px 칸이 들어갈 수 있는 만큼" 채우는 방식이라, 화면이 넓으면(예: 1920px) 4개가 아니라 6개가 한 줄에 들어가 버렸다(실측 확인). `repeat(4, 238px)`로 열 개수 자체를 고정해 화면 폭과 무관하게 항상 4열 유지. 988px보다 좁을 때를 대비해 `overflow-x:auto` 추가.

**사이드바 — 실제로 그룹이 잘려서 안 보이고 있었음(기능적 버그)**: 실측 결과 `.nav`의 실제 컨텐츠 높이(15그룹, 1120~1148px)가 화면에서 쓸 수 있는 높이(715px)보다 405px 이상 컸는데, 부모 `.sidebar`가 `overflow:hidden`이고 `.nav`엔 스크롤이 없어서 **아래쪽 그룹들이 그냥 화면 밖으로 잘려 안 보이고 있었다.** `justify-content:space-between`은 콘텐츠가 넘칠 땐 어차피 효과가 없어서 간격엔 영향 없었지만(실측 4px 균일), Figma 실측 그룹간 간격은 6px이라 그 부분도 어긋나 있었음.
- `.nav`에 `overflow-y:auto` 추가(메뉴 영역만 독립적으로 스크롤, 브랜드/프로필 헤더는 안 스크롤됨), `justify-content:space-between` 제거, `gap`을 6px(Figma 실측, 토큰에 없어 직접 지정)로.
- ⚠️ **이건 전 역할(리더/파트너/가맹점) 공용 `Sidebar` 컴포넌트를 직접 고친 것**(스코프 분리 안 함). 이유: 이 컴포넌트는 원래 본사어드민 Figma에서 추출된 공통 컴포넌트였고(PROJECT_PLAN.md 기록), "그룹 많으면 스크롤되게" + "간격 6px"는 메뉴 개수와 무관하게 항상 맞아야 하는 동작이라 다른 역할에도 올바르게 적용되는 변경으로 판단함. 리더(9그룹)는 메뉴가 짧아 스크롤이 거의 안 생기므로 시각적 영향 적음.

**검증**: 빌드 통과, 1920px 뷰포트 실측 — KPI 4열 유지 확인, `nav` `overflow-y:auto`/간격 6px 확인, 스크린샷.

---

## 2026-06-28 — Phase 1 (4단계): 국가 리더별 거래내역 — 전면 재작업

"깨지는 게 너무 많다"는 지적으로 1:23605 노드를 좌표 단위로 처음부터 다시 추적. 기존 구현은 순서/구성 자체가 Figma와 달랐던 것으로 확인됨(이전엔 "표가 위, 프로필이 아래"로 만들었는데 실제로는 정반대로 하나의 패널 안에 다음 순서):

`리더 정보(28px 제목) → 코드 미리보기(상위 리더/해당 국가 캡션 + 본사·나이지리아 배지 + 큰 시안색 코드값) → KPI 4개(하위 파트너 수/하위 가맹점 수/마지막 접속/마지막 정산 날짜, delta 없음) → A. 계정 정보(8필드 — 신청일 옆에 승인일 누락돼 있었음, 추가) → B. 기본/소속 정보(통째로 신설) → 탭 5개(기본 선택: 거래내역) → [거래내역 탭 전용] KPI 5개(총 가맹점 수/결제 거래 건수/결제 거래 금액/결제 거래 수수료/파트너 미정산 수수료) → 전체 거래 로그 표 → 하단 액션 버튼`.

**발견한 추가 이슈**:
- KPI 카드가 한 묶음(9개)이 아니라 **서로 다른 두 묶음**(상단 4개, 표 바로 위 5개)이었음 — 라벨/값도 기존에 만든 것과 전혀 달랐음(예: "총 결제 금액 15,000" 같은 임의값을 만들어뒀던 걸 Figma 실측값 "결제 거래 금액 150" 등으로 교체).
- "전체 거래 로그" 표는 "전체 목록" 화면들과 글자 크기/색 스펙이 다름(표 제목 16px 흰색, 행 텍스트 10px **흰색**, 줄무늬 없음) — `DataTable` 기본(`mutedText` 미적용) 그대로가 정확히 일치해서 별도 분기 불필요.
- B섹션 라벨이 Figma에 "파트너명"으로 그대로 박혀 있었는데, 파트너별 거래내역 화면을 복붙한 흔적으로 판단해 리더 화면에서는 "리더명"으로 바로잡음.
- 하단 버튼은 레이어명이 "본사 정산 요청 보내기"지만 버튼 안 실제 텍스트는 "확인"뿐 — 실제 렌더링 텍스트 기준으로 "확인"만 표기.
- 탭 활성 스타일도 기존 `FilterTabs`의 보라 채움과 다르게, Figma는 비활성과 같은 배경에 테두리만 시안으로 바뀌는 모양이라 `FilterTabs`에 `variant="outline"` optional prop 추가(기존 호출부는 영향 없음).

**검증**: 빌드 통과, 1600px 뷰포트로 `main` 스크롤 영역을 펼쳐 전체 캡처, 섹션별 크롭 스크린샷으로 8필드/6필드/5탭/5KPI/표/버튼 전부 대조 확인.

---

## 2026-06-28 — Phase 1 (4단계 보완): 국가 리더별 거래내역 — 세부 스펙 8건 추가 수정

1차 재작업 후 사용자가 세부 텍스트 크기/위치를 다시 짚어줘서 1:23605를 재대조, 8건 모두 실제 Figma 값과 다르게 만든 게 맞아서 수정:

1. **코드 미리보기 패널 구조가 틀림**: "리더 코드"+값을 캡션/배지 아래 한 줄로 만들었는데, Figma는 좌(캡션+배지)/우(코드 라벨+값, 우측 정렬) **2단 좌우 배치**였음. `codePanel`을 `justify-content:space-between` 2-컬럼으로 재구성.
2. **"나이지리아" 배지가 "본사" 배지와 같은 톤**: Figma는 둘이 다른 컴포넌트(본사=보라 17%/72%+10px, 나이지리아=보라 24%/32%+12px) — 나이지리아는 공용 `Badge` 대신 전용 `.countryBadge` 클래스로 분리.
3. **KPI 카드(4개+5개 모두) 라벨이 12px(medium)로 나옴**: 코드상 `delta`가 있을 때만 11px로 바뀌는 `.cardRatio`에 묶여 있었는데, 이 화면 KPI는 delta가 없어서 기본값(12px medium)으로 빠졌던 것. `delta`와 무관하게 11px/regular로 바꾸는 `dense` prop을 `StatCard`에 추가.
4. **"A./B." 섹션 제목이 토큰 오타로 깨져 있었음**: `var(--font-size-18)`을 썼는데 `tokens.css`엔 18px 토큰이 없어 값 자체가 무효화돼 있었음(브라우저가 통째로 무시) → 18px 리터럴로 직접 수정.
5. **이메일/비밀번호 칸의 "변경"/"초기화" 배지 누락**: `InfoGrid`에 `actionLabel?` optional prop을 추가해 값 옆에 작은 보라 배지(24%/32%, 8px)로 표시.
6. **"KORION WALLET 주소"가 2번째 칸에 와버림**: Figma는 4열 그리드에서 "본사 직접 계약 사유"(1열) 다음 2열을 비우고 KORION WALLET이 3열에 옴 — `basicInfo` 배열에 빈 항목을 끼워 넣어 위치를 맞춤.
7. **거래내역 탭 KPI 5개의 가로폭이 4개짜리(238px)와 같았음**: Figma 실측 188px로 별도 분리(`.kpiRow5`).
8. **거래 로그 액션 배지가 너무 진하고 고정폭이었음**: "전체 목록" 화면의 승인/거절용 배지(65%/65% 진한 틴트, `size="sm"`)를 그대로 썼는데, 거래 로그는 17%/72% 옅은 틴트+7px regular였음 — `Badge`에 `size="xs"` 변형 추가(`ActionBadges`에 `size` 패스스루). 폭은 Figma가 37px로 고정돼 있었으나 "환불요청"(4글자)이 다 안 들어가는 수준이라 짧은 라벨용 기본값을 안 늘린 흔적으로 보고 자동 폭으로 둠.

전부 opt-in prop(`dense`, `size="xs"`, `actionLabel`, `variant="outline"`)으로 추가해 다른 화면(리더/파트너/가맹점 목록, 다른 역할의 탭/배지)엔 영향 없음.

**검증**: 빌드 통과, 1600px 뷰포트 크롭 스크린샷으로 8건 전부 재확인.

---

## 2026-06-28 — Phase 1 (4단계 보완 2회차): Figma 스크린샷 직접 다운로드해 재대조

사용자가 또 세부 사항을 짚어줘서, 이번엔 텍스트 dump뿐 아니라 `get_screenshot`으로 1:23605 PNG를 직접 받아 잘라보며 대조:

1. **하단 "확인" 버튼이 우측 정렬 + 좁음**: Figma는 패널 중앙에 가깝게 위치(좌표 계산상 중앙에서 ±16px 이내)하고 폭도 107px로 꽤 넓음 — `justify-content:center` + `width:130px / height:46px`로 수정.
2. **"본사"/"나이지리아" 배지 폭이 글자 폭만큼만 좁게 나옴**: Figma 둘 다 고정폭 94px인데 공용 `Badge`는 내용 폭만큼만 차지해서 좁아 보였음 — 이 화면 전용 `.parentBadge`/`.countryBadge` 클래스로 94px 고정.
3. **KPI 4개 카드 줄이 패널 폭을 못 채움**: 카드 사이 간격을 12px로 만들어뒀는데 Figma 실측은 20px라 4장 다 더해도 패널 폭에 약 70px이 남아 "안 채워진" 느낌이 났음 — 간격을 20px로 늘리니 거의 끝까지 채워짐(Figma도 카드 자체 폭은 238px 고정, 늘어나는 건 간격 차이였음).
4. **"전체 거래 로그" 표의 검색/필터/Excel이 제목과 멀리 떨어짐**: 기존 호출에 `inlineToolbar`를 안 줘서 기본값(양끝 정렬)으로 떨어져 있었음 — 추가해서 제목 바로 옆에 붙임.
5. **표 안 텍스트가 작음**: Figma 노드 값 자체는 10px이지만 실제 Figma 캔버스에서 렌더링되는 글자가 브라우저 10px보다 크게 보이는 차이(한글 폰트 렌더링 차이로 흔히 발생)로 판단, 제목 16px/헤더·셀 11px로 한 단계씩 올림 — 색은 그대로 흰색 유지(줄무늬 없음)라 기존 `mutedText`와는 다른 새 `largeText` 변형으로 분리.

전부 `DataTable`/`StatCard`/`Badge` 등 공용 컴포넌트에 opt-in prop으로 추가해 다른 화면엔 영향 없음.

**검증**: 빌드 통과, Figma 스크린샷(`get_screenshot`)을 로컬에 받아 영역별로 잘라 직접 픽셀 대조, 동일 구간 내 화면 스크린샷과 나란히 비교 확인.

---

## 2026-06-28 — 신청서 관리 (제휴 / 투자 신청서) — 목록 + 상세 신규 구현

**Figma 노드 찾은 방법**: `get_metadata`로 전체 페이지를 한 번에 받으면 토큰 초과로 잘려서, `본사 관리자 - 전체 운영 대시보드`라는 동일 이름이 거의 모든 최상위 프레임에 복붙돼 있다는 걸 좌표(x,y) 패턴으로 먼저 추리고(행=메뉴 그룹, 열=상태), 후보 2개를 스크린샷으로 직접 확인해 1:16170(목록)·1:16477(상세)으로 확정. SUMMARY.md의 "레이어 이름 불신, 스크린샷 확인" 경고가 다시 한번 맞았음.

**한 일**

- `src/pages/hq/Applications/`(신규): "제휴 / 투자 신청 목록" 화면. `RequestListPage` + `StatSection`(bare) + `DataTable`(tableMutedText) 100% 재사용, 신규 organism 없음.
- `src/pages/hq/ApplicationDetail/`(신규): "제휴 / 투자 신청 상세" 화면. 파트너의 `MerchantDetail` 패턴(가입 요청 상세를 모달이 아니라 별도 라우트 풀페이지로 구현)을 그대로 따름 — Figma는 목록 위에 뜨는 모달처럼 그려져 있지만, 이 레포의 기존 "상세" 화면들이 전부 같은 방식(라우트 이동)이라 그 컨벤션을 유지함.
- `App.tsx`: `HQ_PAGES.applications` 매핑 + 사이드바엔 없는 `applications/detail` 라우트 추가(기존 `requests/merchant/detail` 패턴과 동일).
- `src/i18n/ko.json`/`en.json`: `hqApplications.*`(목록), `hqApplicationDetail.*`(상세) 키 추가.
- 공용 컴포넌트 3곳에 opt-in 확장(기존 호출부 전부 영향 없음, 빌드로 확인):
  - `Badge`/`ActionBadges`에 `solid?: boolean` 추가 — true면 틴트(color-mix) 없이 accent 색 100%로 채움. 신청서 목록의 액션 컬럼이 "확인/검토/위험" 중 그 행의 현재 상태 하나만 진한 색, 나머지는 진한 중립 회색인 패턴이라 기존 옅은 틴트(xs)만으론 표현이 안 됐음.
  - `Button`에 `danger` variant 추가(빨강 솔리드 + 기존 secondary와 같은 흐린 보라 테두리) — 상세 화면의 "삭제" 버튼용. 기존 `primary`/`secondary`엔 영향 없음.

**발견한 이슈와 처리**

1. **기간 필터(1D-365D) leftover**: 이 화면도 "국가 리더 전체 목록"과 똑같이 `top: 1799px` 절대좌표라 화면 밖으로 잘려 안 보임 — 이전과 동일하게 미구현.
2. **액션 배지 색 분포가 일관적이지 않음**: Figma 인스턴스를 보면 "위험" 활성 배지와 비활성 배지는 솔리드(100%) 채움인데, "확인"/"검토" 활성 배지만 옅은 17%/72% 틴트로 돼 있었음(다른 컴포넌트를 복붙한 흔적으로 추정). 활성/비활성 구분이 한눈에 더 잘 보이는 솔리드 쪽으로 통일해서 셋 다 같은 규칙(활성=accent 솔리드, 비활성=중립 솔리드)을 적용함 — **확인 필요**: 옅은 틴트가 의도된 디자인이라면 알려주시면 "확인/검토"만 다시 옅게 뺄 수 있음.
3. **"신청 유형" 필드 값이 "Richard"(사람 이름)로 돼 있음**: 상세 화면의 첫 필드 라벨은 "신청 유형"인데 Figma 원본 값 자체가 "Richard"였음(같은 "Richard"/"장영길"/"example@email.com" 조합이 파트너의 `MerchantDetail` 더미 데이터에도 그대로 나와 — 여러 화면에 재사용된 목업 컴포넌트의 흔적으로 보임). 데이터 값은 추측하지 않는다는 규칙(CLAUDE.md 9번)에 따라 **Figma 값 그대로 두었음** — 실제로는 "기술제휴/투자제안" 같은 분류값이어야 할 가능성이 높아 **확인 필요**.
4. **"지역" 라벨이 한 화면에 두 번 나옴**(서울/강남 각각). 위와 같은 이유로 라벨도 Figma 그대로 두 번 둠 — 구분이 필요하면 (예: "시/도" · "구/동") 알려주시면 라벨만 바로 수정 가능.
5. **"홈페이지 / 링크" 필드의 placeholder가 "연락 가능한 번호"(전화번호 안내문구)로 돼 있었음**: 바로 위 "연락처" 필드의 placeholder를 복붙한 흔적이 명확해, placeholder는 데이터가 아니라 안내문구라 "웹사이트 또는 SNS 링크를 입력"으로 바로잡음(라벨/실제 데이터 값은 손대지 않음).

**검증**

- `npx tsc --noEmit` 기준 신규/수정 파일에는 에러 없음. 단, 같은 시점에 사용자가 별도로 작업 중인 `src/pages/hq/Dashboard/Dashboard.tsx`(미완성 WIP)에 무관한 타입 에러 8건이 있어 `npm run build`(tsc 포함) 전체는 현재 실패함 — 해당 파일은 사용자 작업 범위라 손대지 않음.
- Vite dev 서버 + Playwright(헤드리스, 스크래치 디렉터리에 임시 설치, 레포 의존성엔 추가 안 함)로 `localStorage.korion.role='HQ'` 설정 후 `/hq/applications`, `/hq/applications/detail` 접속 → 콘솔 에러 0건(처음엔 상세 화면의 중복 "지역" 라벨을 React key로 써서 key 중복 경고가 났었음 — 인덱스 key로 수정 후 해결), 스크린샷으로 Figma와 KPI 값/컬럼/배지/필드/버튼 배치 전부 대조 확인.

---

## 2026-06-28 — 국가 리더별 거래내역: "정산내역" 탭 콘텐츠 구현

탭 4개째인 "정산내역"의 실제 내용을 채우는 작업. Figma 전체(약 36개 화면 프레임)를 layer 단위로 훑었으나 이 탭 전용으로 디자인된 콘텐츠는 존재하지 않았음(거래내역 탭만 실제로 그려져 있고, 나머지 4개 탭은 클릭 가능한 라벨만 있는 상태) — 사용자에게 확인 요청.

**사용자 지시(확정)**: 사용자가 직접 Figma 링크(`node-id=1-20004`)를 제공하며 작업을 지시했으나, 실제로 확인해보니 그 프레임은 사이드바만 있고 콘텐츠 영역(`콘텐츠 / 대시보드`, 1:20144)이 완전히 비어있는 미완성 스캐폴드였음(Figma 파일 자체에 컨텐츠가 없음, 내 추출 오류 아님 — `get_metadata`로 자식 노드 0개 확인). 대신 사용자가 함께 지시한 "기존에 만든 파트너 정산 페이지 컴포넌트 재활용" 쪽으로 진행 — 리더 본인용 `src/pages/SettlementHistory`(요약 카드 2개 + 정산 내역 표) 패턴을 그대로 재사용.

**구현**:
- `leaderSalesData.json`에 `settlement`(마지막 정산일/이번 요청액/상태/정산 내역 행 3개) 추가 — `SettlementHistory`의 실제 더미값(`SET-20260607-001` 등)과 동일 패턴.
- `useLeaderSales.ts`: `settle.hist.*` i18n 키(이미 존재, 리더 본인 화면과 100% 동일 라벨)를 그대로 재사용해 `settlementColumns` 구성.
- `LeaderSales.tsx`/`.module.css`: "정산내역" 탭(인덱스 3) 선택 시 요약 카드 2개(마지막 정산일/이번 요청액) + `DataTable` 렌더. 단, 리더 본인 화면의 `<select>` 상태 토글은 "리더가 자기 요청 상태를 보는" 용도라 HQ가 읽기만 하는 이 화면엔 안 맞아서, 같은 자리에 고정 상태 배지(`.settleStatusBadge`, 원래 `SettlementHistory.module.css`에 정의돼 있었지만 안 쓰이고 있던 클래스)로 대체.
- 액션 컬럼 "상세"는 별도 정산 상세 라우트로 연결하지 않고(이 화면 자체가 이미 거래내역 화면 안의 탭이라 중첩 네비게이션이 애매함) 정적 배지로만 표시.

**검증**: 빌드 통과, Playwright로 "정산내역" 탭 클릭 후 스크린샷 — 마지막 정산일/이번 요청액 카드, 상태 배지, 표 컬럼 9개+액션 정상 렌더 확인.

---

## 2026-06-28 — 대시보드 (전체 운영 대시보드) — 신규 구현

**Figma 노드 찾은 방법**: 이 화면도 똑같이 "본사 관리자 - 전체 운영 대시보드"라는 동일 이름이 거의 모든 최상위 프레임에 복붙돼 있어(24곳) 이름만으로 못 찾음. 좌표 그리드를 분석해 헤더 바로 아래 행(y=3377)에서 폭/높이가 유독 큰(1440×5337, 다른 화면들은 1825) 프레임 2개(x=3678, x=5948)를 후보로 추리고, `get_screenshot`으로 실제 렌더링을 확인해 1:14972(전체 운영 대시보드)·1:15846(국가별 대시보드, 다음 작업 대상)로 확정.

**한 일**

- `src/pages/hq/Dashboard/`(신규): 19개 KPI 카드 + 3개 빈 순위 패널 + 11개 콘텐츠 섹션(실시간 결제 모니터링/오프라인 결제·Sync 현황/정산·담보금 현황/리스크 커맨드센터/국가별 운영 현황/신청·승인 큐/네트워크 성장/결제수단 성과/관리자 로그/AI 운영 인사이트/퀵 액션)으로 구성된 본사어드민 랜딩 화면. JSON+훅 패턴, 데이터는 `dashboardData.json`.
- `src/components/molecules/StatCard`: `labelTone?`/`deltaTone?` optional prop 추가 — "오늘" 계열 카드의 호박색 라벨, 리스크 계열 카드의 빨간 증감줄용. 기존 호출부(리더/본사 목록 화면)는 안 줘서 영향 없음.
- `src/components/molecules/MiniStatCard/`(신규 molecule): 라벨+값만 있는 가장 작은 통계 박스(236×72, accent별 테두리색). 오프라인 결제/정산/리스크/승인큐/네트워크성장 5개 섹션에서 24회 반복돼 신규 추출.
- `App.tsx`: `HQ_PAGES.dashboard` 매핑 추가.
- `src/i18n/ko.json`/`en.json`: `hqDashboard.*` 키 약 150개 추가(KPI 라벨/증감줄, 11개 섹션 제목·설명·컬럼명 등). 행 데이터(국가명·지갑주소·금액·코드 등)는 CLAUDE.md 11번 규칙상 번역하지 않고 JSON에 그대로 둠.

**발견한 이슈와 처리**

1. **"전체 운영 KPI 그리드" 19개 카드가 처음엔 전부 중복/오표기로 보였음**: `get_metadata`가 보여주는 레이어 `name`(예: "활성국가"가 4번 반복, "리스크 알림"이 3번 반복)만 보면 복붙 잔재로 라벨이 안 맞는 줄 알았으나, `get_design_context`로 실제 렌더링 텍스트를 다시 확인하니 19개 전부 서로 다른 진짜 지표였음(레이어 이름만 안 갱신된 것). SUMMARY.md의 "레이어 이름 불신, 실제 텍스트로 확인" 경고가 이번에도 그대로 적중 — 추측 대신 `get_design_context`/스크린샷으로 전부 재확인 후 반영함.
2. **기간 필터(1D-365D) leftover**: 이 화면도 헤더 영역 안에 `top: 1799px` 절대좌표로 박혀 화면 밖에 잘려 안 보이는 동일한 복붙 흔적이 있어 미구현(기존 화면들과 동일 처리).
3. **미니 통계 박스(236×72)의 테두리색이 카드마다 살짝씩 다른 rgba였음**(예: cyan만 5종류 변형). 전부 다른 의도된 색이 아니라 복붙 중 미세하게 흐트러진 값으로 판단해, 의미 단위로 토큰의 `AccentKey`(cyan/orange/red/green/purple)에 매핑했다 — 픽셀 단위 rgba를 전부 따로 박지 않음.
4. **"Network Growth Overview" 섹션의 카드 배경(Rectangle)이 제목/본문보다 148px 아래에 떨어져 있었음**(다른 섹션은 배경이 제목을 정확히 감쌈). 의도된 디자인이 아니라 배경 박스만 따로 옮겨진 흔적으로 보고, 다른 10개 섹션과 똑같이 제목+설명+본문을 한 박스로 묶어 일관되게 구현함.
5. **표+보조박스(국가 히트맵/막대그래프/도넛차트) 좌우 배치 비율이 화면마다 제각각**(640:342, 690:292, 480:512 등 Figma 고정폭): 고정 픽셀로 그대로 박으면 이식 시 폭이 다른 화면에서 깨지기 쉬워, 공용 `sideBySide` 레이아웃(표 쪽 flex:2, 보조박스 flex:1, 좁은 화면에서 줄바꿈)으로 일반화함 — Figma 절대값과는 다르지만 본질적으로 "표가 더 넓다"는 비율은 유지.
6. **결제수단 비율 도넛/네트워크 성장 막대그래프**: 차트 라이브러리를 새로 추가하지 않고(CLAUDE.md 2번 규칙 — 라이브러리 최소화) `conic-gradient`+`mask`(도넛), 막대 높이를 인라인 스타일로 직접 넣는 정적 `<div>`(막대그래프)로 구현. 동작(호버/툴팁) 없음, 표시만.

**검증**

- `npm run build`(tsc+vite) 통과.
- Vite dev 서버 + Playwright(헤드리스, 스크래치 디렉터리에 임시 설치)로 `localStorage.korion.role='HQ'` 설정 후 `/hq/dashboard` 접속 → 콘솔 에러 0건. `AdminLayout`의 콘텐츠 영역이 내부 스크롤 구조(`overflow-y:auto`)라 일반 `fullPage` 스크린샷이 1000px에서 잘렸던 것을 뷰포트 높이를 7200px로 키워 전체(약 5300px) 캡처하는 방식으로 해결, 11개 섹션 전부 스크린샷으로 Figma와 KPI 값/색/표/차트 대조 확인.
- 한↔영 전환 확인: 헤더/KPI 라벨/섹션 제목·설명/컬럼명 전부 번역됨, 데이터 값(국가명/코드/금액 등)은 규칙대로 번역 안 됨.

---

## 2026-06-28 — 파트너 요청 관리 (리더 승인 요청) — 신규 구현

**Figma 노드 찾은 방법**: 이 화면도 "본사 관리자 - 전체 운영 대시보드"라는 동일 이름이 복붙된 최상위 프레임 중 하나였음. "파트너 요청 관리" 그룹(4항목: 리더 승인 요청·파트너 승인 요청(리더요청)·파트너 승인 요청(다이렉트)·가맹점 승인 요청(다이렉트))의 첫 항목이라는 단서로 좌표 그리드(y=11967 행, x=3678)에서 후보를 추리고 `get_screenshot`으로 실제 렌더링을 확인해 1:16704로 확정(레이어명·테이블명은 "전체 운영 대시보드"/"공식 홈페이지 제휴 / 투자 신청 목록"로 복붙 흔적이었지만, 실제 렌더링된 타이틀은 "파트너 요청 관리 - 리더 승인 요청", 테이블 제목은 "리더 승인 요청"이었음 — SUMMARY.md의 "레이어 이름 불신" 경고가 또 적중).

**한 일**

- `src/pages/hq/RequestsLeader/`(신규): "리더 승인 요청" 목록 화면. KPI 3개(신규 신청/검토중/대기자) + 테이블(10컬럼, 액션 컬럼은 승인/거절/검토중/대기/자료요청 5개 고정 배지 중 그 행의 현재 상태 하나만 강조) + 하단 설명 캡션(리더 승인 시 코드 승계 규칙).
- `RequestListPage` 템플릿은 테이블 아래 캡션 슬롯이 없고, 마침 다른 세션이 같은 시점에 그 템플릿/공용 컴포넌트들(`StatSection`/`DataTable`/`StatCard`/`ActionBadges` 등)을 동시에 수정 중이라 충돌을 피하기 위해 템플릿은 건드리지 않고 `PageHeader`+`StatSection`+`DataTable`을 페이지에서 직접 조합하는 방식으로 구현(공용 코드 수정 없음).
- 액션 배지는 `Applications`(신청서 관리) 화면에서 이미 추가된 `ActionBadges`의 `solid` prop을 그대로 재사용(라벨별 `accentByLabel`만 행마다 다르게 계산) — 컴포넌트 추가 변경 없음.
- `App.tsx`: `HQ_PAGES['requests/leader']` 매핑 추가.
- `src/i18n/ko.json`/`en.json`: `hqRequestLeader.*` 키 추가(타이틀/KPI/컬럼/액션 라벨/하단 캡션).

**발견한 이슈와 처리**

1. **액션 배지 데이터 모델이 "라벨 목록"이 아니라 "상태 1개 강조"였음**: 처음엔 행마다 보여줄 배지 종류가 다른 줄 알았으나, Figma 6개 샘플 행을 전부 대조한 결과 5개 배지(승인/거절/검토중/대기/자료요청)가 항상 고정으로 나오고 그 중 신규 접수 행은 전부 무강조, 나머지는 검토중·대기·자료요청 중 하나만 옅은 강조색이었음. `Applications` 화면과 같은 패턴으로 판단해 `statusMeta` 방식을 그대로 따름.
2. **"상위 코드"/"신청자 코드" 컬럼의 의미**: 테이블 하단 캡션("리더 승인이되면 기존 파트너 아이디를 유지한체 승급된다…")을 통해 이 화면이 "파트너를 국가 리더로 승급 승인"하는 화면이고, "상위 코드"=신청자(파트너)의 기존 상위 리더 코드(승인 시 삭제됨), "신청자 코드"=승급 후에도 유지되는 그 파트너 자신의 코드라는 걸 확인 — 캡션 원문의 명백한 오타("유지한체"→"유지한 채", "승인이되면"→"승인이 되면")만 가독성을 위해 바로잡고 의미는 그대로 둠.
3. **영문 모드에서 액션 배지 5번째("Info Requested")가 컬럼 밖으로 잘림**: 액션 라벨이 한글보다 영문이 훨씬 길어(승인→Approve, 자료요청→Info Requested) 처음 잡은 컬럼 폭(1.8fr)에선 영문 모드만 잘렸음. 액션 컬럼 폭을 3fr로 넓혀 한/영 모두 한 줄에 들어오는 것을 스크린샷으로 확인.
4. **Figma 원본은 강조 배지가 옅은 틴트(17%/72%)인데 `solid` 적용 시 100% 채움이 됨**: `Applications` 화면도 같은 이유로 이미 솔리드로 통일했던 선례가 있어(CHANGELOG 2026-06-28 신청서 관리 항목 참고) 일관성을 위해 그대로 따름 — 옅은 틴트가 맞다면 두 화면 모두 같이 되돌리면 됨.

**검증**

- `npm run build`(tsc+vite) 통과.
- Vite dev 서버(5176, 다른 세션이 5173~5175를 쓰고 있어 자동으로 다음 포트 사용) + Playwright(스크래치 디렉터리에 임시 설치, 레포 의존성엔 추가 안 함)로 `localStorage.korion.role='HQ'` 설정 후 `/hq/requests/leader` 접속 → 콘솔 에러 0건, KPI 3개·테이블 10컬럼·6행·배지 강조·하단 캡션 전부 Figma와 대조 확인.
- 한↔영 전환 확인: 헤더/KPI/컬럼/액션 라벨/캡션 전부 번역됨, 데이터 값(국가명/코드/날짜/금액)은 규칙대로 번역 안 됨. 영문 모드 액션 컬럼 폭 이슈는 위 3번 항목으로 수정 후 재확인.

---

## 2026-06-28 — 대시보드(전체 운영 대시보드) 정밀 보완: 색상/줄무늬/반응형 재대조

사용자가 Figma 링크(node-id=1-15113)를 직접 지정하며 "구현 안 된 게 많다"고 재지적, 추측 없이 `get_design_context`로 표·배지 색상을 한 셀씩 다시 대조함. 또한 "리스트는 화면 폭이 바뀌어도 절대 단위로 스크롤되지 말고 같은 비율로 유동적이어야 한다"는 요구를 받음.

**발견한 문제 (전부 실측 후 수정)**

1. **상태/액션 배지가 "항상 배지"라고 잘못 가정함**: 실제로는 진행 중·이례적인 값만 배지로 강조하고 나머지는 평텍스트였음(예: 실시간 결제 5건 중 PENDING 1건만 Sync도 배지, 나머지 4건은 Sync·검증 둘 다 평텍스트 / 정산·리스크 표는 4행 중 1행이 상태·점수를 평텍스트로 둠). `accent가 있으면 Badge, 없으면 평텍스트`로 분기하는 `badgeOrText` 헬퍼를 추가하고 `dashboardData.json`의 해당 필드를 옵셔널로 바꿔 행마다 정확히 반영.
2. **배지 색이 다수 오배정**: COMPLETED(초록→**보라**), 정산 "리스크보류"/승인큐 "보류"(빨강→**주황**), 승인큐 "자료요청"/AI인사이트 Medium/활동로그 Medium(주황→**호박색**, 주황 rgba(255,157,61)과 별개 색조 rgba(247,201,72) 확인) 등. `AccentKey`에 `amber`를 신규 추가(tokens.css/types/accent.ts)해 토큰 체계 안에서 표현.
3. **"실시간 결제 모니터링" Sync 배지 색이 주황으로 잘못돼 있었음**: 실제로는 상태(PENDING)와 같은 블루였음 — 수정.
4. **표 줄무늬·헤더 배경이 기존 화면(`mutedText`)의 보라빛 지브라를 그대로 썼지만, 이 화면은 더 짙은 남색 계열(rgba(9,14,37,.96)/rgba(13,20,50,.96) 교대 + 헤더 행 rgba(18,26,60,.94) 배경)이었음**: `DataTable`에 `navyZebra` opt-in 변형을 추가(기존 `mutedText` 화면엔 영향 없음), 7개 표 전부 `largeText navyZebra`로 교체.
5. **"결제수단 성과" 표의 실패원인 컬럼은 4행 전부 시안 배지인데 평텍스트로 그려져 있었고, Sync 컬럼은 반대로 4행 전부 배지였던 걸 1행(BLE만 배지)으로 고침** — 둘을 서로 바꿔서 만들었던 것을 실측대로 정정.
6. **미니 통계 박스 그리드(`miniStatGrid`)와 그 안의 `MiniStatCard`가 고정 236px×4열 + `overflow-x:auto`였음**: Figma 실측값을 그대로 박았던 것이 "화면 폭이 바뀌면 비율 유지가 아니라 잘려서 스크롤"되는 사용자 지적의 원인이었음. `repeat(4, minmax(0,1fr))`로 바꾸고 `MiniStatCard`의 `width:236px`도 `100%`로 바꿔 부모 칸을 그대로 채우게 함(1100px 좁은 뷰포트에서 `scrollWidth === clientWidth` 확인 — 가로 스크롤 없음). KPI 그리드(`repeat(5,1fr)`)는 이미 유동형이라 추가 수정 없음.

**검증**

- `npm run build`(tsc+vite) 통과.
- Playwright로 1440px(전체 스크린샷, 11개 섹션 전부 Figma 색상표와 재대조)·1100px(가로 스크롤 없음, `main.scrollWidth===clientWidth` 확인) 두 뷰포트에서 재검증, 콘솔 에러 0건.

---

## 2026-06-28 — 대시보드 (국가별 대시보드) — 신규 구현

**Figma 노드**: 사용자가 직접 준 링크로 1:15987 확정(`콘텐츠 / 대시보드` 프레임).

**한 일**

- `src/pages/hq/CountryDashboard/`(신규): KPI 19장 + 순위 패널 3개(나라별/파트너별/가맹점별) + "국가별 운영 순위" 표 1개로 구성.
- `src/components/molecules/StatCard`: `labelTone`에 `'green'` 추가(`--color-accent-green` 매핑). 기존 `'default'|'amber'` 호출부는 영향 없음.
- `src/components/organisms/DataTable`: `zebra?: boolean` 추가 — 글자 크기/색은 기본값(흰 글씨) 그대로 두고 행 배경만 지브라 무늬로. 기존 `mutedText`가 갖고 있던 지브라 CSS를 `.zebra`로 분리하고 `mutedText`가 항상 `.zebra`도 같이 받게 해서(`(zebra || mutedText) && styles.zebra`) 기존 화면 색은 그대로 유지.
- `src/i18n/ko.json`/`en.json`: `hqCountryDashboard.*` 키 추가(페이지 제목, 표 제목/컬럼 9개).
- `App.tsx`: `HQ_PAGES['dashboard/by-country']` 매핑 추가(`src/roles/hqNav.ts`에 이미 등록돼 있던 경로).

**발견한 이슈와 처리**

1. **KPI 19장 + 순위 패널 3개가 "전체 운영 대시보드"(`src/pages/hq/Dashboard`)와 라벨·값·증감 텍스트까지 완전히 동일한 복붙**이었음(`get_design_context`로 텍스트 단위 대조 확인). 차이는 단 둘: ① 1번 카드("활성국가")의 값이 숫자("18 개국")가 아니라 국가명("나이지리아")으로 바뀌고 증감/설명줄이 없어짐, ② 11개 콘텐츠 섹션 대신 "국가별 운영 순위" 표 1개만 있음. 그래서 새 화면은 같은 `hqDashboard.kpi.*`/`hqDashboard.ranking.*` i18n 키를 그대로 재사용하고(새 키 중복 생성 안 함), 표 부분만 새로 작성.
2. **라벨 색조 3종(기본/초록/호박색)이 한 KPI 그리드에 같이 있었음**: 1~5번 카드는 기본(흐린 회색), 6~10번(담보금 충전/해제 등)은 초록(`#09c809`), 11~16번(오늘 결제/정산 등)은 호박색(`rgba(247,201,72,.75)`/`#f7c948`) — `StatCard`에 초록 톤이 없어서 추가함. **확인 필요**: "전체 운영 대시보드" 쪽도 Figma상 6~10번 카드가 똑같이 초록 라벨일 가능성이 높은데(완전 동일 복붙 화면이라), 그 화면 구현 시엔 초록 톤 없이 만들어져 누락된 것으로 보임 — 이번 작업 범위가 아니라 손대지 않았음, 맞다면 같이 고치면 됨.
3. **KPI 라벨이 전부 11px·Regular(증감 유무와 무관)**: 기존 `cardRatio`(증감줄 있을 때만 11px)로는 증감 없는 1번 카드만 12px·Medium으로 빠져버려서, 19장 전부에 `dense` prop을 줘서 강제로 통일.
4. **"국가별 운영 순위" 표의 지브라 줄무늬는 있는데 글자색은 흰색(흐리지 않음)**: 기존 `mutedText`는 줄무늬+글자색 흐림이 한 세트라 이 표엔 안 맞아서, 줄무늬만 분리한 `zebra` prop을 `DataTable`에 새로 추가(2번 항목).
5. **"월 거래 건수" 컬럼 값이 "월 결제 금액"과 똑같이 "$1.28M"로 찍혀 있음**(건수인데 달러 금액 표기) — 3행 전부 동일 패턴이라 복붙 흔적으로 보이지만, 데이터 값은 추측하지 않는다는 규칙(CLAUDE.md 9번)에 따라 Figma 값 그대로 두었음. **확인 필요**: 실제로는 건수(예: "2,840건" 같은 정수)여야 할 가능성이 높음.
6. **"상태" 컬럼("위험")이 배지(알약) 모양이 아니라 일반 텍스트**: Figma 마크업 확인 결과 다른 화면의 액션 배지들과 달리 배경/테두리 없이 행 텍스트 색(흰색) 그대로 찍힌 plain text였음(3행 모두 "위험"이라 색 분기 패턴 자체를 알 수 없음) — Figma에 없는 배지 스타일을 임의로 만들지 않고 plain text로 구현. **확인 필요**: 상태값이 여러 종류(정상/주의/위험 등)로 늘어나면 배지+accent색 분기가 필요할 수 있음.
7. 기간 필터(1D-365D) leftover와 "전체 국가"/"오늘" 필터칩은 기존 화면들과 동일하게 처리(앞쪽은 미구현, 뒤쪽은 동작 없는 표시용 `chip`).

**검증**

- `npm run build`(tsc+vite) 통과.
- Vite dev 서버 + Playwright(스크래치 디렉터리에 임시 설치, 레포 의존성엔 추가 안 함)로 `localStorage.korion.role='HQ'` 설정 후 `/hq/dashboard/by-country` 접속 → 콘솔 에러 0건. 1440px 스크린샷으로 KPI 19장 라벨 색조 3종·표 지브라·툴바 배치 전부 Figma와 대조 확인. 1920px/1024px/768px로 반응형 확인 — KPI 5열이 넓은 화면에서도 6열로 안 깨지고(고정 열 개수 유지), 1024px 이하에서 3열→640px 이하 2열로 축소됨.
- 한↔영 전환 확인: 헤더/KPI 라벨·증감/패널 제목/표 제목·컬럼·툴바 전부 번역됨, 데이터 값(국가명/코드/금액/상태)은 규칙대로 번역 안 됨.

---

## 2026-06-28 — 대시보드 2종 정밀 보완: 초록 라벨 톤 + 카드 정렬

사용자가 국가별 대시보드를 직접 확인하고 두 가지 지적: ① 6~10번 KPI 카드(담보금 충전/해제 등)가 초록 라벨이 맞고, 이걸 기준으로 "전체 운영 대시보드" 쪽도 같이 고쳐야 한다. ② "활성국가"/"나이지리아" 카드는 좌측 위 정렬이어야 한다. 나머지(확인 필요 항목들)는 보류 지시.

**① 전체 운영 대시보드(`src/pages/hq/Dashboard`)에 초록 라벨 누락 — 수정**
Figma 원본 KPI 그리드 노드(1:15144)를 다시 떠서 6~10번 카드 라벨 색을 재확인 → 전부 `#09c809`(초록)로 국가별 대시보드와 100% 동일했음(완전 복붙 화면이라는 가설 재확인). `dashboardData.json`의 `collateralBalance`/`collateralTopup`/`collateralTopupCount`/`collateralRelease`/`newApplicationsToday` 5개에 `"labelTone": "green"` 추가. `useDashboard.ts`의 `KpiRaw.labelTone` 타입에 `'green'` 추가(국가별 대시보드 작업 때 `StatCard`/`StatCard.module.css`에는 이미 추가돼 있어 컴포넌트 쪽 변경 없음).

**② "활성국가" 카드 세로 정렬 — `StatCard`에 `alignTop` opt-in 추가**
원인: `StatCard.module.css`의 `.card`가 `justify-content: center`라, 같은 행의 다른 카드들(증감줄 있어 3줄)보다 이 카드만 줄 수가 적어서(증감줄 없이 2줄) 내용이 세로 중앙에 떠 보였음. `alignTop?: boolean` prop을 추가해 `justify-content: flex-start`로 덮어쓰게 하고, `countryDashboardData.json`의 `activeCountries` 카드에만 `"alignTop": true`를 줘서 그 카드만 위로 붙임 — 다른 카드/화면은 영향 없음(opt-in).

**검증**

- `npm run build`(tsc+vite) 통과.
- Playwright로 두 화면 KPI 그리드 재스크린샷 — 전체 운영 대시보드 2번째 행(현재 총 담보금 잔액/총 담보 충전 금액/총 담보 충전 건수/총 담보 해제 금액/오늘 신규 신청) 라벨이 초록으로 보임, 국가별 대시보드 "활성국가/나이지리아" 카드가 옆 카드들과 같은 높이에서 시작(좌측 위 정렬)함을 확인.

---

## 2026-06-28 — 결제 모니터링: 전체 결제 로그 화면 추가 (payments/logs)

Figma `node-id 1:18353`(결제 모니터링 > 전체 결제 로그)를 요소 단위로 정밀 분석 후 구현. 구조가 기존 목록 화면과 동일(헤더 + KPI 카드 + 단일 테이블)이라 **새 컴포넌트 없이** 기존 템플릿/조직을 100% 재사용했다.

**한 일**

- `src/pages/hq/PaymentLog/`(신규): `PaymentLog.tsx` + `usePaymentLog.ts` + `paymentLogData.json` + `PaymentLog.module.css` + `index.ts`.
  - `RequestListPage`(template) 재사용: `statsBare`(박스 없는 KPI 그리드 10장) + `tableMutedText`(본사어드민 11px muted 표) + `toolbarInline`(제목 옆 툴바).
  - KPI 10장(오늘 총 결제 건수/금액, 오프라인/온라인 결제 건수, Sync 대기/실패, 서버 검증 실패, 정산 완료/보류, 리스크 감지) — `StatCard`에 `delta`(전일 대비 +5/+5%) cyan으로.
  - 표 15컬럼(거래 ID/세션 ID/거래 일시/리더 코드/파트너 코드/국가/가맹점명/결제방식/연결 상태/결제 금액/수수료/실수령/결제자/상태/액션) 6행.
  - 상태 셀은 알약이 아니라 **색 글자**(성공=green/실패=red/대기=amber) — 색은 `ACCENT_VAR` 토큰 변수를 인라인 주입, 굵기만 `PaymentLog.module.css`로. 액션 셀은 `ActionBadges`(지급완료=green/보류해제=amber/지급보류·상세=중립, `size="xs"`).
- `src/App.tsx`: `HqPaymentLog` import + `HQ_PAGES['payments/logs']` 매핑(기존 Placeholder 대체).
- `src/i18n/ko.json` / `en.json`: `hqPaymentLog.*` 키(제목/KPI 라벨·증감/컬럼명) 추가.

**판단/메모**

- Figma 프레임 헤더 텍스트가 "가맹점 관리 - 가맹점 전체 목록"으로 박혀 있으나 이는 복붙 leftover(같은 문구가 `hqMerchantList.title`에 그대로 존재). 실제 사이드바 메뉴는 "결제 모니터링 > 전체 결제 로그"라 제목을 메뉴명(`hqPaymentLog.title`="전체 결제 로그")으로 둠.
- 툴바 "엑셀 다운로드"는 프로젝트 공통 키 `common.excel`("Excel")을 그대로 사용 — 동일 계열(거래 로그) 표들과 라벨 일관성 유지. Figma 표기와는 문구만 다름(의도적).

**검증**

- `tsc --noEmit` 통과.
- Playwright(헤드리스, `localStorage.korion.role='HQ'` 주입)로 `/hq/payments/logs` 접속 → 헤더·KPI 10장(4+4+2)·전체 결제 로그 표가 Figma와 1:1로 렌더, 상태 색 글자(성공/실패/대기)·액션 배지 색 일치, 콘솔/페이지 에러 없음. 기존 화면·라우트 변경 없음.

---

## 2026-06-28 — 전체 결제 로그: 페이지 제목 변경 + "상세" 우측 Drawer 추가

Figma `node-id 1:25387`(전체 결제 로그 · 상세 Drawer)를 구현. 해당 프레임은 좌측 설명/주석 + 우측 실제 Drawer로 구성된 스펙 페이지라, **우측 "거래 상세 정보" 패널만** 제품 UI로 구현(좌측 미니테이블·예시·상태별 액션 설계 박스는 디자인 주석이라 제외 — 사용자 확인).

**한 일**

- 페이지 헤더 제목을 `결제모니터링 - 전체 결제 로그`로 변경(`hqPaymentLog.pageTitle` 신규). 테이블 패널 제목은 `전체 결제 로그`(`hqPaymentLog.title`) 그대로 — 헤더/패널 제목 분리.
- `src/components/organisms/DetailDrawer/`(신규): 우측 슬라이드 공용 드로어 셸([스크림]+[고정 헤더]+[스크롤 본문]+[고정 푸터]). 열기/닫기만(작업 범위: UI), 배경 클릭·닫기 버튼으로 닫힘. **목록 화면 어디서든 재사용 가능**하게 내용은 props/children 주입.
- `src/components/molecules/DetailSection/`(신규): 드로어 섹션 박스(제목 + 라벨/값 줄 목록). 표가 아닌 섹션(스텝퍼·메모)은 `children`으로.
- `src/pages/hq/PaymentLog/`: `paymentLogDetailData.json` + `usePaymentLogDetail.ts` 추가. 표 "상세" 배지 클릭 → 드로어 오픈(행 전체가 아니라 '상세' 배지만 트리거 — 정산 배지와 분리). A~H 섹션(기본/송수신자/로컬블록/Proof검증/Sync스텝퍼/수수료정산/리스크/메모) + 헤더 상태배지 + 하단 액션 버튼.
- `src/i18n/ko.json`/`en.json`: `common.close` + `hqPaymentLog.pageTitle`/`hqPaymentLog.detail.*`(섹션 제목·필드 라벨·버튼) 추가.

**판단/메모 (사용자 확인 사항)**

- 드로어 데이터: 현재 어느 행을 눌러도 **동일한 Figma 예시 1건**을 표시(요구사항). 단, 추후 API 연동이 쉽도록 `paymentLogDetailData.json`을 섹션(header/basic/parties/localBlock/proof/sync/fee/risk/memo/footerActions) 구조로 깔끔히 정리하고, `usePaymentLogDetail(txId)`가 txId를 받도록 시그니처만 미리 열어둠(내부만 API로 교체).
- 인터랙션: 닫기만 작동. 하단 버튼·Sync 스텝퍼·메모 textarea(readOnly)는 표시 전용(CLAUDE.md 1번 규칙).
- 푸터 버튼 색: Button atom 변형(primary/secondary/danger)으로 매핑 — 메모 저장/서버 검증=primary, 리스크 등록=danger, 나머지=secondary. Figma의 "메모 저장 초록"은 별도 변형을 추가하지 않고 primary로 대체(의도적, atom 영향 최소화).

**검증**

- `tsc --noEmit` 통과.
- Playwright로 `/hq/payments/logs`에서 1행 "상세" 클릭 → 우측 드로어가 헤더(KP-... 시안 + 상태배지 5개 + 메타줄)·A~H 섹션·Sync 스텝퍼(REQ/APP/PROOF=완료 초록, EVD=진행 시안, 이후 대기 중립)·관리자 메모·고정 푸터까지 Figma와 일치하게 렌더됨을 확인. 페이지 헤더가 "결제모니터링 - 전체 결제 로그"로 바뀐 것도 확인. 콘솔/페이지 에러 없음.

---

## 2026-06-29 — 전체 결제 로그: 툴바 버튼 높이 + 표 가로폭 고정·셀 줄바꿈

사용자 피드백 2건 반영.

- **툴바 버튼(검색/필터/Excel) 높이 과대** → Figma 재확인 후 보정. Figma는 옅은 테두리(rgba 55%)의 작은 칩이라, 기본 `.toolbarButton`(8px 패딩·진한 보라 테두리)이 본사어드민 표에서 너무 높아 보였음. `mutedText` 변형에서만 세로 패딩 8→5px·라인하이트 1.2·테두리 55% 적용 → 버튼 높이 34→26px(측정값). 리더 등 비-muted 표는 영향 없음.
- **15컬럼 표가 좁은 화면에서 글자 잘림** → 가로 스크롤이 아니라 **가로폭 고정 + 줄바꿈** 방식으로 처리(사용자 요청: "리스트 가로 전체는 고정하고 길면 다음줄로"). `DataTable`에 `wrapCells?` prop 추가 — 켜면 셀이 말줄임(…) 대신 다음 줄로 넘어가고(`white-space:normal; word-break:break-word`), 헤더 셀도 줄바꿈, 줄바꿈 시 셀을 위쪽 정렬(`align-items:start`). 전체 결제 로그는 `tableFluid`(가로폭을 컨테이너에 고정·행 최소폭/가로 스크롤 제거) + `tableWrapCells`를 같이 적용. `RequestListPage`에 `tableFluid`/`tableWrapCells` passthrough 추가. 기본 표들은 그대로(말줄임).

**검증**

- `tsc --noEmit` 통과.
- Playwright 측정: 버튼 높이 26px, 표 가로 스크롤 없음(`scrollWidth==clientWidth`, vp 1280·1440 모두). 스크린샷으로 거래ID(`KP-20260614-0001`)·세션ID·거래일시 등 긴 값이 잘리지 않고 다음 줄로 줄바꿈되어 끝(액션 컬럼)까지 보임을 확인.

---

## 2026-06-29 — 파트너 수수료/정산 · 정산 신청(목록 + 상세 검토)

**한 일** — `수수료 / 정산` 그룹의 첫 화면. Figma node n1(1-18569, 목록)·n3(1-20145, 상세 검토 패널) 2개 구현.

- `src/pages/hq/SettlementRequest/`(신규): 정산 신청 목록. KPI 8 + "리더 정산 신청 목록" 표(14컬럼: 신청 ID·신청일·신청자·파트너명·국가·정산 기간·전체 거래금액·파트너 수익·직계약 수익·파트너 정산·보류·최종금액·상태·액션). 행 전체/‘상세’ 클릭 → 상세 검토 라우트로 이동(`onRowClick`). 상태값(정산검토=주황/정산완료=초록/정산보류=호박)은 데이터 값이라 글자색만 입힘. `PageHeader`/`DataTable(mutedText·inlineToolbar·fill)`/`ActionBadges` 재사용, KPI 카드는 화면 로컬 CSS.
- `src/pages/hq/SettlementRequestDetail/`(신규): 별도 라우트 상세 화면. 패널 헤더(SET-LD-… + 컨텍스트 배지 + 상태 배지) → 정산 기간 배너(`InfoGrid`) → 요약 KPI 6(칩 색) → 정산 가능 금액 계산(수식 카드 3개: 가맹점 수익 − 보류 = 최종, 그라데이션 결과 + 분배 게이지 4행) → 수수료 구조 칩 흐름 4행 → 가맹점별 수수료 수익 표 → 보류/제외 거래 표 → 본사 정산 요청 폼(필드 그리드 + 체크 4 + 액션 버튼 정산승인/정산검토/정산보류/자료요청/정산거절/취소 + 저장). 기존 leader `SettlementRequest`의 KPI/AmountCard/게이지/수수료칩 CSS 패턴을 차용.
- `src/App.tsx`: `HQ_PAGES`에 `settlement/request` 매핑 + HQ 라우트 블록에 사이드바 밖 상세 라우트 `settlement/request/detail` 추가(leader 패턴과 동일).
- `src/i18n/ko.json` / `en.json`: 본문/컬럼/버튼 키 92개(`hqSettle.req.*`, `hqSettle.reqDetail.*`) 추가. 메뉴 키(`nav.item.hqSettlement*`)는 Phase 0에서 이미 존재. 기존 파일의 빈 줄 구획을 보존하기 위해 재직렬화 대신 텍스트 append로 추가.

**결정/메모**

- 상세 화면은 **별도 라우트 페이지**로 구현(사용자 결정). 상단에 `PageHeader`(언어/로그아웃) + 페이지 제목("정산 신청 상세 검토")을 두어 다른 화면과 일관성 유지 — Figma n3는 패널 헤더만 있었으나 앱 공통 헤더를 위해 추가(leader `SettlementDetail`과 동일 방식).
- 인터랙션은 **UI 상태만**(사용자 결정). 버튼은 표시 전용, ‘취소’만 목록 복귀, 행 클릭만 라우팅.
- KPI 카드의 보조설명(note)·상태 enum은 기존 정산 화면 컨벤션대로 **데이터 값으로 취급**(번역 안 함) → EN 모드에서도 한국어 유지. 라벨/컬럼/버튼만 번역.

**검증**

- `npm run build`(tsc+vite) 통과.
- Playwright(헤드리스, 스크래치 임시 설치)로 `localStorage.korion.role='HQ'` 설정 후 `/hq/settlement/request`·`/hq/settlement/request/detail` 풀페이지 스크린샷 → Figma n1·n3와 레이아웃/라벨/색/컬럼 1:1 대조 일치 확인. 언어 토글로 EN 전환 시 UI 텍스트만 번역되고 데이터 값(금액·코드·날짜·국가·상태)은 불변 확인.
- 기존 화면/라우트 변경 없음.

**후속(사용자 피드백)**

- KPI 보조설명(note)을 데이터→번역 키로 전환(사용자 요청). 단 상세 화면 1번 카드 note는 날짜값(`2026.05.02 ~ 06.01`)이라 데이터로 유지. `hqSettle.req.note.*`(8) + `hqSettle.reqDetail.note.*`(5) 키 추가, EN에서 번역됨을 스크린샷으로 재확인.

---

## 2026-06-29 — 파트너 수수료/정산 · 정산 내역(목록)

**한 일** — Figma node n4(1-18898) 구현. 정산 내역 상세 폼(n5=1-26061)은 Figma가 깨져 와 **사용자 재전송 대기**(이번 범위 제외).

- `src/pages/hq/SettlementHistory/`(신규): 정산 내역 목록. 기간 필터 칩("30 D", 데이터 토큰이라 번역 안 함) + KPI 12 + "리더 정산 신청 목록" 표(15컬럼: 신청 ID·신청일·**처리일시**·**코드**·파트너명·국가·정산 기간·전체 거래금액·파트너 수익·직계약 수익·파트너 정산·보류·최종금액·상태·액션). 정산 신청(n1) 화면과 KPI/표 패턴·CSS 동일 톤으로 구현.
- KPI 5번(전체 지급 완료 금액)만 Figma 정확값대로 **시안 강조 테두리(2px)**, 나머지는 표준 보라 테두리.
- 상태값(정산검토/정산완료/정산보류)은 데이터 값이라 글자색만. 액션은 Figma 마크업 그대로 `상세` + `검토`/`보류`(상태별). 행 ‘상세’→상세 폼 이동은 **n5 확정 후 라우트 연결 예정**(현재 표시 전용).
- `src/App.tsx`: `HQ_PAGES`에 `settlement/history` 매핑 추가.
- `src/i18n/ko.json` / `en.json`: 본문/KPI/컬럼 키 39개(`hqSettle.hist.*`) 추가. 액션/엑셀 라벨은 `hqSettle.req.*` 재사용. 텍스트 append로 추가(빈 줄 구획 보존).

**결정/메모**

- 기간 필터는 Figma 프레임상 활성값("30 D") 하나만 노출 → 그대로 단일 칩으로 구현(1D~365D 전체 필터 행은 Figma에 안 보임).
- 정산 내역 상세(n5)는 사용자가 "파트너 가입 통합 폼"으로 잘못 export된 노드라 재전송 예정. 받는 즉시 `settlement/history/detail` 라우트 + 행 클릭 연결 예정.

**검증**

- `npm run build`(tsc+vite) 통과.
- Playwright로 `localStorage.korion.role='HQ'` 설정 후 `/hq/settlement/history` 풀페이지 스크린샷 → Figma n4와 레이아웃/라벨/색/KPI 12/15컬럼 대조 일치. EN 전환 시 UI 텍스트만 번역되고 데이터 값(금액·코드·날짜·국가·상태) 불변 확인.
- 기존 화면/라우트 변경 없음.

---
