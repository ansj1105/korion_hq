import { useTranslation } from '../../../i18n'
import { useCollateralInfoDetail, type InfoDetailTone } from './useCollateralInfoDetail'
import styles from './CollateralInfoOverlay.module.css'

interface Props {
  open: boolean
  onClose: () => void
}

/* 상태 강조색 — Figma 시안의 초록(#34d399)/호박(#fbbf24). 페이지 안내 카드와 같은 팔레트라 토큰과 별개 실측값 */
const TONE_COLOR: Record<InfoDetailTone, string> = {
  cyan: '#22d3ee',
  green: '#34d399',
  amber: '#fbbf24',
}

/* 메트릭 카드 톤별 테두리 클래스 — 문자열 조합 대신 명시 매핑(camelCaseOnly 설정에서 안전) */
const METRIC_TONE_CLASS: Record<InfoDetailTone, string> = {
  cyan: styles.metricCyan,
  green: styles.metricGreen,
  amber: styles.metricAmber,
}

/*
 * CollateralInfoOverlay — 회원 담보금 정보 탭의 행 클릭 시 뜨는 상세 폼 (Figma 81:29553)
 * ------------------------------------------------------------------
 * 별도 라우트 없이 open prop으로만 제어. 사이드바를 제외한 콘텐츠 영역 중앙에 노출
 * (CollateralDetailOverlay와 동일한 backdrop 방식). backdrop 클릭 또는 '닫기' 버튼으로 닫힘.
 * A.기본 정보(읽기 전용 필드) → B.담보금 요약(메트릭 3장) → C.최근 활동(미니 표) → 하단 버튼.
 * '관련 회원 정산 내역 보기' 버튼은 동작 협의 전이라 UI만(1번 규칙).
 */
export default function CollateralInfoOverlay({ open, onClose }: Props) {
  const { t } = useTranslation()
  const { fields, metrics, activities } = useCollateralInfoDetail()

  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {/* stopPropagation: 패널 안 클릭이 backdrop 클릭으로 버블링되지 않도록 */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('hqCollateral.infoDetail.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2 className={styles.title}>{t('hqCollateral.infoDetail.title')}</h2>
            <p className={styles.subtitle}>{t('hqCollateral.infoDetail.desc')}</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            {t('common.close')}
          </button>
        </div>

        {/* A. 회원 기본 정보 — 읽기 전용 필드 2열. newRow는 Figma의 빈 칸(한 줄에 필드 1개) 배치 재현 */}
        <h3 className={styles.sectionTitle}>{t('hqCollateral.infoDetail.secBasic')}</h3>
        <div className={styles.fieldGrid}>
          {fields.map((f) => (
            <div key={f.label} className={f.newRow ? `${styles.field} ${styles.fieldNewRow}` : styles.field}>
              <span className={styles.fieldLabel}>{f.label}</span>
              <span className={styles.fieldValue}>{f.value}</span>
            </div>
          ))}
        </div>

        {/* B. 담보금 요약 — 색조가 다른 메트릭 카드 3장 */}
        <h3 className={styles.sectionTitle}>{t('hqCollateral.infoDetail.secSummary')}</h3>
        <div className={styles.metricRow}>
          {metrics.map((m) => (
            <div key={m.label} className={`${styles.metricCard} ${METRIC_TONE_CLASS[m.tone]}`}>
              <span className={styles.metricLabel}>{m.label}</span>
              <span className={styles.metricValue} style={{ color: TONE_COLOR[m.tone] }}>
                {m.value}
              </span>
            </div>
          ))}
        </div>

        {/* C. 최근 활동 — 일시/유형/금액/상태 미니 표 (가운데 행만 지브라 배경 — Figma 시안 그대로) */}
        <h3 className={styles.sectionTitle}>{t('hqCollateral.infoDetail.secActivity')}</h3>
        <div className={styles.activityBox}>
          <div className={`${styles.activityRow} ${styles.activityHead}`}>
            <span>{t('hqCollateral.infoDetail.activity.col.at')}</span>
            <span>{t('hqCollateral.col.type')}</span>
            <span>{t('hqCollateral.col.amount')}</span>
            <span>{t('hqCollateral.col.status')}</span>
          </div>
          {activities.map((a, i) => (
            <div key={a.at} className={i % 2 === 1 ? `${styles.activityRow} ${styles.activityZebra}` : styles.activityRow}>
              <span>{a.at}</span>
              <span>{a.type}</span>
              <span>{a.amount}</span>
              <span style={{ color: TONE_COLOR[a.statusTone] }}>{a.status}</span>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.settlementButton}>
            {t('hqCollateral.infoDetail.btn.viewSettlement')}
          </button>
        </div>
      </div>
    </div>
  )
}
