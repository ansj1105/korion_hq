import { useState } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import StatSection from '../../../components/organisms/StatSection'
import DataTable, { type TableRow } from '../../../components/organisms/DataTable'
import ActionBadges from '../../../components/molecules/ActionBadges'
import Badge from '../../../components/atoms/Badge'
import Button from '../../../components/atoms/Button'
import { useTranslation } from '../../../i18n'
import { putHqPageData } from '../../../services/korionChongApi'
import type { AccentKey } from '../../../types'
import { useHqAdminPage, type HqAdminPageType, type HqAdminRow } from './useHqAdminPage'
import styles from './AdminPage.module.css'

interface AdminPageProps {
  pageType: HqAdminPageType
}

const STATUS_ACCENT: Record<string, AccentKey> = {
  ACTIVE: 'green',
  SUSPENDED: 'red',
  DELETED: 'red',
  필요: 'orange',
  정상: 'green',
  미설정: 'orange',
  설정됨: 'green',
  제한: 'red',
  대기: 'orange',
}

const ACTION_ACCENT: Record<string, AccentKey> = {
  상세: 'cyan',
  수정: 'blue',
  권한수정: 'blue',
  정지: 'red',
  해제: 'green',
  삭제: 'red',
  재설정: 'orange',
  감사: 'purple',
}

const ROLE_OPTIONS = ['HQ_ADMIN', 'HQ_MANAGER', 'HQ_STAFF', 'VIEWER']
const STATUS_OPTIONS = ['ACTIVE', 'SUSPENDED']

interface AccountFormState {
  adminRole: string
  status: string
  parentAdminId: string
  countryScope: string
}

interface GroupFormState {
  scope: string
  status: string
  permissions: string
}

interface CountryAccessFormState {
  countryCode: string
  status: string
  menuPermissions: string
}

interface LoginSecurityFormState {
  configValue: string
  status: string
}

interface TwoFactorFormState {
  configValue: string
  status: string
}

