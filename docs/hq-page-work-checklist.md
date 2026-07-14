# HQ Admin Page Work Checklist

작성일: 2026-07-15

이 문서는 완료 선언이 아니라 재검증용 체크리스트다.  
`코드 연결`은 라우트/컴포넌트/API 호출 코드가 존재한다는 뜻이고, `수동 검증`은 운영 브라우저에서 로그인 후 실제 데이터와 액션을 직접 확인해야 한다는 뜻이다.

## 공통 검증

- [x] 프론트 빌드 통과: `npm run build`
- [x] 백엔드 전체 테스트 통과: `./gradlew test --no-daemon`
- [ ] 프론트 운영 배포 완료: 최신 로컬 변경 미배포
- [ ] 백엔드 운영 배포 완료: 최신 로컬 변경 미배포
- [ ] `/hq/logs/admin` SPA route 200 확인
- [ ] `/api/hq/logs/admin` 인증 보호 확인: 무토큰 401
- [ ] 운영 로그인 세션으로 전체 페이지 직접 화면 확인
- [ ] 전체 DataTable 좌우 스크롤/컬럼 resize 직접 확인
- [ ] 전체 검색/필터/엑셀 다운로드 직접 확인
- [ ] 전체 액션 버튼 클릭 후 KPI/표 즉시 반영 직접 확인
- [ ] 전체 상세 modal/drawer row click 직접 확인
- [ ] 전체 상태/액션 뱃지 색상 통일 직접 확인
- [x] `kori_partners` Badge/ActionBadges 기준 비교 완료
- [x] HQ 공통 ActionBadges 기본값을 partners 기준(`md` + `rect` + 라벨별 색상)으로 조정
- [x] HQ 상세 탭 일부 `xs` 액션 배지 제거 및 상태 span을 공통 Badge로 전환
- [x] DataTable 공통 코드에서 좌우 스크롤/컬럼 resize/search/filter/excel 기능 지원 확인
- [ ] 운영 브라우저에서 공통 배지 크기 변경 후 표 잘림/가로 스크롤 재확인
- [ ] 상태 뱃지 색상 기준 확인: 완료/승인/활성=green, 검토/대기/자료요청=orange, 보류=blue/orange, 위험/거절/삭제=red, 승인요청=purple

## 라우팅 표면 점검

아래는 `src/App.tsx`의 `HQ_PAGES` 기준 전체 라우팅 표면이다. 각 라우트는 코드 연결과 별개로 운영 로그인 세션에서 200/렌더/API/배지/표 조작을 직접 확인해야 한다.

### 대시보드
- [x] `/hq/dashboard` 라우트 연결
- [x] `/hq/dashboard/by-country` 라우트 연결
- [ ] `/hq/dashboard` 더미 fallback 제거 여부 확인
- [ ] `/hq/dashboard/by-country` 더미 기반 여부 확인
- [ ] Quick Action 이동/권한/배지 색상 직접 확인

### 라우트 alias / 리다이렉트
- [x] `/hq/admin` -> `/hq/admin/accounts` 리다이렉트 연결
- [x] `/hq/risk` -> `/hq/risk/fake-applications` 리다이렉트 연결
- [x] `/hq/stats` -> `/hq/stats/country` 리다이렉트 연결
- [x] `/hq/logs` -> `/hq/logs/admin` 리다이렉트 연결
- [x] `/hq/settlement/request/detail` 사이드바 외 상세 라우트 연결
- [ ] 각 alias가 운영 SPA에서 200 후 의도 라우트로 이동하는지 확인

### 배지/액션 공통 라우팅 점검
- [ ] `/hq/applications` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/applications/result-log` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/requests/leader` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/requests/partner-by-leader` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/requests/partner-direct` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/requests/merchant-direct` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/requests/result-log` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/leaders` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/leaders/sales` 상세 탭 상태/액션 배지 색상 직접 확인
- [ ] `/hq/partners` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/partners/sales` 상세 탭 상태/액션 배지 색상 직접 확인
- [ ] `/hq/merchants` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/merchants/sales` 상세 탭 상태/액션 배지 색상 직접 확인
- [ ] `/hq/payments/logs` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/payments/sync-issues` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/payments/error-codes` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/settlement/request` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/settlement/request/detail` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/settlement/history` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/settlement/commission` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/settlement/rate-setting` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/collateral/history` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/announcements/send` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/announcements/history` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/admin/accounts` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/admin/permission-groups` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/admin/country-access` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/admin/login-security` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/admin/two-factor` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/risk/fake-applications` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/risk/fake-merchants` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/risk/duplicates` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/risk/settlement-hold` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/risk/blacklist` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/stats/country` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/stats/partner` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/stats/merchant` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/stats/payment-method` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/system/country` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/system/error-code` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/system/security-policy` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/system/maintenance-mode` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/logs/admin` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/logs/approval` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/logs/settlement` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/logs/permission-change` 상태/액션 배지 색상 직접 확인
- [ ] `/hq/logs/security` 상태/액션 배지 색상 직접 확인

