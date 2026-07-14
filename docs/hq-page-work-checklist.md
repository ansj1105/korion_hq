# HQ Admin Page Work Checklist

작성일: 2026-07-15

이 문서는 완료 선언이 아니라 재검증용 작업 체크리스트다.  
`코드 반영`은 라우트, 컴포넌트, API 호출, 백엔드 엔드포인트가 존재한다는 뜻이다.  
`운영 검증`은 `https://admin.korion.network` 로그인 세션으로 실제 화면, 실제 데이터, 실제 액션 결과를 확인했다는 뜻이다.  
운영 브라우저로 직접 확인하지 않은 항목은 완료로 보지 않는다.

## 신뢰 기준

사용자가 지적한 것처럼, 이 문서는 "내가 했다"를 믿기 위한 문서가 아니다.  
각 페이지를 다시 열어보고, API 응답과 DB/화면/액션 결과가 맞는지 확인하기 위한 검수표다.

- `코드 반영`만 체크된 항목은 운영 완료가 아니다.
- `운영 검증` 체크는 실제 로그인 세션에서 화면을 열고, 네트워크/API 응답과 화면 값을 대조한 경우에만 한다.
- 액션 버튼은 클릭 후 표/KPI/로그/DB 중 최소 2개 이상에서 결과가 확인되어야 검증 완료로 본다.
- KPI는 프론트 하드코딩/샘플 JSON이 아니라 API 응답 또는 DB 집계 기준임을 확인해야 한다.
- 국가/기간 드롭다운이 있는 페이지는 `전체 기간`, `1D`, `7D`, `30D`, 국가 개별 선택을 최소 케이스로 확인한다.
- 검색/필터/엑셀/페이지네이션/row 상세/모바일 반응형은 페이지별 공통 검수 항목으로 본다.
- 운영에서 확인하지 못한 항목은 `미검증` 또는 `[ ]` 상태로 유지한다.

## 현재 기준 HEAD

- [x] 프론트 현재 로컬 HEAD: `ead5ddf`
- [x] API 현재 로컬 HEAD: `2e7ed96`
- [ ] 운영 서버가 위 HEAD와 정확히 일치하는지 재확인
- [ ] 운영 로그인 세션에서 전체 라우트 smoke test 재실행

## 범례

- [x] 코드 반영 또는 명령 검증 완료
- [ ] 운영 브라우저 또는 실제 데이터 검증 필요
- `미검증`: 코드가 있어도 실제 운영 데이터/권한/DB 반영을 확인하지 못한 상태

## 배포/검증 상태

- [x] 프론트 저장소 최신화: `/home/ubuntu/work/KORIONPAY_PAGE_FRONTEND`
- [x] API 저장소 최신화: `/home/ubuntu/work/korion_chong`
- [x] 프론트 빌드 통과: `npm run build`
- [x] API 전체 테스트 통과: `./gradlew clean test --no-daemon`
- [x] 프론트 커밋/푸시 완료: 기존 `c9b4f6e`, `1bb2820`, `49f8839` 이후 최신 `ead5ddf`
- [x] API 커밋/푸시 완료: 기존 `c3e5f5a`, `5d4ba61`, `04acd9a` 이후 최신 `2e7ed96`
- [x] 프론트 운영 배포 완료 이력: `52.44.202.187:/var/www/korion_hq`
- [x] API 운영 배포 완료 이력: `54.83.183.123:/var/www/korion_chong`
- [x] 프론트 컨테이너 확인: `korion-hq-web` healthy
- [x] API health 확인: `https://chong.korion.io.kr/actuator/health` = `UP`
- [x] SPA route 확인: `https://admin.korion.network/hq/logs/security` = 200
- [x] 2026-07-15 로컬 프론트 빌드 재확인: `npm run build`
- [x] 2026-07-15 HQ 컨트롤러 계약 테스트 재확인: `HqControllerContractTest`
- [x] 2026-07-15 `src/pages/hq` 정적 JSON import 제거 확인
- [x] 2026-07-15 `src/pages/hq/**/*.json` 샘플 파일 삭제 완료
- [x] 2026-07-15 JSON 삭제 후 프론트 빌드 재확인: `npm run build`
- [x] 2026-07-15 JSON 삭제 후 HQ 컨트롤러 계약 테스트 재확인: `HqControllerContractTest`
- [x] 2026-07-15 대표 SPA route 200 확인: `/hq/dashboard`, `/hq/payments/sync-issues`, `/hq/payments/error-codes`, `/hq/settlement/request`
- [x] 2026-07-15 대표 HQ API 무토큰 401 보호 확인: `/api/hq/payments/sync-issues`, `/api/hq/payments/error-codes`, `/api/hq/settlement-requests`
- [ ] 운영 로그인 세션으로 전체 페이지 직접 확인
- [ ] 실제 운영 데이터와 KPI 일치 확인
- [ ] 액션 버튼 클릭 후 DB/표/KPI 즉시 반영 확인
- [ ] 검색/필터/엑셀 다운로드 전체 페이지 확인
- [ ] DataTable 좌우 스크롤/컬럼 resize 전체 페이지 확인
- [ ] row click 상세 modal/drawer 전체 페이지 확인
- [ ] 상태/액션 뱃지 색상 전체 페이지 확인

