# 본사어드민(HQ Admin) 작업 규칙

> `headOfficeAdminPage-frontend2` 브랜치에서 본사어드민 화면을 새로 만들 때 지킬 규칙이다.
> 배경/조사 내용은 [SUMMARY.md](./SUMMARY.md) 참고.
> 이 레포는 루트 `KORIONPAY_PAGE_FRONTEND`와 같은 `CLAUDE.md`를 그대로 쓴다 — **이 문서는 CLAUDE.md를 대체하지 않고, 본사어드민 작업에 한정된 세부사항만 보완한다.**

---

## 1. 기존 패턴을 그대로 따른다

리더(`src/pages/Dashboard` 등)·파트너(`src/pages/partner/*`)·가맹점(`src/pages/merchant/*`)이 만들어진 방식과 똑같이 만든다. 새로운 폴더 구조나 새로운 상태관리 방식을 발명하지 않는다.

- **역할 추가 패턴** (파트너/가맹점 역할이 추가될 때 썼던 방식 그대로, `src/roles/` 참고):
  1. `src/roles/types.ts`의 `Role` 유니온에 본사용 키 추가
  2. `src/roles/hqNav.ts`(가칭) 작성 — `NavGroup[]` 구조로 5번 항목의 IA를 그대로 옮긴다(SUMMARY.md 5번)
  3. `src/roles/index.ts`의 `ROLES`에 `basePath`, `roleLabelKey`, `profileLines`, `nav` 등록
  4. `src/App.tsx`에 새 라우팅 서브트리 추가 (`AdminLayout role="..."`로 감싸고 `navRoutes()`로 자식 라우트 생성 — 기존 leader/partner/merchant 서브트리와 동일한 모양)
  5. 화면이 리더/파트너 화면과 데이터·구조가 같다면 **새로 안 만들고 기존 컴포넌트를 재사용**한다(파트너가 가맹점 화면을 리더 컴포넌트로 재사용한 것과 같은 방식, `App.tsx` 주석 참고).
- **페이지 1개 작성 패턴** (`src/pages/Merchants` 참고): `Page.tsx` + `usePage.ts`(데이터 훅) + `pageData.json`(더미 데이터) + `index.ts`. 화면은 가능하면 기존 템플릿(`RequestListPage`, `SalesPage`) + organism(`DataTable`, `StatSection`, `KpiGrid` 등)을 조합해서 짠다 — 화면마다 새 레이아웃을 짜지 않는다.

## 2. 주석 규칙 (CLAUDE.md 7번과 동일, 재강조)

- **한국어**, **"왜"** 위주. 코드로 자명한 내용은 쓰지 않는다.
- 짧게 남길 만한 경우: 반응형 처리 이유, Figma와 다르게 구현한 부분과 그 이유, Figma 레이어 이름과 실제 텍스트가 달라서 헷갈릴 수 있는 부분(어떤 텍스트를 기준으로 구현했는지 한 줄).
- 함수/컴포넌트 상단에 긴 설명 블록 금지. 기존 코드(예: `src/templates/AdminLayout/AdminLayout.tsx`)의 주석 밀도를 기준으로 맞춘다.

## 3. 데이터는 더미로, 단 모양은 실 연동을 의식해서

- CLAUDE.md 1번 규칙대로 백엔드 연동은 만들지 않는다. `korionChongApi.ts`/`useRolePageData` 같은 실 연동 레이어는 건드리지 않는다(필요하면 추후 별도 작업으로).
- 대신 CLAUDE.md 12번 규칙(JSON + 훅)을 그대로 따른다: 화면 데이터는 `*.json`에 하드코딩하고 `use*` 훅이 읽어 반환한다. 추후 실 연동 시 훅 내부만 바꾸면 되도록, 데이터 모양과 렌더링을 분리해서 작성한다.
- 라벨은 하드코딩하지 않고 `labelKey`로 저장 후 `t()`로 번역(CLAUDE.md 11번 규칙). 본사어드민 i18n 키는 `ko.json`/`en.json`에 신규 추가 필요(예: `nav.group.hq*`, `nav.item.hq*`).

## 4. 작업 범위가 크다 — 단계별로 진행

15개 그룹 / 48개 화면이라 한 번에 다 만들지 않는다. 그룹(또는 화면) 단위로 끊어서, Figma 실제 텍스트/레이아웃 확인 → 기존 컴포넌트 매칭 → 구현 → 확인받기 순서로 반복한다.

## 5. 작업 전 확인이 필요한 경우

- Figma에 정보가 부족하거나 모호하면 추측하지 말고 먼저 질문한다(CLAUDE.md 9번).
- 기존 공용 코드(`roles/`, `App.tsx`, `AdminLayout`, `Sidebar`, 기존 organism/template)를 고쳐야 하는 상황이 생기면, 다른 역할(리더/파트너/가맹점) 화면에 영향이 없는지 먼저 확인하고 진행 전 사용자에게 알린다.
- 화면 완성 시 `docs/PROJECT_PLAN.md` 8번 분류표 갱신(CLAUDE.md 9번).

## 6. 작업 기록 (인수인계 로그)

이 작업을 넘겨받는 발주처/관리자가 "무엇을, 왜 이렇게 했는지"를 커밋 로그만 보고 다 알 수는 없으므로, **Phase(단계)가 끝날 때마다 [CHANGELOG.md](./CHANGELOG.md)에 기록을 남긴다.**

- 기록 항목: 날짜, Phase 번호/이름, 변경한 파일 목록, 새로 만든 컴포넌트와 그 이유, 발견한 이슈/이상한 점(예: Figma 레이어 이름 불일치, 기존 코드의 타입 버그 등)과 해결 방법, 다음 Phase로 넘어가기 전 사용자 확인을 받은 내용.
- "무엇을 했다"보다 "왜 이렇게 했다"를 적는다 — CLAUDE.md 7번 주석 규칙과 같은 정신.
- SUMMARY.md(현재 상태 요약, 계속 갱신)와 CHANGELOG.md(시간순 기록, 끝난 건 안 건드림)는 역할이 다르다 — 헷갈리면 안 됨.
