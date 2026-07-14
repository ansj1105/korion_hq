import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../../components/organisms/PageHeader'
import StatCard from '../../../components/molecules/StatCard'
import { useTranslation } from '../../../i18n'
import { useNoticeSend } from './useNoticeSend'
import NoticeSendConfirm from './NoticeSendConfirm'
import styles from './NoticeSend.module.css'

interface ChipDef {
  key: string
  labelKey: string
  /** 선택 시 칩 색 — Figma 실측값(#3b82f6 등)으로 토큰 accent와 다른 색조라 직접 지정 */
  accent: string
}

/* 대상 역할 칩 4종 — 회원(파랑)/리더(보라)/파트너(초록)/가맹점(시안) */
const ROLE_CHIPS: ChipDef[] = [
  { key: 'member', labelKey: 'hqNoticeSend.role.member', accent: '#3b82f6' },
  { key: 'leader', labelKey: 'hqNoticeSend.role.leader', accent: '#8b5cf6' },
  { key: 'partner', labelKey: 'hqNoticeSend.role.partner', accent: '#34d399' },
  { key: 'merchant', labelKey: 'hqNoticeSend.role.merchant', accent: '#22d3ee' },
]

/* 발송 설정 칩 — 선택된 쪽만 초록으로 강조(Figma: "예약 발송 선택"이 선택 상태) */
const METHOD_CHIPS: ChipDef[] = [
  { key: 'immediate', labelKey: 'hqNoticeSend.method.immediate', accent: '#34d399' },
  { key: 'scheduled', labelKey: 'hqNoticeSend.method.scheduled', accent: '#34d399' },
]

/*
 * NoticeSend (page) — 본사어드민 · 알림/공지 · 공지 보내기
 * ------------------------------------------------------------------
 * Figma 81:19770 기준: 제목/설명 → 국가·날짜 필터칩 → KPI 5장 →
 * "본사 전용 공지 작성" 패널(발송자/국가/대상 역할/발송 설정/예약 일시/제목/본문/버튼).
 * "발송하기" → 발송 확인 모달(81:21491) → 확정 시 발송 내역 화면으로 이동.
 */
