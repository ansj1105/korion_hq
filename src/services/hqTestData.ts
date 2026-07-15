type JsonObject = Record<string, unknown>

const TEST = '[TEST]'
const TEST_NOTE = 'TEST DATA - API 데이터가 없을 때만 표시됩니다.'

const stat = (id: string, labelKey: string, value: string, note = TEST_NOTE) => ({
  id,
  labelKey,
  value,
  note,
  delta: note,
  deltaBadge: true,
})

const kpi = stat

const adminColumns = [
  { key: 'no', labelKey: 'common.no', width: '72px', align: 'center' },
  { key: 'name', labelKey: 'common.name', width: '1fr' },
  { key: 'role', labelKey: 'common.role', width: '1fr' },
  { key: 'country', labelKey: 'common.country', width: '0.8fr' },
  { key: 'status', labelKey: 'common.status', width: '0.9fr' },
  { key: 'updatedAt', labelKey: 'common.updatedAt', width: '1fr' },
  { key: 'action', labelKey: 'common.action', width: '1fr' },
]

const logColumns = [
  { key: 'no', labelKey: 'common.no', width: '72px', align: 'center' },
  { key: 'admin', labelKey: 'hqLogs.col.admin', width: '1fr' },
  { key: 'menu', labelKey: 'hqLogs.col.menu', width: '1fr' },
  { key: 'action', labelKey: 'hqLogs.col.action', width: '1fr' },
  { key: 'targetId', labelKey: 'hqLogs.col.targetId', width: '1fr' },
  { key: 'time', labelKey: 'hqLogs.col.time', width: '1fr' },
  { key: 'result', labelKey: 'hqLogs.col.result', width: '0.8fr' },
  { key: 'riskLevel', labelKey: 'hqLogs.col.riskLevel', width: '0.9fr' },
]

const requestStats = [
  stat('new', 'hqRequestLeader.stat.new', '3'),
  stat('review', 'hqRequestLeader.stat.review', '1'),
  stat('waiting', 'hqRequestLeader.stat.waiting', '2'),
]

const requestRows = (kind: 'leader' | 'partnerLeader' | 'partnerDirect' | 'merchantDirect') => {
  const isMerchant = kind === 'merchantDirect'
  const prefix = isMerchant ? 'KR-MER' : 'KR-SP'
  return [
    {
      applicationId: kind === 'leader' ? 9101 : kind === 'partnerLeader' ? 9201 : kind === 'partnerDirect' ? 9301 : 9401,
      no: '3',
      appliedAt: '2026.07.15',
      applicationType: isMerchant ? 'MERCHANT' : 'SALES_PARTNER',
      applicantType: isMerchant ? 'MERCHANT' : 'PARTNER',
      requestedRole: isMerchant ? 'MERCHANT' : kind === 'partnerLeader' ? 'COUNTRY_LEADER' : 'SALES_PARTNER',
      contractPath: kind === 'partnerDirect' || kind === 'merchantDirect' ? 'HQ_DIRECT' : 'LEADER_DIRECT',
      loginId: `${isMerchant ? 'merchant' : 'partner'}test03`,
      email: `${isMerchant ? 'merchant' : 'partner'}test03@example.com`,
      contactName: 'KORION Test Contact 03',
      phone: '+82 10-0000-0003',
      telegram: '@korion-test-03',
      whatsapp: '+82 10-0000-0003',
      parentCode: kind === 'partnerDirect' || kind === 'merchantDirect' ? 'HQ-DIRECT' : 'KR-LEAD-TEST',
      applicantCode: `${prefix}-TEST-003`,
      country: 'KR',
      region: 'Seoul',
      city: 'Seoul',
      address: 'TEST 03 Address',
      partnerName: `${TEST} ${isMerchant ? 'Direct Merchant Request' : 'Partner Approval Request'}`,
      businessType: isMerchant ? 'Retail' : 'Sales Partner',
      walletNetwork: 'TRON',
      walletAddress: 'TTESTREQUEST000000000000000000000003',
      walletAuthStatus: 'VERIFIED',
      integrationPlan: `${TEST_NOTE} 신청자의 영업 계획과 운영 가능성을 검토합니다.`,
      evidenceNote: `${TEST_NOTE} 첨부 증빙과 연락 가능 정보를 확인합니다.`,
      source: 'TEST_DATA',
      requestId: `REQ-TEST-${kind}-003`,
      attachmentFileName: 'test-application-03.pdf',
      attachmentFileSize: 204800,
      attachmentContentType: 'application/pdf',
      twitterProfile: '@korion_test_03',
      preferredLanguage: 'Korean',
      subMerchantCount: isMerchant ? '-' : '4',
      monthVolume: '12,500 KORI',
      monthTxCount: '18',
      status: 'waiting',
    },
    {
      applicationId: kind === 'leader' ? 9102 : kind === 'partnerLeader' ? 9202 : kind === 'partnerDirect' ? 9302 : 9402,
      no: '2',
      appliedAt: '2026.07.14',
      applicationType: isMerchant ? 'MERCHANT' : 'SALES_PARTNER',
      applicantType: isMerchant ? 'MERCHANT' : 'PARTNER',
      requestedRole: isMerchant ? 'MERCHANT' : kind === 'partnerLeader' ? 'COUNTRY_LEADER' : 'SALES_PARTNER',
      contractPath: kind === 'partnerDirect' || kind === 'merchantDirect' ? 'HQ_DIRECT' : 'LEADER_DIRECT',
      loginId: `${isMerchant ? 'merchant' : 'partner'}test02`,
      email: `${isMerchant ? 'merchant' : 'partner'}test02@example.com`,
      contactName: 'KORION Test Contact 02',
      phone: '+234 000 0002',
      telegram: '@korion-test-02',
      whatsapp: '+234 000 0002',
      parentCode: kind === 'partnerDirect' || kind === 'merchantDirect' ? 'HQ-DIRECT' : 'KR-LEAD-TEST',
      applicantCode: `${prefix}-TEST-002`,
      country: 'NG',
      region: 'Lagos',
      city: 'Lagos',
      address: 'TEST 02 Address',
      partnerName: `${TEST} Review Target`,
      businessType: isMerchant ? 'Cafe' : 'Sales Partner',
      walletNetwork: 'TRON',
      walletAddress: 'TTESTREQUEST000000000000000000000002',
      walletAuthStatus: 'VERIFIED',
      integrationPlan: `${TEST_NOTE} 신청 경로와 활동 계획을 검토합니다.`,
      evidenceNote: `${TEST_NOTE} 자료요청 또는 보류 테스트용 행입니다.`,
      source: 'TEST_DATA',
      requestId: `REQ-TEST-${kind}-002`,
      attachmentFileName: 'test-application-02.pdf',
      attachmentFileSize: 102400,
      attachmentContentType: 'application/pdf',
      twitterProfile: '@korion_test_02',
      preferredLanguage: 'English',
      subMerchantCount: isMerchant ? '-' : '2',
      monthVolume: '8,300 KORI',
      monthTxCount: '11',
      status: 'review',
    },
  ]
}

