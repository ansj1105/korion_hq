import PageHeader from '../../../components/organisms/PageHeader'
import DateRangeSelect from '../../../components/molecules/DateRangeSelect'
import KpiGrid from '../../../components/organisms/KpiGrid'
import Panel from '../../../components/molecules/Panel'
import { useTranslation } from '../../../i18n'
import { usePartnerDashboard } from './usePartnerDashboard'
import styles from './PartnerDashboard.module.css'

/*
 * PartnerDashboard (page) — 파트너 관리자 · 내 가맹점 대시보드
 * ------------------------------------------------------------------
 * 리더 대시보드와 동일 골격(KPI 8 + 하단 패널)을 공통 컴포넌트(KpiGrid·Panel)로 재사용.
 * 하단 패널은 Figma상 제목/설명만 있고 내용이 비어 있어, 내용은 임의로 채우지 않고
 * "들어갈 자리" 주석만 남긴다.
 */
export default function PartnerDashboard() {
  const { t } = useTranslation()
  const { kpis } = usePartnerDashboard()

  return (
    <div className={styles.page}>
      <PageHeader title={t('pdash.title')}>
        {/* 설명(좌) + 기간 토글(우) */}
        <div className={styles.subRow}>
          <p className={styles.desc}>{t('pdash.desc')}</p>
          <DateRangeSelect />
        </div>
      </PageHeader>

      {/* KPI 카드 8개 (4×2) */}
      <KpiGrid items={kpis} />

      {/* 하단 요약 패널 4개 (가맹점순위 / 가맹점 승인 / 최근 활동 / 공지) */}
      <div className={styles.panelGrid}>
        <Panel title={t('pdash.panel.merchantRank')}>
          {/* 들어갈 자리: 가맹점 순위 리스트 */}
        </Panel>
        <Panel title={t('pdash.panel.merchantApproval')}>
          {/* 들어갈 자리: 가맹점 승인 현황 */}
        </Panel>
        <Panel title={t('pdash.panel.recentActivity')} subtitle={t('pdash.panel.activityDesc')}>
          {/* 들어갈 자리: 활동 피드 */}
        </Panel>
        <Panel title={t('pdash.panel.notice')} subtitle={t('pdash.panel.activityDesc')}>
          {/* 들어갈 자리: 공지 요약 */}
        </Panel>
      </div>
    </div>
  )
}
