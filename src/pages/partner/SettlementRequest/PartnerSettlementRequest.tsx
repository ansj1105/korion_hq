import { useState, type CSSProperties } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import Button from '../../../components/atoms/Button'
import InfoGrid from '../../../components/molecules/InfoGrid'
import ActionBadges from '../../../components/molecules/ActionBadges'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import { useTranslation } from '../../../i18n'
import { usePartnerSettlementRequest } from './usePartnerSettlementRequest'
import styles from './PartnerSettlementRequest.module.css'

/** 분배 게이지 세그먼트 색 (본사/리더/파트너) */
const ROLE_COLOR: Record<string, string> = { hq: '#7c5cff', leader: '#24e6b8', partner: '#f6c85a' }

/** 수수료 구조 — 카테고리(첫 항목) 칩 색 */
function feeCatClass(label: string) {
  return label.includes('직계약') ? styles.feeCatDirect : styles.feeCatPartner
}
/** 수수료 구조 — 스텝 칩 색 (본사/가맹점=회보라, 리더=청록, 파트너=골드) */
function feeStepClass(label: string) {
  if (label.startsWith('리더')) return styles.feeLeader
  if (label.startsWith('파트너')) return styles.feePartner
  return styles.feeHq
}

/** 정산 계산 수식의 금액 카드 (add: 청록 / minus: 빨강 / final: 그라데이션) */
function AmountCard({ variant, label, value, unit }: { variant: 'add' | 'minus' | 'final'; label: string; value: string; unit: string }) {
  if (variant === 'final') {
    return (
      <div className={`${styles.amountCard} ${styles.amountFinal}`}>
        <span className={styles.amountTitle}>{label}</span>
        <span className={styles.amountValueRow}>
          <span className={styles.amountValue}>{value}</span>
          <span className={styles.amountUnit}>{unit}</span>
        </span>
      </div>
    )
  }
  const isMinus = variant === 'minus'
  const valCls = isMinus ? styles.valRed : styles.valTeal
  return (
    <div className={`${styles.amountCard} ${isMinus ? styles.amountMinus : styles.amountAdd}`}>
      <span className={`${styles.amountChip} ${isMinus ? styles.amountChipRed : styles.amountChipTeal}`}>{label}</span>
      <span className={styles.amountValueRow}>
        <span className={`${styles.amountValue} ${valCls}`}>{value}</span>
        <span className={`${styles.amountUnit} ${valCls}`}>{unit}</span>
      </span>
    </div>
  )
}

/** 최종 요청 폼의 필드 — 라벨(박스 위) + 값 박스(46px) */
function FieldCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.fieldCell}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.fieldBox}>
        <span className={styles.fieldValue}>{value}</span>
      </div>
    </div>
  )
}

/*
 * PartnerSettlementRequest (page) — 파트너 · 수수료/정산 · 정산 신청
 * ------------------------------------------------------------------
 * 리더와 동일 플로우(기본 화면 → 확인 폼 → 완료 토스트)지만 파트너용으로:
 *   - KPI 6개, 계산식 2항(가맹점 별 수수료 수익 − 보류 제외 = 최종 정산 가능)
 *   - 직계약 가맹점 테이블·자동 정산 안내 섹션 없음
 *   - 가맹점별 수수료 수익 테이블 1개 + 보류/제외 거래 테이블
 * 박스 외형/계산 카드/게이지/필드 등은 리더 정산 신청과 동일 스타일 재사용.
 */