const rankingPanels = [
  {
    id: 'country',
    titleKey: 'hqDashboard.ranking.country',
    rows: [
      { rank: 1, name: `${TEST} KR`, meta: 'KR', amount: '22,500 KORI' },
      { rank: 2, name: `${TEST} NG`, meta: 'NG', amount: '18,300 KORI' },
    ],
  },
  {
    id: 'leader',
    titleKey: 'hqDashboard.ranking.leader',
    rows: [{ rank: 1, name: `${TEST} KORION Test Leader`, meta: 'KR-LEAD-TEST', amount: '22,500 KORI' }],
  },
  {
    id: 'partner',
    titleKey: 'hqDashboard.ranking.partner',
    rows: [{ rank: 1, name: `${TEST} Partner Alpha`, meta: 'KR-SP-TEST', amount: '12,500 KORI' }],
  },
  {
    id: 'merchant',
    titleKey: 'hqDashboard.ranking.merchant',
    rows: [{ rank: 1, name: `${TEST} Demo Store`, meta: 'KR-MER-TEST', amount: '7,400 KORI' }],
  },
]

const dashboardData = {
  filters: {
    countryOptions: [
      { value: 'all', label: 'All Countries' },
      { value: 'KR', label: 'KR' },
      { value: 'NG', label: 'NG' },
    ],
    rangeOptions: ['ALL', '1D', '7D', '14D', '30D', '90D', '180D', '365D'],
  },
  kpis: [
    stat('activeCountries', 'hqDashboard.kpi.activeCountries', '2 TEST'),
    stat('leaders', 'hqDashboard.kpi.leaders', '3'),
    stat('partners', 'hqDashboard.kpi.partners', '6'),
    stat('merchants', 'hqDashboard.kpi.merchants', '12'),
    stat('payments', 'hqDashboard.kpi.paymentCount', '42'),
    stat('fees', 'hqDashboard.kpi.totalFee', '128.5 KORI'),
  ],
  rankingPanels,
  realtimePayments: { rows: [] },
  offlinePay: {
    miniStats: [
      { id: 'created', labelKey: 'hqDashboard.offlinePay.created', value: '12건', accent: 'cyan', note: TEST_NOTE },
      { id: 'pending', labelKey: 'hqDashboard.offlinePay.pending', value: '3건', accent: 'orange', note: TEST_NOTE },
      { id: 'failed', labelKey: 'hqDashboard.offlinePay.failed', value: '1건', accent: 'red', note: TEST_NOTE },
      { id: 'avgSync', labelKey: 'hqDashboard.offlinePay.avgSync', value: '32초', accent: 'purple', note: TEST_NOTE },
    ],
    flowSteps: [
      'hqDashboard.offlinePay.flow.offlineProof',
      'hqDashboard.offlinePay.flow.localBlock',
      'hqDashboard.offlinePay.flow.serverVerification',
      'hqDashboard.offlinePay.flow.settlement',
    ],
  },
  settlement: {
    stats: [
      { id: 'pending', labelKey: 'hqDashboard.settlement.pending', value: '635.8625 KORI', accent: 'cyan' },
      { id: 'done', labelKey: 'hqDashboard.settlement.done', value: '120 KORI', accent: 'green' },
      { id: 'hold', labelKey: 'hqDashboard.settlement.hold', value: '75.9 KORI', accent: 'orange' },
      { id: 'collateral', labelKey: 'hqDashboard.settlement.collateral', value: '751.6 KORI', accent: 'purple' },
    ],
    rows: [
      {
        type: 'Leader',
        name: `${TEST} Leader Settlement`,
        country: 'KR',
        requested: '320 KORI',
        held: '12 KORI',
        settleable: '308 KORI',
        status: '정산대기',
        statusAccent: 'cyan',
        action: '상세',
      },
      {
        type: 'Partner',
        name: `${TEST} Partner Settlement`,
        country: 'NG',
        requested: '180 KORI',
        held: '75.9 KORI',
        settleable: '104.1 KORI',
        status: '일부보류',
        statusAccent: 'orange',
        action: '상세',
      },
    ],
  },
  risk: {
    stats: [
      { id: 'withdraw', labelKey: 'hqDashboard.risk.withdraw', value: '2건', accent: 'red' },
      { id: 'bug', labelKey: 'hqDashboard.risk.bug', value: '1건', accent: 'orange' },
      { id: 'duplicate', labelKey: 'hqDashboard.risk.duplicate', value: '1건', accent: 'purple' },
      { id: 'holdTarget', labelKey: 'hqDashboard.risk.holdTarget', value: '2건', accent: 'cyan' },
    ],
    rows: [
      {
        type: 'DUPLICATE_WALLET',
        targetId: 'RISK-TEST-001',
        wallet: 'TTEST...001',
        country: 'KR',
        related: `${TEST} Demo Store`,
        risk: 'High',
        riskAccent: 'orange',
        held: '9.275 KORI',
        status: '검토',
        statusAccent: 'cyan',
      },
    ],
  },
  countryOps: {
    rows: [
      { id: 'KR', rank: '1', country: 'KR', leaders: '2', partners: '4', merchants: '8', members: '120', amount: '22,500 KORI', syncFail: '1건', growth: '+12%', value: 22500 },
      { id: 'NG', rank: '2', country: 'NG', leaders: '1', partners: '2', merchants: '4', members: '80', amount: '18,300 KORI', syncFail: '2건', growth: '+8%', value: 18300 },
    ],
    heatmap: [
      { code: 'KR', rank: '1', amount: '22,500 KORI', syncFail: '1건', growth: '+12%', intensity: 1 },
      { code: 'NG', rank: '2', amount: '18,300 KORI', syncFail: '2건', growth: '+8%', intensity: 0.8 },
    ],
  },
  approvalQueue: {
    stats: [
      { id: 'today', labelKey: 'hqDashboard.approval.today', value: '4건', accent: 'cyan' },
      { id: 'waiting', labelKey: 'hqDashboard.approval.waiting', value: '2건', accent: 'orange' },
      { id: 'info', labelKey: 'hqDashboard.approval.info', value: '1건', accent: 'purple' },
      { id: 'done', labelKey: 'hqDashboard.approval.done', value: '1건', accent: 'green' },
    ],
    rows: [
      { type: '리더', name: `${TEST} Leader Applicant`, country: 'KR', contact: '@testleader', wallet: 'TTEST...LDR', time: '10:42', risk: 'Low', riskAccent: 'cyan', status: '승인대기', statusAccent: 'orange' },
      { type: '파트너', name: `${TEST} Partner Applicant`, country: 'NG', contact: '@testpartner', wallet: 'TTEST...SP', time: '10:21', risk: 'Medium', riskAccent: 'orange', status: '자료요청', statusAccent: 'purple' },
    ],
  },
  networkGrowth: {
    stats: [
      { id: 'leaders', labelKey: 'hqDashboard.network.leaders', value: '3명', accent: 'cyan' },
      { id: 'partners', labelKey: 'hqDashboard.network.partners', value: '6명', accent: 'purple' },
      { id: 'merchants', labelKey: 'hqDashboard.network.merchants', value: '12개', accent: 'green' },
      { id: 'black', labelKey: 'hqDashboard.network.black', value: '1명', accent: 'red' },
    ],
    trendBars: [32, 45, 51, 63, 78, 82, 96],
    topPartners: [{ rank: 1, name: `${TEST} Partner Alpha`, meta: 'KR-SP-TEST', amount: '12,500 KORI' }],
    topLeaders: [{ rank: 1, name: `${TEST} Leader Alpha`, meta: 'KR-LEAD-TEST', amount: '22,500 KORI' }],
    topMerchants: [{ rank: 1, name: `${TEST} Demo Store`, meta: 'KR-MER-TEST', amount: '7,400 KORI' }],
  },
  paymentMethod: {
    rows: [
      { method: 'QR', count: '20건', successRate: '95%', failRate: '5%', avgApprove: '1.5초', sync: '정상', syncAccent: 'green', failReason: `${TEST} 사용자 취소` },
      { method: 'BLE', count: '12건', successRate: '91%', failRate: '9%', avgApprove: '3.2초', sync: '일부 대기', syncAccent: 'orange', failReason: `${TEST} 연결 끊김` },
    ],
    donut: [
      { label: 'QR', value: 48, accent: 'cyan' },
      { label: 'BLE', value: 29, accent: 'purple' },
      { label: 'NFC', value: 12, accent: 'green' },
      { label: 'OFF', value: 11, accent: 'orange' },
    ],
  },
  activityLogs: {
    rows: [
      { admin: `${TEST} HQ Admin`, menu: '정산', action: '보류 처리', targetId: 'SETTLE-TEST-001', time: '10:37', ip: '127.0.0.1', result: '성공', resultAccent: 'green', riskLevel: 'High', riskAccent: 'orange' },
    ],
  },
  aiInsight: {
    items: [
      { level: 'High', accent: 'orange', message: `${TEST} Sync 실패율이 테스트 기준치보다 높습니다.`, action: '리스크 확인' },
      { level: 'Low', accent: 'cyan', message: `${TEST} 테스트 데이터 기반 인사이트입니다.`, action: '로그 보기' },
    ],
  },
  quickActions: [
    'hqDashboard.quickActions.reviewApplications',
    'hqDashboard.quickActions.approveSettlement',
    'hqDashboard.quickActions.retrySyncFailures',
    'hqDashboard.quickActions.addBlacklist',
  ],
}