## 공통 UI/API 작업

- [x] `kori_partners` 스타일 기준으로 HQ `Badge`/`ActionBadges` 크기, radius, 색상 기준 보정
- [x] 액션 라벨 기반 색상 매핑 유틸 추가: `src/utils/badgeAccents.ts`
- [x] `ActionBadges` 기본 크기 `md`, 기본 모양 `rect` 적용
- [x] 표 액션 버튼 `xs` 위주 표시를 줄이고 가시성 개선
- [x] Payment error/sync issue 플래그 배지 `md/rect`로 보정
- [x] HQ `DataTable` resize 기본 활성, 가로 스크롤, 검색/필터/CSV export 경로 정적 확인
- [x] 결제 로그 표의 `tableFluid/tableWrapCells` 제거로 가로 스크롤/컬럼 resize 경로 복구
- [x] 요청/신청 액션 공통 처리 후 데이터 재조회 경로 반영
- [x] `GET /api/hq/logs/{page}` permission/security 분류 보강
- [x] OpenAPI에 HQ 추가/수정 API 반영
- [ ] 전체 페이지에서 partners 프로젝트와 동일한 뱃지 크기인지 육안 확인
- [ ] 전체 페이지에서 상태별 색상 기준 확인
- [ ] 전체 페이지에서 액션 실패 메시지/권한 오류 처리 확인

## 상태/액션 색상 기준

- [ ] 승인/완료/활성/정산완료: green
- [ ] 검토/대기/자료요청/Sync 대기: orange 또는 amber
- [ ] 승인요청/권한/역할/정보요청: purple
- [ ] 보류/지급보류/정산보류: orange 또는 blue, 페이지별 의미와 통일 필요
- [ ] 위험/거절/삭제/차단/블랙/실패/DB 이상/공격 탐지: red
- [ ] 일반 정보/상세/보기: cyan 또는 blue

## 라우팅/메뉴

- [x] `/hq/dashboard`
- [x] `/hq/dashboard/by-country`
- [x] `/hq/applications`
- [x] `/hq/applications/result-log`
- [x] `/hq/requests/leader`
- [x] `/hq/requests/partner-by-leader`
- [x] `/hq/requests/partner-direct`
- [x] `/hq/requests/merchant-direct`
- [x] `/hq/requests/result-log`
- [x] `/hq/leaders`
- [x] `/hq/leaders/sales`
- [x] `/hq/partners`
- [x] `/hq/partners/sales`
- [x] `/hq/merchants`
- [x] `/hq/merchants/sales`
- [x] `/hq/payments/logs`
- [x] `/hq/payments/sync-issues`
- [x] `/hq/payments/error-codes`
- [x] `/hq/settlement/request`
- [x] `/hq/settlement/request/detail`
- [x] `/hq/settlement/history`
- [x] `/hq/settlement/commission`
- [x] `/hq/settlement/rate-setting`
- [x] `/hq/collateral/history`
- [x] `/hq/risk/fake-applications`
- [x] `/hq/risk/fake-merchants`
- [x] `/hq/risk/duplicates`
- [x] `/hq/risk/settlement-hold`
- [x] `/hq/risk/blacklist`
- [x] `/hq/stats/country`
- [x] `/hq/stats/partner`
- [x] `/hq/stats/merchant`
- [x] `/hq/stats/payment-method`
- [x] `/hq/announcements/send`
- [x] `/hq/announcements/history`
- [x] `/hq/admin/accounts`
- [x] `/hq/admin/permission-groups`
- [x] `/hq/admin/country-access`
- [x] `/hq/admin/login-security`
- [x] `/hq/admin/two-factor`
- [x] `/hq/system/country`
- [x] `/hq/system/error-code`
- [x] `/hq/system/security-policy`
- [x] `/hq/system/maintenance-mode`
- [x] `/hq/logs/admin`
- [x] `/hq/logs/approval`
- [x] `/hq/logs/settlement`
- [x] `/hq/logs/permission-change`
- [x] `/hq/logs/security`
- [x] `/hq/admin` -> `/hq/admin/accounts`
- [x] `/hq/risk` -> `/hq/risk/fake-applications`
- [x] `/hq/stats` -> `/hq/stats/country`
- [x] `/hq/logs` -> `/hq/logs/admin`
- [ ] 위 모든 라우트 운영 로그인 세션 렌더 확인
- [x] 대표 SPA route 200 확인: dashboard/payment sync/payment error/settlement request

## 대시보드

### `/hq/dashboard`
- [x] API 호출 코드 존재: `/api/hq/dashboard`
- [x] Quick Action 이동 경로 코드 반영
- [x] 리스크 액션 API 코드 존재: `/api/hq/dashboard/risk-actions`
- [x] `dashboardData.json` import/fallback 제거 확인
- [x] 국가/기간 필터에 따른 KPI/섹션 값 프론트 보정 제거. API 응답 그대로 표시
- [ ] Quick Action 모든 버튼 실제 이동 확인
- [ ] KPI/차트/AI insight 실제 데이터 확인

### `/hq/dashboard/by-country`
- [x] 라우트/화면 코드 존재
- [x] `countryDashboardData.json` import 제거 및 `/api/hq/dashboard` 기반 매핑 확인
- [ ] 국가별 실제 KPI/차트 확인

