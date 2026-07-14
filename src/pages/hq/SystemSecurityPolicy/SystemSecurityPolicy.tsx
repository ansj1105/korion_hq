import PageHeader from '../../../components/organisms/PageHeader'
import StatCard from '../../../components/molecules/StatCard'
import ActionBadges from '../../../components/molecules/ActionBadges'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import type { AccentKey } from '../../../types'
import { useSystemSecurityPolicy } from './useSystemSecurityPolicy'
import styles from './SystemSecurityPolicy.module.css'

const ENFORCEMENT_ACCENT: Record<string, AccentKey> = {
  강제: 'red',
  권고: 'amber',
}

const ACTION_ACCENT: Record<string, AccentKey> = {
  상세: 'cyan',
  수정: 'blue',
  비활성: 'red',
  활성: 'green',
}

const AUTO_ACTION_ACCENT: Record<string, AccentKey> = {
  '로그인 차단': 'red',
  '계정 잠금': 'red',
  '자동 로그아웃': 'orange',
  '정산 보류': 'amber',
  '추가 인증': 'purple',
  '변경 알림': 'cyan',
  '로그 보존': 'blue',
}

export default function SystemSecurityPolicy() {
  const { t } = useTranslation()
  const { kpis, columns, rows: rawRows, isLoading, error } = useSystemSecurityPolicy()

  const rows: TableRow[] = rawRows.map((row) => ({
    id: row.id,
    cells: {
      no: row.no,
      policyName: row.policyName,
      category: row.category,
      scope: row.scope,
      currentValue: row.currentValue,
      requiredValue: row.requiredValue,
      enforcement: (
        <Badge accent={ENFORCEMENT_ACCENT[row.enforcement] ?? 'blue'} size="md" shape="rect">
          {row.enforcement}
        </Badge>
      ),
      autoAction: (
        <Badge accent={AUTO_ACTION_ACCENT[row.autoAction] ?? 'blue'} size="md" shape="rect">
          {row.autoAction}
        </Badge>
      ),
      status: (
        <Badge accent={(row.statusAccent as AccentKey) ?? (row.status === '적용중' ? 'green' : 'orange')} size="md" shape="rect">
          {row.status}
        </Badge>
      ),
      updatedAt: row.updatedAt,
      source: (
        <Badge accent={row.source === 'app_config' ? 'cyan' : 'blue'} size="md" shape="rect">
          {row.source}
        </Badge>
      ),
      action: (
        <ActionBadges
          labels={row.actions?.length ? row.actions : [t('common.detail')]}
          accentByLabel={ACTION_ACCENT}
          solid
          size="md"
          shape="rect"
        />
      ),
    },
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqSystemSecurityPolicy.title')}>
        <p className={styles.pageDesc}>{t('hqSystemSecurityPolicy.desc')}</p>
      </PageHeader>

      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => <StatCard key={kpi.id} {...kpi} />)}
      </div>

      <section className={styles.noticeCard}>
        <h2 className={styles.noticeTitle}>{t('hqSystemSecurityPolicy.notice.title')}</h2>
        <p className={styles.noticeDesc}>{t('hqSystemSecurityPolicy.notice.desc')}</p>
      </section>

      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      <DataTable
        title={t('hqSystemSecurityPolicy.tableTitle')}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        columns={columns}
        rows={rows}
        searchKeys={['policyName', 'category', 'scope', 'currentValue', 'requiredValue', 'autoAction', 'status', 'source']}
        filterKeys={['category', 'enforcement', 'autoAction', 'status', 'source']}
        mutedText
        headerBar
        wrapCells
        paginated
        pageSize={10}
      />
    </div>
  )
}