const applicationData = {
  stats: [
    stat('new', 'hqApplications.stat.new', '3'),
    stat('risk', 'hqApplications.stat.risk', '1'),
    stat('total', 'hqApplications.stat.total', '6'),
    stat('status', 'hqApplications.stat.status', '1 / 1 / 1'),
  ],
  rows: [
    { no: '6', appliedAt: '2026.07.15', type: `${TEST} 파트너 제휴`, country: '대한민국', region: 'Seoul', city: 'Seoul', contact: 'Test Manager', company: `${TEST} KORION Demo Labs`, email: 'test-admin@example.com', phone: '+82-10-0000-0000', website: 'https://example.com', interest: `${TEST} 기술제휴`, proposal: '테스트 신청서입니다.', status: 'waiting' },
    { no: '5', appliedAt: '2026.07.14', type: `${TEST} 투자제안`, country: '나이지리아', region: 'Lagos', city: 'Lagos', contact: 'Test Partner', company: `${TEST} Lagos Demo Capital`, email: 'test-ng@example.com', phone: '+234-000', interest: `${TEST} 투자`, proposal: '테스트 위험 신청서입니다.', status: 'risk' },
  ],
}

const leaderRows = [
  { no: '3', appliedAt: '2026.07.15', leaderCode: 'KR-LEAD-TEST', country: 'KR', partnerName: `${TEST} KORION Test Leader`, subPartnerCount: '2', subMerchantCount: '6', monthVolume: '22,500 KORI', monthTxCount: '42', unsettledFee: '128.5 KORI', status: 'approved' },
  { no: '2', appliedAt: '2026.07.14', leaderCode: 'NG-LEAD-TEST', country: 'NG', partnerName: `${TEST} Nigeria Test Leader`, subPartnerCount: '1', subMerchantCount: '4', monthVolume: '18,300 KORI', monthTxCount: '28', unsettledFee: '75.9 KORI', status: 'suspended' },
]

const partnerRows = [
  { no: '4', appliedAt: '2026.07.15', leaderCode: 'KR-LEAD-TEST', partnerCode: 'KR-SP-TEST', country: 'KR', partnerName: `${TEST} Partner Alpha`, subMerchantCount: '4', monthVolume: '12,500 KORI', monthTxCount: '18', unsettledFee: '42 KORI', status: 'approved' },
  { no: '3', appliedAt: '2026.07.14', leaderCode: 'NG-LEAD-TEST', partnerCode: 'NG-SP-TEST', country: 'NG', partnerName: `${TEST} Partner Beta`, subMerchantCount: '2', monthVolume: '8,300 KORI', monthTxCount: '11', unsettledFee: '33.9 KORI', status: 'suspended' },
]

const merchantRows = [
  { no: '5', appliedAt: '2026.07.15', leaderCode: 'KR-LEAD-TEST', partnerCode: 'KR-SP-TEST', merchantCode: 'KR-MER-TEST', country: 'KR', region: 'Seoul', merchantName: `${TEST} Demo Store`, businessType: 'Cafe', monthVolume: '7,400 KORI', monthTxCount: '12', fee: '18.5 KORI', status: 'approved', actions: ['상세'] },
  { no: '4', appliedAt: '2026.07.14', leaderCode: 'NG-LEAD-TEST', partnerCode: 'NG-SP-TEST', merchantCode: 'NG-MER-TEST', country: 'NG', region: 'Lagos', merchantName: `${TEST} Lagos Demo Shop`, businessType: 'Retail', monthVolume: '5,100 KORI', monthTxCount: '9', fee: '12.75 KORI', status: 'black', actions: ['상세'] },
]

const paymentRows = [
  { no: '3', id: 'PAY-TEST-003', txId: 'TX-TEST-003', sessionId: 'SESSION-TEST-003', datetime: '2026.07.15 10:10', leaderCode: 'KR-LEAD-TEST', partnerCode: 'KR-SP-TEST', country: 'KR', merchantName: `${TEST} Demo Store`, method: 'QR', connection: 'ONLINE', amount: '2,500 KORI', fee: '6.25 KORI', netAmount: '2,493.75 KORI', payer: 'wallet-test-003', status: 'SETTLED', statusLabel: 'SETTLED', syncStatus: '완료', statusAccent: 'green', actions: ['상세'] },
  { no: '2', id: 'PAY-TEST-002', txId: 'TX-TEST-002', sessionId: 'SESSION-TEST-002', datetime: '2026.07.15 09:35', leaderCode: 'NG-LEAD-TEST', partnerCode: 'NG-SP-TEST', country: 'NG', merchantName: `${TEST} Lagos Demo Shop`, method: 'BLE', connection: 'OFFLINE', amount: '1,800 KORI', fee: '4.5 KORI', netAmount: '1,795.5 KORI', payer: 'wallet-test-002', status: 'FAILED', statusLabel: 'FAILED', syncStatus: '실패', statusAccent: 'red', actions: ['상세'] },
]

const paymentSyncData = {
  kpis: [kpi('pending', 'hqPaymentSyncIssues.kpi.pending', '3'), kpi('failed', 'hqPaymentSyncIssues.kpi.failed', '1')],
  rows: [
    { id: 'SYNC-TEST-001', no: '2', txId: 'TX-TEST-002', sessionId: 'SESSION-TEST-002', proofId: 'PROOF-TEST-002', occurredAt: '2026.07.15 09:35', updatedAt: '2026.07.15 09:40', leaderCode: 'NG-LEAD-TEST', partnerCode: 'NG-SP-TEST', merchantCode: 'NG-MER-TEST', merchantName: `${TEST} Lagos Demo Shop`, country: 'NG', amount: '1,800 KORI', connection: 'OFFLINE', senderDeviceId: 'SENDER-TEST', receiverDeviceId: 'RECEIVER-TEST', senderUploadStatus: 'SUCCESS', receiverUploadStatus: 'WAITING', serverVerifyStatus: 'PENDING', settlementStatus: 'HOLD', sourceStatus: 'SYNC_FAILED', overallStatus: 'Sync 실패', overallAccent: 'red', senderAccent: 'green', receiverAccent: 'orange', longWaiting: true, retryable: true, reason: `${TEST} receiver evidence waiting`, actions: ['재시도', '상세'] },
  ],
}