### JSON / 더미 잔존 점검
- [ ] `/hq/dashboard`: [useDashboard.ts](/home/ubuntu/work/KORIONPAY_PAGE_FRONTEND/src/pages/hq/Dashboard/useDashboard.ts)에서 `dashboardData.json` fallback 잔존
- [ ] `/hq/dashboard/by-country`: [useCountryDashboard.ts](/home/ubuntu/work/KORIONPAY_PAGE_FRONTEND/src/pages/hq/CountryDashboard/useCountryDashboard.ts)에서 `countryDashboardData.json` 기반
- [ ] `/hq/leaders/sales`: `leaderSalesData.json`, `leaderPartnersData.json`, `leaderMerchantsData.json`, `leaderSettlementData.json` type/초기값 의존 잔존
- [ ] `/hq/partners/sales`: `partnerSalesData.json`, `partnerDetailData.json` type/초기값 의존 잔존
- [ ] `/hq/merchants/sales`: `merchantSalesData.json`, `transactionDetailData.json` type/초기값/상세 모달 의존 잔존
- [x] `/hq/announcements/send`: [useNoticeSend.ts](/home/ubuntu/work/KORIONPAY_PAGE_FRONTEND/src/pages/hq/NoticeSend/useNoticeSend.ts)에서 `noticeSendData.json` fallback 제거 및 파일 삭제
- [ ] `/hq/settlement/request/detail`: [useSettlementRequestDetail.ts](/home/ubuntu/work/KORIONPAY_PAGE_FRONTEND/src/pages/hq/SettlementRequestDetail/useSettlementRequestDetail.ts)에서 상세 JSON shape 의존 잔존
- [ ] `/hq/collateral/history`: 충전/정보/정산 상세 overlay JSON 의존 잔존
- [ ] `/hq/system/maintenance-mode`: 시작/확인 overlay 옵션 JSON 의존 잔존
- [ ] `/hq/requests/result-log`: 상세 overlay JSON 의존 잔존
- [ ] 위 JSON 잔존 파일은 API 응답 스키마를 백엔드에서 확정한 뒤 빈 초기값 또는 API 전용 타입으로 제거

## 신청서 관리

### `/hq/applications`
- [x] 라우트 연결
- [x] 표 검색/필터/엑셀 UI 연결
- [x] 액션 버튼 공통 badge 스타일 적용 코드 반영
- [x] 신청서 상태 액션 API 연결
- [x] 더미 fallback 제거
- [ ] 대기/검토/확인/위험/삭제 액션 실제 처리 확인
- [ ] 신청서 액션 발생 시 DB `partner_applications.status` 및 활동 로그 적재 운영 확인
- [ ] No 정렬이 최신 큰 번호 기준인지 확인
- [ ] 표 가로 스크롤 잘림 여부 확인

### `/hq/applications/result-log`
- [x] 라우트 연결
- [x] 처리 결과 이력 메뉴 연결
- [ ] 신청서 액션 발생 시 이력 적재 확인
- [ ] 검색/필터/엑셀 확인

## 요청 관리

### `/hq/requests/leader`
- [x] 라우트 연결
- [x] 승인/거절/검토/대기/자료요청 API 연결
- [x] No 정렬 로직 반영
- [x] 액션 버튼 색상 분리 코드 반영
- [x] 더미 fallback 제거
- [x] 액션 실패 숨김 제거 및 성공 후 목록 재조회 연결
- [ ] 각 액션 실제 상태 변경 확인
- [ ] 요청 처리 후 결과 로그 반영 확인

