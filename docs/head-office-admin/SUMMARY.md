# 본사어드민(HQ Admin) 작업 요약

> 작성일: 2026-06-27
> 레포: `kori_partners` (github.com/ansj1105/kori_partners)
> 브랜치: `headOfficeAdminPage-frontend2` (base: `main`)
> 목적: 매 세션마다 같은 조사를 반복하지 않도록, 지금까지 확인한 사실을 기록한다.

---

## 1. 배경

- 루트 프로젝트 `KORIONPAY_PAGE_FRONTEND`(github.com/gun587330/KORIONPAY_PAGE_FRONTEND)에서 리더/파트너/가맹점 어드민 화면을 퍼블리싱(프론트 UI만)으로 작업했었음.
- 그 결과물이 `kori_partners`(github.com/ansj1105/kori_partners)로 이어져 실제 백엔드 연동이 일부 시작됨. **이 레포가 우리가 계속 작업할 곳이 맞다.**
  - `kori_partners`의 git 히스토리는 루트 프로젝트 커밋 `472c9f5`까지 완전히 동일하고, 그 위에 5개 커밋(`ae108ec`~`b7ad408`)이 추가되어 있음: 인증 API 연동, 파트너 포털 API 연동, HTTPS 프록시, 회원가입 인증 강화, 프로덕션 도커 배포.
  - `package.json`의 `name: "korion-pay-leader-admin"`, `CLAUDE.md`도 루트와 바이트 단위로 동일 — 같은 프로젝트의 연속본임을 확인.
- ⚠️ **시행착오 기록**: 중간에 `ansj1105/fox_coin_frontend`(코인 채굴 앱, 완전히 무관한 별개 서비스)를 잘못 받아와서 한동안 그쪽 구조(FSD)를 조사했었음. 본사어드민과 무관하다는 게 확인되어 로컬에서 삭제함 — 혹시 다른 세션 기록에 그 내용이 남아있어도 무시할 것.

## 2. 기존 코드 구조 (kori_partners, main 기준)

루트 프로젝트와 **완전히 동일한 Atomic Design 구조**를 그대로 유지하고 있음:
```
src/components/{atoms,molecules,organisms}/
src/templates/AdminLayout/
src/components/templates/{RequestListPage,SalesPage}/
src/pages/{Dashboard,Merchants,Partners,...}/  (리더 역할 = prefix 없음)
src/pages/partner/*, src/pages/merchant/*
src/roles/  (ROLES 레지스트리 — leader/partner/merchant)
```

**추가된 것은 `services/` 레이어 하나뿐:**
- `src/services/korionChongApi.ts` — `fetch` 기반 API 클라이언트(axios 아님). `/api/leader/*`, `/api/partner/*`, `/api/auth/*` 호출. 역할 구분은 JWT가 아니라 **커스텀 헤더**(`X-Leader-Id` / `X-Partner-Id` / `X-Merchant-Id` / `X-Country-Scopes`)로 함.
- `src/services/authSession.ts` — `localStorage`(`korion.userId`, `korion.role`, `korion.countryScopes` 등)에 세션 저장.
- `src/hooks/use{Leader,Partner,Merchant}PageData.ts` + `useRolePageData.ts` — 기존 페이지의 `use*.ts` 훅들이 이 공용 훅을 통해 API를 호출하도록 바뀜.
  - **중요**: API 호출이 실패하면 `useRolePageData`가 그냥 처음에 넘긴 `initialData`(기존 하드코딩 JSON)를 그대로 유지함(`src/hooks/useRolePageData.ts:12,30-39`). 즉 **백엔드 없이 로컬에서 그냥 열어도 화면이 깨지지 않고 더미 데이터가 보인다** — 로그인 우회 같은 트릭이 필요 없음.
- `docs/frontend-api-contract-plan.md` — 리더/파트너/가맹점 API 계약 문서. **본사(HQ) 관련 내용은 없음** — API 계약도 우리가 새로 정의해야 함(단, 이번 작업 범위는 UI만이므로 직접 만들 필요는 없음. 4번 항목 참고).

## 3. 로컬에서 화면 확인하는 방법

이 레포는 fox_coin_frontend와 달리 admin 라우트에 로그인 가드가 없음(`src/App.tsx`의 `/leader/*`, `/partner/*`, `/merchant/*`는 `AdminLayout`으로만 감싸져 있고 인증 체크 없음). 그냥 dev 서버 띄우고 바로 들어가면 됨:

```bash
npm run dev
```

- `http://localhost:5173/leader/dashboard` (본사 직속 국가 리더 어드민 — 곧 만들 본사어드민의 하위 계층)
- `http://localhost:5173/partner/dashboard`
- `http://localhost:5173/merchant/dashboard`

