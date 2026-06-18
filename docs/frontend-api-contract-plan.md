# KORI Partners Frontend API Contract Plan

## 1. 목적

이 문서는 `kori_partners` 프론트가 현재 호출하도록 연결한 리더, 파트너, 가맹점 API 계약을 정리한다.

백엔드 구현 문서인 `korion_chong/docs/backend-api-implementation-plan.md`와 짝을 이룬다. 백엔드가 아직 제공하지 않는 API도 프론트 호출 계약은 먼저 고정되어 있으므로, 이후 백엔드 OpenAPI/DTO 구현 시 이 문서의 path, query, response shape을 기준으로 맞춘다.

## 2. 프론트 공통 호출 규칙

### 2.1 API base

- 환경변수: `VITE_KORION_CHONG_API_URL`
- 정의 파일: `src/services/korionChongApi.ts`

### 2.2 권한별 헤더

- 리더 API
  - Hook: `src/hooks/useLeaderPageData.ts`
  - Fetcher: `fetchLeaderPageData`
  - Header
    - `X-Leader-Id`
    - `X-Country-Scopes`
- 파트너 API
  - Hook: `src/hooks/usePartnerPageData.ts`
  - Fetcher: `fetchPartnerPageData`
  - Header
    - `X-Partner-Id`
    - `X-Country-Scopes`
- 가맹점 API
  - Hook: `src/hooks/useMerchantPageData.ts`
  - Fetcher: `fetchMerchantPageData`
  - Header
    - `X-Merchant-Id`
    - `X-Country-Scopes`
- 공용 재사용 페이지
  - Hook: `src/hooks/useRolePageData.ts`
  - 현재 로그인 role에 따라 `leader`, `partner`, `merchant` path 중 하나를 호출한다.

### 2.3 공통 query

- 모든 role page hook은 기본으로 `countryScope`를 포함한다.
- `countryScope` 기본값은 `localStorage.korion.countryScopes`의 첫 번째 값이다.
- 페이지별 추가 query는 hook 호출 시 넘긴다.

### 2.4 공통 fallback

- API 응답 전 초기 렌더링은 기존 JSON fixture를 사용한다.
- API 성공 시 fixture를 응답 데이터로 교체한다.
- API 실패 시 현재 화면은 fixture 기반 상태를 유지하고 `error` 값을 hook return에 보관한다.
- 최종 구현에서는 페이지 컴포넌트가 `isLoading`, `error` 상태를 UI에 표시해야 한다.

## 3. 인증 API 계약

### 3.1 구현 완료 백엔드 API

- [x] `POST /api/auth/login`
- [x] `GET /api/auth/availability`
- [x] `GET /api/auth/referral-codes/{code}/validate`
- [x] `POST /api/auth/email-verifications/send`
- [x] `POST /api/auth/email-verifications/confirm`
- [x] `POST /api/auth/wallet-links/verify`
- [x] `POST /api/auth/signup-applications`

### 3.2 프론트 연결 파일

- `src/pages/auth/RoleLogin/useRoleLogin.ts`
- `src/pages/auth/RoleSignup/RoleSignup.tsx`
- `src/services/korionChongApi.ts`
- `src/services/authSession.ts`

## 4. 리더 페이지 API 계약

### 4.1 구현 완료 백엔드 API

- [x] `GET /api/leader/dashboard`
  - Page: `/leader/dashboard`
  - Front hook: `src/pages/Dashboard/useDashboardData.ts`
  - Query: `period`, `countryScope`
  - Response: `LeaderDashboardApiResponse`
- [x] `GET /api/leader/partners`
  - Page: `/leader/dashboard`, `/leader/partners`
  - Front hook: `src/pages/Dashboard/useDashboardData.ts`, `src/pages/Partners/usePartners.ts`
  - Query: `countryScope`, `status`, `page`, `size`
  - Response: `LeaderPartnerApiResponse`

### 4.2 백엔드 미구현, 프론트 계약 고정 API