const errorCodeRows = [
  { id: 'ERR-TEST-001', no: '2', registeredAt: '2026.07.15', updatedAt: '2026.07.15', code: 'TEST_SYNC_FAILED', name: `${TEST} 서버 Sync 실패`, category: '오프라인 Sync', severity: '주의', userMessage: '네트워크 복구 후 다시 동기화됩니다.', adminDescription: TEST_NOTE, autoAction: '재시도', ownerTeam: 'HQ Ops', httpStatus: '409', retryable: true, settlementBlocked: true, riskHold: false, publicVisible: true, status: '활성', memo: TEST_NOTE, severityAccent: 'orange', statusAccent: 'green', actions: ['상세'] },
]

const settlementRequestRows = [
  { settlementRequestId: 8801, no: '2', id: 'SETTLE-TEST-002', date: '2026.07.15', applicant: `${TEST} KORION Test Leader`, partnerName: `${TEST} Leader Settlement`, recipientType: 'Leader', country: 'KR', period: '2026.07.01 - 2026.07.15', totalAmount: '320 KORI', partnerProfit: '120 KORI', directProfit: '60 KORI', partnerSettle: '100 KORI', held: '12 KORI', finalAmount: '308 KORI', status: 'review', statusAccent: 'cyan', sourceStatus: 'TEST_DATA', actions: ['APPROVE', 'REVIEW', 'HOLD', 'REQUEST_INFO', 'REJECT'] },
  { settlementRequestId: 8802, no: '1', id: 'SETTLE-TEST-001', date: '2026.07.14', applicant: `${TEST} Partner Alpha`, partnerName: `${TEST} Partner Settlement`, recipientType: 'Partner', country: 'NG', period: '2026.07.01 - 2026.07.15', totalAmount: '180 KORI', partnerProfit: '80 KORI', directProfit: '0 KORI', partnerSettle: '104.1 KORI', held: '75.9 KORI', finalAmount: '104.1 KORI', status: 'hold', statusAccent: 'orange', sourceStatus: 'TEST_DATA', actions: ['REVIEW', 'REQUEST_INFO'] },
]

const requestResultRows = [
  { no: '4', applicationNo: 'REQ-TEST-004', appliedAt: '2026.07.15', paidAt: '2026.07.15', requestType: `${TEST} 리더 승인 요청`, parentCode: 'KR-LEAD-TEST', applicantCode: 'KR-SP-TEST', country: 'KR', partnerName: `${TEST} Partner Alpha`, adminAction: 'approved' },
  { no: '3', applicationNo: 'REQ-TEST-003', appliedAt: '2026.07.14', paidAt: '2026.07.14', requestType: `${TEST} 파트너 다이렉트`, parentCode: 'HQ-DIRECT', applicantCode: 'NG-SP-TEST', country: 'NG', partnerName: `${TEST} Partner Beta`, adminAction: 'review' },
]

const noticeHistoryData = {
  kpis: [kpi('total', 'hqNoticeHistory.kpi.total', '3건'), kpi('today', 'hqNoticeHistory.kpi.today', '1건')],
  filters: { countryOptions: [{ value: 'all', label: 'all' }, { value: 'KR', label: 'KR' }], rangeOptions: ['ALL', 'TODAY', '7D', '30D', '90D'] },
  history: {
    rows: [
      { id: 'NOTICE-TEST-003', no: '3', sentAt: '2026.07.15 10:00', title: `${TEST} HQ Test Notice`, country: 'KR', target: `${TEST} 전체`, recipients: '6명', method: '즉시', status: '발송완료', rawStatus: 'sent', sender: 'HQ Admin', success: '6', fail: '0', rate: '100%', body: '테스트 공지입니다.' },
      { id: 'NOTICE-TEST-002', no: '2', sentAt: '2026.07.14 15:30', title: `${TEST} Scheduled Notice`, country: 'NG', target: `${TEST} 파트너`, recipients: '2명', method: '예약', status: '예약대기', rawStatus: 'scheduled', sender: 'HQ Admin', success: '0', fail: '0', rate: '0%', body: '예약 테스트 공지입니다.' },
    ],
  },
  detail: { recipients: [] },
}

const riskStats = [
  stat('total', 'hqRisk.common.stat.total', '2'),
  stat('high', 'hqRisk.common.stat.high', '1'),
  stat('review', 'hqRisk.common.stat.review', '1'),
]

const fakeApplicationRows = [
  {
    id: 'FAKE-APP-TEST-001',
    applicationId: 7701,
    no: '2',
    applicationNo: 'APP-TEST-002',
    appliedAt: '2026.07.15',
    updatedAt: '2026.07.15',
    applicantType: 'Partner',
    requestedRole: 'Sales Partner',
    contractPath: 'HQ Direct',
    loginId: 'test-risk-partner',
    companyName: `${TEST} Duplicate Wallet Partner`,
    contactName: 'Test Manager',
    country: 'KR',
    region: 'Seoul',
    city: 'Seoul',
    email: 'test-risk@example.com',
    phone: '+82-10-0000-0001',
    telegram: '@test_risk_partner',
    whatsapp: '+82-10-0000-0001',
    contact: 'test-risk@example.com',
    referralCode: 'HQ-DIRECT',
    wallet: 'TTEST...RISK',
    walletRaw: 'TTESTRISK000000000001',
    walletAuthStatus: 'VERIFIED',
    status: 'review',
    statusCode: 'REVIEW',
    riskScore: 84,
    riskLevel: 'high',
    riskAccent: 'red',
    reasons: [TEST_NOTE, '동일 지갑 신청 중복'],
    reasonSummaryKey: 'hqRiskFakeApplications.reason.duplicateWallet',
    hasDuplicateIdentity: true,
    hasMissingEvidence: false,
    duplicateWalletCount: 2,
    duplicateEmailCount: 1,
    duplicatePhoneCount: 1,
    duplicateTelegramCount: 1,
    evidenceNote: TEST_NOTE,
    integrationPlan: '테스트 데이터로 표시되는 허위 신청 의심 건',
    attachmentFileName: 'test-evidence.pdf',
  },
]

const fakeMerchantRows = [
  {
    id: 'FAKE-MER-TEST-001',
    merchantId: 8801,
    no: '2',
    merchantCode: 'KR-MER-TEST',
    merchantName: `${TEST} Demo Store`,
    businessType: 'Cafe',
    country: 'KR',
    region: 'Seoul',
    city: 'Seoul',
    address: 'Seoul Test Road 1',
    parentCode: 'KR-SP-TEST',
    parentName: `${TEST} Partner Alpha`,
    loginId: 'test-risk-merchant',
    email: 'test-merchant-risk@example.com',
    phone: '+82-10-0000-0002',
    telegram: '@test_risk_merchant',
    whatsapp: '+82-10-0000-0002',
    contact: 'test-merchant-risk@example.com',
    wallet: 'TTEST...MER',
    walletRaw: 'TTESTMERCHANT000000001',
    walletAuthStatus: 'VERIFIED',
    appliedAt: '2026.07.14',
    approvedAt: '2026.07.15',
    lastActivityAt: '2026.07.15 10:10',
    status: 'pending',
    statusCode: 'PENDING',
    storeAccessStatus: 'REVIEW',
    riskScore: 78,
    riskLevel: 'medium',
    riskAccent: 'orange',
    reasons: [TEST_NOTE, '프로필 증빙 부족'],
    reasonSummaryKey: 'hqRiskFakeMerchants.reason.missingProfile',
    hasDuplicateIdentity: false,
    hasAbnormalTransactions: true,
    hasMissingProfile: true,
    txCount: 12,
    failedTxCount: 2,
    heldTxCount: 1,
    confirmedAmount: '7,400 KORI',
    failedAmount: '1,800 KORI',
    duplicateWalletCount: 0,
    duplicateEmailCount: 0,
    duplicatePhoneCount: 0,
    duplicateTelegramCount: 0,
  },
]