export default function PartnerSettlementRequest() {
  const { t } = useTranslation()
  const [step, setStep] = useState<'default' | 'form'>('default')
  const [submitted, setSubmitted] = useState(false)

  const { banner, kpis, calc, feeStructure, merchantTable, heldTable, summary, checks, formFields } =
    usePartnerSettlementRequest()

  const detailCell = <ActionBadges labels={['보기']} />
  const mtRows: TableRow[] = merchantTable.rows.map((r) => ({
    id: r.code,
    cells: { ...r, auto: <span className={styles.autoTag}>{r.auto}</span>, detail: detailCell },
  }))
  const htRows: TableRow[] = heldTable.rows.map((r) => ({
    id: r.txNo,
    cells: { ...r, status: <span className={styles.heldTag}>{r.status}</span>, detail: detailCell },
  }))

  // ===== 플로우 2·3: 확인 폼 + 완료 토스트 =====
  if (step === 'form') {
    return (
      <div className={styles.page}>
        <PageHeader title={t('settle.req.title')} />
        <div className={styles.formWrap}>
          <section className={styles.formCard}>
            <h2 className={styles.formTitle}>{t('settle.req.cardTitle')}</h2>
            <p className={styles.formDesc}>{t('settle.req.cardDesc')}</p>
            <div className={styles.formFields}>
              {formFields.map((f) => (
                <FieldRow key={f.label} label={f.label} value={f.value} color={f.color} />
              ))}
            </div>
            <div className={styles.formButtons}>
              <Button variant="secondary" onClick={() => setStep('default')}>{t('settle.req.cancel')}</Button>
              <Button
                variant="primary"
                onClick={() => {
                  // 완료 토스트 표시 후 1초 뒤 처음 정산 신청(기본) 화면으로 복귀
                  setSubmitted(true)
                  window.setTimeout(() => {
                    setSubmitted(false)
                    setStep('default')
                  }, 1000)
                }}
              >
                {t('settle.req.submit')}
              </Button>
            </div>
          </section>
          {submitted && <div className={styles.toast}>{t('settle.req.toast')}</div>}
        </div>
      </div>
    )
  }

  // ===== 플로우 1: 기본(긴) 화면 =====
  return (
    <div className={styles.page}>
      <PageHeader title={t('settle.req.title')} />

      {/* 요약 배너 */}
      <div className={styles.bannerBox}>
        <div className={styles.bannerHead}>
          <p className={styles.notice}>{banner.notice}</p>
          <span className={styles.statusBadge}>{t('settle.req.statusOk')}</span>
        </div>
        <InfoGrid
          items={[
            { label: t('settle.req.banner.lastDate'), value: banner.lastDate },
            { label: t('settle.req.banner.period'), value: banner.period },
            { label: t('settle.req.banner.exclude'), value: banner.exclude },
            { label: t('settle.req.banner.method'), value: banner.method },
          ]}
        />
      </div>

      {/* 지표 6개 — 독립 카드, 제목 칩은 카드별 색 */}
      <div className={styles.kpiGrid}>
        {kpis.map((k) => (
          <div key={k.id} className={styles.kpiCard}>
            <span
              className={`${styles.kpiLabel} ${styles.kpiLabelTranslucent}`}
              style={{ '--chip': k.chip } as CSSProperties}
            >
              {k.label}
            </span>
            <span className={styles.kpiValue}>{k.value}</span>
            {k.note && <span className={styles.kpiNote}>{k.note}</span>}
          </div>
        ))}
      </div>

      {/* 정산 가능 금액 계산 (시안 히어로) — 가맹점 별 수수료 수익 − 보류 제외 = 최종 */}
      <div className={styles.calcHero}>
        <h3 className={styles.calcTitle}>{t('settle.req.calc.title')}</h3>
        <p className={styles.calcDesc}>{t('settle.req.calc.desc')}</p>
        <div className={styles.formula}>
          <AmountCard variant="add" label={t('psreq.calc.merchantProfit')} value={calc.merchantProfit} unit={calc.unit} />
          <span className={styles.formulaOp}>−</span>
          <AmountCard variant="minus" label={t('settle.req.calc.held')} value={calc.held} unit={calc.unit} />
          <span className={styles.formulaOp}>=</span>
          <AmountCard variant="final" label={t('settle.req.calc.final')} value={calc.final} unit={calc.unit} />
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

      {/* 수수료 구조 */}
      <div className={styles.feeBox}>
        <h3 className={styles.feeTitle}>{t('settle.req.fee.title')}</h3>
        {feeStructure.map((row, i) => (
          <div key={i} className={styles.feeRow}>
            <div className={styles.feeCell}>
              <span className={`${styles.feeChip} ${feeCatClass(row[0])}`}>{row[0]}</span>
            </div>
            {row.slice(1).map((stepLabel, j) => (
              <div key={j} className={styles.feeCell}>
                {j > 0 && <span className={styles.feeArrow}>→</span>}
                <span className={`${styles.feeChip} ${feeStepClass(stepLabel)}`}>{stepLabel}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 가맹점별 수수료 수익 */}
      <div className={styles.sectionBox}>
        <h3 className={styles.sectionTitle}>{t('psreq.pt.title')}</h3>
        <p className={styles.sectionDesc}>{merchantTable.desc}</p>
        <DataTable columns={merchantTable.columns} rows={mtRows} bare />
      </div>

      {/* 보류 / 제외 거래 */}
      <div className={styles.sectionBox}>
        <h3 className={styles.sectionTitle}>{t('settle.req.ht.title')}</h3>
        <p className={styles.sectionDesc}>{heldTable.desc}</p>
        <DataTable columns={heldTable.columns} rows={htRows} bare />
      </div>

      {/* 본사 정산 요청 (최종 요청 폼) */}
      <div className={styles.sectionBox}>
        <h3 className={styles.sectionTitle}>{t('settle.req.final.title')}</h3>
        <p className={styles.sectionDesc}>{t('psreq.final.desc')}</p>
        <div className={styles.fieldGrid}>
          <FieldCard label={t('settle.req.final.period')} value={summary.period} />
          <FieldCard label={t('settle.req.final.lastDate')} value={summary.lastDate} />
          <FieldCard label={t('settle.req.final.finalAmount')} value={summary.finalAmount} />
          <FieldCard label={t('settle.req.final.held')} value={summary.held} />
          <FieldCard label={t('settle.req.final.requestAmount')} value={summary.requestAmount} />
          <FieldCard label={t('settle.req.final.wallet')} value={summary.wallet} />
          <FieldCard label={t('settle.req.final.currency')} value={summary.currency} />
          <div className={styles.fieldCell}>
            <span className={styles.fieldLabel}>{t('settle.req.final.memo')}</span>
            <input className={styles.memo} type="text" placeholder={summary.memoPlaceholder} />
          </div>
        </div>

        <div className={styles.checks}>
          {checks.map((c, i) => (
            <label key={i} className={styles.check}>
              <input type="checkbox" defaultChecked /> {c}
            </label>
          ))}
        </div>

        <div className={styles.requestBtnRow}>
          <Button variant="primary" onClick={() => setStep('form')}>{t('settle.req.requestBtn')}</Button>
        </div>
      </div>
    </div>
  )
}

/** 확인 폼 라벨/값 한 쌍 (특정 값은 청록/골드 강조) */
function FieldRow({ label, value, color }: { label: string; value: string; color?: string }) {
  const cls =
    color === 'teal' ? styles.formValTeal : color === 'gold' ? styles.formValGold : ''
  return (
    <>
      <span className={styles.formFieldLabel}>{label}</span>
      <span className={`${styles.formFieldValue} ${cls}`}>{value}</span>
    </>
  )
}
