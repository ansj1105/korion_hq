import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatCard from '../../../components/molecules/StatCard'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import Badge from '../../../components/atoms/Badge'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Button from '../../../components/atoms/Button'
import { useTranslation } from '../../../i18n'
import type { AccentKey } from '../../../types'
import { putHqPageData } from '../../../services/korionChongApi'
import { useSystemSecurityPolicy, type SecurityPolicyPageData, type SecurityPolicyRow } from './useSystemSecurityPolicy'
import styles from './SystemSecurityPolicy.module.css'

const ENFORCEMENT_ACCENT: Record<string, AccentKey> = {
  강제: 'red',
  권고: 'amber',
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

interface SecurityPolicyForm {
  configValue: string
  status: string
}

interface SecurityPolicyUpdateResponse {
  status: string
  policyKey: string
  configValue: string
  page: SecurityPolicyPageData
}

export default function SystemSecurityPolicy() {
  const { t } = useTranslation()
  const { kpis, columns, rows: rawRows, setData, isLoading, error } = useSystemSecurityPolicy()
  const [selectedRow, setSelectedRow] = useState<SecurityPolicyRow | null>(null)
  const [form, setForm] = useState<SecurityPolicyForm>({ configValue: '', status: 'ACTIVE' })
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const openEditModal = (row: SecurityPolicyRow) => {
    setSelectedRow(row)
    setForm({ configValue: row.currentValue ?? '', status: row.status === '검토필요' ? 'REVIEW' : 'ACTIVE' })
    setSaveError('')
  }

  const closeEditModal = () => {
    if (isSaving) return
    setSelectedRow(null)
    setSaveError('')
  }

  const saveSecurityPolicy = async () => {
    if (!selectedRow) return
    setIsSaving(true)
    setSaveError('')
    try {
      const response = await putHqPageData<SecurityPolicyUpdateResponse>(
        `/api/hq/system/security-policy/${encodeURIComponent(selectedRow.policyKey)}`,
        {
          configValue: form.configValue.trim(),
          status: form.status,
          requestId: `hq-system-security-${Date.now()}`,
        },
      )
      setData(response.page)
      setSelectedRow(null)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('hqSystemSecurityPolicy.modal.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

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
        <div className={styles.actionGroup}>
          <ActionBadges
            labels={row.actions?.length ? row.actions : [t('common.detail')]}
            size="md"
            shape="rect"
            onLabelClick={() => openEditModal(row)}
          />
        </div>
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
        onRowClick={(rowId) => {
          const source = rawRows.find((item) => item.id === rowId)
          if (source) openEditModal(source)
        }}
      />

      {selectedRow && (
        <div className={styles.overlay} onClick={closeEditModal}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-label={t('hqSystemSecurityPolicy.modal.title')} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <h2 className={styles.modalTitle}>{t('hqSystemSecurityPolicy.modal.title')}</h2>
                <p className={styles.modalDesc}>{t('hqSystemSecurityPolicy.modal.desc')}</p>
              </div>
              <Badge accent={(selectedRow.statusAccent as AccentKey) ?? (selectedRow.status === '적용중' ? 'green' : 'orange')} size="md" shape="rect">
                {selectedRow.status}
              </Badge>
            </div>

            <dl className={styles.detailGrid}>
              <div><dt>{t('hqSystemSecurityPolicy.col.policyName')}</dt><dd>{selectedRow.policyName}</dd></div>
              <div><dt>{t('hqSystemSecurityPolicy.modal.policyKey')}</dt><dd>{selectedRow.policyKey}</dd></div>
              <div><dt>{t('hqSystemSecurityPolicy.col.category')}</dt><dd>{selectedRow.category}</dd></div>
              <div><dt>{t('hqSystemSecurityPolicy.col.scope')}</dt><dd>{selectedRow.scope}</dd></div>
              <div><dt>{t('hqSystemSecurityPolicy.col.requiredValue')}</dt><dd>{selectedRow.requiredValue}</dd></div>
              <div><dt>{t('hqSystemSecurityPolicy.col.autoAction')}</dt><dd>{selectedRow.autoAction}</dd></div>
            </dl>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>{t('hqSystemSecurityPolicy.modal.configValue')}</span>
                <input
                  value={form.configValue}
                  onChange={(event) => setForm((prev) => ({ ...prev, configValue: event.target.value }))}
                  placeholder={t('hqSystemSecurityPolicy.modal.configValuePlaceholder')}
                />
              </label>
              <label className={styles.field}>
                <span>{t('hqSystemSecurityPolicy.modal.status')}</span>
                <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </label>
            </div>

            {saveError && <p className={styles.errorText}>{saveError}</p>}

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={closeEditModal}>{t('hqSystemSecurityPolicy.modal.cancel')}</Button>
              <Button variant="primary" onClick={saveSecurityPolicy} disabled={isSaving}>{isSaving ? t('common.loading') : t('hqSystemSecurityPolicy.modal.save')}</Button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
