import { Fragment } from 'react'
import PageHeader from '../../components/organisms/PageHeader'
import Button from '../../components/atoms/Button'
import { useTranslation } from '../../i18n'
import { useSettlementRequest } from './useSettlementRequest'
import styles from './SettlementRequest.module.css'

/*
 * SettlementRequest (page) — 수수료/정산 · 정산 신청
 * ------------------------------------------------------------------
 * 디자인엔 "본사에 정산 요청 보내시겠습니까?" 확인 카드만 있어, 그 카드를 페이지 본문으로 구현.
 * 요약 정보(라벨/값) + 취소/요청 버튼 + 성공 토스트. (동작은 UI만)
 */
export default function SettlementRequest() {
  const { t } = useTranslation()
  const { fields } = useSettlementRequest()

  return (
    <div className={styles.page}>
      <PageHeader title={t('settle.req.title')} />

      {/* 확인 카드 */}
      <section className={styles.card}>
        <h2 className={styles.cardTitle}>{t('settle.req.cardTitle')}</h2>
        <p className={styles.cardDesc}>{t('settle.req.cardDesc')}</p>

        <div className={styles.fields}>
          {fields.map((f) => (
            <Fragment key={f.label}>
              <span className={styles.fieldLabel}>{f.label}</span>
              <span className={styles.fieldValue}>{f.value}</span>
            </Fragment>
          ))}
        </div>

        <div className={styles.buttonRow}>
          <Button variant="secondary">{t('settle.req.cancel')}</Button>
          <Button variant="primary">{t('settle.req.submit')}</Button>
        </div>
      </section>

      {/* 성공 토스트 (UI 표시용) */}
      <div className={styles.toast}>{t('settle.req.toast')}</div>
    </div>
  )
}
