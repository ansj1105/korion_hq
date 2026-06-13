import PageHeader from '../../components/organisms/PageHeader'
import DateRangeSelect from '../../components/molecules/DateRangeSelect'
import KpiGrid from '../../components/organisms/KpiGrid'
import Panel from '../../components/molecules/Panel'
import { useTranslation } from '../../i18n'
import { useDashboardData } from './useDashboardData'
import styles from './Dashboard.module.css'

/*
 * Dashboard (page) — 리더 관리자 · 국가 운영 대시보드
 * ------------------------------------------------------------------
 * 구성: 상단 헤더(제목/기간탭) + KPI 카드 그리드 + 하단 요약 패널들.
 *
 * [하단 패널 처리] 파트너 순위/가맹점 순위/최근 활동/요청/공지 패널은
 * 현재 Figma상 제목만 있고 내용이 비어 있다(미정의). 따라서 내용을 임의로 채우지 않고,
 * 각 패널에 "무엇이 들어갈 자리"인지 주석으로만 명시해 빈 공간으로 둔다.
 * (내용 정의되면 각 Panel의 children으로 실제 리스트/위젯을 넣으면 됨)
 */
export default function Dashboard() {
  const { t } = useTranslation()
  // 데이터는 훅에서 받아온다 (현재는 하드코딩 JSON, 추후 API로 교체 가능)
  const { kpis } = useDashboardData()

  return (
    <div className={styles.page}>
      {/* 공통 헤더 + 대시보드 전용 기간 선택 드롭다운(우측 정렬, children 슬롯) */}
      <PageHeader title={t('dashboard.title')}>
        <DateRangeSelect />
      </PageHeader>

      {/* KPI 카드 그리드 (데이터: useDashboardData 훅) */}
      <KpiGrid items={kpis} />

      {/*
        요약 패널 5종 — 모두 동일 크기(330×220) 3열 그리드.
        윗줄: 파트너 순위 / 가맹점 순위 / 최근 활동, 아랫줄: 요청 / 공지 (왼쪽 정렬).
        내용이 비어 있는 패널은 "들어갈 자리" 주석만 남기고 빈 공간으로 둔다.
      */}
      <div className={styles.panelGrid}>
        <Panel title={t('dashboard.panel.partnerRank')}>
          {/* 들어갈 자리: 상위 파트너 순위 리스트 (매출/거래량 기준 정렬) */}
        </Panel>
        <Panel title={t('dashboard.panel.merchantRank')}>
          {/* 들어갈 자리: 상위 가맹점 순위 리스트 */}
        </Panel>
        {/* 최근 활동 패널만 디자인에 설명줄이 있어 subtitle로 표시 */}
        <Panel
          title={t('dashboard.panel.recentActivity')}
          subtitle={t('dashboard.panel.recentActivityDesc')}
        >
          {/* 들어갈 자리: 활동 피드 항목 리스트 */}
        </Panel>
        <Panel title={t('dashboard.panel.request')}>
          {/* 들어갈 자리: 처리 대기 중인 요청 목록 (내용 정의 필요) */}
        </Panel>
        <Panel title={t('dashboard.panel.notice')}>
          {/* 들어갈 자리: 본사 공지/소식 요약 (내용 정의 필요) */}
        </Panel>
      </div>
    </div>
  )
}
