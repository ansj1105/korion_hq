import { type CSSProperties } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageHeader from '../../../components/organisms/PageHeader'
import Button from '../../../components/atoms/Button'
import InfoGrid from '../../../components/molecules/InfoGrid'
import ActionBadges from '../../../components/molecules/ActionBadges'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { useSettlementRequestDetail } from './useSettlementRequestDetail'
import styles from './SettlementRequestDetail.module.css'

/** 분배 게이지 세그먼트 색 (본사/리더/파트너) */
const ROLE_COLOR: Record<string, string> = { hq: '#7c5cff', leader: '#24e6b8', partner: '#f6c85a' }

/** 수수료 구조 — 카테고리(첫 항목) 칩 색: 파트너 경유(보라) / 직계약(파랑) */
function feeCatClass(label: string, styleMap: typeof styles) {
  return label.includes('직계약') ? styleMap.feeCatDirect : styleMap.feeCatPartner
}
/** 수수료 구조 — 스텝 칩 색 (본사/가맹점=회보라, 리더=청록, 파트너=골드) */
function feeStepClass(label: string, styleMap: typeof styles) {
  if (label.startsWith('리더')) return styleMap.feeLeader
  if (label.startsWith('파트너')) return styleMap.feePartner
  return styleMap.feeHq
}

/** 정산 계산 수식의 금액 카드 (earn: 청록 / held: 빨강 / final: 그라데이션) */
function AmountCard({ variant, label, value, unit }: { variant: 'earn' | 'held' | 'final'; label: string; value: string; unit: string }) {
  if (variant === 'final') {
    return (
      <div className={`${styles.amountCard} ${styles.amountFinal}`}>
        <span className={styles.amountChip}>{label}</span>
        <span className={styles.amountValueRow}>
          <span className={styles.amountValue}>{value}</span>
          <span className={styles.amountUnit}>{unit}</span>
        </span>
      </div>
    )
  }
  const isHeld = variant === 'held'
  const valCls = isHeld ? styles.valRed : styles.valTeal
  return (
    <div className={`${styles.amountCard} ${isHeld ? styles.amountMinus : styles.amountAdd}`}>
      <span className={`${styles.amountChip} ${isHeld ? styles.amountChipRed : styles.amountChipTeal}`}>{label}</span>
      <span className={styles.amountValueRow}>
        <span className={`${styles.amountValue} ${valCls}`}>{value}</span>
        <span className={`${styles.amountUnit} ${valCls}`}>{unit}</span>
      </span>
    </div>
  )
}

/*
 * HqSettlementRequestDetail (page) — 본사어드민 · 정산 신청 상세 검토
 * ------------------------------------------------------------------
 * 목록의 ‘상세’에서 진입(별도 라우트). 하나의 긴 화면에:
 *   패널 헤더 → 정산 기간 배너 → 요약 KPI 6 → 정산 가능 금액 계산(수식+게이지)
 *   → 수수료 구조 → 가맹점별 수수료 수익 → 보류/제외 거래 → 본사 정산 요청 폼.
 * 동작은 UI 상태만(버튼은 표시 전용, 취소는 목록 복귀).
 */