const statsRows = {
  country: [
    { id: 'KR', no: '2', rank: '1', country: `${TEST} 대한민국`, countryCode: 'KR', leaders: '2', partners: '4', merchants: '8', members: '120', amount: '22,500 KORI', syncFail: '1건', growth: '+12%', status: 'active' },
    { id: 'NG', no: '1', rank: '2', country: `${TEST} 나이지리아`, countryCode: 'NG', leaders: '1', partners: '2', merchants: '4', members: '80', amount: '18,300 KORI', syncFail: '2건', growth: '+8%', status: 'attention' },
  ],
  partner: [
    { id: 'KR-SP-TEST', no: '2', rank: '1', partnerCode: 'KR-SP-TEST', partnerName: `${TEST} Partner Alpha`, leaderCode: 'KR-LEAD-TEST', country: 'KR', subMerchantCount: '4', amount: '12,500 KORI', txCount: '18', partnerFee: '42 KORI', unsettledFee: '12 KORI', syncFail: '1건', growth: '+9%', status: 'active' },
  ],
  merchant: [
    { id: 'KR-MER-TEST', no: '2', rank: '1', merchantCode: 'KR-MER-TEST', merchantName: `${TEST} Demo Store`, partnerCode: 'KR-SP-TEST', leaderCode: 'KR-LEAD-TEST', country: 'KR', region: 'Seoul', amount: '7,400 KORI', txCount: '12', fee: '18.5 KORI', unsettledFee: '5 KORI', syncFail: '0건', growth: '+11%', status: 'active' },
  ],
  paymentMethod: [
    { id: 'QR', rank: 1, rawCount: 20, rawSuccessCount: 19, rawFailCount: 1, rawSyncCount: 19, count: '20건', successRate: '95%', failRate: '5%', avgApprove: '1.5초', sync: '정상', syncAccent: 'green', failReason: `${TEST} 사용자 취소` },
    { id: 'BLE', rank: 2, rawCount: 12, rawSuccessCount: 11, rawFailCount: 1, rawSyncCount: 10, count: '12건', successRate: '91%', failRate: '9%', avgApprove: '3.2초', sync: '일부 대기', syncAccent: 'orange', failReason: `${TEST} 연결 끊김` },
  ],
}

const systemCountryData = {
  kpis: [kpi('active', 'hqSystemCountry.kpi.active', '2'), kpi('paymentOn', 'hqSystemCountry.kpi.paymentOn', '2')],
  rows: [
    { id: 'KR', no: '2', registeredAt: '2026.07.15 10:00', code: 'KR', country: `${TEST} Korea`, regions: 'Seoul', timezone: 'UTC+09', currency: 'KRW', language: 'Korean', leader: `${TEST} KORION Test Leader`, leaderCount: '1', leaderNames: `${TEST} Leader`, partners: '4', merchants: '8', status: '활성', statusAccent: 'green', payment: 'ON', paymentAccent: 'green', actions: ['상세'] },
    { id: 'NG', no: '1', registeredAt: '2026.07.14 10:00', code: 'NG', country: `${TEST} Nigeria`, regions: 'Lagos', timezone: 'UTC+01', currency: 'NGN', language: 'English', leader: `${TEST} Nigeria Test Leader`, leaderCount: '1', leaderNames: `${TEST} NG Leader`, partners: '2', merchants: '4', status: '검토', statusAccent: 'orange', payment: 'OFF', paymentAccent: 'orange', actions: ['상세'] },
  ],
  formOptions: {
    countries: [
      { code: 'KR', name: 'Korea', timezone: 'UTC+09', currency: 'KRW', language: 'Korean' },
      { code: 'NG', name: 'Nigeria', timezone: 'UTC+01', currency: 'NGN', language: 'English' },
    ],
    leaders: [
      { code: 'KR-LEAD-TEST', name: `${TEST} KORION Test Leader`, countryCode: 'KR' },
      { code: 'NG-LEAD-TEST', name: `${TEST} Nigeria Test Leader`, countryCode: 'NG' },
    ],
    statuses: ['활성', '검토', '제한'],
  },
}

const maintenanceData = {
  status: { enabled: false, label: `${TEST} 정상 운영`, accent: 'green' },
  kpis: [kpi('planned', 'hqSystemMaintenance.kpi.planned', '1'), kpi('history', 'hqSystemMaintenance.kpi.history', '2')],
  rows: [
    { id: 'MAINT-TEST-001', no: '2', registeredAt: '2026.07.15', maintenanceId: 'MAINT-TEST-001', scope: 'HQ', countries: 'KR, NG', features: 'KORION PAY', startAt: '2026.07.20 02:00', endAt: '2026.07.20 03:00', status: '예약', statusAccent: 'orange', admin: `${TEST} HQ Admin`, source: 'TEST_DATA', userMessage: '테스트 점검 예정입니다.', actions: ['상세'] },
  ],
}

const securityPolicyData = {
  kpis: [kpi('active', 'hqSecurityPolicy.kpi.active', '4'), kpi('warning', 'hqSecurityPolicy.kpi.warning', '1')],
  columns: [],
  rows: [
    { id: 'POLICY-TEST-001', no: '2', policyKey: 'TEST_MFA_REQUIRED', policyName: `${TEST} 2FA 필수`, category: 'Login', scope: 'HQ Admin', currentValue: 'ON', requiredValue: 'ON', enforcement: '강제', autoAction: '차단', status: '활성', statusAccent: 'green', updatedAt: '2026.07.15', source: 'TEST_DATA', actions: ['상세'] },
  ],
}

const adminPageData = (pageType: string) => ({
  titleKey: `hqAdmin.${pageType}.title`,
  descKey: `hqAdmin.${pageType}.desc`,
  tableTitleKey: `hqAdmin.${pageType}.table`,
  stats: [stat('total', 'hqAdmin.common.total', '2'), stat('test', 'hqAdmin.common.test', 'TEST')],
  columns: adminColumns,
  rows: [
    { id: `${pageType}-test-001`, no: '2', adminId: 9901, name: `${TEST} HQ Admin`, role: 'SUPER_ADMIN', roleCode: 'SUPER_ADMIN', country: 'ALL', status: '활성', statusAccent: 'green', updatedAt: '2026.07.15', actions: ['상세'] },
    { id: `${pageType}-test-002`, no: '1', adminId: 9902, name: `${TEST} Country Operator`, role: 'COUNTRY_ADMIN', roleCode: 'COUNTRY_ADMIN', country: 'KR', status: '검토', statusAccent: 'orange', updatedAt: '2026.07.14', actions: ['상세'] },
  ],
})