export default function NoticeSend() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { kpis, form } = useNoticeSend()

  // Figma 시안 기본 상태: 대상 역할 4종 모두 선택 + "예약 발송 선택"
  const [roles, setRoles] = useState<string[]>(ROLE_CHIPS.map((c) => c.key))
  const [method, setMethod] = useState('scheduled')
  const [confirmOpen, setConfirmOpen] = useState(false)
  // 확인 모달에 입력값을 요약 표시해야 해서 제목/예약 일시는 제어 입력으로 관리
  const [noticeTitle, setNoticeTitle] = useState(form.noticeTitle)
  const [sendDate, setSendDate] = useState(form.sendDate)
  const [sendTime, setSendTime] = useState(form.sendTime)
  const [timezone, setTimezone] = useState(form.timezone)

  const toggleRole = (key: string) =>
    setRoles((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  const renderChip = (c: ChipDef, selected: boolean, onClick: () => void, checkmark: boolean) => (
    <button
      key={c.key}
      type="button"
      onClick={onClick}
      style={{ '--chip': c.accent } as CSSProperties}
      className={`${styles.chipToggle} ${selected ? styles.chipSelected : ''}`}
    >
      {/* 선택된 역할 칩만 ✓ 접두(Figma 표기) — 발송 설정 칩은 ✓ 없음 */}
      {checkmark && selected ? `✓ ${t(c.labelKey)}` : t(c.labelKey)}
    </button>
  )

  return (
    <div className={styles.page}>
      <PageHeader title={t('hqNoticeSend.title')}>
        <p className={styles.pageDesc}>{t('hqNoticeSend.desc')}</p>
        {/* Figma의 국가/날짜 필터칩 — 동작 없는 UI 표시만 (CLAUDE.md 1번 규칙: 인터랙션은 협의 전까지 보류) */}
        <div className={styles.filterChips}>
          <span className={styles.chip}>{t('hqDashboard.filter.allCountries')}</span>
          <span className={styles.chip}>{t('hqDashboard.filter.today')}</span>
        </div>
      </PageHeader>

      {/* 발송 현황 KPI 그리드 — Figma 실측 5열 1행 */}
      <div className={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <StatCard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* 본사 전용 공지 작성 패널 — Figma "Drawer – 공지 발송 상세"(700px 시안 테두리)를 본문 인라인 배치 */}
      <section className={styles.formPanel}>
        <h2 className={styles.formTitle}>{t('hqNoticeSend.form.title')}</h2>

        <div className={styles.fieldRow}>
          <span className={styles.rowLabel}>{t('hqNoticeSend.form.sender')}</span>
          {/* 발송자는 본사 관리자 계정 고정 표시(수정 대상 아님) */}
          <input className={`${styles.input} ${styles.inputRight}`} type="text" value={form.sender} readOnly />
        </div>

        <div className={styles.fieldRow}>
          <span className={styles.rowLabel}>{t('hqNoticeSend.form.country')}</span>
          {/* 국가 선택 — 드롭다운 UI 모양만(옵션 목록은 Figma에 없어 협의 전까지 보류) */}
          <button type="button" className={`${styles.input} ${styles.selectBox}`}>
            <span>{t('hqDashboard.filter.allCountries')}</span>
            <span className={styles.caret} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.fieldRow}>
          <span className={styles.rowLabel}>{t('hqNoticeSend.form.targetRole')}</span>
          <div className={styles.chipsRow}>
            {ROLE_CHIPS.map((c) => renderChip(c, roles.includes(c.key), () => toggleRole(c.key), true))}
          </div>
        </div>

        <div className={styles.fieldRow}>
          <span className={styles.rowLabel}>{t('hqNoticeSend.form.sendSetting')}</span>
          <div className={styles.chipsRow}>
            {METHOD_CHIPS.map((c) => renderChip(c, method === c.key, () => setMethod(c.key), false))}
          </div>
        </div>

        {/* 예약 발송 일시 — 라벨 열은 비우고 필드 열에 정렬. 즉시 발송 선택 시 비활성(흐리게) */}
        <div className={styles.fieldRow}>
          <span aria-hidden="true" />
          <div className={`${styles.scheduleFields} ${method === 'immediate' ? styles.scheduleDisabled : ''}`}>
            <div className={styles.scheduleField}>
              <span className={styles.scheduleLabel}>{t('hqNoticeSend.form.sendDate')}</span>
              <input
                className={`${styles.input} ${styles.inputCenter} ${styles.dateInput}`}
                type="text"
                value={sendDate}
                onChange={(e) => setSendDate(e.target.value)}
                disabled={method === 'immediate'}
              />
            </div>
            <div className={styles.scheduleField}>
              <span className={styles.scheduleLabel}>{t('hqNoticeSend.form.sendTime')}</span>
              <input
                className={`${styles.input} ${styles.inputCenter} ${styles.timeInput}`}
                type="text"
                value={sendTime}
                onChange={(e) => setSendTime(e.target.value)}
                disabled={method === 'immediate'}
              />
            </div>
            <div className={styles.scheduleField}>
              <span className={styles.scheduleLabel}>{t('hqNoticeSend.form.timezone')}</span>
              <input
                className={`${styles.input} ${styles.inputCenter} ${styles.timezoneInput}`}
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                disabled={method === 'immediate'}
              />
            </div>
          </div>
        </div>

        <div className={styles.stackField}>
          <span className={styles.rowLabel}>{t('hqNoticeSend.form.noticeTitle')}</span>
          <input
            className={styles.input}
            type="text"
            value={noticeTitle}
            onChange={(e) => setNoticeTitle(e.target.value)}
          />
        </div>

        <div className={styles.stackField}>
          <span className={styles.rowLabel}>{t('hqNoticeSend.form.noticeBody')}</span>
          <textarea className={styles.textarea} defaultValue={form.noticeBody} />
        </div>

        {/* 하단 버튼 — Figma는 가운데 정렬(시안 고스트 "취소" + 보라 솔리드 "발송하기") */}
        <div className={styles.buttons}>
          <button type="button" className={styles.cancelButton}>
            {t('hqNoticeSend.form.cancel')}
          </button>
          <button type="button" className={styles.sendButton} onClick={() => setConfirmOpen(true)}>
            {t('hqNoticeSend.form.send')}
          </button>
        </div>
      </section>

      {/* 발송 확인 모달 — 확정 시 발송 내역 화면으로 이동(실제 발송 API 없음, 라우팅만) */}
      <NoticeSendConfirm
        open={confirmOpen}
        summary={{
          noticeTitle,
          country: t('hqDashboard.filter.allCountries'),
          roles: ROLE_CHIPS.filter((c) => roles.includes(c.key)).map((c) => ({
            key: c.key,
            label: t(c.labelKey),
            accent: c.accent,
          })),
          method: t(method === 'immediate' ? 'hqNoticeSend.method.immediate' : 'hqNoticeSend.method.scheduled'),
          // Figma 시안: 즉시 발송이면 예약 시간 "-", 예약이면 폼의 날짜/시간/시간대를 합쳐 표시
          scheduleTime: method === 'immediate' ? '-' : `${sendDate} ${sendTime} (${timezone})`,
          sender: form.sender,
          recipients: form.recipients,
        }}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => navigate('/hq/announcements/history')}
      />
    </div>
  )
}