- [ ] `GET /api/leader/partner-applications`
  - Page: `/leader/requests/partner`
  - Front hook: `src/pages/RequestsPartner/usePartnerRequests.ts`
  - Initial fixture: `src/pages/RequestsPartner/partnerData.json`
  - Query: `countryScope`, `status?`, `region?`, `keyword?`, `page?`, `size?`
  - Response shape: `{ stats: StatRaw[], rows: PartnerRow[] }`
- [ ] `GET /api/leader/merchant-applications`
  - Page: `/leader/requests/merchant`
  - Front hook: `src/pages/RequestsMerchant/useMerchantRequests.ts`
  - Initial fixture: `src/pages/RequestsMerchant/merchantData.json`
  - Query: `countryScope`, `status?`, `city?`, `keyword?`, `page?`, `size?`
  - Response shape: `{ stats: StatRaw[], rows: MerchantRow[] }`
- [ ] `GET /api/leader/partner-sales`
  - Page: `/leader/partners/sales`
  - Front hook: `src/pages/PartnerSales/usePartnerSales.ts`
  - Initial fixture: `src/pages/PartnerSales/partnerSalesData.json`
  - Query: `countryScope`, `period?`, `partnerId?`
  - Response shape: `{ stats: StatRaw[], t1Rows: PartnerSalesRow[], merchantRows: MerchantSalesRow[] }`
- [ ] `GET /api/leader/merchants`
  - Page: `/leader/merchants`
  - Front hook: `src/pages/Merchants/useMerchants.ts`
  - Initial fixture: `src/pages/Merchants/merchantsData.json`
  - Query: `countryScope`, `status?`, `city?`, `keyword?`, `page?`, `size?`
  - Response shape: `{ stats: StatRaw[], rows: MerchantListRow[] }`
- [ ] `GET /api/leader/merchant-sales`
  - Page: `/leader/merchants/sales`
  - Front hook: `src/pages/MerchantSales/useMerchantSales.ts`
  - Initial fixture: `src/pages/MerchantSales/merchantSalesData.json`
  - Query: `countryScope`, `period?`, `merchantId?`
  - Response shape: `{ stats: StatRaw[], t1Rows: MerchantSalesT1Row[], t2Rows: MerchantSalesT2Row[] }`
- [ ] `GET /api/leader/transactions`
  - Page: `/leader/transactions`, `/leader/transactions/offline`, `/leader/transactions/failed`
  - Front hook: `src/pages/Transactions/useTransactions.ts`
  - Initial fixture: `src/pages/Transactions/transactionsData.json`
  - Query: `countryScope`, `variant=all|offline|failed`, `period?`, `status?`, `partnerId?`, `merchantId?`
  - Response shape: `{ stats: StatRaw[], all: { rows: Row[] }, offline: { rows: Row[] }, failed: { rows: Row[] } }`
- [ ] `GET /api/leader/settlements/request-summary`
  - Page: `/leader/settlement/request`
  - Front hook: `src/pages/SettlementRequest/useSettlementRequest.ts`
  - Initial fixture: `src/pages/SettlementRequest/settlementRequestData.json`
  - Query: `countryScope`, `period?`
  - Response shape: `SettlementRequestData`
- [ ] `GET /api/leader/settlements`
  - Page: `/leader/settlement/history`
  - Front hook: `src/pages/SettlementHistory/useSettlementHistory.ts`
  - Initial fixture: `src/pages/SettlementHistory/settlementHistoryData.json`
  - Query: `countryScope`, `status?`, `period?`, `page?`, `size?`
  - Response shape: `{ lastSettleDate: string, thisRequestAmount: string, rows: SettlementHistoryRow[] }`
- [ ] `GET /api/leader/settlements/detail`
  - Page: `/leader/settlement/history/detail`
  - Front hook: `src/pages/SettlementDetail/useSettlementDetail.ts`
  - Initial fixture: `src/pages/SettlementDetail/settlementDetailData.json`
  - Query: `countryScope`, `settlementId?`
  - Response shape: `SettlementDetailData`