## 신청서 관리

### `/hq/applications`
- [x] API 호출 코드 존재: `/api/hq/applications`
- [x] 상태 액션 API 코드 존재: `/api/hq/applications/{applicationId}/status`
- [x] 대기/검토/확인/위험/삭제 버튼 클릭 이벤트 코드 반영
- [x] 검색/필터/엑셀 UI 코드 존재
- [x] No 컬럼 최신순 정렬 코드 반영
- [x] 액션 버튼 색상 분리 코드 반영
- [ ] 각 버튼 실제 상태 변경 확인
- [ ] 처리 후 KPI/표 갱신 확인
- [ ] result-log 적재 확인
- [ ] 표 가로 스크롤 확인

### `/hq/applications/result-log`
- [x] 메뉴/라우트 연결
- [x] 처리 결과 이력 화면 코드 존재
- [ ] 신청서 액션이 실제 이력에 적재되는지 확인
- [ ] 검색/필터/엑셀 확인

## 요청 관리

### 공통
- [x] 요청 액션 공통 hook 정리: `useHqRequestActionRows.tsx`
- [x] 액션별 색상 분리 코드 반영
- [x] 액션 후 reload 코드 반영
- [x] export URL 연결 코드 존재
- [x] HQ 요청 approve/reject/review/waiting/request-info 성공 시 관리자 계정 기반 감사 로그 기록 코드 반영
- [x] HQ 요청 감사 로그 컨트롤러/저장소 테스트 추가
- [ ] 승인/거절/검토/대기/자료요청 DB 반영 확인
- [ ] 요청 처리 결과 로그 반영 확인
- [ ] 각 요청 페이지 No 최신순 확인

### `/hq/requests/leader`
- [x] 목록 API 코드 존재: `/api/hq/requests/leader`
- [x] 액션 API 코드 존재: approve/reject/review/waiting/request-info
- [ ] 운영 액션 검증 필요

### `/hq/requests/partner-by-leader`
- [x] 목록 API 코드 존재: `/api/hq/requests/partner-by-leader`
- [x] 액션 API 코드 존재: approve/reject/review/waiting/request-info
- [ ] 운영 액션 검증 필요

### `/hq/requests/partner-direct`
- [x] 목록 API 코드 존재: `/api/hq/requests/partner-direct`
- [x] 액션 API 코드 존재: approve/reject/review/waiting/request-info
- [ ] 운영 액션 검증 필요

### `/hq/requests/merchant-direct`
- [x] 목록 API 코드 존재: `/api/hq/requests/merchant-direct`
- [x] 액션 API 코드 존재: approve/reject/review/waiting/request-info
- [ ] 운영 액션 검증 필요

### `/hq/requests/result-log`
- [x] 목록 API 코드 존재: `/api/hq/requests/result-log`
- [x] 상세 overlay 코드 존재
- [x] row click 시 선택한 이력 행 기반 상세 overlay 연결
- [ ] 요청 액션별 이력/상세 데이터 운영 확인

## 리더 관리

### `/hq/leaders`
- [x] 목록 API 코드 존재: `/api/hq/leaders`
- [x] KPI 서버 응답 사용 코드 반영
- [x] 정지/해제 API 코드 존재: `/api/hq/leaders/{leaderCode}/status`
- [x] row click 상세 이동 코드 반영
- [x] 상세 버튼 제거 방향 반영
- [ ] KPI 실제 DB 값 일치 확인
- [ ] 정지/해제 후 KPI 즉시 반영 확인
- [ ] row click 시 상세 기본 탭 확인
- [ ] 검색/필터/엑셀 확인

### `/hq/leaders/sales`
- [x] 전체 리더 목록/상세 화면 코드 존재
- [x] 상세 API 코드 존재: overview/partners/merchants/transactions/settlement
- [x] 파트너별/가맹점별/거래내역/정산내역/관리자 메모 탭 코드 존재
- [ ] 목록 row click 시 거래내역 탭으로 진입 확인
- [ ] 상세 탭별 실제 데이터 확인
- [ ] 관리자 메모 저장 동작 확인

## 파트너 관리

### `/hq/partners`
- [x] 목록 API 코드 존재: `/api/hq/partners`
- [x] KPI 서버 응답 사용 코드 반영
- [x] 정지/해제 API 코드 존재: `/api/hq/partners/{partnerCode}/status`
- [x] row click 상세 이동 코드 반영
- [x] 상세 버튼 제거 방향 반영
- [ ] KPI 실제 DB 값 일치 확인
- [ ] 정지/해제 후 KPI 즉시 반영 확인
- [ ] row click 시 상세 기본 탭 확인
- [ ] 검색/필터/엑셀 확인

### `/hq/partners/sales`
- [x] 파트너 목록/상세 화면 코드 존재
- [x] 상세 API 코드 존재: overview/merchants/transactions/settlement/memo
- [x] 가맹점별/거래내역/정산내역/관리자 메모 탭 코드 존재
- [ ] 목록 row click 시 거래내역 탭으로 진입 확인
- [ ] 상세 탭별 실제 데이터 확인
- [ ] 거래내역 row 상세 modal 확인
- [ ] 관리자 메모 저장 확인

