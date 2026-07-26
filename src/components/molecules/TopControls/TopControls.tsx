import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCircle2, Globe2, LogOut, X } from 'lucide-react'
import { useTranslation } from '../../../i18n'
import { clearAuthSession, readAuthSession } from '../../../services/authSession'
import { fetchHqPageData } from '../../../services/korionChongApi'
import { HQ_TEST_DATA_VISIBILITY_EVENT, isHqTestDataVisible, setHqTestDataVisible } from '../../../services/hqTestData'
import styles from './TopControls.module.css'

type NotificationItem = {
  id: string
  title: string
  description: string
  time: string
  actionPath?: string
  read?: boolean
}

type NotificationResponse = {
  items?: NotificationItem[]
}

const DEFAULT_NOTIFICATIONS: NotificationItem[] = []

export default function TopControls() {
  const { lang, toggleLang, t } = useTranslation()
  const navigate = useNavigate()
  const session = readAuthSession()
  const isHq = session?.role === 'hq'
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS)
  const [showTestData, setShowTestData] = useState(isHqTestDataVisible)
  const langLabel = lang === 'ko' ? 'KR · 한국어' : 'EN · English'
  const unreadCount = useMemo(() => notifications.filter((item) => !item.read).length, [notifications])

  useEffect(() => {
    if (!isHq) return

    let cancelled = false
    fetchHqPageData<NotificationResponse>('/api/hq/notifications')
      .then((response) => {
        if (!cancelled) setNotifications(response.items ?? [])
      })
      .catch(() => {
        if (!cancelled) setNotifications([])
      })

    return () => {
      cancelled = true
    }
  }, [isHq])

  useEffect(() => {
    if (!isHq) return undefined

    const syncTestDataVisibility = () => setShowTestData(isHqTestDataVisible())
    window.addEventListener('storage', syncTestDataVisibility)
    window.addEventListener(HQ_TEST_DATA_VISIBILITY_EVENT, syncTestDataVisibility)
    return () => {
      window.removeEventListener('storage', syncTestDataVisibility)
      window.removeEventListener(HQ_TEST_DATA_VISIBILITY_EVENT, syncTestDataVisibility)
    }
  }, [isHq])

  const confirmLogout = () => {
    clearAuthSession()
    setLogoutOpen(false)
    navigate('/login')
  }

  const openNotification = (item: NotificationItem) => {
    setNotifications((items) => items.map((current) => (current.id === item.id ? { ...current, read: true } : current)))
    if (item.actionPath) {
      setNotificationOpen(false)
      navigate(item.actionPath)
    }
  }

  const toggleTestDataVisibility = () => {
    const next = !showTestData
    setHqTestDataVisible(next)
    setShowTestData(next)
    window.location.reload()
  }

  return (
    <div className={styles.controls}>
      {isHq && (
        <button
          type="button"
          className={[styles.testModeSwitch, showTestData && styles.testModeSwitchOn].filter(Boolean).join(' ')}
          role="switch"
          aria-checked={showTestData}
          aria-label={showTestData ? t('common.testMode.disable') : t('common.testMode.enable')}
          onClick={toggleTestDataVisibility}
          title={showTestData ? t('common.testMode.disable') : t('common.testMode.enable')}
        >
          <span className={styles.testModeLabel}>{t('common.testMode')}</span>
          <span className={styles.testModeTrack} aria-hidden="true">
            <span className={styles.testModeKnob} />
          </span>
          <span className={styles.testModeState}>{showTestData ? 'ON' : 'OFF'}</span>
        </button>
      )}

      <div className={styles.notificationShell}>
        <button
          type="button"
          className={`${styles.button} ${styles.iconButton}`}
          aria-label={t('common.notifications')}
          aria-expanded={notificationOpen}
          aria-haspopup="dialog"
          onClick={() => setNotificationOpen((open) => !open)}
        >
          <Bell size={16} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className={styles.badge} aria-label={t('common.notifications.count')}>
              {unreadCount}
            </span>
          )}
        </button>
        {notificationOpen && (
          <div className={styles.notificationPanel} role="dialog" aria-label={t('common.notifications.title')}>
            <div className={styles.notificationHead}>
              <div>
                <strong>{t('common.notifications.title')}</strong>
                <span>{t('common.notifications.summary')}</span>
              </div>
              <button
                type="button"
                className={styles.panelIconButton}
                aria-label={t('common.close')}
                onClick={() => setNotificationOpen(false)}
              >
                <X size={15} aria-hidden="true" />
              </button>
            </div>
            <div className={styles.notificationList}>
              {notifications.length === 0 ? (
                <div className={styles.emptyNotice}>{t('common.notifications.empty')}</div>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={[styles.notificationItem, item.read && styles.notificationItemRead].filter(Boolean).join(' ')}
                    onClick={() => openNotification(item)}
                  >
                    <span className={styles.notificationTitle}>{item.title}</span>
                    <span className={styles.notificationDesc}>{item.description}</span>
                    <span className={styles.notificationMeta}>
                      <time>{item.time}</time>
                      <span>{item.read ? t('common.notifications.confirmed') : t('common.notifications.confirm')}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <button type="button" className={styles.button} onClick={toggleLang}>
        <Globe2 size={16} aria-hidden="true" />
        <span>{langLabel}</span>
      </button>

      <button type="button" className={styles.button} onClick={() => setLogoutOpen(true)}>
        <LogOut size={16} aria-hidden="true" />
        <span>{t('common.logout')}</span>
      </button>

      {logoutOpen &&
        createPortal(
          <div className={styles.logoutOverlay} role="dialog" aria-modal="true" aria-label={t('common.logout.completeTitle')}>
            <section className={styles.logoutDialog}>
              <CheckCircle2 size={34} aria-hidden="true" />
              <h2>{t('common.logout.completeTitle')}</h2>
              <p>{t('common.logout.completeMessage')}</p>
              <button type="button" className={styles.logoutConfirmButton} onClick={confirmLogout}>
                {t('common.logout.goHome')}
              </button>
            </section>
          </div>,
          document.body,
        )}
    </div>
  )
}