- [ ] `GET /api/leader/hq-notices`
  - Page: `/leader/hq-notices`
  - Front hook: `src/pages/HqNotices/useHqNotices.ts`
  - Initial fixture: `src/pages/HqNotices/hqNoticesData.json`
  - Query: `countryScope`, `type?`, `keyword?`, `page?`, `size?`
  - Response shape: `{ rows: HqNoticeRow[] }`
- [ ] `GET /api/leader/notices/send-summary`
  - Page: `/leader/notices/send`
  - Front hook: `src/pages/NoticeSend/useNoticeSend.ts`
  - Initial fixture: `src/pages/NoticeSend/noticeSendData.json`
  - Query: `countryScope`
  - Response shape: `{ metrics: MetricRaw[] }`
- [ ] `GET /api/leader/notices`
  - Page: `/leader/notices/history`
  - Front hook: `src/pages/NoticeHistory/useNoticeHistory.ts`
  - Initial fixture: `src/pages/NoticeHistory/noticeHistoryData.json`
  - Query: `countryScope`, `status?`, `type?`, `period?`, `page?`, `size?`
  - Response shape: `{ metrics: MetricRaw[], rows: NoticeHistoryRow[] }`
- [ ] `GET /api/leader/profile`
  - Page: `/leader/settings/profile`
  - Front hook: `src/pages/Profile/useProfile.ts`
  - Initial fixture: `src/pages/Profile/profileData.json`
  - Query: `countryScope`
  - Response shape: `{ statusItems: StatusRaw[], code: string, accountFields: FieldRaw[], basicFields: FieldRaw[] }`
- [ ] `GET /api/leader/activity-logs`
  - Page: `/leader/settings/activity-log`
  - Front hook: `src/pages/ActivityLog/useActivityLog.ts`
  - Initial fixture: `src/pages/ActivityLog/activityLogData.json`
  - Query: `countryScope`, `type?`, `status?`, `period?`, `page?`, `size?`
  - Response shape: `{ metrics: MetricRaw[], rows: ActivityLogRow[] }`

## 5. 파트너 페이지 API 계약

- [ ] `GET /api/partner/dashboard`
  - Page: `/partner/dashboard`
  - Hook: `src/pages/partner/Dashboard/usePartnerDashboard.ts`
  - Fixture: `src/pages/partner/Dashboard/partnerDashboardData.json`
  - Query: `countryScope`
  - Response shape: `{ kpis: KpiRaw[] }`
- [ ] `GET /api/partner/merchant-applications`
  - Page: `/partner/requests/merchant`
  - Hook: `src/pages/partner/RequestsMerchant/usePartnerMerchantRequests.ts`
  - Fixture: `src/pages/partner/RequestsMerchant/partnerMerchantData.json`
  - Query: `countryScope`, `status?`, `keyword?`, `page?`, `size?`
  - Response shape: `{ stats: StatRaw[], rows: PartnerMerchantRow[] }`
- [ ] `GET /api/partner/merchant-applications/detail`
  - Page: `/partner/requests/merchant/detail`
  - Hook: `src/pages/partner/MerchantDetail/useMerchantDetail.ts`
  - Fixture: `src/pages/partner/MerchantDetail/merchantDetailData.json`
  - Query: `countryScope`, `applicationId?`
  - Response shape: `MerchantDetailData`
- [ ] `GET /api/partner/merchants`
  - Page: `/partner/merchants`
  - Hook: `src/pages/Merchants/useMerchants.ts`
  - Fixture: `src/pages/Merchants/merchantsData.json`
  - Query: `countryScope`, `status?`, `city?`, `keyword?`, `page?`, `size?`
  - Response shape: `{ stats: StatRaw[], rows: MerchantListRow[] }`
- [ ] `GET /api/partner/merchant-sales`
  - Page: `/partner/merchants/sales`
  - Hook: `src/pages/MerchantSales/useMerchantSales.ts`
  - Fixture: `src/pages/MerchantSales/merchantSalesData.json`
  - Query: `countryScope`, `period?`, `merchantId?`
  - Response shape: `{ stats: StatRaw[], t1Rows: MerchantSalesT1Row[], t2Rows: MerchantSalesT2Row[] }`