### `/hq/requests/partner-by-leader`
- [x] 라우트 연결
- [x] 승인/거절/검토/대기/자료요청 API 연결
- [x] No 정렬 로직 반영
- [x] 액션 버튼 색상 분리 코드 반영
- [x] 더미 fallback 제거
- [x] 액션 실패 숨김 제거 및 성공 후 목록 재조회 연결
- [ ] 각 액션 실제 상태 변경 확인
- [ ] 요청 처리 후 결과 로그 반영 확인

### `/hq/requests/partner-direct`
- [x] 라우트 연결
- [x] 승인/거절/검토/대기/자료요청 API 연결
- [x] No 정렬 로직 반영
- [x] 액션 버튼 색상 분리 코드 반영
- [x] 더미 fallback 제거
- [x] 액션 실패 숨김 제거 및 성공 후 목록 재조회 연결
- [ ] 각 액션 실제 상태 변경 확인
- [ ] 요청 처리 후 결과 로그 반영 확인

### `/hq/requests/merchant-direct`
- [x] 라우트 연결
- [x] 승인/거절/검토/대기/자료요청 API 연결
- [x] No 정렬 로직 반영
- [x] 액션 버튼 색상 분리 코드 반영
- [x] 더미 fallback 제거
- [x] 액션 실패 숨김 제거 및 성공 후 목록 재조회 연결
- [ ] 각 액션 실제 상태 변경 확인
- [ ] 요청 처리 후 결과 로그 반영 확인

### `/hq/requests/result-log`
- [x] 라우트 연결
- [x] 처리 결과 이력 페이지 연결
- [x] 더미 fallback 제거
- [ ] 모든 요청 액션이 실제 이력에 쌓이는지 확인

## 리더/파트너/가맹점 관리

### `/hq/leaders`
- [x] API 연결 코드 존재
- [x] 더미 fallback 제거
- [x] KPI/표 구조 API 기반으로 이동
- [x] row click 상세 이동 코드 반영
- [x] 정지/해제 액션 API 연결
- [x] 목록 KPI 프론트 재계산 제거 및 서버 KPI 사용
- [ ] KPI가 실제 DB 값과 일치하는지 확인
- [ ] 정지/해제 후 KPI 즉시 반영 확인
- [ ] row click 시 기본 탭이 의도한 탭인지 확인
- [ ] 상세 탭별 실제 데이터 확인

### `/hq/leaders/sales`
- [x] API 연결 코드 존재
- [x] 국가 리더 전체 목록 구성 코드 반영
- [x] row click 상세 이동 코드 반영
- [ ] row click 시 거래내역 탭으로 진입하는지 확인
- [ ] 더미가 아닌 실제 API 데이터인지 확인

### 리더 상세 탭
- [x] 파트너별 탭 코드 반영
- [x] 가맹점별 탭 코드 반영
- [x] 거래내역 탭 코드 반영
- [x] 정산내역 탭 코드 반영
- [x] 관리자 메모 탭 코드 반영
- [ ] 각 탭 KPI/표 실제 데이터 확인
- [ ] 관리자 메모 저장 확인

### `/hq/partners`
- [x] API 연결 코드 존재
- [x] 더미 fallback 제거
- [x] KPI/표 구조 API 기반으로 이동
- [x] row click 상세 이동 코드 반영
- [x] 정지/해제 액션 API 연결
- [x] 목록 KPI 프론트 재계산 제거 및 서버 KPI 사용
- [ ] KPI가 실제 DB 값과 일치하는지 확인
- [ ] 정지/해제 후 KPI 즉시 반영 확인
- [ ] row click 시 기본 탭이 의도한 탭인지 확인

### `/hq/partners/sales`
- [x] API 연결 코드 존재
- [x] 파트너 목록 row click 상세 이동 코드 반영
- [ ] row click 시 거래내역 탭으로 진입하는지 확인
- [ ] 실제 API 데이터인지 확인

### 파트너 상세 탭
- [x] 가맹점별 탭 코드 반영
- [x] 거래내역 탭 코드 반영
- [x] 정산내역 탭 코드 반영
- [x] 관리자 메모 탭 코드 반영
- [ ] 각 탭 KPI/표 실제 데이터 확인
- [ ] 거래내역 row 상세 modal 확인
- [ ] 관리자 메모 저장 확인