const logPageData = (pageType: string) => ({
  titleKey: `hqLogs.${pageType}.title`,
  descKey: `hqLogs.${pageType}.desc`,
  tableTitleKey: `hqLogs.${pageType}.table`,
  stats: [stat('total', 'hqLogs.common.total', '3'), stat('success', 'hqLogs.common.success', '2')],
  columns: logColumns,
  rows: [
    { id: `${pageType}-log-test-001`, logId: 'LOG-TEST-001', no: '3', adminId: 'korionadmin', admin: `${TEST} HQ Admin`, eventType: 'TEST_ACTION', menu: `${TEST} ${pageType}`, menuAccent: 'cyan', action: '테스트 처리', actionAccent: 'cyan', targetId: 'TARGET-TEST-001', time: '2026.07.15 10:00', ip: '127.0.0.1', result: '성공', resultAccent: 'green', riskLevel: 'Low', riskAccent: 'cyan', actions: ['상세'] },
  ],
})

function baseStats(labelPrefix: string) {
  return [
    stat('total', `${labelPrefix}.stat.total`, '2'),
    stat('active', `${labelPrefix}.stat.active`, '1'),
    stat('attention', `${labelPrefix}.stat.attention`, '1'),
  ]
}

const registry: Record<string, unknown> = {
  '/api/hq/dashboard': dashboardData,
  '/api/hq/applications': applicationData,
  '/api/hq/requests/leader': { stats: requestStats, rows: requestRows('leader') },
  '/api/hq/requests/partner-by-leader': { stats: requestStats, rows: requestRows('partnerLeader') },
  '/api/hq/requests/partner-direct': { stats: requestStats, rows: requestRows('partnerDirect') },
  '/api/hq/requests/merchant-direct': { stats: requestStats, rows: requestRows('merchantDirect') },
  '/api/hq/requests/result-log': { stats: [stat('total', 'hqRequestResultLog.stat.total', '4'), stat('approved', 'hqRequestResultLog.stat.approved', '2'), stat('rejected', 'hqRequestResultLog.stat.rejected', '1')], rows: requestResultRows },
  '/api/hq/leaders': { stats: baseStats('hqLeaders'), rows: leaderRows },
  '/api/hq/partners': { stats: baseStats('hqPartners'), rows: partnerRows },
  '/api/hq/merchants': { stats: baseStats('hqMerchants'), rows: merchantRows },
  '/api/hq/payments/logs': { pageTitle: 'HQ Payment Logs', title: 'Payment Logs', kpis: [kpi('total', 'hqPaymentLog.kpi.total', '2'), kpi('failed', 'hqPaymentLog.kpi.failed', '1')], rows: paymentRows },
  '/api/hq/payments/sync-issues': paymentSyncData,
  '/api/hq/payments/error-codes': { kpis: [kpi('total', 'hqErrorCode.kpi.total', '1')], rows: errorCodeRows, options: { categories: ['오프라인 Sync', '정산', '보안'], severities: ['주의', '위험', '치명'], autoActions: ['재시도', '보류', '차단'], statuses: ['활성', '비활성'] } },
  '/api/hq/settlement-requests': { kpis: [kpi('pending', 'hqSettlementRequest.kpi.pending', '2'), kpi('hold', 'hqSettlementRequest.kpi.hold', '1')], rows: settlementRequestRows },
  '/api/hq/settlement-history': { kpis: [kpi('done', 'hqSettlementHistory.kpi.done', '1'), kpi('hold', 'hqSettlementHistory.kpi.hold', '1')], rows: settlementRequestRows.map((row) => ({ ...row, processedAt: '2026.07.15 11:00', code: row.id, status: row.status === 'review' ? 'done' : row.status })) },
  '/api/hq/commission-fees': { kpis: [kpi('countries', 'hqCommission.kpi.countries', '2')], rows: [{ no: '2', country: `${TEST} Korea`, code: 'KR', countryCode: 'KR', baseFee: '2.5%', baseFeeValue: '2.5', online: '1.0%', onlineFee: '1.0', offline: '1.5%', offlineFee: '1.5', event: 'OFF', eventEnabled: false, eventFee: '0', actualFee: '2.5%', coinCount: '1', status: 'active', statusAccent: 'green', scope: 'COUNTRY_ALL', coins: [{ assetCode: 'KORI', network: 'TRON', tokenStandard: 'TRC20', fee: '2.5%', name: 'KORI' }] }], countries: [{ code: 'KR', name: `${TEST} Korea` }], globalFee: '2.5' },
  '/api/hq/distribution-rates': { kpis: [kpi('countries', 'hqRate.kpi.countries', '2')], diagram: [], rows: [{ no: '2', country: `${TEST} Korea`, code: 'KR', countryCode: 'KR', hqFee: '50%', hqRate: '50', leaderFee: '25%', leaderRate: '25', partnerFee: '25%', partnerRate: '25', merchantSettle: 'ON', merchantSettlementEnabled: true, event: 'none', eventEnabled: false, coinCount: '1', status: 'active', statusAccent: 'green', memo: TEST_NOTE, adminMemo: TEST_NOTE }], countries: [{ code: 'KR', name: `${TEST} Korea` }] },
  '/api/hq/collateral-history': { kpis: [kpi('balance', 'hqCollateral.kpi.balance', '751.6 KORI'), kpi('topup', 'hqCollateral.kpi.topup', '120 KORI')], filters: { countries: [{ value: 'KR', label: 'KR' }], dates: ['2026-07-15'] }, history: { rows: [{ no: '2', processedAt: '2026.07.15 10:10', code: 'COL-TEST-002', country: 'KR', memberId: 'wallet-test-002', memberName: `${TEST} Wallet Member`, type: '충전', amount: '120 KORI', beforeAfter: '0 -> 120', status: '완료' }] }, info: { rows: [{ no: '1', adminCode: 'HQ-ADMIN-TEST', country: 'KR', memberId: 'wallet-test-001', memberName: `${TEST} Wallet Member`, totalWallet: '500 KORI', availableWallet: '380 KORI', collateralBalance: '120 KORI', lastTopup: '2026.07.15', lastPayment: '2026.07.15' }] }, settlement: { rows: [{ no: '1', settledAt: '2026.07.15', parentPartner: 'KR-SP-TEST', ownCode: 'wallet-test-001', country: 'KR', memberId: 'wallet-test-001', memberName: `${TEST} Wallet Member`, target: '회원 수취금', amount: '50 KORI', beforeAfter: '120 -> 70', status: '정산대기' }] } },
  '/api/hq/announcements/send-summary': { kpis: [kpi('total', 'hqNoticeSend.kpi.total', '3건'), kpi('today', 'hqNoticeSend.kpi.today', '1건'), kpi('scheduled', 'hqNoticeSend.kpi.scheduled', '1건'), kpi('targets', 'hqNoticeSend.kpi.targets', '20명'), kpi('successRate', 'hqNoticeSend.kpi.successRate', '100%')], filters: { countryOptions: [{ value: 'all', label: 'all' }, { value: 'KR', label: 'KR' }], rangeOptions: ['ALL', 'TODAY', '7D', '30D', '90D'] }, form: { sender: `${TEST} HQ Admin`, sendDate: '2026.07.15', sendTime: '10:00', timezone: 'KST', recipients: '20명', noticeTitle: `${TEST} 공지 제목`, noticeBody: '테스트 공지 본문입니다.' } },
  '/api/hq/announcements/history': noticeHistoryData,
  '/api/hq/announcements/drafts': { rows: [{ id: 'DRAFT-TEST-001', no: '1', title: `${TEST} 임시저장 공지`, savedAt: '2026.07.15 10:00', target: '전체', country: 'KR' }] },
  '/api/hq/risk/fake-applications': { stats: riskStats, rows: fakeApplicationRows },
  '/api/hq/risk/fake-merchants': { stats: riskStats, rows: fakeMerchantRows },
  '/api/hq/risk/duplicates': { stats: riskStats, rows: [{ id: 'DUP-TEST-001', no: '1', valueType: 'WALLET', duplicateValue: 'TTEST...001', duplicateValueRaw: 'TTEST000000000001', duplicateCount: 2, affectedRoles: 'Merchant, Partner', countries: 'KR', latestAt: '2026.07.15', riskyStatusCount: 1, riskScore: 82, riskLevel: 'high', riskAccent: 'red', reasons: [TEST_NOTE], reasonSummaryKey: 'hqRiskDuplicates.reason.duplicateWallet', membersSummary: `${TEST} 2 accounts`, status: 'high' }] },
  '/api/hq/risk/settlement-hold': { stats: riskStats, rows: [{ id: 'HOLD-TEST-001', entryId: 7701, no: '1', targetType: 'Merchant', targetCode: 'KR-MER-TEST', targetName: `${TEST} Demo Store`, merchantCode: 'KR-MER-TEST', merchantName: `${TEST} Demo Store`, country: 'KR', txNo: 'TX-TEST-002', occurredAt: '2026.07.15', amount: '1,800 KORI', fee: '4.5 KORI', heldAmount: '9.275 KORI', sourceStatus: 'CONFIRMED', settlementStatus: 'HOLD', holdReason: TEST_NOTE, riskScore: 76, riskLevel: 'medium', riskAccent: 'orange', reasons: [TEST_NOTE], reasonSummaryKey: 'hqRiskSettlementHold.reason.manualHold', status: 'review' }] },
  '/api/hq/risk/blacklist': { stats: riskStats, rows: [{ id: 'BLACK-TEST-001', requestId: 6601, targetId: 5501, no: '1', targetType: 'Merchant', targetCode: 'NG-MER-TEST', targetName: `${TEST} Lagos Demo Shop`, country: 'NG', parentCode: 'NG-SP-TEST', parentName: `${TEST} Partner Beta`, email: 'test-black@example.com', phone: '+234-000', wallet: 'TTEST...BLACK', walletRaw: 'TTESTBLACK000001', entityStatus: 'SUSPENDED', accessStatus: 'BLOCKED', requestStatus: 'REQUESTED', reason: TEST_NOTE, latestAt: '2026.07.15', riskScore: 91, riskLevel: 'high', riskAccent: 'red', reasons: [TEST_NOTE], reasonSummaryKey: 'hqRiskBlacklist.reason.manualBlock', status: 'requested' }] },
  '/api/hq/stats/country': { stats: baseStats('hqStatsCountry'), rows: statsRows.country, rankingPanels, heatmap: dashboardData.countryOps.heatmap },
  '/api/hq/stats/partner': { stats: baseStats('hqStatsPartner'), rows: statsRows.partner, rankingPanels },
  '/api/hq/stats/merchant': { stats: baseStats('hqStatsMerchant'), rows: statsRows.merchant, rankingPanels },
  '/api/hq/stats/payment-method': { stats: baseStats('hqStatsPaymentMethod'), rows: statsRows.paymentMethod, rankingPanels, donut: dashboardData.paymentMethod.donut },
  '/api/hq/system/country': systemCountryData,
  '/api/hq/system/security-policy': securityPolicyData,
  '/api/hq/system/maintenance-mode': maintenanceData,
}