## 4. Figma 참고 자료

- 최종 확인 파일: `https://www.figma.com/design/Py4ReGy0SxpXhj45BMa9DI/Untitled` 안의 **"본사어드민페이지"** 섹션/프레임.
- ⚠️ **주의**: 레이어 이름(layer name)이 복붙 작업 흔적으로 실제 텍스트와 다른 경우가 많았음. 메타데이터(`get_metadata`)의 `name` 속성만 보고 판단하지 말고, **반드시 스크린샷으로 실제 렌더링된 텍스트를 확인**할 것.
- 노드 ID는 사용자가 파일을 계속 편집 중이라 수시로 바뀜 — 고정 ID를 코드/문서에 하드코딩하지 말고, 매번 "본사어드민페이지" 이름으로 다시 검색해서 찾을 것.

## 5. 확정된 사이드바 IA (실제 텍스트 기준, 2026-06-27 확인)

계층 구조: **본사(HQ) → 국가리더(Country Leader, 이 레포의 `leader` 역할) → 파트너(Sales Partner) → 가맹점(Merchant)**

| # | 그룹 | 하위 항목 |
|---|------|----------|
| 1 | 대시보드 | 전체 운영 대시보드 · 국가별 대시보드 |
| 2 | 신청서 관리 | 제휴 / 투자 신청서 |
| 3 | 파트너 요청 관리 | 리더 승인 요청 · 파트너 승인 요청(리더요청) · 파트너 승인 요청(다이렉트) · 가맹점 승인 요청(다이렉트) |
| 4 | 국가 리더 관리 | 국가 리더 전체 목록 · 국가 리더별 거래내역 |
| 5 | 파트너 관리 | 파트너 전체 목록 · 파트너별 거래내역 |
| 6 | 가맹점 관리 | 가맹점 전체 목록 · 가맹점별 거래내역 |
| 7 | 결제 모니터링 | 전체 결제 로그 · Sync 대기/실패 · 오류 코드 관리 |
| 8 | 파트너 수수료 / 정산 | 정산 신청 · 정산 내역 · 수수료 관리 · 배분율 설정 |
| 9 | 회원 담보금 / 정산 | 회원 담보금 충전 / 해제 내역 |
| 10 | 검증 / 리스크 관리 | 허위 신청 의심 · 허위 가맹점 의심 · 중복 정보 감지 · 정산 보류 대상 · 블랙리스트 관리 |
| 11 | 통계 / 리포트 | 국가별 통계 · 파트너별 통계 · 가맹점별 통계 · 결제수단별 통계 |
| 12 | 알림 / 공지 | 공지 보내기 · 발송 내역 |
| 13 | 관리자 / 권한 관리 | 관리자 계정 관리 · 권한 그룹 관리 · 국가별 접근 권한 · 로그인 보안 · 2FA 설정 |
| 14 | 시스템 설정 | 국가 / 지역 설정 · 오류 코드 설정 · 보안 정책 설정 · 서비스 점검 모드 |
| 15 | 관리자 실행 로그 | 관리자 전체 로그 · 관리자 승인/거절 로그 · 정산 처리 로그 · 권한 변경 로그 · 보안 로그 |

총 15개 그룹 / 48개 화면.

## 6. 결정된 사항 (Phase 0에서 확정)

- 역할 키: `'hq'`로 확정 (`src/roles/types.ts`에 추가 완료). i18n은 기존 `hq.*`(본사 소식지) 키와 안 겹치게 `hqDashboard.*`처럼 화면별 prefix 사용.
- 로그인 허브(`AuthMain.tsx`)에 본사 카드 노출 안 함 — `/hq/*`는 URL 직접 접근만.
- `korionChongApi.ts`(실 API 연동) 패턴은 본사 화면에 적용하지 않음(CLAUDE.md 1번 규칙상 이번 작업은 UI만) — JSON+훅 더미 데이터 패턴 사용.

## 7. 미해결 / 확인 필요

1. 화면별 상세 레이아웃(대시보드부터)은 일부만 Figma로 확인함 — 그룹별로 착수 시 재확인 필요.
2. 신규 화면 빌드 완료 시 `docs/PROJECT_PLAN.md` 8번 분류표 갱신 필요(CLAUDE.md 9번 규칙).

## 8. 같이 보기

- [CONVENTIONS.md](./CONVENTIONS.md) — 이 작업에서 지킬 코드/주석 규칙
- [CHANGELOG.md](./CHANGELOG.md) — Phase별 작업 기록(시간순, 인수인계용)