- [ ] `GET /api/partner/settlements/request-summary`
  - Page: `/partner/settlement/request`
  - Hook: `src/pages/partner/SettlementRequest/usePartnerSettlementRequest.ts`
  - Fixture: `src/pages/partner/SettlementRequest/partnerSettlementRequestData.json`
  - Query: `countryScope`, `period?`
  - Response shape: `PartnerSettlementRequestData`
- [ ] `GET /api/partner/settlements`
  - Page: `/partner/settlement/history`
  - Hook: `src/pages/partner/SettlementHistory/usePartnerSettlementHistory.ts`
  - Fixture: `src/pages/partner/SettlementHistory/partnerSettlementHistoryData.json`
  - Query: `countryScope`, `status?`, `period?`, `page?`, `size?`
  - Response shape: `{ lastSettleDate: string, thisRequestAmount: string, rows: PartnerSettlementHistoryRow[] }`
- [ ] `GET /api/partner/settlements/detail`
  - Page: `/partner/settlement/history/detail`
  - Hook: `src/pages/partner/SettlementDetail/usePartnerSettlementDetail.ts`
  - Fixture: `src/pages/partner/SettlementDetail/partnerSettlementDetailData.json`
  - Query: `countryScope`, `settlementId?`
  - Response shape: `PartnerSettlementDetailData`
- [ ] `GET /api/partner/hq-notices`
  - Page: `/partner/hq-notices`
  - Hook: `src/pages/HqNotices/useHqNotices.ts`
  - Fixture: `src/pages/HqNotices/hqNoticesData.json`
  - Query: `countryScope`, `type?`, `keyword?`, `page?`, `size?`
  - Response shape: `{ rows: HqNoticeRow[] }`
- [ ] `GET /api/partner/notices/send-summary`
  - Page: `/partner/notices/send`
  - Hook: `src/pages/partner/NoticeSend/usePartnerNoticeSend.ts`
  - Fixture: `src/pages/partner/NoticeSend/partnerNoticeSendData.json`
  - Query: `countryScope`
  - Response shape: `{ metrics: MetricRaw[] }`
- [ ] `GET /api/partner/notices`
  - Page: `/partner/notices/history`
  - Hook: `src/pages/NoticeHistory/useNoticeHistory.ts`
  - Fixture: `src/pages/NoticeHistory/noticeHistoryData.json`
  - Query: `countryScope`, `status?`, `type?`, `period?`, `page?`, `size?`
  - Response shape: `{ metrics: MetricRaw[], rows: NoticeHistoryRow[] }`
- [ ] `GET /api/partner/profile`
  - Page: `/partner/settings/profile`
  - Hook: `src/pages/partner/Profile/usePartnerProfile.ts`
  - Fixture: `src/pages/partner/Profile/partnerProfileData.json`
  - Query: `countryScope`
  - Response shape: `{ statusItems: StatusRaw[], code: string, accountFields: FieldRaw[], basicFields: FieldRaw[] }`
- [ ] `GET /api/partner/activity-logs`
  - Page: `/partner/settings/activity-log`
  - Hook: `src/pages/ActivityLog/useActivityLog.ts`
  - Fixture: `src/pages/ActivityLog/activityLogData.json`
  - Query: `countryScope`, `type?`, `status?`, `period?`, `page?`, `size?`
  - Response shape: `{ metrics: MetricRaw[], rows: ActivityLogRow[] }`

## 6. 가맹점 페이지 API 계약

- [ ] `GET /api/merchant/dashboard`
  - Page: `/merchant/dashboard`
  - Hook: `src/pages/merchant/Dashboard/useMerchantDashboard.ts`
  - Fixture: `src/pages/merchant/Dashboard/merchantDashboardData.json`
  - Query: `countryScope`
  - Response shape: `{ kpis: KpiRaw[] }`
- [ ] `GET /api/merchant/transactions`
  - Page: `/merchant/transactions`, `/merchant/transactions/refund`
  - Hook: `src/pages/MerchantSales/useMerchantSales.ts`
  - Fixture: `src/pages/MerchantSales/merchantSalesData.json`
  - Query: `countryScope`, `variant=all|refund`, `period?`, `method?`, `status?`
  - Response shape: `{ stats: StatRaw[], t1Rows: MerchantSalesT1Row[], t2Rows: MerchantSalesT2Row[] }`