### `/hq/merchants`
- [x] API 연결 코드 존재
- [x] 더미 fallback 제거
- [x] KPI/표 구조 API 기반으로 이동
- [x] row click 상세 이동 코드 반영
- [x] 정지/해제/블랙 상태 액션 API 연결
- [x] 목록 KPI 프론트 재계산 제거 및 서버 KPI 사용
- [ ] KPI가 실제 DB 값과 일치하는지 확인
- [ ] 정지/해제 후 KPI 즉시 반영 확인
- [ ] row click 시 거래내역 탭으로 진입하는지 확인

### `/hq/merchants/sales`
- [x] API 연결 코드 존재
- [x] 가맹점 목록 row click 상세 이동 코드 반영
- [ ] 거래내역 탭 실제 하부 데이터 확인
- [ ] row click 상세 modal 확인

### 가맹점 상세 탭
- [x] 거래내역 탭 코드 반영
- [x] 정산내역 탭 코드 반영
- [x] 관리자 메모 탭 코드 반영
- [x] 요청사항 탭 코드 반영
- [ ] 각 탭 KPI/표 실제 데이터 확인
- [ ] 거래내역 row 상세 modal 확인
- [ ] 관리자 메모 저장 확인

## 결제/거래 로그

### `/hq/payments/logs`
- [x] 라우트 연결
- [x] KPI API 연결 코드 존재
- [x] No 컬럼 추가 코드 반영
- [x] 상태 뱃지 코드 반영
- [x] 지급보류/보류해제 API 연결 코드 존재
- [x] row click 상세 modal 코드 반영
- [x] 결제 로그 표 `tableFluid/tableWrapCells` 제거로 가로 스크롤/컬럼 resize 경로 복구
- [ ] KPI가 실제 거래 데이터와 일치하는지 확인
- [ ] 지급보류/보류해제 버튼 동작 확인
- [ ] row 상세 내용 충분성 확인
- [ ] 필터/검색/엑셀 확인

### `/hq/payments/sync-issues`
- [x] 라우트 연결
- [x] KPI/표 API 연결 코드 존재
- [x] 송신/수신/업로드 상태 기반 표 구성 코드 반영
- [ ] 401 해결 여부 운영 로그인으로 확인
- [ ] 실제 sync issue 데이터 반영 확인

### `/hq/payments/error-codes`
- [x] 라우트 연결
- [x] KPI/표 API 연결 코드 존재
- [x] 오류 코드 등록/상태 관리 코드 존재
- [ ] 401 해결 여부 운영 로그인으로 확인
- [ ] 등록/수정/상태 변경 실제 동작 확인
- [ ] KPI가 등록된 오류 코드 기준으로 반영되는지 확인

## 수수료 / 정산

### `/hq/settlement/request`
- [x] 라우트 연결
- [x] KPI API 연결 코드 존재
- [x] No 컬럼/상태 뱃지 코드 반영
- [x] 승인/검토/보류/자료요청/거절 액션 API 연결 코드 존재
- [x] row click 상세 이동 코드 반영
- [ ] KPI 실제 데이터 연산 확인
- [ ] 승인/검토/보류/자료요청/거절 실제 동작 확인
- [ ] 표 가로 스크롤/컬럼 resize 확인

### `/hq/settlement/request/detail`
- [x] 라우트 연결
- [x] 상세 API 연결 코드 존재
- [x] 체크박스 기본 미체크 코드 반영
- [x] 승인/검토/보류/자료요청/거절 버튼 코드 존재
- [ ] 각 버튼 API 실제 동작 확인
- [ ] 상세 내역 실제 데이터 확인

### `/hq/settlement/history`
- [x] 라우트 연결
- [x] KPI/표 API 연결 코드 존재
- [x] No 컬럼/상태 뱃지 코드 반영
- [x] row click 상세 modal 코드 반영
- [ ] KPI 실제 데이터 확인
- [ ] 정산내역 row 상세 확인
- [ ] 액션 컬럼 제거 여부 확인

### `/hq/settlement/commission`
- [x] 라우트 연결
- [x] KPI/표 API 연결 코드 존재
- [x] 수수료 추가/수정/삭제 API 연결 코드 존재
- [x] 국가 드롭다운/이벤트 토글/코인별 수수료 입력 코드 존재
- [ ] 국가 중복 추가 차단 확인
- [ ] 이벤트 토글 실제 저장 확인
- [ ] 코인별 수수료 추가 실제 저장 확인
- [ ] 액션 버튼 크기/가시성 확인

