import { type CSSProperties, useState } from 'react'
import RequestListPage from '../../../components/templates/RequestListPage'
import DetailSection from '../../../components/molecules/DetailSection'
import DetailDrawer from '../../../components/organisms/DetailDrawer'
import Badge from '../../../components/atoms/Badge'
import Button from '../../../components/atoms/Button'
import type { TableRow } from '../../../components/organisms/DataTable'
import type { AccentKey } from '../../../types'
import { useTranslation } from '../../../i18n'
import { postHqPageData } from '../../../services/korionChongApi'
import { usePaymentLog, type PaymentLogRow } from './usePaymentLog'
import { usePaymentLogDetail, type SyncStep } from './usePaymentLogDetail'
import { PAYMENT_STATUS_ACTION_POLICIES, PAYMENT_STATUS_EXAMPLES } from './paymentLogStatusPolicy'
import styles from './PaymentLog.module.css'

/** 액션 컬럼에서 드로어를 여는 배지(데이터 enum). 나머지는 정산 처리 배지. */
const DETAIL_LABEL = '상세'
/** 정산 처리 배지 색: 지급완료=초록 / 보류해제=주황 / 지급보류=빨강 */
const SETTLE_ACCENT: Record<string, AccentKey> = { 지급완료: 'green', 보류해제: 'amber', 지급보류: 'red' }
const statusAccentStyle = (accent: AccentKey): CSSProperties => ({ '--status-accent': `var(--color-accent-${accent})` }) as CSSProperties

interface PaymentSettlementHoldResponse {
  statusLabel: string
  statusAccent: AccentKey
  actions: string[]
}

/*
 * PaymentLog (page) — 본사어드민 · 결제 모니터링 · 전체 결제 로그
 * ------------------------------------------------------------------
 * 구조: [헤더] + [KPI 카드 10개(박스 없는 그리드)] + [결제 로그 테이블 1개] + [상세 Drawer].
 * RequestListPage 템플릿을 재사용하고, 표의 "상세" 배지를 누르면 우측 DetailDrawer가 열린다.
 *
 * 참고: Figma 프레임 헤더 텍스트가 "가맹점 관리 - 가맹점 전체 목록"으로 박혀 있으나
 * 이는 복붙 leftover다(같은 텍스트가 hqMerchantList.title에 그대로 존재). 실제 화면은
 * 사이드바 "결제 모니터링 > 전체 결제 로그"이므로 제목을 해당 메뉴명으로 둔다.
 */
