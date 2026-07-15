import { Fragment, useState, type CSSProperties } from 'react'
import PageHeader from '../../components/organisms/PageHeader'
import Button from '../../components/atoms/Button'
import InfoGrid from '../../components/molecules/InfoGrid'
import ActionBadges from '../../components/molecules/ActionBadges'
import DataTable, { type TableRow } from '../../components/organisms/DataTable'
import { useTranslation } from '../../i18n'
import { useSettlementRequest } from './useSettlementRequest'
import styles from './SettlementRequest.module.css'

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
  return styles.feeHq // 본사 / 가맹점
}

/** 정산 계산 수식의 금액 카드 (add: 시안 / minus: 빨강 / final: 그라데이션) */
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

/*
 * SettlementRequest (page) — 수수료/정산 · 정산 신청
 * 플로우: 기본(긴) 화면 → [본사 정산 요청] → 확인 폼(가운데) → [보내기] → 완료 토스트
 * 박스 외형은 Figma 정산 화면 전용(보라 테두리/검은 그림자/시안 히어로 등) — 모듈 CSS 참고.
 */
export default function SettlementRequest() {
  const { t } = useTranslation()
  const [step, setStep] = useState<'default' | 'form'>('default')
  const [submitted, setSubmitted] = useState(false)

  const {
    banner, kpis, calc, feeStructure, autoDesc, autoHighlightTitle, autoHighlightDesc, autoStats,
    partnerTable, directTable, heldTable, summary, checks, formFields,
  } = useSettlementRequest()

  const detailCell = <ActionBadges labels={['보기']} />
  const ptRows: TableRow[] = partnerTable.rows.map((r) => ({
    id: r.code,
    // 'auto'(자동 예정) 값은 시안색으로 강조 — 데이터는 그대로 두고 화면에서만 색 입힘
    cells: { ...r, auto: <span className={styles.autoTag}>{r.auto}</span>, detail: detailCell },
  }))
  const dtRows: TableRow[] = directTable.rows.map((r) => ({ id: r.code, cells: { ...r, detail: detailCell } }))
  const htRows: TableRow[] = heldTable.rows.map((r) => ({
    id: r.txNo,
    // 'status'(정산 보류) 값은 주황색으로 강조 — 데이터는 그대로 두고 화면에서만 색 입힘
    cells: { ...r, status: <span className={styles.heldTag}>{r.status}</span>, detail: detailCell },
  }))

  // ===== 플로우 2·3: 확인 폼 + 완료 토스트 (가운데) =====
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
                <Fragment key={f.label}>
                  <span className={styles.formFieldLabel}>{f.label}</span>
                  <span
                    className={`${styles.formFieldValue} ${
                      f.color === 'teal' ? styles.formValTeal : f.color === 'gold' ? styles.formValGold : ''
                    }`}
                  >
                    {f.value}
                  </span>
                </Fragment>
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

      {/* 지표 8개 — 감싸는 박스 없이 독립 카드 4×2, 제목 칩은 카드별 색 */}
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

      {/* 정산 가능 금액 계산 (시안 히어로 박스) */}
      <div className={styles.calcHero}>
        <h3 className={styles.calcTitle}>{t('settle.req.calc.title')}</h3>
        <p className={styles.calcDesc}>{t('settle.req.calc.desc')}</p>
        <div className={styles.formula}>
          <AmountCard variant="add" label={t('settle.req.calc.partnerProfit')} value={calc.partnerProfit} unit={calc.unit} />
          <span className={styles.formulaOp}>+</span>
          <AmountCard variant="add" label={t('settle.req.calc.directProfit')} value={calc.directProfit} unit={calc.unit} />
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

      {/* 수수료 구조 (별도 박스) */}
      <div className={styles.feeBox}>
        <h3 className={styles.feeTitle}>{t('settle.req.fee.title')}</h3>
        {feeStructure.map((row, i) => (
          <div key={i} className={styles.feeRow}>
            {/* 각 칩을 셀에 담아 행마다 같은 열에 정렬 */}
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

      {/* 자동 정산 안내 박스 — 제목 + 설명만 */}
      <div className={styles.autoBox}>
        <h3 className={styles.autoTitle}>{t('settle.req.auto.title')}</h3>
        <p className={styles.autoDesc}>{autoDesc}</p>
      </div>

      {/* 골드 강조 박스 — 안내 박스와 분리된 별도 박스, 한 줄 */}
      <div className={styles.autoHighlight}>
        <span className={styles.autoHlTitle}>{autoHighlightTitle}</span>
        <span className={styles.autoHlDesc}>{autoHighlightDesc}</span>
      </div>

      {/* 자동 정산 요약 카드 4개 (각 카드가 박스) */}
      <div className={styles.summaryGrid}>
        {autoStats.map((s) => (
          <div key={s.id} className={styles.summaryCard}>
            <span className={styles.summaryCardLabel}>{s.label}</span>
            {s.note && <span className={styles.summaryNote}>{s.note}</span>}
            <span className={styles.summaryValue}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* 파트너별 수수료 수익 */}
      <div className={styles.sectionBox}>
        <h3 className={styles.sectionTitle}>{t('settle.req.pt.title')}</h3>
        <p className={styles.sectionDesc}>{partnerTable.desc}</p>
        <DataTable columns={partnerTable.columns} rows={ptRows} bare />
      </div>

      {/* 직계약 가맹점 수수료 수익 */}
      <div className={styles.sectionBox}>
        <h3 className={styles.sectionTitle}>{t('settle.req.dt.title')}</h3>
        <p className={styles.sectionDesc}>{directTable.desc}</p>
        <DataTable columns={directTable.columns} rows={dtRows} bare />
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
        <p className={styles.sectionDesc}>{t('settle.req.final.desc')}</p>
        <div className={styles.fieldGrid}>
          <FieldCard label={t('settle.req.final.period')} value={summary.period} />
          <FieldCard label={t('settle.req.final.lastDate')} value={summary.lastDate} />
          <FieldCard label={t('settle.req.final.finalAmount')} value={summary.finalAmount} />
          <FieldCard label={t('settle.req.final.autoSettle')} value={summary.autoSettle} />
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