### `/hq/settlement/rate-setting`
- [x] 라우트 연결
- [x] KPI/표 API 연결 코드 존재
- [x] 기본 배분율 수정/저장 코드 존재
- [x] 국가별 배분율 추가/수정/삭제 API 연결 코드 존재
- [ ] 배분율 저장 실제 반영 확인
- [ ] 국가 중복 추가 차단 확인
- [ ] KPI가 저장된 배분율 기준으로 갱신되는지 확인

## 담보금

### `/hq/collateral/history`
- [x] 라우트 연결
- [x] KPI API 연결 코드 존재
- [x] 국가/일자 필터 코드 존재
- [x] 회원 담보금 충전/해제 내역 탭 코드 존재
- [x] 회원 담보금 정보 탭 코드 존재
- [x] 회원 정산내역 탭 코드 존재
- [x] row click 상세 modal 코드 존재
- [ ] KPI 실제 데이터 확인
- [ ] 필터에 맞는 데이터 반영 확인
- [ ] 담보금 변경 전/후 금액 확인
- [ ] 회원정보 액션 실제 연결 확인

## 리스크 관리

### `/hq/risk/fake-applications`
- [x] 라우트 연결
- [x] 화면/표/상세 overlay 코드 존재
- [ ] 실제 API 기반인지 확인
- [ ] 액션/상태 처리 실제 동작 확인

### `/hq/risk/fake-merchants`
- [x] 라우트 연결
- [x] 화면/표/상세 overlay 코드 존재
- [ ] 실제 API 기반인지 확인
- [ ] 액션/상태 처리 실제 동작 확인

### `/hq/risk/duplicates`
- [x] 라우트 연결
- [x] 화면/표/상세 overlay 코드 존재
- [ ] 실제 API 기반인지 확인
- [ ] 액션/상태 처리 실제 동작 확인

### `/hq/risk/settlement-hold`
- [x] 라우트 연결
- [x] 화면/표/상세 overlay 코드 존재
- [ ] 실제 API 기반인지 확인
- [ ] 보류/해제 처리 실제 동작 확인

### `/hq/risk/blacklist`
- [x] 라우트 연결
- [x] 화면/표/상세 overlay 코드 존재
- [ ] 실제 API 기반인지 확인
- [ ] 블랙/해제 처리 실제 동작 확인

## 통계

### `/hq/stats/country`
- [x] 라우트 연결
- [x] 화면/표/상세 overlay 코드 존재
- [ ] 실제 API 기반인지 확인
- [ ] KPI/차트/표 데이터 정확성 확인

### `/hq/stats/partner`
- [x] 라우트 연결
- [x] 화면/표/상세 overlay 코드 존재
- [ ] 실제 API 기반인지 확인
- [ ] KPI/차트/표 데이터 정확성 확인

### `/hq/stats/merchant`
- [x] 라우트 연결
- [x] 화면/표/상세 overlay 코드 존재
- [ ] 실제 API 기반인지 확인
- [ ] KPI/차트/표 데이터 정확성 확인

### `/hq/stats/payment-method`
- [x] 라우트 연결
- [x] 화면/표 코드 존재
- [ ] 실제 API 기반인지 확인
- [ ] QR/NFC/BLE/온라인 데이터 정확성 확인

## 공지사항

### `/hq/announcements/send`
- [x] 라우트 연결
- [x] 파트너/리더 스타일 기반 UI refactor 코드 존재
- [x] 전송/임시저장 API 연결 코드 존재
- [x] `noticeSendData.json` fallback 제거/파일 삭제 및 API 실패 시 샘플값 미표시
- [ ] 실제 대상 선택/전송 확인
- [ ] 실패 시 에러 메시지 확인

### `/hq/announcements/history`
- [x] 라우트 연결
- [x] KPI/표 API 연결 코드 존재
- [x] 국가/일자 필터 코드 존재
- [x] 상태 뱃지 코드 존재
- [ ] KPI 실제 데이터 확인
- [ ] 액션 버튼 크기/가시성 확인
- [ ] 상세/취소/수신자 목록 확인

## 관리자 관리

### `/hq/admin/accounts`
- [x] 라우트 연결
- [x] API 기반 관리자 계정 목록 코드 존재
- [x] 수정 modal/API 연결 코드 존재
- [ ] 역할/상태 변경 실제 저장 확인
- [ ] 권한 계층 제한 확인