export default function HqSettlementRequestDetail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const settlementRequestId = searchParams.get('settlementRequestId')
  const { header, banner, kpis, calc, feeStructure, partnerTable, heldTable, formFields, memoPlaceholder, replyPlaceholder, checks } =
    useSettlementRequestDetail(settlementRequestId)
  const targetType = searchParams.get('type')
  const targetName = searchParams.get('name')
  const targetCountry = searchParams.get('country')
  const targetStatus = searchParams.get('status')
  const contextBadges = targetName
    ? [targetName, targetType, targetCountry, targetStatus].filter((value): value is string => Boolean(value))
    : header.contextBadges

  const detailCell = <ActionBadges labels={[t('hqSettle.reqDetail.view')]} accentByLabel={{}} size="xs" solid />
  const ptRows: TableRow[] = partnerTable.rows.map((r) => ({
    id: r.code,
    // '자동 예정' 값은 청록으로 강조 — 데이터는 그대로 두고 화면에서만 색 입힘
    cells: { ...r, auto: <span className={styles.autoTag}>{r.auto}</span>, detail: detailCell },
  }))
  const htRows: TableRow[] = heldTable.rows.map((r) => ({
    id: r.txNo,
    // '정산 보류' 값은 주황으로 강조
    cells: { ...r, status: <span className={styles.heldTag}>{r.status}</span>, detail: detailCell },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqSettle.reqDetail.title')} />

      {/* 패널 헤더: 정산번호 + 컨텍스트 배지(좌) + 상태 배지(우) */}
      <div className={styles.panelHead}>
        <div className={styles.panelHeadLeft}>
          <h2 className={styles.panelTitle}>
            {t('hqSettle.reqDetail.panel')} · {header.no}
          </h2>
          <div className={styles.ctxBadges}>
            {contextBadges.map((b) => (
              <span key={b} className={styles.ctxBadge}>{b}</span>
            ))}
          </div>
        </div>
        <span className={styles.statusBadge}>{header.statusOk}</span>
      </div>

      {/* 정산 기간 배너 */}
      <div className={styles.bannerBox}>
        <p className={styles.notice}>{banner.notice}</p>
        <InfoGrid
          items={[
            { label: t('hqSettle.reqDetail.banner.lastDate'), value: banner.lastDate },
            { label: t('hqSettle.reqDetail.banner.period'), value: banner.period },
            { label: t('hqSettle.reqDetail.banner.exclude'), value: banner.exclude },
            { label: t('hqSettle.reqDetail.banner.method'), value: banner.method },
          ]}
        />
      </div>

      {/* 요약 KPI 6개 — 칩 색은 카드별 다름 */}
      <div className={styles.kpiGrid}>
        {kpis.map((k) => (
          <div key={k.id} className={styles.kpiCard}>
            <span
              className={`${styles.kpiLabel} ${k.chipSolid ? styles.kpiLabelSolid : styles.kpiLabelTranslucent}`}
              style={{ '--chip': k.chip } as CSSProperties}
            >
              {k.label}
            </span>
            <span className={styles.kpiValue}>{k.value}</span>
            <span className={styles.kpiNote}>{k.note}</span>
          </div>
        ))}
      </div>

      {/* 정산 가능 금액 계산 (시안 히어로 박스) */}
      <div className={styles.calcHero}>
        <h3 className={styles.calcTitle}>{t('hqSettle.reqDetail.calc.title')}</h3>
        <p className={styles.calcDesc}>{t('hqSettle.reqDetail.calc.desc')}</p>
        <div className={styles.formula}>
          <AmountCard variant="earn" label={calc.earnLabel} value={calc.earn} unit={calc.unit} />
          <span className={styles.formulaOp}>−</span>
          <AmountCard variant="held" label={calc.heldLabel} value={calc.held} unit={calc.unit} />
          <span className={styles.formulaOp}>=</span>
          <AmountCard variant="final" label={calc.finalLabel} value={calc.final} unit={calc.unit} />
        </div>

        {/* 분배 게이지 바 (본사/리더/파트너) */}
        <div className={styles.gauges}>
          {calc.gauges.map((segs, gi) => (
            <div key={gi} className={styles.gaugeGroup}>
              <div className={styles.gaugeBar}>
                {segs.filter((s) => s.pct > 0).map((s, si) => (
                  <span key={si} className={styles.gaugeSeg} style={{ flexGrow: s.pct, backgroundColor: ROLE_COLOR[s.role] }} />
                ))}
              </div>
              <div className={styles.gaugeLabels}>
                {segs.map((s, si) => (
                  <span key={si} style={{ flexGrow: s.pct || 0.001 }}>{s.label}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 수수료 구조 (별도 박스) */}
      <div className={styles.feeBox}>
        <h3 className={styles.feeTitle}>{t('hqSettle.reqDetail.fee.title')}</h3>
        {feeStructure.map((row, i) => (
          <div key={i} className={styles.feeRow}>
            <div className={styles.feeCell}>
              <span className={`${styles.feeChip} ${feeCatClass(row[0], styles)}`}>{row[0]}</span>
            </div>
            {row.slice(1).map((stepLabel, j) => (
              <div key={j} className={styles.feeCell}>
                {j > 0 && <span className={styles.feeArrow}>→</span>}
                <span className={`${styles.feeChip} ${feeStepClass(stepLabel, styles)}`}>{stepLabel}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 가맹점별 수수료 수익 */}
      <div className={styles.sectionBox}>
        <h3 className={styles.sectionTitle}>{t('hqSettle.reqDetail.pt.title')}</h3>
        <p className={styles.sectionDesc}>{partnerTable.desc}</p>
        <DataTable columns={partnerTable.columns} rows={ptRows} toolbar={[t('common.search'), t('common.filter'), t('common.excel')]} bare />
      </div>

      {/* 보류 / 제외 거래 */}
      <div className={styles.sectionBox}>
        <h3 className={styles.sectionTitle}>{t('hqSettle.reqDetail.ht.title')}</h3>
        <p className={styles.sectionDesc}>{heldTable.desc}</p>
        <DataTable columns={heldTable.columns} rows={htRows} toolbar={[t('common.search'), t('common.filter'), t('common.excel')]} bare />
      </div>

      {/* 본사 정산 요청 폼 */}
      <div className={styles.sectionBox}>
        <h3 className={styles.sectionTitle}>{t('hqSettle.reqDetail.form.title')}</h3>
        <p className={styles.sectionDesc}>{t('hqSettle.reqDetail.form.desc')}</p>
        <div className={styles.fieldGrid}>
          {formFields.map((f) => (
            <div key={f.label} className={styles.fieldCell}>
              <span className={styles.fieldLabel}>{f.label}</span>
              {f.editable ? (
                <input className={styles.fieldInput} type="text" defaultValue={f.value} />
              ) : (
                <div className={styles.fieldBox}>
                  <span className={styles.fieldValue}>{f.value}</span>
                </div>
              )}
            </div>
          ))}
          {/* 정산 신청 메모 (전체 폭) */}
          <div className={`${styles.fieldCell} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>{t('hqSettle.reqDetail.field.memo')}</span>
            <input className={styles.fieldInput} type="text" placeholder={memoPlaceholder} />
          </div>
          {/* 본사 답장 (전체 폭, 읽기 전용 영역) + 저장 버튼 */}
          <div className={`${styles.fieldCell} ${styles.fieldFull}`}>
            <span className={styles.fieldLabel}>{t('hqSettle.reqDetail.field.reply')}</span>
            <textarea className={styles.replyBox} placeholder={replyPlaceholder} rows={3} />
            <div className={styles.saveRow}>
              <button type="button" className={styles.saveBtn}>{t('hqSettle.reqDetail.btn.save')}</button>
            </div>
          </div>
        </div>

        <div className={styles.checks}>
          {checks.map((c, i) => (
            <label key={i} className={styles.check}>
              <input type="checkbox" defaultChecked /> {c}
            </label>
          ))}
        </div>

        {/* 액션 버튼 — 승인(그라데이션) + 보조 버튼들. 취소는 목록 복귀 */}
        <div className={styles.actionRow}>
          <Button variant="primary">{t('hqSettle.reqDetail.btn.approve')}</Button>
          <button type="button" className={styles.subBtn}>{t('hqSettle.reqDetail.btn.review')}</button>
          <button type="button" className={styles.subBtn}>{t('hqSettle.reqDetail.btn.hold')}</button>
          <button type="button" className={styles.subBtnOutline}>{t('hqSettle.reqDetail.btn.requestInfo')}</button>
          <button type="button" className={styles.subBtnOutline}>{t('hqSettle.reqDetail.btn.reject')}</button>
          <button type="button" className={styles.subBtn} onClick={() => navigate('..')}>{t('hqSettle.reqDetail.btn.cancel')}</button>
        </div>
      </div>
    </div>
  )
}