export default function PaymentLog() {
  const { t } = useTranslation()
  const { pageTitle, title, kpis, columns, rows: rawRows } = usePaymentLog()

  // 어느 행의 "상세"를 눌렀는지(=드로어 열림 여부). null이면 닫힘.
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pendingActionId, setPendingActionId] = useState<string | null>(null)
  const [rowOverrides, setRowOverrides] = useState<Record<string, Partial<Pick<PaymentLogRow, 'statusLabel' | 'statusAccent' | 'actions'>>>>({})
  const selectedRow = rawRows.find((row) => row.id === selectedId) ?? null
  const detail = usePaymentLogDetail(selectedRow)

  // Sync 스텝 상태 → 스타일 클래스 매핑(완료/진행/대기)
  const stepStateClass: Record<SyncStep['state'], string> = {
    done: styles.stepDone,
    active: styles.stepActive,
    pending: styles.stepPending,
  }

  const handleSettlementAction = async (row: PaymentLogRow, label: string) => {
    const normalizedLabel = normalizeSettlementActionLabel(label)
    if (normalizedLabel !== '지급보류' && normalizedLabel !== '보류해제') return
    const entryId = getCommissionEntryId(row)
    if (!entryId) {
      window.alert('정산 처리 대상 거래 ID를 확인할 수 없습니다.')
      return
    }
    setPendingActionId(row.id)
    try {
      const response = await postHqPageData<PaymentSettlementHoldResponse>(
        `/api/hq/payments/logs/${entryId}/settlement-hold`,
        {
          action: normalizedLabel === '지급보류' ? 'HOLD' : 'RELEASE',
          reason: normalizedLabel === '지급보류' ? 'HQ payment log manual settlement hold' : 'HQ payment log manual settlement hold release',
        },
      )
      setRowOverrides((prev) => ({
        ...prev,
        [row.id]: {
          statusLabel: response.statusLabel,
          statusAccent: response.statusAccent,
          actions: response.actions,
        },
      }))
    } catch {
      window.alert('정산 상태 변경에 실패했습니다.')
    } finally {
      setPendingActionId(null)
    }
  }

  const rows: TableRow[] = rawRows.map((rawRow) => {
    const r = { ...rawRow, ...(rowOverrides[rawRow.id] ?? {}) }
    const settlementActions = r.actions.filter((a) => a !== DETAIL_LABEL)
    return {
      id: r.id,
      cells: {
        ...r,
        no: r.no,
        status: (
          <Badge accent={r.statusAccent} size="md" shape="rect">
            {r.statusLabel ?? r.status}
          </Badge>
        ),
        // 액션: 정산 처리 배지 + 클릭 가능한 "상세" 배지(드로어 오픈)
        action: (
          <div className={styles.actionCell}>
            {settlementActions.map((label) => (
              <button
                key={label}
                type="button"
                className={styles.actionButton}
                disabled={pendingActionId === r.id || normalizeSettlementActionLabel(label) === '지급완료'}
                onClick={(event) => {
                  event.stopPropagation()
                  handleSettlementAction(r, label)
                }}
              >
                <Badge accent={SETTLE_ACCENT[normalizeSettlementActionLabel(label)]} size="md" shape="rect">
                  {label}
                </Badge>
              </button>
            ))}
            <button
              type="button"
              className={styles.detailButton}
              onClick={(event) => {
                event.stopPropagation()
                setSelectedId(r.id)
              }}
            >
              <Badge size="md" shape="rect">
                {t('common.detail')}
              </Badge>
            </button>
          </div>
        ),
      },
    }
  })

  const { sections } = detail

  return (
    <>
      <RequestListPage
        title={pageTitle}
        stats={kpis}
        statsBare
        columns={columns}
        rows={rows}
        tableTitle={title}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        toolbarInline
        tableMutedText
        onRowClick={(id) => setSelectedId(id)}
      />

      <DetailDrawer
        open={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title={detail.title}
        headerExtra={
          <div className={styles.drawerHead}>
            <span className={styles.drawerId}>{detail.header.id}</span>
            <div className={styles.statusRow}>
              {detail.header.statuses.map((s) => (
                <Badge key={s.label} accent={s.accent} size="xs">
                  {s.label}
                </Badge>
              ))}
            </div>
            <p className={styles.metaLine}>{detail.header.meta}</p>
          </div>
        }
        footer={detail.footerActions.map((a) => (
          <Button key={a.label} variant={a.variant}>
            {a.label}
          </Button>
        ))}
      >
        <DetailSection title={sections.basic.title} rows={sections.basic.rows} />
        <DetailSection title={sections.parties.title} rows={sections.parties.rows} />
        <DetailSection title={sections.localBlock.title} rows={sections.localBlock.rows} />
        <DetailSection title={sections.proof.title} rows={sections.proof.rows} />

        {/* E. Sync / 서버 검증 — 표가 아니라 단계 스텝퍼 + 상태 설명줄 */}
        <DetailSection title={sections.sync.title}>
          <div className={styles.stepper}>
            {sections.sync.steps.map((step, i) => (
              <div key={step.label} className={styles.step}>
                <span className={`${styles.stepNode} ${stepStateClass[step.state]}`}>{step.label}</span>
                {i < sections.sync.steps.length - 1 && <span className={styles.stepConnector} aria-hidden="true" />}
              </div>
            ))}
          </div>
          <p className={styles.syncStatus}>{sections.sync.statusLine}</p>
        </DetailSection>

        <DetailSection title={sections.fee.title} rows={sections.fee.rows} />
        <DetailSection title={sections.risk.title} rows={sections.risk.rows} />

        <DetailSection title={t('hqPaymentLog.detail.section.statusExamples')}>
          <div className={styles.statusExampleList}>
            {PAYMENT_STATUS_EXAMPLES.map((example) => (
              <div key={example.no} className={styles.statusExampleCard} style={statusAccentStyle(example.accent)}>
                <span className={styles.statusExampleNo}>{example.no}</span>
                <strong className={styles.statusExampleTitle}>{example.title}</strong>
                <span className={styles.statusExampleCodes}>{example.statuses.join(' / ')}</span>
              </div>
            ))}
          </div>
        </DetailSection>

        <DetailSection title={t('hqPaymentLog.detail.section.actionPolicy')}>
          <div className={styles.actionPolicyList}>
            {PAYMENT_STATUS_ACTION_POLICIES.map((policy) => (
              <div key={policy.status} className={styles.actionPolicyRow} style={statusAccentStyle(policy.accent)}>
                <span className={styles.actionPolicyStatus}>{policy.status}</span>
                <div className={styles.actionPolicyActions}>
                  {policy.actions.map((action) => (
                    <span key={action} className={styles.actionPolicyChip}>
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DetailSection>

        {/* H. 관리자 메모 — 입력칸(정적, 동작 없음) + 메모 로그 */}
        <DetailSection title={sections.memo.title}>
          {/* 작업 범위상 동작 없음(읽기 전용 표시용) */}
          <textarea className={styles.memoInput} placeholder={sections.memo.placeholder} readOnly />
          <ul className={styles.memoLogs}>
            {sections.memo.logs.map((log, i) => (
              <li key={i}>{log}</li>
            ))}
          </ul>
        </DetailSection>
      </DetailDrawer>
    </>
  )
}

function normalizeSettlementActionLabel(label: string) {
  return label.replace(/\s/g, '')
}

function getCommissionEntryId(row: PaymentLogRow) {
  if (typeof row.entryId === 'number' && row.entryId > 0) {
    return row.entryId
  }
  const match = row.id.match(/^CE-(\d+)$/)
  return match ? Number(match[1]) : null
}