function normalizePath(path: string) {
  return path.split('?')[0]
}

function dynamicFallback(path: string) {
  if (path.startsWith('/api/hq/admin/')) return adminPageData(path.split('/').pop() ?? 'accounts')
  if (path.startsWith('/api/hq/logs/')) return logPageData(path.split('/').pop() ?? 'admin')
  if (path === '/api/hq/partners/sales/overview') return salesOverviewData('partner')
  if (path.match(/^\/api\/hq\/leaders\/[^/]+\/sales\/overview$/)) return leaderSalesDetailData()
  if (path.match(/^\/api\/hq\/partners\/[^/]+\/sales\/overview$/)) return partnerSalesDetailData()
  if (path.match(/^\/api\/hq\/merchants\/[^/]+\/sales$/)) return merchantSalesDetailData()
  if (path.match(/^\/api\/hq\/leaders\/[^/]+\/sales\/partners$/)) return leaderPartnerTabData()
  if (path.match(/^\/api\/hq\/leaders\/[^/]+\/sales\/merchants$/)) return leaderMerchantTabData()
  if (path.match(/^\/api\/hq\/partners\/[^/]+\/sales\/merchants$/)) return partnerMerchantTabData()
  if (path.match(/^\/api\/hq\/leaders\/[^/]+\/sales\/transactions$/)) return salesTransactionsData('leader')
  if (path.match(/^\/api\/hq\/partners\/[^/]+\/sales\/transactions$/)) return salesTransactionsData('partner')
  if (path.match(/^\/api\/hq\/leaders\/[^/]+\/sales\/settlement$/)) return leaderSalesSettlementData()
  if (path.match(/^\/api\/hq\/partners\/[^/]+\/sales\/settlement$/)) return compactSettlementData()
  if (path.match(/^\/api\/hq\/merchants\/[^/]+\/sales\/settlement$/)) return compactSettlementData()
  if (path.match(/^\/api\/hq\/partners\/[^/]+\/sales\/memo$/)) return { memo: `${TEST} 테스트 파트너 메모` }
  if (path.match(/^\/api\/hq\/merchants\/[^/]+\/sales\/memo$/)) return { memo: `${TEST} 테스트 가맹점 메모` }
  if (path.match(/^\/api\/hq\/announcements\/[^/]+\/recipients$/)) {
    return {
      rows: [
        { no: 1, recipientType: 'Partner', recipientCode: 'KR-SP-TEST', recipientName: `${TEST} Partner Alpha`, country: 'KR', deliveryStatus: '성공', readStatus: '읽음', deliveredAt: '2026.07.15 10:01' },
        { no: 2, recipientType: 'Merchant', recipientCode: 'KR-MER-TEST', recipientName: `${TEST} Demo Store`, country: 'KR', deliveryStatus: '성공', readStatus: '미확인', deliveredAt: '2026.07.15 10:01' },
      ],
    }
  }
  if (path.match(/^\/api\/hq\/settlement-requests\/[^/]+\/detail$/)) {
    return {
      kpis: [kpi('amount', 'hqSettlementDetail.kpi.amount', '308 KORI')],
      profile: { code: 'SETTLE-TEST-001', name: `${TEST} Settlement Detail`, country: 'KR', wallet: 'TTEST...SETTLE' },
      partnerTable: { rows: settlementRequestRows },
      heldTable: { rows: [] },
    }
  }
  return null
}

const salesLogRow = {
  txNo: 'TX-TEST-001',
  partnerCode: 'KR-SP-TEST',
  txAt: '2026.07.15 10:10',
  merchantCode: 'KR-MER-TEST',
  merchantName: `${TEST} Demo Store`,
  amount: '2,500 KORI',
  method: 'QR',
  fee: '6.25 KORI',
  net: '2,493.75 KORI',
  status: 'SETTLED',
  syncStatus: '완료',
  actions: ['상세'],
}

function salesKpis(prefix: string) {
  return [
    { id: 'amount', labelKey: `${prefix}.kpi.amount`, value: '22,500 KORI' },
    { id: 'count', labelKey: `${prefix}.kpi.count`, value: '42' },
    { id: 'fee', labelKey: `${prefix}.kpi.fee`, value: '128.5 KORI' },
  ]
}

