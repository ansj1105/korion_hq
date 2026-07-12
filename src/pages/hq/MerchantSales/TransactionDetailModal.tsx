import { useTranslation } from '../../../i18n'
import data from './transactionDetailData.json'
import styles from './TransactionDetailModal.module.css'

interface FieldRaw {
  labelKey: string
  value: string
  /** true면 값이 코드/주소류라 Figma처럼 10px Regular로 한 단계 작게 표시 */
  small?: boolean
}

interface TransactionDetailModalProps {
  /** 닫기(확인/배경 클릭) — 표시 전용 모달이라 저장/지급보류도 동작은 추후 협의 */
  onClose: () => void
}

/*
 * TransactionDetailModal — "가맹점 거래내역" 거래 로그 행 클릭 시 뜨는 상세 모달
 * ------------------------------------------------------------------
 * Figma 81:28685 "거래 내역 상세정보". 좌측 네브바를 제외한 콘텐츠 영역 기준
 * 가운데 정렬(오버레이 left를 --sidebar-width 만큼 밀고, 모바일에선 전체 폭).
 * 데이터는 Figma 샘플값 하드코딩(transactionDetailData.json) — 실데이터 연동 시
 * 클릭한 행의 거래번호로 조회해 채우면 된다.
 */
export default function TransactionDetailModal({ onClose }: TransactionDetailModalProps) {
  const { t } = useTranslation()

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{t('hqMerchantSales.txModal.title')}</h2>

        <dl className={styles.fields}>
          {(data.fields as FieldRaw[]).map((f) => (
            <div key={f.labelKey} className={styles.fieldRow}>
              <dt className={styles.fieldLabel}>{t(f.labelKey)}</dt>
              <dd className={f.small ? `${styles.fieldValue} ${styles.fieldValueSm}` : styles.fieldValue}>
                {f.value}
              </dd>
            </div>
          ))}
        </dl>

        <p className={styles.memoLabel}>{t('hqMerchantSales.txModal.memo')}</p>
        <textarea className={styles.memoBox} defaultValue={data.memo} aria-label={t('hqMerchantSales.txModal.memo')} />

        <p className={styles.memoLabel}>{t('hqMerchantSales.txModal.adminMemo')}</p>
        <textarea
          className={styles.memoBox}
          placeholder={data.adminMemoPlaceholder}
          aria-label={t('hqMerchantSales.txModal.adminMemo')}
        />

        <button type="button" className={styles.saveButton}>
          {t('hqSettle.reqDetail.btn.save')}
        </button>

        <div className={styles.footer}>
          <button type="button" className={styles.confirmButton} onClick={onClose}>
            {t('hqMerchantSales.confirmButton')}
          </button>
          <button type="button" className={styles.holdButton}>
            {t('hqMerchantSales.txModal.hold')}
          </button>
        </div>
      </div>
    </div>
  )
}