## 가맹점 관리

### `/hq/merchants`
- [x] 목록 API 코드 존재: `/api/hq/merchants`
- [x] KPI 서버 응답 사용 코드 반영
- [x] 정지/해제/블랙 관련 status API 코드 존재: `/api/hq/merchants/{merchantCode}/status`
- [x] row click 상세 이동 코드 반영
- [x] 상세 버튼 제거 방향 반영
- [ ] KPI 실제 DB 값 일치 확인
- [ ] 상태 액션 후 KPI 즉시 반영 확인
- [ ] row click 시 거래내역 탭 진입 확인
- [ ] 검색/필터/엑셀 확인

### `/hq/merchants/sales`
- [x] 가맹점 목록/상세 화면 코드 존재
- [x] 상세 API 코드 존재: sales/settlement/memo
- [x] 거래내역/정산내역/관리자 메모/요청사항 탭 코드 존재
- [ ] 거래내역 탭 실제 하부 데이터 확인
- [ ] 거래내역 row 상세 modal 확인
- [ ] 관리자 메모 저장 확인

## 결제/거래 로그

### `/hq/payments/logs`
- [x] 목록 API 코드 존재: `/api/hq/payments/logs`
- [x] KPI/표 API 연결 코드 존재
- [x] No 컬럼 코드 반영
- [x] 상태 뱃지 코드 반영
- [x] 지급보류/보류해제 API 코드 존재: `/api/hq/payments/logs/{entryId}/settlement-hold`
- [x] row click 상세 modal 코드 반영
- [x] 표 가로 스크롤/컬럼 resize 경로 복구
- [ ] KPI 실제 거래 데이터 일치 확인
- [ ] 지급보류/보류해제 버튼 실제 동작 확인
- [ ] row 상세 내용 충분성 확인
- [ ] 검색/필터/엑셀 확인

### `/hq/payments/sync-issues`
- [x] API 호출 코드 존재: `/api/hq/payments/sync-issues`
- [x] 송신/수신/업로드 상태 기반 표 코드 존재
- [ ] 운영 로그인에서 401 재발 여부 확인
- [ ] 실제 sync issue 데이터 확인
- [ ] KPI 실제 데이터 확인

### `/hq/payments/error-codes`
- [x] API 호출 코드 존재: `/api/hq/payments/error-codes`
- [x] 오류 코드 등록 API 코드 존재
- [x] export 코드 존재
- [x] 시스템 오류코드 페이지와 동일 API 사용
- [ ] 운영 로그인에서 401 재발 여부 확인
- [ ] 등록/수정/상태 변경 실제 동작 확인
- [ ] KPI가 등록된 오류 코드 기준인지 확인

## 수수료 / 정산

### `/hq/settlement/request`
- [x] 목록 API 코드 존재: `/api/hq/settlement-requests`
- [x] KPI API 연결 코드 존재
- [x] No 컬럼/상태 뱃지 코드 반영
- [x] 승인/검토/보류/자료요청/거절 API 코드 존재
- [x] row click 상세 이동 코드 반영
- [ ] KPI 실제 데이터 연산 확인
- [ ] 승인/검토/보류/자료요청/거절 실제 동작 확인
- [ ] 표 가로 스크롤/컬럼 resize 확인
- [ ] 신청 ID 생성 규칙 확인

### `/hq/settlement/request/detail`
- [x] 상세 API 코드 존재: `/api/hq/settlement-requests/{settlementRequestId}/detail`
- [x] 액션 API 코드 존재: `/api/hq/settlement-requests/{settlementRequestId}/actions`
- [x] 체크박스 기본 미체크 코드 반영
- [ ] 각 버튼 실제 상태 변경 확인
- [ ] 상세 내역 실제 데이터 확인
- [ ] 체크박스 문구/필수 조건 운영 확인

### `/hq/settlement/history`
- [x] API 호출 코드 존재: `/api/hq/settlement-history`
- [x] KPI/표 API 연결 코드 존재
- [x] No 컬럼/상태 뱃지 코드 반영
- [x] row click 상세 modal 코드 반영
- [ ] KPI 실제 데이터 확인
- [ ] 정산내역 row 상세 확인
- [ ] 액션 컬럼 제거 여부 확인

### `/hq/settlement/commission`
- [x] API 호출 코드 존재: `/api/hq/commission-fees`
- [x] 추가/수정/삭제 API 코드 존재
- [x] export 코드 존재
- [x] 국가 드롭다운/이벤트 토글/적용범위/코인별 수수료 입력 코드 존재
- [ ] KPI 실제 데이터 확인
- [ ] 국가 중복 추가 차단 확인
- [ ] 이벤트 토글 실제 저장 확인
- [ ] 코인별 수수료 추가 실제 저장 확인
- [ ] 액션 버튼 크기/가시성 확인

### `/hq/settlement/rate-setting`
- [x] API 호출 코드 존재: `/api/hq/distribution-rates`
- [x] 기본 배분율 수정/저장 API 코드 존재
- [x] 국가별 배분율 추가/수정/삭제 API 코드 존재
- [x] export 코드 존재
- [ ] KPI 실제 데이터 확인
- [ ] 배분율 저장 실제 반영 확인
- [ ] 국가 중복 추가 차단 확인
- [ ] 숫자 하단 뱃지/상태 뱃지 확인