function salesOverviewData(scope: 'leader' | 'partner' | 'merchant') {
  return {
    miniStats: salesKpis(`hq${scope === 'partner' ? 'Partner' : 'Leader'}Sales`),
    kpiBottom: salesKpis(`hq${scope === 'partner' ? 'Partner' : 'Leader'}Sales`),
    logRows: [salesLogRow],
    profile: {
      code: scope === 'partner' ? 'KR-SP-TEST' : 'KR-LEAD-TEST',
      country: 'KR',
      parent: scope === 'partner' ? 'KR-LEAD-TEST' : 'HQ',
      account: {
        loginId: `${TEST} sales-test`,
        password: '******',
        email: 'sales-test@example.com',
        telegram: '@sales_test',
        phone: '+82-10-0000-0000',
        twitter: '@sales_test',
        appliedAt: '2026.07.15',
      },
    },
  }
}

function profileBlock(code: string, parentBadge: string) {
  return {
    profile: { topLabel: 'TEST DATA', parentBadge, country: 'KR', code },
    kpiTop: salesKpis('hqLeaderSales'),
    account: {
      loginId: `${TEST} ${code.toLowerCase()}`,
      password: '******',
      email: 'test-detail@example.com',
      telegram: '@test_detail',
      phone: '+82-10-0000-0000',
      twitter: '@test_detail',
      appliedAt: '2026.07.15',
      approvedAt: '2026.07.15',
    },
    basic: {
      name: `${TEST} Detail User`,
      country: 'KR',
      region: 'Seoul',
      language: 'Korean',
      directContractReason: TEST_NOTE,
      walletAddress: 'TTESTDETAIL000000001',
    },
  }
}

function leaderSalesDetailData() {
  return {
    ...profileBlock('KR-LEAD-TEST', 'HQ'),
    kpiBottom: salesKpis('hqLeaderSales'),
    logRows: [salesLogRow],
    settlement: {
      lastSettleDate: '2026.07.15',
      thisRequestAmount: '308 KORI',
      status: '정산대기',
      rows: [{ no: '1', appliedDate: '2026.07.15', period: '2026.07.01 - 2026.07.15', totalAmount: '320 KORI', leaderAmount: '120 KORI', partnerAmount: '100 KORI', held: '12 KORI', status: '정산대기', paidDate: '-' }],
    },
  }
}

function partnerSalesDetailData() {
  return {
    ...profileBlock('KR-SP-TEST', 'KR-LEAD-TEST'),
    tabKpi: salesKpis('hqPartnerSales'),
    merchantRows: partnerMerchantTabData().rows,
  }
}

function merchantSalesDetailData() {
  return {
    ...profileBlock('KR-MER-TEST', 'KR-SP-TEST'),
    store: { name: `${TEST} Demo Store`, owner: 'Test Owner', businessType: 'Cafe', address: 'Seoul Test Road 1' },
    kpiBottom: salesKpis('hqMerchantSales'),
    logRows: [salesLogRow],
  }
}

function leaderPartnerTabData() {
  return {
    kpi: salesKpis('hqLeaderSales.partners'),
    rows: [{ no: '1', code: 'KR-SP-TEST', partnerName: `${TEST} Partner Alpha`, telegramId: '@partner_alpha', region: 'Seoul', subMerchantCount: '4', monthVolume: '12,500 KORI', monthTxCount: '18', unsettledFee: '42 KORI', lastActive: '2026.07.15' }],
  }
}

function leaderMerchantTabData() {
  return {
    kpi: salesKpis('hqLeaderSales.merchants'),
    rows: [{ no: '1', partnerCode: 'KR-SP-TEST', merchantCode: 'KR-MER-TEST', merchantName: `${TEST} Demo Store`, monthVolume: '7,400 KORI', monthTxCount: '12', fee: '18.5 KORI', lastPaidAt: '2026.07.15', usage: 'QR 60% / NFC 20% / BLE 20%' }],
  }
}

function partnerMerchantTabData() {
  return {
    kpi: salesKpis('hqPartnerSales.merchants'),
    rows: [{ no: '1', partnerCode: 'KR-SP-TEST', merchantCode: 'KR-MER-TEST', city: 'Seoul', merchantName: `${TEST} Demo Store`, sector: 'Cafe', monthVolume: '7,400 KORI', monthTxCount: '12', fee: '18.5 KORI', lastPaidAt: '2026.07.15', usage: 'QR 60% / NFC 20% / BLE 20%' }],
  }
}

function salesTransactionsData(scope: 'leader' | 'partner') {
  return {
    kpi: salesKpis(scope === 'leader' ? 'hqLeaderSales' : 'hqPartnerSales'),
    rows: [salesLogRow],
  }
}

function compactSettlementData() {
  return {
    summary: [
      { label: 'TEST DATA', value: '308 KORI', color: '#24e6b8' },
      { label: '보류', value: '12 KORI', color: '#f6c85a' },
    ],
    heldRows: [{ txNo: 'TX-TEST-002', merchant: `${TEST} Demo Store`, partner: 'KR-SP-TEST', reason: TEST_NOTE, amount: '1,800 KORI', heldFee: '4.5 KORI', status: '보류' }],
    historyRows: [{ no: '1', appliedDate: '2026.07.15', period: '2026.07.01 - 2026.07.15', partnerAmount: '308 KORI', held: '12 KORI', status: '정산대기', paidDate: '-', action: '상세' }],
  }
}

function leaderSalesSettlementData() {
  return {
    ...compactSettlementData(),
    partnerRows: [{ name: `${TEST} Partner Alpha`, code: 'KR-SP-TEST', amount: '180 KORI', fee: '42 KORI', status: '정산대기', paidDate: '-', detail: '상세' }],
    merchantRows: [{ name: `${TEST} Direct Merchant`, code: 'KR-MER-DIRECT-TEST', amount: '140 KORI', fee: '28 KORI', status: '정산대기', detail: '상세' }],
  }
}

export function hqTestDataForPath<T>(path: string): T | null {
  const normalized = normalizePath(path)
  return ((registry[normalized] ?? dynamicFallback(normalized)) as T | undefined) ?? null
}

function isPlainObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function isEmptyValue(value: unknown) {
  if (Array.isArray(value)) return value.length === 0
  if (isPlainObject(value)) return Object.keys(value).length === 0
  return value === undefined || value === null || value === ''
}

function mergeMissingArrays(payload: unknown, fallback: unknown): unknown {
  if (Array.isArray(fallback)) {
    return Array.isArray(payload) && payload.length > 0 ? payload : fallback
  }
  if (isPlainObject(fallback)) {
    const payloadObject = isPlainObject(payload) ? payload : {}
    const next: JsonObject = { ...fallback, ...payloadObject }
    Object.entries(fallback).forEach(([key, fallbackValue]) => {
      const payloadValue = payloadObject[key]
      if (isEmptyValue(payloadValue)) {
        next[key] = fallbackValue
      } else if (isPlainObject(fallbackValue) || Array.isArray(fallbackValue)) {
        next[key] = mergeMissingArrays(payloadValue, fallbackValue)
      }
    })
    return next
  }
  return isEmptyValue(payload) ? fallback : payload
}

export function withHqTestData<T>(path: string, payload: T): T {
  const fallback = hqTestDataForPath<T>(path)
  if (!fallback) return payload
  return mergeMissingArrays(payload, fallback) as T
}
