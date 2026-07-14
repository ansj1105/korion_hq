import { useTranslation } from '../../../i18n'
import Badge from '../../../components/atoms/Badge'
import { useCollateralSettleDetail } from './useCollateralSettleDetail'
import type { CollateralSettlementRow } from './useCollateralHistory'
import styles from './CollateralSettleOverlay.module.css'

interface Props {
  open: boolean
  onClose: () => void
  row?: CollateralSettlementRow | null
}

/*
 * CollateralSettleOverlay — 회원 정산 내역 탭의 행 클릭 시 뜨는 상세 폼 (Figma 81:29616)
 * ------------------------------------------------------------------
 * 별도 라우트 없이 open prop으로만 제어. 사이드바를 제외한 콘텐츠 영역 중앙에 노출
 * (CollateralDetailOverlay와 동일한 backdrop 방식). backdrop 클릭 또는 '닫기' 버튼으로 닫힘.
 * 읽기 전용 필드 → 관련 거래 요약(미니 표) → 하단 버튼 구성.
 * '트랜잭션 복사' 버튼은 동작 협의 전이라 UI만(1번 규칙).
 */
export default function CollateralSettleOverlay({ open, onClose, row }: Props) {
  const { t } = useTranslation()
  const { fields, txRows } = useCollateralSettleDetail()
  const detailFields = row
    ? [
        { label: t('hqCollateral.settle.col.no'), value: row.no },
        { label: t('hqCollateral.settle.col.settledAt'), value: row.settledAt },
        { label: t('hqCollateral.settle.col.parentPartner'), value: row.parentPartner },
        { label: t('hqCollateral.settle.col.ownCode'), value: row.ownCode },
        { label: t('hqCollateral.col.country'), value: row.country },
        { label: t('hqCollateral.col.memberId'), value: row.memberId },
        { label: t('hqCollateral.col.memberName'), value: row.memberName },
        { label: t('hqCollateral.settle.col.target'), value: row.target },
        { label: t('hqCollateral.settle.col.amount'), value: row.amount },
        { label: t('hqCollateral.settle.col.beforeAfter'), value: row.beforeAfter },
        { label: t('hqCollateral.col.status'), value: row.status },
      ]
    : fields

  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={onClose}>
      {/* stopPropagation: 패널 안 클릭이 backdrop 클릭으로 버블링되지 않도록 */}
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label={t('hqCollateral.settleDetail.title')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div className={styles.headerText}>
            <h2 className={styles.title}>{t('hqCollateral.settleDetail.title')}</h2>
            <p className={styles.subtitle}>{t('hqCollateral.settleDetail.desc')}</p>
          </div>
          <button type="button" className={styles.ghostButton} onClick={onClose}>
            {t('common.close')}
          </button>
        </div>

        {/* 읽기 전용 필드 2열 — "전송 대상"이 시안상 두 번 나와 key는 인덱스 사용. newRow는 빈 칸 배치 재현 */}
        <div className={styles.fieldGrid}>
          {detailFields.map((f, i) => (
            <div key={`${f.label}-${i}`} className={'newRow' in f && f.newRow ? `${styles.field} ${styles.fieldNewRow}` : styles.field}>
              <span className={styles.fieldLabel}>{f.label}</span>
              <span className={styles.fieldValue}>{f.value}</span>
            </div>
          ))}
        </div>

        {/* 관련 거래 요약 — 거래 ID/거래일시/결제 금액/수취 금액/상태 미니 표 (가운데 행만 지브라 — Figma 그대로) */}
        <h3 className={styles.sectionTitle}>{t('hqCollateral.settleDetail.secTx')}</h3>
        <div className={styles.txBox}>
          <div className={`${styles.txRow} ${styles.txHead}`}>
            <span>{t('hqCollateral.settleDetail.tx.col.id')}</span>
            <span>{t('hqCollateral.settleDetail.tx.col.at')}</span>
            <span>{t('hqCollateral.settleDetail.tx.col.payAmount')}</span>
            <span>{t('hqCollateral.settleDetail.tx.col.receiveAmount')}</span>
            <span>{t('hqCollateral.col.status')}</span>
          </div>
          {txRows.map((r, i) => (
            <div key={r.id} className={i % 2 === 1 ? `${styles.txRow} ${styles.txZebra}` : styles.txRow}>
              <span>{r.id}</span>
              <span>{r.at}</span>
              <span>{r.payAmount}</span>
              <span>{r.receiveAmount}</span>
              <Badge accent={r.statusTone} size="md" shape="rect">{r.status}</Badge>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.ghostButton}>
            {t('hqCollateral.settleDetail.btn.copyTx')}
          </button>
        </div>
      </div>
    </div>
  )
}
