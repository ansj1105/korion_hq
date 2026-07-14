import { useTranslation } from '../../../i18n'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import ActionBadges from '../../../components/molecules/ActionBadges'
import { useRequestDetail, type DetailField, type DetailKpi } from './useRequestDetail'
import styles from './RequestDetailOverlay.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

/*
 * RequestDetailOverlay — 요청 결과 로그 '상세정보' 클릭 시 뜨는 파트너 정보 오버레이 (Figma 81:17062)
 * ------------------------------------------------------------------
 * 별도 라우트 없이 open prop으로만 제어. 사이드바를 제외한 콘텐츠 영역 중앙에 노출
 * (ApplicationDetailOverlay와 동일한 backdrop 방식). backdrop 클릭 또는 '확인' 버튼으로 닫힘.
 * 탭(가맹점별/거래내역/정산내역/관리자 메모)은 Figma에 '가맹점별' 내용만 있어 표시 전용.
 */
export default function RequestDetailOverlay({ open, onClose }: Props) {
  const { t } = useTranslation()
  const detail = useRequestDetail()

  if (!open) return null

  const renderKpi = (k: DetailKpi) => (
    <div key={k.id} className={styles.kpiCard}>
      <span className={styles.kpiLabel}>{k.label}</span>
      <span className={styles.kpiValue}>{k.value}</span>
    </div>
  )

  const renderField = (f: DetailField, index: number) => (
    <div key={index} className={styles.field}>
      <span className={styles.fieldLabel}>{f.label}</span>
      <span className={f.highlight ? `${styles.fieldValue} ${styles.fieldValueTeal}` : styles.fieldValue}>
        {f.value}
        {/* 비밀번호 초기화/이메일 변경 — 표시 전용 미니 배지 */}
        {f.badge && <span className={styles.fieldBadge}>{f.badge}</span>}
      </span>
    </div>
  )

  const merchantRows: TableRow[] = detail.merchantRows.map((r) => ({
    id: r.no,
    cells: {
      no: r.no,
      partnerCode: r.partnerCode,
      merchantCode: r.merchantCode,
      city: r.city,
      merchantName: r.merchantName,
      category: r.category,
      monthSales: r.monthSales,
      monthTxCount: r.monthTxCount,
      fee: r.fee,
      lastPaidAt: r.lastPaidAt,
      usage: r.usage,
      action: <ActionBadges labels={[t('hqRequestResultLog.detail.col.detailBadge')]} />,
    },
  }))

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {/* stopPropagation: 패널 안 클릭이 backdrop 클릭으로 버블링되지 않도록 */}
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{t('hqRequestResultLog.detail.title')}</h2>

        {/* 파트너 코드 미리보기 — 좌: 상위 리더/국가 배지, 우: 파트너 코드 */}
        <div className={styles.codePanel}>
          <div className={styles.codeLeft}>
            <span className={styles.codePanelLabel}>{t('hqRequestResultLog.detail.codePanel.leaderCountry')}</span>
            <div className={styles.codeBadges}>
              <span className={styles.leaderBadge}>{detail.leaderCode}</span>
              <span className={styles.countryBadge}>{detail.countryName}</span>
            </div>
          </div>
          <div className={styles.codeRight}>
            <span className={styles.codePanelLabel}>{t('hqRequestResultLog.detail.codePanel.partnerCode')}</span>
            <span className={styles.partnerCode}>{detail.partnerCode}</span>
          </div>
        </div>

        {/* KPI 4개 — 하위 추천인/가맹점/마지막 접속/마지막 정산 */}
        <div className={styles.kpiGrid4}>{detail.kpiTop.map(renderKpi)}</div>

        {/* A. 계정 정보 */}
        <section className={styles.block}>
          <h3 className={styles.blockTitle}>{t('hqRequestResultLog.detail.secA')}</h3>
          <div className={styles.fieldGrid}>{detail.accountFields.map(renderField)}</div>
        </section>

        {/* B. 기본 / 소속 정보 */}
        <section className={styles.block}>
          <h3 className={styles.blockTitle}>{t('hqRequestResultLog.detail.secB')}</h3>
          <div className={styles.fieldGrid}>{detail.basicFields.map(renderField)}</div>
          <div className={styles.fieldGridWide}>{detail.basicWideFields.map(renderField)}</div>
        </section>

        {/* 탭 줄 — 첫 탭(가맹점별)만 활성, 우측 기간 칩(데이터 토큰이라 번역 안 함) */}
        <div className={styles.tabRow}>
          <div className={styles.tabs}>
            {detail.tabs.map((tab, index) => (
              <button key={tab} type="button" className={index === 0 ? `${styles.tab} ${styles.tabActive}` : styles.tab}>
                {tab}
              </button>
            ))}
          </div>
          <button type="button" className={styles.tab}>
            {detail.periodChip}
          </button>
        </div>

        {/* KPI 5개 — 결제/수수료/정산 지표 */}
        <div className={styles.kpiGrid5}>{detail.kpiBottom.map(renderKpi)}</div>

        {/* 가맹점별 정보 표 */}
        <DataTable
          title={t('hqRequestResultLog.detail.table.title')}
          columns={detail.merchantColumns}
          rows={merchantRows}
          toolbar={[t('common.search'), t('common.filter'), t('hqRequestResultLog.detail.toolbar.excel')]}
          inlineToolbar
          largeText
          fluid
        />

        {/* 확인 — 오버레이 닫기 */}
        <div className={styles.footer}>
          <button type="button" className={styles.btnConfirm} onClick={onClose}>
            {t('hqRequestResultLog.detail.action.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