export default function AdminPage({ pageType }: AdminPageProps) {
  const { t } = useTranslation()
  const { title, desc, tableTitle, stats, columns, rows, isLoading, error, reload } = useHqAdminPage(pageType)
  const [selectedRow, setSelectedRow] = useState<null | HqAdminRowWithAccount>(null)
  const [selectedGroup, setSelectedGroup] = useState<null | HqAdminRowWithGroup>(null)
  const [selectedCountryAccess, setSelectedCountryAccess] = useState<null | HqAdminRowWithCountryAccess>(null)
  const [selectedLoginSecurity, setSelectedLoginSecurity] = useState<null | HqAdminRowWithLoginSecurity>(null)
  const [selectedTwoFactor, setSelectedTwoFactor] = useState<null | HqAdminRowWithTwoFactor>(null)
  const [form, setForm] = useState<AccountFormState>({ adminRole: 'HQ_STAFF', status: 'ACTIVE', parentAdminId: '', countryScope: 'ALL' })
  const [groupForm, setGroupForm] = useState<GroupFormState>({ scope: '', status: 'ACTIVE', permissions: '' })
  const [countryAccessForm, setCountryAccessForm] = useState<CountryAccessFormState>({ countryCode: 'ALL', status: 'ACTIVE', menuPermissions: '' })
  const [loginSecurityForm, setLoginSecurityForm] = useState<LoginSecurityFormState>({ configValue: '', status: 'ACTIVE' })
  const [twoFactorForm, setTwoFactorForm] = useState<TwoFactorFormState>({ configValue: '', status: 'ACTIVE' })
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const openAccountModal = (row: HqAdminRow, nextStatus?: string) => {
    if (pageType !== 'accounts') return
    const adminId = Number(row.adminId ?? String(row.id).replace('admin-', ''))
    if (!Number.isFinite(adminId) || adminId <= 0) return
    setSelectedRow({ ...row, adminId })
    setForm({
      adminRole: String(row.role ?? 'HQ_STAFF'),
      status: nextStatus ?? String(row.status ?? 'ACTIVE'),
      parentAdminId: '',
      countryScope: String(row.countryScope ?? 'ALL'),
    })
    setSaveError(null)
  }

  const openGroupModal = (row: HqAdminRow) => {
    if (pageType !== 'permission-groups') return
    const roleCode = String(row.roleCode ?? row.role ?? '')
    if (!roleCode) return
    setSelectedGroup({ ...row, roleCode })
    setGroupForm({
      scope: String(row.scope ?? ''),
      status: String(row.status ?? 'ACTIVE'),
      permissions: String(row.permissions ?? '').split(',').map((item) => item.trim()).filter(Boolean).join('\n'),
    })
    setSaveError(null)
  }

  const openCountryAccessModal = (row: HqAdminRow) => {
    if (pageType !== 'country-access') return
    const adminId = Number(row.adminId ?? String(row.id).split('-')[2])
    if (!Number.isFinite(adminId) || adminId <= 0) return
    setSelectedCountryAccess({ ...row, adminId })
    setCountryAccessForm({
      countryCode: String(row.countryCode ?? 'ALL'),
      status: String(row.status ?? 'ACTIVE'),
      menuPermissions: String(row.menuPermissions ?? '').split(',').map((item) => item.trim()).filter(Boolean).join('\n'),
    })
    setSaveError(null)
  }

  const openLoginSecurityModal = (row: HqAdminRow) => {
    if (pageType !== 'login-security') return
    const policyKey = String(row.policyKey ?? row.id ?? '')
    if (!policyKey) return
    setSelectedLoginSecurity({ ...row, policyKey })
    setLoginSecurityForm({
      configValue: String(row.currentValue ?? ''),
      status: String(row.status ?? '') === '검토필요' ? 'REVIEW' : 'ACTIVE',
    })
    setSaveError(null)
  }

  const openTwoFactorModal = (row: HqAdminRow) => {
    if (pageType !== 'two-factor') return
    const policyKey = String(row.policyKey ?? row.id ?? '')
    if (!policyKey) return
    setSelectedTwoFactor({ ...row, policyKey })
    setTwoFactorForm({
      configValue: String(row.currentValue ?? ''),
      status: String(row.status ?? '') === '검토필요' ? 'REVIEW' : 'ACTIVE',
    })
    setSaveError(null)
  }

  const saveAccount = async () => {
    if (!selectedRow) return
    setIsSaving(true)
    setSaveError(null)
    try {
      await putHqPageData(`/api/hq/admin/accounts/${selectedRow.adminId}`, {
        adminRole: form.adminRole,
        status: form.status,
        parentAdminId: form.parentAdminId ? Number(form.parentAdminId) : undefined,
        countryScope: form.countryScope,
        requestId: `hq-admin-${Date.now()}`,
      })
      setSelectedRow(null)
      reload()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('hqAdmin.modal.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  const saveCountryAccess = async () => {
    if (!selectedCountryAccess) return
    const countryCode = countryAccessForm.countryCode.trim().toUpperCase() || 'ALL'
    setIsSaving(true)
    setSaveError(null)
    try {
      await putHqPageData(`/api/hq/admin/country-access/${selectedCountryAccess.adminId}/${countryCode}`, {
        status: countryAccessForm.status,
        menuPermissions: countryAccessForm.menuPermissions.split(/\n|,/).map((item) => item.trim()).filter(Boolean),
        requestId: `hq-country-access-${Date.now()}`,
      })
      setSelectedCountryAccess(null)
      reload()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('hqAdmin.countryModal.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  const saveLoginSecurity = async () => {
    if (!selectedLoginSecurity) return
    setIsSaving(true)
    setSaveError(null)
    try {
      await putHqPageData(`/api/hq/admin/login-security/${selectedLoginSecurity.policyKey}`, {
        configValue: loginSecurityForm.configValue.trim(),
        status: loginSecurityForm.status,
        requestId: `hq-login-security-${Date.now()}`,
      })
      setSelectedLoginSecurity(null)
      reload()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('hqAdmin.loginModal.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  const saveTwoFactor = async () => {
    if (!selectedTwoFactor) return
    setIsSaving(true)
    setSaveError(null)
    try {
      await putHqPageData(`/api/hq/admin/two-factor/${selectedTwoFactor.policyKey}`, {
        configValue: twoFactorForm.configValue.trim(),
        status: twoFactorForm.status,
        requestId: `hq-two-factor-${Date.now()}`,
      })
      setSelectedTwoFactor(null)
      reload()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('hqAdmin.twoFactorModal.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  const saveGroup = async () => {
    if (!selectedGroup) return
    setIsSaving(true)
    setSaveError(null)
    try {
      await putHqPageData(`/api/hq/admin/permission-groups/${selectedGroup.roleCode}`, {
        scope: groupForm.scope,
        status: groupForm.status,
        permissions: groupForm.permissions.split(/\n|,/).map((item) => item.trim()).filter(Boolean),
        requestId: `hq-permission-${Date.now()}`,
      })
      setSelectedGroup(null)
      reload()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : t('hqAdmin.permissionModal.saveError'))
    } finally {
      setIsSaving(false)
    }
  }

  const tableRows: TableRow[] = rows.map((row) => ({
    id: row.id,
    cells: Object.fromEntries(columns.map((column) => {
      if (column.key === 'status') {
        const value = String(row.status ?? row[column.key] ?? '-')
        return [column.key, <Badge accent={row.statusAccent as AccentKey ?? STATUS_ACCENT[value] ?? 'cyan'} size="md" shape="rect">{value}</Badge>]
      }
      if (column.key === 'role') {
        const value = String(row.role ?? row[column.key] ?? '-')
        return [column.key, <Badge accent="purple" size="md" shape="rect">{value}</Badge>]
      }
      if (column.key === 'action') {
        const actions = Array.isArray(row.actions) ? row.actions : [t('common.detail')]
        return [column.key, (
          <ActionBadges
            labels={actions}
            accentByLabel={ACTION_ACCENT}
            size="md"
            shape="rect"
            solid
            onLabelClick={(label) => {
              if (pageType === 'accounts') {
                openAccountModal(row, label === '정지' ? 'SUSPENDED' : label === '해제' ? 'ACTIVE' : undefined)
              } else if (pageType === 'permission-groups') {
                openGroupModal(row)
              } else if (pageType === 'country-access') {
                openCountryAccessModal(row)
              } else if (pageType === 'login-security') {
                openLoginSecurityModal(row)
              } else if (pageType === 'two-factor') {
                openTwoFactorModal(row)
              }
            }}
          />
        )]
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
        searchKeys={columns.filter((column) => column.key !== 'action').map((column) => column.key)}
        filterKeys={columns.filter((column) => ['status', 'role', 'country', 'scope', 'countryScope', 'securityStatus', 'twoFactorStatus'].includes(column.key)).map((column) => column.key)}
        mutedText
        headerBar
        wrapCells
        paginated
        pageSize={10}
      />

      {selectedRow && (
        <div className={styles.overlay} onClick={() => setSelectedRow(null)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-label={t('hqAdmin.modal.title')} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <h2 className={styles.modalTitle}>{t('hqAdmin.modal.title')}</h2>
                <p className={styles.modalDesc}>{t('hqAdmin.modal.desc')}</p>
              </div>
              <Badge accent={selectedRow.status === 'ACTIVE' ? 'green' : 'red'} size="md" shape="rect">{String(selectedRow.status ?? '-')}</Badge>
            </div>

            <dl className={styles.detailGrid}>
              <div><dt>{t('hqAdmin.col.loginId')}</dt><dd>{String(selectedRow.loginId ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.displayName')}</dt><dd>{String(selectedRow.displayName ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.email')}</dt><dd>{String(selectedRow.email ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.parentAdmin')}</dt><dd>{String(selectedRow.parentAdmin ?? '-')}</dd></div>
            </dl>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>{t('hqAdmin.modal.role')}</span>
                <select value={form.adminRole} onChange={(event) => setForm((prev) => ({ ...prev, adminRole: event.target.value }))}>
                  {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>
              <label className={styles.field}>
                <span>{t('hqAdmin.modal.status')}</span>
                <select value={form.status} onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}>
                  {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className={styles.field}>
                <span>{t('hqAdmin.modal.countryScope')}</span>
                <input value={form.countryScope} onChange={(event) => setForm((prev) => ({ ...prev, countryScope: event.target.value.toUpperCase() }))} placeholder="ALL / KR / NG" />
              </label>
              <label className={styles.field}>
                <span>{t('hqAdmin.modal.parentAdminId')}</span>
                <input value={form.parentAdminId} onChange={(event) => setForm((prev) => ({ ...prev, parentAdminId: event.target.value.replace(/\D/g, '') }))} placeholder={t('hqAdmin.modal.parentPlaceholder')} />
              </label>
            </div>

            {saveError && <p className={styles.errorText}>{saveError}</p>}

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setSelectedRow(null)}>{t('hqAdmin.modal.cancel')}</Button>
              <Button variant="primary" onClick={saveAccount} disabled={isSaving}>{isSaving ? t('common.loading') : t('hqAdmin.modal.save')}</Button>
            </div>
          </section>
        </div>
      )}

      {selectedGroup && (
        <div className={styles.overlay} onClick={() => setSelectedGroup(null)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-label={t('hqAdmin.permissionModal.title')} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <h2 className={styles.modalTitle}>{t('hqAdmin.permissionModal.title')}</h2>
                <p className={styles.modalDesc}>{t('hqAdmin.permissionModal.desc')}</p>
              </div>
              <Badge accent="purple" size="md" shape="rect">{selectedGroup.roleCode}</Badge>
            </div>

            <dl className={styles.detailGrid}>
              <div><dt>{t('hqAdmin.col.role')}</dt><dd>{selectedGroup.roleCode}</dd></div>
              <div><dt>{t('hqAdmin.col.displayName')}</dt><dd>{String(selectedGroup.displayName ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.accountCount')}</dt><dd>{String(selectedGroup.accountCount ?? '0')}</dd></div>
              <div><dt>{t('hqAdmin.col.activeCount')}</dt><dd>{String(selectedGroup.activeCount ?? '0')}</dd></div>
            </dl>

            <div className={styles.formGrid}>
              <label className={`${styles.field} ${styles.fullField}`}>
                <span>{t('hqAdmin.permissionModal.scope')}</span>
                <textarea value={groupForm.scope} onChange={(event) => setGroupForm((prev) => ({ ...prev, scope: event.target.value }))} rows={3} />
              </label>
              <label className={styles.field}>
                <span>{t('hqAdmin.permissionModal.status')}</span>
                <select value={groupForm.status} onChange={(event) => setGroupForm((prev) => ({ ...prev, status: event.target.value }))}>
                  {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className={`${styles.field} ${styles.fullField}`}>
                <span>{t('hqAdmin.permissionModal.permissions')}</span>
                <textarea value={groupForm.permissions} onChange={(event) => setGroupForm((prev) => ({ ...prev, permissions: event.target.value }))} rows={6} placeholder={t('hqAdmin.permissionModal.permissionsPlaceholder')} />
              </label>
            </div>

            {saveError && <p className={styles.errorText}>{saveError}</p>}

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setSelectedGroup(null)}>{t('hqAdmin.modal.cancel')}</Button>
              <Button variant="primary" onClick={saveGroup} disabled={isSaving}>{isSaving ? t('common.loading') : t('hqAdmin.modal.save')}</Button>
            </div>
          </section>
        </div>
      )}

      {selectedCountryAccess && (
        <div className={styles.overlay} onClick={() => setSelectedCountryAccess(null)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-label={t('hqAdmin.countryModal.title')} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <h2 className={styles.modalTitle}>{t('hqAdmin.countryModal.title')}</h2>
                <p className={styles.modalDesc}>{t('hqAdmin.countryModal.desc')}</p>
              </div>
              <Badge accent={selectedCountryAccess.status === 'ACTIVE' ? 'green' : 'red'} size="md" shape="rect">{String(selectedCountryAccess.status ?? '-')}</Badge>
            </div>

            <dl className={styles.detailGrid}>
              <div><dt>{t('hqAdmin.col.loginId')}</dt><dd>{String(selectedCountryAccess.loginId ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.displayName')}</dt><dd>{String(selectedCountryAccess.displayName ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.role')}</dt><dd>{String(selectedCountryAccess.role ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.accountStatus')}</dt><dd>{String(selectedCountryAccess.accountStatus ?? '-')}</dd></div>
            </dl>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>{t('hqAdmin.countryModal.countryCode')}</span>
                <input value={countryAccessForm.countryCode} onChange={(event) => setCountryAccessForm((prev) => ({ ...prev, countryCode: event.target.value.toUpperCase() }))} placeholder="ALL / KR / NG" />
              </label>
              <label className={styles.field}>
                <span>{t('hqAdmin.countryModal.status')}</span>
                <select value={countryAccessForm.status} onChange={(event) => setCountryAccessForm((prev) => ({ ...prev, status: event.target.value }))}>
                  {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
              <label className={`${styles.field} ${styles.fullField}`}>
                <span>{t('hqAdmin.countryModal.menuPermissions')}</span>
                <textarea value={countryAccessForm.menuPermissions} onChange={(event) => setCountryAccessForm((prev) => ({ ...prev, menuPermissions: event.target.value }))} rows={7} placeholder={t('hqAdmin.countryModal.menuPermissionsPlaceholder')} />
              </label>
            </div>

            {saveError && <p className={styles.errorText}>{saveError}</p>}

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setSelectedCountryAccess(null)}>{t('hqAdmin.modal.cancel')}</Button>
              <Button variant="primary" onClick={saveCountryAccess} disabled={isSaving}>{isSaving ? t('common.loading') : t('hqAdmin.modal.save')}</Button>
            </div>
          </section>
        </div>
      )}

      {selectedLoginSecurity && (
        <div className={styles.overlay} onClick={() => setSelectedLoginSecurity(null)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-label={t('hqAdmin.loginModal.title')} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <h2 className={styles.modalTitle}>{t('hqAdmin.loginModal.title')}</h2>
                <p className={styles.modalDesc}>{t('hqAdmin.loginModal.desc')}</p>
              </div>
              <Badge accent={selectedLoginSecurity.status === '적용중' ? 'green' : 'orange'} size="md" shape="rect">{String(selectedLoginSecurity.status ?? '-')}</Badge>
            </div>

            <dl className={styles.detailGrid}>
              <div><dt>{t('hqAdmin.col.policyName')}</dt><dd>{String(selectedLoginSecurity.policyName ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.category')}</dt><dd>{String(selectedLoginSecurity.category ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.controlRange')}</dt><dd>{String(selectedLoginSecurity.controlRange ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.recommendedValue')}</dt><dd>{String(selectedLoginSecurity.recommendedValue ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.enforcement')}</dt><dd>{String(selectedLoginSecurity.enforcement ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.impact')}</dt><dd>{String(selectedLoginSecurity.impact ?? '-')}</dd></div>
            </dl>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>{t('hqAdmin.loginModal.configValue')}</span>
                <input value={loginSecurityForm.configValue} onChange={(event) => setLoginSecurityForm((prev) => ({ ...prev, configValue: event.target.value }))} placeholder={t('hqAdmin.loginModal.configValuePlaceholder')} />
              </label>
              <label className={styles.field}>
                <span>{t('hqAdmin.loginModal.status')}</span>
                <select value={loginSecurityForm.status} onChange={(event) => setLoginSecurityForm((prev) => ({ ...prev, status: event.target.value }))}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </label>
            </div>

            {saveError && <p className={styles.errorText}>{saveError}</p>}

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setSelectedLoginSecurity(null)}>{t('hqAdmin.modal.cancel')}</Button>
              <Button variant="primary" onClick={saveLoginSecurity} disabled={isSaving}>{isSaving ? t('common.loading') : t('hqAdmin.modal.save')}</Button>
            </div>
          </section>
        </div>
      )}

      {selectedTwoFactor && (
        <div className={styles.overlay} onClick={() => setSelectedTwoFactor(null)}>
          <section className={styles.modal} role="dialog" aria-modal="true" aria-label={t('hqAdmin.twoFactorModal.title')} onClick={(event) => event.stopPropagation()}>
            <div className={styles.modalHead}>
              <div>
                <h2 className={styles.modalTitle}>{t('hqAdmin.twoFactorModal.title')}</h2>
                <p className={styles.modalDesc}>{t('hqAdmin.twoFactorModal.desc')}</p>
              </div>
              <Badge accent={selectedTwoFactor.status === '적용중' ? 'green' : 'orange'} size="md" shape="rect">{String(selectedTwoFactor.status ?? '-')}</Badge>
            </div>

            <dl className={styles.detailGrid}>
              <div><dt>{t('hqAdmin.col.policyName')}</dt><dd>{String(selectedTwoFactor.policyName ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.category')}</dt><dd>{String(selectedTwoFactor.category ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.controlRange')}</dt><dd>{String(selectedTwoFactor.controlRange ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.recommendedValue')}</dt><dd>{String(selectedTwoFactor.recommendedValue ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.enforcement')}</dt><dd>{String(selectedTwoFactor.enforcement ?? '-')}</dd></div>
              <div><dt>{t('hqAdmin.col.impact')}</dt><dd>{String(selectedTwoFactor.impact ?? '-')}</dd></div>
            </dl>

            <div className={styles.formGrid}>
              <label className={styles.field}>
                <span>{t('hqAdmin.twoFactorModal.configValue')}</span>
                <input value={twoFactorForm.configValue} onChange={(event) => setTwoFactorForm((prev) => ({ ...prev, configValue: event.target.value }))} placeholder={t('hqAdmin.twoFactorModal.configValuePlaceholder')} />
              </label>
              <label className={styles.field}>
                <span>{t('hqAdmin.twoFactorModal.status')}</span>
                <select value={twoFactorForm.status} onChange={(event) => setTwoFactorForm((prev) => ({ ...prev, status: event.target.value }))}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="REVIEW">REVIEW</option>
                  <option value="DISABLED">DISABLED</option>
                </select>
              </label>
            </div>

            {saveError && <p className={styles.errorText}>{saveError}</p>}

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={() => setSelectedTwoFactor(null)}>{t('hqAdmin.modal.cancel')}</Button>
              <Button variant="primary" onClick={saveTwoFactor} disabled={isSaving}>{isSaving ? t('common.loading') : t('hqAdmin.modal.save')}</Button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

type HqAdminRowWithAccount = HqAdminRow & { adminId: number }
type HqAdminRowWithGroup = HqAdminRow & { roleCode: string }
type HqAdminRowWithCountryAccess = HqAdminRow & { adminId: number }
type HqAdminRowWithLoginSecurity = HqAdminRow & { policyKey: string }
type HqAdminRowWithTwoFactor = HqAdminRow & { policyKey: string }