## 담보금

### `/hq/collateral/history`
- [x] API 호출 코드 존재: `/api/hq/collateral-history`
- [x] 국가/일자 필터 코드 존재
- [x] 회원 담보금 충전/해제 내역 탭 코드 존재
- [x] 회원 담보금 정보 탭 코드 존재
- [x] 회원 정산내역 탭 코드 존재
- [x] row click 상세 modal 코드 존재
- [x] 상세 overlay 액션 배지 크기 보정
- [ ] KPI 실제 데이터 확인
- [ ] 필터에 맞는 데이터 반영 확인
- [ ] 충전/해제 전후 담보금 확인
- [ ] 회원정보 액션 실제 연결 확인

### 담보 미충전 알림
- [x] HQ 상단 알림 API 코드 존재: `/api/hq/notifications`
- [x] 미충전 기준 코드 반영: `KORI` 사용 가능 지갑 잔액 > 0 이고 활성/잠금 담보 잔액 = 0
- [x] HQ 상단 벨에서 알림 API 호출 코드 반영
- [x] 알림 클릭 시 `/hq/collateral/history` 이동 코드 반영
- [x] 저장소 테스트로 미충전 SQL 조건 고정
- [ ] 운영 DB에서 담보 미충전 대상 사용자 수와 알림 카운트 일치 확인
- [ ] 담보 충전 후 알림에서 대상이 빠지는지 확인
- [ ] 실제 사용자 앱/지갑 푸시까지 필요한 경우 별도 사용자 알림 API 연동 확인

## 리스크 관리

### `/hq/risk/fake-applications`
- [x] API 호출 코드 존재: `/api/hq/risk/fake-applications`
- [x] 화면/표/상세 overlay 코드 존재
- [ ] 실제 API 데이터 확인
- [ ] 액션/상태 처리 실제 동작 확인

### `/hq/risk/fake-merchants`
- [x] API 호출 코드 존재: `/api/hq/risk/fake-merchants`
- [x] 화면/표/상세 overlay 코드 존재
- [ ] 실제 API 데이터 확인
- [ ] 액션/상태 처리 실제 동작 확인

### `/hq/risk/duplicates`
- [x] API 호출 코드 존재: `/api/hq/risk/duplicates`
- [x] 화면/표/상세 overlay 코드 존재
- [ ] 실제 API 데이터 확인
- [ ] 액션/상태 처리 실제 동작 확인

### `/hq/risk/settlement-hold`
- [x] API 호출 코드 존재: `/api/hq/risk/settlement-hold`
- [x] 화면/표/상세 overlay 코드 존재
- [ ] 실제 API 데이터 확인
- [ ] 보류/해제 처리 실제 동작 확인

### `/hq/risk/blacklist`
- [x] API 호출 코드 존재: `/api/hq/risk/blacklist`
- [x] 화면/표/상세 overlay 코드 존재
- [ ] 실제 API 데이터 확인
- [ ] 블랙/해제 처리 실제 동작 확인

## 통계

### `/hq/stats/country`
- [x] API 호출 코드 존재: `/api/hq/stats/country`
- [x] 화면/표/상세 overlay 코드 존재
- [ ] KPI/차트/표 실제 데이터 확인
- [ ] 필터/기간 조건 확인

### `/hq/stats/partner`
- [x] API 호출 코드 존재: `/api/hq/stats/partner`
- [x] 화면/표/상세 overlay 코드 존재
- [ ] KPI/차트/표 실제 데이터 확인
- [ ] 필터/기간 조건 확인

### `/hq/stats/merchant`
- [x] API 호출 코드 존재: `/api/hq/stats/merchant`
- [x] 화면/표/상세 overlay 코드 존재
- [ ] KPI/차트/표 실제 데이터 확인
- [ ] 필터/기간 조건 확인

### `/hq/stats/payment-method`
- [x] API 호출 코드 존재: `/api/hq/stats/payment-method`
- [x] 화면/표 코드 존재
- [ ] QR/NFC/BLE/온라인 데이터 정확성 확인
- [ ] 필터/기간 조건 확인

## 공지사항

### `/hq/announcements/send`
- [x] API 호출 코드 존재: `/api/hq/announcements/send-summary`
- [x] 전송 API 코드 존재: `/api/hq/announcements/send`
- [x] 임시저장 API 코드 존재: `/api/hq/announcements/drafts`
- [x] 파트너/리더 스타일 기반 UI refactor 코드 존재
- [x] `noticeSendData.json` fallback 제거
- [ ] 실제 대상 선택/전송 확인
- [ ] 실패 시 에러 메시지 확인
- [ ] 예약/즉시 전송 조건 확인

### `/hq/announcements/history`
- [x] API 호출 코드 존재: `/api/hq/announcements/history`
- [x] 취소 API 코드 존재: `/api/hq/announcements/{noticeId}/cancel`
- [x] 수신자 목록 API 코드 존재
- [x] 국가/일자 필터 코드 존재
- [x] 상태 뱃지 코드 존재
- [ ] KPI 실제 데이터 확인
- [ ] 액션 버튼 크기/가시성 확인
- [ ] 상세/취소/수신자 목록 확인

