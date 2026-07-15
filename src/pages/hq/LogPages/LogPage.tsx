import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Badge from '../../../components/atoms/Badge'
import { useTranslation } from '../../../i18n'
import type { AccentKey } from '../../../types'
import { useHqLogPage, type HqLogPageType } from './useHqLogPage'
import styles from './LogPage.module.css'

interface LogPageProps {
  pageType: HqLogPageType
}

export default function LogPage({ pageType }: LogPageProps) {
  const { t } = useTranslation()
  const { title, desc, tableTitle, stats, columns, rows, isLoading, error } = useHqLogPage(pageType)

  const tableRows: TableRow[] = rows.map((row) => ({
    id: row.id,
    cells: Object.fromEntries(columns.map((column) => {
      if (column.key === 'eventType') {
        return [column.key, <Badge accent={(row.menuAccent as AccentKey) ?? 'blue'} size="md" shape="rect">{row.eventType}</Badge>]
      }
      if (column.key === 'menu') {
        return [column.key, <Badge accent={(row.menuAccent as AccentKey) ?? 'blue'} size="md" shape="rect">{row.menu}</Badge>]
      }
      if (column.key === 'action') {
        return [column.key, <Badge accent={(row.actionAccent as AccentKey) ?? 'blue'} size="md" shape="rect">{row.action}</Badge>]
      }
      if (column.key === 'result') {
        return [column.key, <Badge accent={(row.resultAccent as AccentKey) ?? 'green'} size="md" shape="rect">{row.result}</Badge>]
      }
      if (column.key === 'riskLevel') {
        return [column.key, <Badge accent={(row.riskAccent as AccentKey) ?? 'blue'} size="md" shape="rect">{row.riskLevel}</Badge>]
      }
      if (column.key === 'actions') {
        return [column.key, <ActionBadges labels={row.actions?.length ? row.actions : [t('common.detail')]} size="md" shape="rect" />]
      }
      return [column.key, row[column.key] == null ? '-' : String(row[column.key])]
    })),
  }))

  return (
    <div className={styles.page}>
      <PageHeader title={title}>
        <p className={styles.pageDesc}>{desc}</p>
      </PageHeader>

      <StatSection title={title} stats={stats} bare />
      {isLoading && <p className={styles.stateText}>{t('common.loading')}</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      <DataTable
        title={tableTitle}
        toolbar={[t('common.search'), t('common.filter'), t('common.excel')]}
        columns={columns}
        rows={tableRows}
        searchKeys={['no', 'logId', 'time', 'adminId', 'admin', 'eventType', 'menu', 'action', 'targetId', 'ip', 'result', 'riskLevel']}
        filterKeys={['eventType', 'menu', 'action', 'result', 'riskLevel']}
        mutedText
        headerBar
        wrapCells
        paginated
        pageSize={10}
      />
    </div>
  )
}
