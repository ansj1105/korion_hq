import { useEffect, useState, type CSSProperties } from 'react'
import PageHeader from '../../../components/organisms/PageHeader'
import Button from '../../../components/atoms/Button'
import MetricCard from '../../../components/molecules/MetricCard'
import { useTranslation } from '../../../i18n'
import { fetchHqPageData, postHqPageData } from '../../../services/korionChongApi'
import { useNoticeSend, type HqNoticeSendRange } from './useNoticeSend'
import NoticeSendConfirm from './NoticeSendConfirm'
import styles from './NoticeSend.module.css'

interface ChipDef {
  key: string
  labelKey: string
  chip: string
}

const ROLE_CHIPS: ChipDef[] = [
  { key: 'member', labelKey: 'hqNoticeSend.role.member', chip: '#2a8bff' },
  { key: 'leader', labelKey: 'hqNoticeSend.role.leader', chip: '#7c5cff' },
  { key: 'partner', labelKey: 'hqNoticeSend.role.partner', chip: '#24e6b8' },
  { key: 'merchant', labelKey: 'hqNoticeSend.role.merchant', chip: '#22d9ff' },
]

const METHOD_CHIPS: ChipDef[] = [
  { key: 'immediate', labelKey: 'hqNoticeSend.method.immediate', chip: '#24e6b8' },
  { key: 'scheduled', labelKey: 'hqNoticeSend.method.scheduled', chip: '#7c5cff' },
]

const KPI_CHIPS: Record<string, { chip: string }> = {
  totalSent: { chip: '#24e6b8'},
  todaySent: { chip: '#7c5cff' },
  scheduledPending: { chip: '#f6c85a'},
  totalRecipients: { chip: '#2a8bff' },
  successRate: { chip: '#22d9ff' },
}

const NOTICE_TYPES = ['GENERAL', 'URGENT', 'SETTLEMENT', 'POLICY', 'MAINTENANCE', 'OPERATION', 'STORE', 'SECURITY'] as const

interface NoticeActionResponse {
  noticeId: number
  status: string
  recipientCount: number
  messageKey: string
}

interface DraftRow {
  id: number
  title: string
  noticeType: string
  body: string
  channel: string
  updatedAt: string
}