## 관리자 관리

### `/hq/admin/accounts`
- [x] API 호출 코드 존재: `/api/hq/admin/accounts`
- [x] 수정 API 코드 존재: `/api/hq/admin/accounts/{adminId}`
- [ ] 역할/상태 변경 실제 저장 확인
- [ ] 권한 계층 제한 확인

### `/hq/admin/permission-groups`
- [x] API 호출 코드 존재: `/api/hq/admin/permission-groups`
- [x] 수정 API 코드 존재: `/api/hq/admin/permission-groups/{roleCode}`
- [ ] 권한 저장 실제 반영 확인

### `/hq/admin/country-access`
- [x] API 호출 코드 존재: `/api/hq/admin/country-access`
- [x] 수정 API 코드 존재: `/api/hq/admin/country-access/{adminId}/{countryCode}`
- [ ] 국가별 메뉴 권한 저장 실제 반영 확인

### `/hq/admin/login-security`
- [x] API 호출 코드 존재: `/api/hq/admin/login-security`
- [x] 수정 API 코드 존재: `/api/hq/admin/login-security/{policyKey}`
- [ ] 정책 값 저장 실제 반영 확인
- [ ] `app_config` 저장값 확인

### `/hq/admin/two-factor`
- [x] API 호출 코드 존재: `/api/hq/admin/two-factor`
- [x] 수정 API 코드 존재: `/api/hq/admin/two-factor/{policyKey}`
- [ ] 실제 2FA 상태 데이터 확인
- [ ] 수정 저장 실제 반영 확인

## 시스템 설정

### `/hq/system/country`
- [x] API 호출 코드 존재: `/api/hq/system/country`
- [x] 추가 API 코드 존재
- [x] export 코드 존재
- [x] 상태/액션 뱃지 코드 존재
- [ ] 국가 번호 정렬 확인
- [ ] 결제 상태 뱃지 확인
- [ ] 실제 국가 데이터 확인
- [ ] 수정/삭제/상세 액션 확인

### `/hq/system/error-code`
- [x] API 호출 코드 존재: `/api/hq/payments/error-codes`
- [x] 등록 API 코드 존재
- [x] 자동처리 상태/액션 뱃지 코드 존재
- [ ] 번호 정렬 확인
- [ ] 등록/수정/삭제 실제 동작 확인

### `/hq/system/security-policy`
- [x] API 호출 코드 존재: `/api/hq/system/security-policy`
- [x] 수정 API 코드 존재: `/api/hq/system/security-policy/{policyKey}`
- [ ] 실제 API 데이터 확인
- [ ] 정책 변경 저장 동작 확인

### `/hq/system/maintenance-mode`
- [x] API 호출 코드 존재: `/api/hq/system/maintenance-mode`
- [x] 수정 API 코드 존재: `/api/hq/system/maintenance-mode/{maintenanceId}`
- [x] 상태/액션 뱃지 코드 존재
- [ ] 유지보수 모드 실제 동작 확인
- [ ] 수정/삭제/상세 액션 확인

## 로그 관리

### `/hq/logs/admin`
- [x] API 호출 코드 존재: `/api/hq/logs/admin`
- [x] KPI/표 API 연결 코드 존재
- [ ] 실제 로그 데이터 확인

### `/hq/logs/approval`
- [x] API 호출 코드 존재: `/api/hq/logs/approval`
- [x] KPI/표 API 연결 코드 존재
- [ ] 승인/거절/보류/자료요청 액션 로그 확인

### `/hq/logs/settlement`
- [x] API 호출 코드 존재: `/api/hq/logs/settlement`
- [x] KPI/표 API 연결 코드 존재
- [ ] 정산 액션 로그 확인

### `/hq/logs/permission-change`
- [x] API 호출 코드 존재: `/api/hq/logs/permission-change`
- [x] 권한/리더/파트너 상태 변경 로그 분류 코드 반영
- [ ] 권한/관리자/리더/파트너 변경 로그 실제 확인

### `/hq/logs/security`
- [x] API 호출 코드 존재: `/api/hq/logs/security`
- [x] 보안/공격/DB 이상 로그 분류 코드 반영
- [x] 운영 SPA route 200 확인
- [ ] 로그인/보안/DB 이상 이벤트 로그 실제 확인

## 더미/JSON 잔존 점검

2026-07-15 기준 `src/pages/hq` 하위 TS/TSX의 JSON import는 제거했고, 남아 있던 `src/pages/hq/**/*.json` 샘플 파일도 삭제했다.  
검증 명령:

- [x] `rg -n "from .*\\.json|import .*\\.json|\\.json" src/pages/hq -S` 결과 없음
- [x] `find src/pages/hq -name '*.json'` 결과 없음
- [x] `npm run build` 통과

## 반드시 다시 봐야 할 의심 지점

