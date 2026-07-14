import { useEffect, useState } from 'react'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import { fetchHqPageData } from '../../../services/korionChongApi'
import styles from './SettlementDetailModal.module.css'

interface FieldRaw {
  labelKey: string
  value: string
  editable?: boolean
}

interface SettlementDetailModalProps {
  settlementRequestId?: number
  onClose: () => void
}

interface SettlementDetailResponse {
  header?: {
    no?: string
    statusOk?: string
    contextBadges?: string[]
  }
  banner?: {
    notice?: string
    period?: string
    method?: string
  }
  form?: {
    fields?: FieldRaw[]
    memoPlaceholder?: string
    replyPlaceholder?: string
  }
}

/*
 * SettlementDetailModal — 정산 내역 행(상세) 클릭 시 뜨는 상세 모달
 * ------------------------------------------------------------------
 * Figma 81:29429(내용 80:14460) "거래 내역 상세정보". 좌측 네브바를 제외한
 * 콘텐츠 영역 기준 가운데 정렬(오버레이 left를 --sidebar-width 만큼 밀고,
 * 모바일에선 전체 폭) — 가맹점 거래내역 모달과 동일 패턴.
 * 클릭한 행의 정산 ID로 상세 API를 조회한다. 샘플 상세 파일을 사용하지 않는다.
 */
export default function SettlementDetailModal({ settlementRequestId, onClose }: SettlementDetailModalProps) {
  const { t } = useTranslation()
  const [detail, setDetail] = useState<SettlementDetailResponse | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(settlementRequestId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!settlementRequestId) {
      setDetail(null)
      setIsLoading(false)
      setError('정산 내역 ID가 없습니다.')
      return
    }

    let alive = true
    setIsLoading(true)
    setError(null)
    fetchHqPageData<SettlementDetailResponse>(`/api/hq/settlement-requests/${encodeURIComponent(String(settlementRequestId))}/detail`)
      .then((payload) => {
        if (alive) setDetail(payload)
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : 'API error')
      })
      .finally(() => {
        if (alive) setIsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [settlementRequestId])

  const fields = detail?.form?.fields ?? []

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {/* 헤더: 제목 좌측 + 정산 상태 배지(연녹색, 데이터 값) 우측 */}
        <div className={styles.header}>
          <h2 className={styles.title}>{t('hqSettle.histModal.title')}</h2>
          <Badge accent="green" size="md" shape="rect">{detail?.header?.statusOk ?? '-'}</Badge>
        </div>
        <div className={styles.divider} />

        {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
        {error && <p className={styles.errorText}>{error}</p>}
        {detail?.banner?.notice && <p className={styles.notice}>{detail.banner.notice}</p>}
        {detail?.header?.no && <p className={styles.requestNo}>{detail.header.no}</p>}

        {!isLoading && !error && (
          <dl className={styles.fields}>
            {fields.map((f, index) => (
              <div key={`${f.labelKey}-${index}`} className={index === 4 ? `${styles.fieldRow} ${styles.fieldRowGap}` : styles.fieldRow}>
                <dt className={styles.fieldLabel}>{t(f.labelKey)}</dt>
                <dd className={styles.fieldValue}>{f.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <p className={styles.memoLabel}>{t('hqSettle.histModal.memo')}</p>
        <textarea className={styles.memoBox} placeholder={detail?.form?.memoPlaceholder ?? ''} aria-label={t('hqSettle.histModal.memo')} />

        <p className={styles.memoLabel}>{t('hqSettle.histModal.adminMemo')}</p>
        <textarea
          className={styles.memoBox}
          placeholder={detail?.form?.replyPlaceholder ?? ''}
          aria-label={t('hqSettle.histModal.adminMemo')}
          readOnly
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