export default function NoticeSend() {
  const { t } = useTranslation()
  const [countryScope, setCountryScope] = useState('all')
  const [range, setRange] = useState<HqNoticeSendRange>('TODAY')
  const { kpis, filters, form } = useNoticeSend({ countryScope, range })

  // Figma 시안 기본 상태: 대상 역할 4종 모두 선택 + "예약 발송 선택"
  const [roles, setRoles] = useState<string[]>(ROLE_CHIPS.map((c) => c.key))
  const [method, setMethod] = useState('scheduled')
  const [confirmOpen, setConfirmOpen] = useState(false)
  // 확인 모달에 입력값을 요약 표시해야 해서 제목/예약 일시는 제어 입력으로 관리
  const [noticeTitle, setNoticeTitle] = useState(form.noticeTitle)
  const [noticeType, setNoticeType] = useState<(typeof NOTICE_TYPES)[number]>('OPERATION')
  const [noticeBody, setNoticeBody] = useState(form.noticeBody)
  const [sendDate, setSendDate] = useState(form.sendDate)
  const [sendTime, setSendTime] = useState(form.sendTime)
  const [timezone, setTimezone] = useState(form.timezone)
  const [toast, setToast] = useState('')
  const [draftsOpen, setDraftsOpen] = useState(false)
  const [drafts, setDrafts] = useState<DraftRow[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const selectedCountryLabel = filters.countryOptions.find((option) => option.value === countryScope)?.label ?? countryScope
  const metricCards = kpis.map((kpi) => ({
    id: kpi.id,
    label: kpi.label,
    value: kpi.value,
    note: kpi.delta,
    chip: KPI_CHIPS[kpi.id]?.chip ?? '#7c5cff',
  }))

  useEffect(() => {
    setNoticeTitle(form.noticeTitle)
    setNoticeBody(form.noticeBody)
    setSendDate(form.sendDate)
    setSendTime(form.sendTime)
    setTimezone(form.timezone)
  }, [form.noticeTitle, form.noticeBody, form.sendDate, form.sendTime, form.timezone])

  const getRangeLabel = (option: HqNoticeSendRange) => {
    if (option === 'ALL') return t('hqDashboard.filter.allPeriod')
    if (option === 'TODAY' || option === '1D') return t('hqDashboard.filter.today')
    return option
  }

  const toggleRole = (key: string) =>
    setRoles((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  const getScheduledAt = () => {
    if (method === 'immediate') return null
    if (!sendDate || !sendTime) return null
    return new Date(`${sendDate.replace(/\./g, '-')}T${sendTime}:00+09:00`).toISOString()
  }

  const buildPayload = () => ({
    title: noticeTitle,
    noticeType,
    body: noticeBody,
    channel: 'IN_APP',
    scheduledAt: getScheduledAt(),
    countryScope,
    targetRoles: roles.map((role) => role.toUpperCase()),
    requestId: `hq-notice-${Date.now()}`,
  })

  const showToast = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(''), 3500)
  }

  const saveDraft = async () => {
    setIsSubmitting(true)
    try {
      const response = await postHqPageData<NoticeActionResponse>('/api/hq/announcements/drafts', buildPayload())
      showToast(t(response.messageKey))
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('hqNoticeSend.toast.failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const loadDrafts = async () => {
    const nextOpen = !draftsOpen
    setDraftsOpen(nextOpen)
    if (!nextOpen) return
    try {
      const response = await fetchHqPageData<{ rows: DraftRow[] }>('/api/hq/announcements/drafts')
      setDrafts(response.rows)
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('hqNoticeSend.toast.failed'))
    }
  }

  const applyDraft = (draft: DraftRow) => {
    setNoticeTitle(draft.title)
    setNoticeType((NOTICE_TYPES.includes(draft.noticeType as (typeof NOTICE_TYPES)[number]) ? draft.noticeType : 'GENERAL') as (typeof NOTICE_TYPES)[number])
    setNoticeBody(draft.body)
    setDraftsOpen(false)
  }

  const sendNotice = async () => {
    setIsSubmitting(true)
    try {
      const response = await postHqPageData<NoticeActionResponse>('/api/hq/announcements/send', buildPayload())
      setConfirmOpen(false)
      showToast(t(response.messageKey))
    } catch (error) {
      showToast(error instanceof Error ? error.message : t('hqNoticeSend.toast.failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderChip = (c: ChipDef, selected: boolean, onClick: () => void, checkmark: boolean) => (
    <button
      key={c.key}
      type="button"
      onClick={onClick}
      style={{ '--chip': c.chip } as CSSProperties}
      className={`${styles.chip} ${styles.chipTranslucent} ${selected ? styles.chipActive : ''}`}
      aria-pressed={selected}
    >
      {checkmark && selected ? `✓ ${t(c.labelKey)}` : t(c.labelKey)}
    </button>
  )

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqNoticeSend.title')}>
        <p className={styles.pageDesc}>{t('hqNoticeSend.desc')}</p>
        <div className={styles.filterChips}>
          <label className={styles.filterSelectField}>
            <span>{t('hqNoticeSend.filter.country')}</span>
            <select className={styles.filterSelect} value={countryScope} onChange={(event) => setCountryScope(event.target.value)}>
              {filters.countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.filterSelectField}>
            <span>{t('hqNoticeSend.filter.range')}</span>
            <select className={styles.filterSelect} value={range} onChange={(event) => setRange(event.target.value as HqNoticeSendRange)}>
              {filters.rangeOptions.map((option) => (
                <option key={option} value={option}>
                  {getRangeLabel(option)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </PageHeader>

      <div className={styles.metrics}>
        {metricCards.map((metric) => (
          <MetricCard key={metric.id} {...metric} />
        ))}
      </div>

      <section className={styles.formCard}>
        <h2 className={styles.cardTitle}>{t('hqNoticeSend.form.title')}</h2>

        <div className={styles.fieldGrid}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeSend.form.sender')}</span>
            <input className={styles.input} type="text" value={form.sender} readOnly />
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeSend.form.country')}</span>
            <select className={styles.input} value={countryScope} onChange={(event) => setCountryScope(event.target.value)}>
              {filters.countryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('hqNoticeSend.form.targetRole')}</span>
          <div className={styles.chips}>
            {ROLE_CHIPS.map((c) => renderChip(c, roles.includes(c.key), () => toggleRole(c.key), true))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('hqNoticeSend.form.noticeTitle')}</span>
          <input
            className={styles.input}
            type="text"
            value={noticeTitle}
            onChange={(e) => setNoticeTitle(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('notice.send.typeLabel')}</span>
          <select className={styles.input} value={noticeType} onChange={(event) => setNoticeType(event.target.value as (typeof NOTICE_TYPES)[number])}>
            {NOTICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {t(`hqNoticeSend.type.${type}`)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>{t('hqNoticeSend.form.noticeBody')}</span>
          <textarea className={styles.textarea} value={noticeBody} onChange={(event) => setNoticeBody(event.target.value)} />
        </div>

        <div className={styles.optionRow}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('hqNoticeSend.form.sendSetting')}</span>
            <div className={styles.chips}>
              {METHOD_CHIPS.map((c) => renderChip(c, method === c.key, () => setMethod(c.key), false))}
            </div>
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>{t('notice.send.scheduleLabel')}</span>
            <div className={`${styles.scheduleFields} ${method === 'immediate' ? styles.scheduleDisabled : ''}`}>
              <input
                className={styles.schedule}
                type="text"
                aria-label={t('hqNoticeSend.form.sendDate')}
                value={sendDate}
                onChange={(e) => setSendDate(e.target.value)}
                disabled={method === 'immediate'}
              />
              <input
                className={styles.schedule}
                type="text"
                aria-label={t('hqNoticeSend.form.sendTime')}
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
                disabled={method === 'immediate'}
              />
              <input
                className={`${styles.schedule} ${styles.timezoneInput}`}
                type="text"
                aria-label={t('hqNoticeSend.form.timezone')}
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={method === 'immediate'}
              />
            </div>
          </div>
        </div>

        <div className={styles.buttons}>
          <Button variant="secondary">
            {t('hqNoticeSend.form.cancel')}
          </Button>
          <Button variant="secondary" onClick={loadDrafts}>{t('hqNoticeSend.form.draftList')}</Button>
          <Button variant="secondary" onClick={saveDraft} disabled={isSubmitting}>{t('hqNoticeSend.form.draft')}</Button>
          <Button variant="primary" onClick={() => setConfirmOpen(true)} disabled={isSubmitting}>
            {t('hqNoticeSend.form.send')}
          </Button>
        </div>
        {draftsOpen && (
          <div className={styles.draftPanel}>
            <h3 className={styles.draftTitle}>{t('hqNoticeSend.drafts.title')}</h3>
            {drafts.length ? drafts.map((draft) => (
              <button key={draft.id} type="button" className={styles.draftItem} onClick={() => applyDraft(draft)}>
                <span>{draft.title || t('hqNoticeSend.drafts.untitled')}</span>
                <small>{draft.noticeType} · {draft.updatedAt}</small>
              </button>
            )) : <span className={styles.draftEmpty}>{t('hqNoticeSend.drafts.empty')}</span>}
          </div>
        )}
      </section>

      <NoticeSendConfirm
        open={confirmOpen}
        summary={{
          noticeTitle,
          country: selectedCountryLabel,
          roles: ROLE_CHIPS.filter((c) => roles.includes(c.key)).map((c) => ({
            key: c.key,
            label: t(c.labelKey),
            accent: c.chip,
          })),
          method: t(method === 'immediate' ? 'hqNoticeSend.method.immediate' : 'hqNoticeSend.method.scheduled'),
          scheduleTime: method === 'immediate' ? '-' : `${sendDate} ${sendTime} (${timezone})`,
          sender: form.sender,
          recipients: form.recipients,
        }}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={sendNotice}
      />
      {toast && (
        <div className={styles.toast}>
          <span>{toast}</span>
          <button type="button" onClick={() => setToast('')} aria-label={t('hqNoticeSend.toast.close')}>×</button>
        </div>
      )}
    </div>
  )
}