- [ ] 운영에서 401이 났던 `/hq/payments/sync-issues`, `/hq/payments/error-codes` 재확인
- [x] 무토큰 401은 정상 보호 동작 확인. 로그인 세션 401 재발 시 토큰/권한/프록시 헤더를 별도 확인
- [ ] 액션 버튼이 안 눌렸던 신청서/요청/정산/결제 로그 페이지 재확인
- [ ] 리더/파트너/가맹점 상세 진입 시 기본 탭이 의도와 맞는지 재확인
- [ ] 리더/파트너/가맹점 KPI가 프론트 계산이 아니라 서버 DB 집계인지 재확인
- [ ] 정산/수수료/배분율 추가 시 중복 국가 차단 확인
- [ ] 유지보수 모드 실제 전역 동작 확인
- [ ] 리스크/통계 페이지가 “구현 예정” 또는 더미 데이터처럼 보이지 않는지 확인
- [ ] 모든 표에서 긴 컬럼이 잘리지 않고 가로 스크롤/resize가 되는지 확인
- [ ] 모든 액션 후 활동 로그/처리 결과 로그가 실제로 쌓이는지 확인

## 운영 검증 증거 기록표

검증할 때는 아래 형식으로 증거를 남긴다. 화면만 보고 넘어가지 않는다.

| 일시 | 환경 | 계정 | 라우트 | 확인 항목 | API/DB 증거 | 화면 결과 | 판정 |
| --- | --- | --- | --- | --- | --- | --- | --- |
|  | 운영 | `korionadmin` | `/hq/dashboard` | 국가/기간 필터, KPI |  |  |  |
|  | 운영 | `korionadmin` | `/hq/requests/leader` | 승인/거절/검토/자료요청 |  |  |  |
|  | 운영 | `korionadmin` | `/hq/settlement/request` | 상세 이동/정산 액션 |  |  |  |
|  | 운영 | `korionadmin` | `/hq/announcements/send` | 즉시/예약/임시저장 |  |  |  |
|  | 운영 | `korionadmin` | `/hq/system/country` | 국가 추가/상태/결제 토글 |  |  |  |

## 리더/파트너/가맹점 포털 회귀 체크

아래 항목은 기존 `kori_partners` 역할 포털에서 반복 지적된 내용이다. HQ 작업과 별개로 운영에서 다시 확인해야 한다.

### 공통

- [ ] 상단바 모바일 반응형: 알림/언어/로그아웃 버튼이 2열로 밀리지 않는지 확인
- [ ] 사이드바 프로필 카드: 상위 관리자/관리 코드/국가/운영 상태가 실제 로그인 계정 기준으로 나오는지 확인
- [ ] 상태 뱃지: 승인/대기/재확인/정지/블랙/보류/완료 색상과 크기가 공통 Badge와 맞는지 확인
- [ ] i18n: EN 모드에서 sender/target/method/action/status가 한국어로 남지 않는지 확인
- [ ] No 컬럼: 번호에 뱃지가 붙지 않고 최신/큰 번호가 위에 오는지 확인
- [ ] 공지 카드/대시보드 공지 영역: 긴 내용이 잘리지 않고 스크롤 또는 높이 처리가 되는지 확인
- [ ] 검색/필터/엑셀/페이지네이션: DataTable 공통 기능이 각 역할 페이지에서 동작하는지 확인
- [ ] row click 상세: 클릭 가능한 행이 상세 모달/상세 탭/하위 목록으로 정상 이동하는지 확인
- [ ] 활동 로그: action/status/target이 의미 없는 숫자나 원문 enum으로 나오지 않는지 확인

### 가맹점 포털

- [ ] `/merchant/dashboard`: KPI, 공지, 최근활동 데이터가 실제 가맹점 기준인지 확인
- [ ] `/merchant/transactions`: `월 거래 건수` 컬럼 제거, `QR / NFC / BLE` 라벨 확인
- [ ] `/merchant/transactions/refund`: 메뉴에서 숨김 처리 유지 확인
- [ ] `/merchant/transactions/failed`: 메뉴에서 숨김 처리 유지 확인
- [ ] `/merchant/hq-notices`: No 최신순, 번호 뱃지 제거, author/target i18n 확인
- [ ] `/merchant/settings/profile`: 상위 관리자 수정 요청 버튼명, 파일 선택 optional, 5MB 제한, 오류 메시지/i18n 확인
- [ ] `/merchant/settings/profile`: 상태 영역이 공통 input box/상태 badge 구조와 맞는지 확인
- [ ] `/merchant/settings/activity-log`: 대상 숫자 노출 제거, action i18n, 실제 로그 데이터 확인

### 파트너 포털