### `/hq/admin/permission-groups`
- [x] 라우트 연결
- [x] 권한 그룹 목록 코드 존재
- [x] 수정 modal/API 연결 코드 존재
- [ ] 권한 저장 실제 반영 확인

### `/hq/admin/country-access`
- [x] 라우트 연결
- [x] 국가별 접근 권한 목록 코드 존재
- [x] 수정 modal/API 연결 코드 존재
- [ ] 국가별 메뉴 권한 저장 실제 반영 확인

### `/hq/admin/login-security`
- [x] 라우트 연결
- [x] 로그인 보안 정책 목록 API 연결 코드 존재
- [x] 수정 modal/API 연결 코드 존재
- [x] 백엔드 `PUT /api/hq/admin/login-security/{policyKey}` 구현
- [ ] 정책 값 저장 실제 반영 확인
- [ ] app_config 저장값 확인

### `/hq/admin/two-factor`
- [x] 라우트 연결
- [x] 페이지 데이터 코드 존재
- [ ] 실제 2FA 상태 데이터 확인
- [ ] 필요한 액션 존재 여부 확인

## 시스템 설정

### `/hq/system/country`
- [x] 라우트 연결
- [x] KPI/표 API 연결 코드 존재
- [x] 상태 뱃지/액션 버튼 코드 존재
- [ ] 국가 번호 정렬 확인
- [ ] 결제 상태 뱃지 확인
- [ ] 실제 국가 데이터인지 확인
- [ ] 수정/삭제/상세 액션 확인

### `/hq/system/error-code`
- [x] 라우트 연결
- [x] KPI/표 API 연결 코드 존재
- [x] 자동처리 상태/액션 뱃지 코드 존재
- [ ] 번호 정렬 확인
- [ ] 등록/수정/삭제 실제 동작 확인

### `/hq/system/security-policy`
- [x] 라우트 연결
- [x] 화면 코드 존재
- [ ] 실제 API 기반인지 확인
- [ ] 정책 변경 저장 동작 확인

### `/hq/system/maintenance-mode`
- [x] 라우트 연결
- [x] KPI/표 API 연결 코드 존재
- [x] 상태/액션 뱃지 코드 존재
- [ ] 유지보수 모드 실제 동작 확인
- [ ] 수정/삭제/상세 액션 확인

## 로그 관리

### `/hq/logs/admin`
- [x] 라우트 연결
- [x] 백엔드 `GET /api/hq/logs/admin` 구현
- [x] KPI/표 API 연결 코드 존재
- [ ] 로그인 후 실제 로그 데이터 확인

### `/hq/logs/approval`
- [x] 라우트 연결
- [x] 백엔드 `GET /api/hq/logs/approval` 구현
- [x] KPI/표 API 연결 코드 존재
- [ ] 승인/거절/보류/자료요청 액션 로그 확인

### `/hq/logs/settlement`
- [x] 라우트 연결
- [x] 백엔드 `GET /api/hq/logs/settlement` 구현
- [x] KPI/표 API 연결 코드 존재
- [ ] 정산 액션 로그 확인

### `/hq/logs/permission-change`
- [x] 라우트 연결
- [x] 백엔드 `GET /api/hq/logs/permission-change` 구현
- [x] KPI/표 API 연결 코드 존재
- [ ] 권한/관리자 변경 액션 로그 확인

### `/hq/logs/security`
- [x] 라우트 연결
- [x] 백엔드 `GET /api/hq/logs/security` 구현
- [x] KPI/표 API 연결 코드 존재
- [ ] 로그인/보안 이벤트 로그 확인

## 의심 지점

- [ ] 리스크/통계 일부 페이지는 현재 프론트 파일에 JSON 데이터 파일이 남아 있다. 실제 API 기반으로 전환됐는지 별도 확인 필요.
- [ ] 운영 로그인 토큰으로 401 발생 페이지를 재확인해야 한다.
- [ ] 모든 KPI가 “화면 표시용 계산”이 아니라 실제 DB 집계인지 쿼리 단위로 검증해야 한다.
- [ ] 액션 후 프론트 reload/optimistic update가 모든 페이지에서 동일하게 작동하는지 확인해야 한다.
- [ ] 대량 변경 커밋이므로 페이지별 회귀 테스트를 분리해 진행해야 한다.