- [ ] `GET /api/merchant/settlements`
  - Page: `/merchant/settlement/history`
  - Hook: `src/pages/SettlementHistory/useSettlementHistory.ts`
  - Fixture: `src/pages/SettlementHistory/settlementHistoryData.json`
  - Query: `countryScope`, `status?`, `period?`, `page?`, `size?`
  - Response shape: `{ lastSettleDate: string, thisRequestAmount: string, rows: SettlementHistoryRow[] }`
- [ ] `GET /api/merchant/hq-notices`
  - Page: `/merchant/hq-notices`
  - Hook: `src/pages/HqNotices/useHqNotices.ts`
  - Fixture: `src/pages/HqNotices/hqNoticesData.json`
  - Query: `countryScope`, `type?`, `keyword?`, `page?`, `size?`
  - Response shape: `{ rows: HqNoticeRow[] }`
- [ ] `GET /api/merchant/profile`
  - Page: `/merchant/settings/profile`
  - Hook: `src/pages/merchant/Profile/useMerchantProfile.ts`
  - Fixture: `src/pages/merchant/Profile/merchantProfileData.json`
  - Query: `countryScope`
  - Response shape: `{ statusItems: StatusRaw[], code: string, accountFields: FieldRaw[], basicFields: FieldRaw[] }`
- [ ] `GET /api/merchant/activity-logs`
  - Page: `/merchant/settings/activity-log`
  - Hook: `src/pages/ActivityLog/useActivityLog.ts`
  - Fixture: `src/pages/ActivityLog/activityLogData.json`
  - Query: `countryScope`, `type?`, `status?`, `period?`, `page?`, `size?`
  - Response shape: `{ metrics: MetricRaw[], rows: ActivityLogRow[] }`

## 7. Frontend Step-by-Step 진행 계획

### Step 1. 계약 문서 고정

- [x] 프론트에서 호출 중인 API path 전체 수집
- [x] 역할별 hook, fixture, page 연결 정리
- [x] query와 response shape 초안 작성

### Step 2. 타입 명시화

- [ ] 각 JSON fixture shape을 `types.ts` 또는 page hook 내부 exported type으로 명시한다.
- [ ] `useLeaderPageData`, `usePartnerPageData`, `useMerchantPageData`, `useRolePageData`의 response generic을 페이지별 타입으로 좁힌다.
- [ ] `Record<string, string>` 남용 구간을 response DTO 타입으로 교체한다.

### Step 3. 로딩/오류 UI 연결

- [ ] 각 페이지 컴포넌트에서 `isLoading` 표시 정책을 통일한다.
- [ ] 각 페이지 컴포넌트에서 `error` 표시 정책을 통일한다.
- [ ] API 실패 시 fixture fallback이 사용자에게 혼동되지 않도록 개발 배너 또는 상태 표시를 추가한다.

### Step 4. 백엔드 OpenAPI 동기화

- [ ] `korion_chong/docs/openapi.yaml`에 이 문서의 path/query/response를 반영한다.
- [ ] OpenAPI response schema 이름과 프론트 타입명을 1:1로 맞춘다.
- [ ] enum/status 값은 백엔드 enum과 프론트 표시 텍스트를 분리한다.

### Step 5. 계약 테스트/검증

- [ ] 프론트 빌드: `npm run build`
- [ ] API mock 또는 dev 서버로 각 role별 smoke test를 수행한다.
- [ ] 백엔드 ContractTest와 프론트 계약 문서 path 목록을 대조한다.

## 8. 완료 기준

- 프론트에 존재하는 모든 API 호출 path가 이 문서에 등재된다.
- 각 path는 page, hook, fixture, query, response shape을 가진다.
- 각 path는 백엔드 OpenAPI path와 일치한다.
- role별 화면에서 다른 role의 API를 호출하지 않는다.
- `npm run build`가 통과한다.