- [ ] `/partner/dashboard`: 하부 가맹점 수, 승인 대기, 미확인 공지, 총 매출, 거래건수 API 기준 확인
- [ ] `/partner/requests/merchant`: 가입 요청과 수정 요청이 모두 들어오는지 확인
- [ ] `/partner/requests/merchant`: 본사-파트너-가맹점 구조에서 승인구조 버튼이 아니라 승인 버튼인지 확인
- [ ] `/partner/requests/merchant/actions`: 승인/보류/정지/수정 요청 액션 로그가 쌓이는지 확인
- [ ] `/partner/merchants`: 가맹점 코드가 `<국가코드>-MER-<숫자>` 규칙인지 확인
- [ ] `/partner/merchants/sales`: 가맹점 row 클릭 시 해당 가맹점 거래 상세가 열리는지 확인
- [ ] `/partner/settlement/request`: 정산 요청 성공 후 HQ 정산 요청에 들어오는지, 성공 후 reload/상태 갱신 확인
- [ ] `/partner/settlement/history`: 정산번호 왼쪽 No 컬럼, 상태 뱃지/i18n 확인
- [ ] `/partner/hq-notices`: 가맹점 페이지와 CSS/구조/No 정렬 일치 확인
- [ ] `/partner/notices/send`: 대상 선택, 즉시/예약 차이, 임시저장/임시목록, KPI 하단 설명/뱃지 확인
- [ ] `/partner/notices/history`: sender/target/method/action i18n, 상세에서 title/content/대상 구분 확인
- [ ] `/partner/settings/profile`: 상위 관리자 답변 read-only, 버튼명 `상위 관리자 수정 요청`, 뱃지 스타일 확인
- [ ] `/partner/settings/activity-log`: action enum i18n, `PARTNER_SUSPENDED` 등 누락 매핑 확인

### 리더 포털

- [ ] `/leader/dashboard`: 첨부 이미지 기준 KPI 구성, 국가 필터 제거, 공지/요청/최근활동 데이터 확인
- [ ] `/leader/dashboard`: 하부 파트너/가맹점, 활성회원수, 거래량/거래건수, 수수료, 증감 뱃지 확인
- [ ] `/leader/requests/partner`: 파트너 페이지와 동일한 action 버튼/상태 뱃지/클릭 동작 확인
- [ ] `/leader/requests/partner`: 파트너 코드/파트너명/담당지역/하위 가맹점수/월거래액/월거래건수 실제 집계 확인
- [ ] `/leader/requests/merchant`: 활성/추천/직통/블랙 가맹점 KPI가 API 기준인지 확인
- [ ] `/leader/partners`: 총/활성/정지/블랙 파트너 카운트, 정지 상태의 active/black 버튼 확인
- [ ] `/leader/partners/detail`: 상단 status bar와 code hero 설명이 가맹점 상세 양식과 맞는지 확인
- [ ] `/leader/partners/sales`: 표 컬럼, row click 하위 가맹점, 하위 가맹점 row click 거래내역 확인
- [ ] `/leader/merchants/detail`: status bar 뱃지 전체 노출 확인
- [ ] `/leader/merchants/sales`: QR/NFC/BLE 뱃지와 하부 데이터 확인
- [ ] `/leader/transactions/offline`: 데이터 존재/필터/상세 확인
- [ ] `/leader/transactions/failed`: No 뱃지 제거 확인
- [ ] `/leader/settlement/request`: 안내 문구, 지갑/통화, 정산요청 API/HQ 유입, 수익 합계 확인
- [ ] `/leader/settlement/history`: 데이터 보강, 정산번호 옆 No 컬럼 확인
- [ ] `/leader/hq-notices`: EN 모드 target 뱃지 한국어 잔존 확인
- [ ] `/leader/notices/send`: 특정 파트너/가맹점 선택 모달, target filter 표시, 즉시/예약/임시저장 확인
- [ ] `/leader/notices/history`: 10개 이상 데이터, 타입 뱃지, No 최신순, 상세 title/content/대상 구분 확인
- [ ] `/leader/settings/profile`: read-only 필드, 상위 관리자 답변 read-only, 첨부 placeholder, 하위 가맹점/미정산수수료 계산 확인
- [ ] `/leader/settings/activity-log`: KPI 설명/뱃지, action enum 매핑, 실제 로그 데이터 확인

## 본사 신청/승인 흐름 점검

이 항목은 화면만으로 끝내지 않고 DB/API 경로까지 확인해야 한다.

- [ ] 리더가 승인요청한 파트너 요청이 `/hq/requests/leader` 또는 의도한 HQ 요청 페이지에 들어오는지 확인
- [ ] 본사-파트너 구조의 파트너 직접 신청이 `/hq/requests/partner-direct`에 들어오는지 확인
- [ ] 본사-가맹점 구조의 가맹점 직접 신청이 `/hq/requests/merchant-direct`에 들어오는지 확인
- [ ] 가입 요청에서 리더로 가입한 파트너가 리더 승인 후 HQ 승인 요청으로 올라오는지 확인
- [ ] 승인/거절/검토/자료요청이 `/hq/requests/result-log`에 기록되는지 확인
- [ ] 처리 완료된 요청이 원래 대기 목록에서 사라지고 결과 로그에 남는지 확인
- [ ] 누락된 구조가 있으면 요청 유형 enum/API/라우트/표 라벨을 함께 보강

## 검증 우선순위

1. 로그인/권한/라우팅: HQ, 리더, 파트너, 가맹점 각 역할로 1회씩 실제 로그인
2. 금전/정산/수수료: 정산 요청, 정산 상세, 수수료/배분율, 담보금 화면
3. 승인 흐름: 리더/파트너/가맹점 신청과 HQ 요청 페이지 유입
4. 공지 흐름: 즉시/예약/임시저장/취소/수신자 목록
5. 리스크/로그: 액션 로그, 보안 로그, 위험 상태 처리
6. UI 회귀: 뱃지 크기/색상, No 컬럼, 모바일, i18n, 검색/필터/엑셀
