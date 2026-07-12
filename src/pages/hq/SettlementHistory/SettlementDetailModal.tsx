import { useTranslation } from '../../../i18n'
import data from './settlementDetailData.json'
import styles from './SettlementDetailModal.module.css'

interface FieldRaw {
  labelKey: string
  value: string
  /** true면 앞 필드 그룹과 간격을 벌린다(Figma: 최종 정산 금액 ↔ 지급 방식 사이) */
  gapBefore?: boolean
}

interface SettlementDetailModalProps {
  /** 닫기(확인/배경 클릭) — 표시 전용 모달이라 저장 동작은 추후 협의 */
  onClose: () => void
}

/*
 * SettlementDetailModal — 정산 내역 행(상세) 클릭 시 뜨는 상세 모달
 * ------------------------------------------------------------------
 * Figma 81:29429(내용 80:14460) "거래 내역 상세정보". 좌측 네브바를 제외한
 * 콘텐츠 영역 기준 가운데 정렬(오버레이 left를 --sidebar-width 만큼 밀고,
 * 모바일에선 전체 폭) — 가맹점 거래내역 모달과 동일 패턴.
 * 데이터는 Figma 샘플값 하드코딩(settlementDetailData.json) — 실데이터 연동 시
 * 클릭한 행의 정산 ID로 조회해 채우면 된다.
 */
export default function SettlementDetailModal({ onClose }: SettlementDetailModalProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {/* 헤더: 제목 좌측 + 정산 상태 배지(연녹색, 데이터 값) 우측 */}
        <div className={styles.header}>
          <h2 className={styles.title}>{t('hqSettle.histModal.title')}</h2>
          <span className={styles.statusBadge}>{data.badge}</span>
        </div>
        <div className={styles.divider} />

        <dl className={styles.fields}>
          {(data.fields as FieldRaw[]).map((f) => (
            <div key={f.labelKey} className={f.gapBefore ? `${styles.fieldRow} ${styles.fieldRowGap}` : styles.fieldRow}>
              <dt className={styles.fieldLabel}>{t(f.labelKey)}</dt>
              <dd className={styles.fieldValue}>{f.value}</dd>
            </div>
          ))}
        </dl>

        <p className={styles.memoLabel}>{t('hqSettle.histModal.memo')}</p>
        <textarea className={styles.memoBox} defaultValue={data.memo} aria-label={t('hqSettle.histModal.memo')} />

        <p className={styles.memoLabel}>{t('hqSettle.histModal.adminMemo')}</p>
        <textarea
          className={styles.memoBox}
          placeholder={data.adminMemoPlaceholder}
          aria-label={t('hqSettle.histModal.adminMemo')}
        />

        {/* 관리자 메모 아래 좌측의 작은 저장 버튼 (Figma 배치 그대로) */}
        <button type="button" className={styles.saveButton}>
          {t('hqSettle.reqDetail.btn.save')}
        </button>

        {/* 하단 가운데 확인(그라디언트) 버튼 — 클릭 시 닫기 */}
        <div className={styles.footer}>
          <button type="button" className={styles.confirmButton} onClick={onClose}>
            {t('hqSettle.histModal.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
