import { useEffect, useMemo, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  ChevronDown,
  ClipboardList,
  FileText,
  Handshake,
  LayoutDashboard,
  Map,
  Megaphone,
  PanelLeftClose,
  PanelLeftOpen,
  ReceiptText,
  Settings,
  ShieldCheck,
  Store,
  Users,
  WalletCards,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useTranslation } from '../../../i18n'
import type { NavGroup } from '../../../types'
import type { ProfileLine } from '../../../roles/types'
import styles from './Sidebar.module.css'

interface SidebarProps {
  basePath: string
  roleLabelKey: string
  profileLines: ProfileLine[]
  nav: NavGroup[]
  mobileOpen?: boolean
  onMobileClose?: () => void
}

const GROUP_ICONS: Record<string, LucideIcon> = {
  'nav.group.dashboard': LayoutDashboard,
  'nav.group.requests': ClipboardList,
  'nav.group.partners': Handshake,
  'nav.group.merchants': Store,
  'nav.group.transactions': ReceiptText,
  'nav.group.settlement': WalletCards,
  'nav.group.hqNotices': Megaphone,
  'nav.group.leaderNotices': Megaphone,
  'nav.group.partnerNotices': Megaphone,
  'nav.group.notices': Megaphone,
  'nav.group.settings': Settings,
  'nav.group.hqDashboard': LayoutDashboard,
  'nav.group.hqApplications': FileText,
  'nav.group.hqPartnerRequests': ClipboardList,
  'nav.group.hqLeaders': Users,
  'nav.group.hqPartners': Handshake,
  'nav.group.hqMerchants': Store,
  'nav.group.hqPaymentMonitoring': ReceiptText,
  'nav.group.hqSettlement': WalletCards,
  'nav.group.hqCollateral': WalletCards,
  'nav.group.hqRisk': AlertTriangle,
  'nav.group.hqStats': BarChart3,
  'nav.group.hqAnnouncements': Megaphone,
  'nav.group.hqAdmin': ShieldCheck,
  'nav.group.hqSystem': Settings,
  'nav.group.hqLogs': ClipboardList,
}

function normalizeCode(text: string) {
  return text.replace(/^(코드|Code)\s*:\s*/i, '').trim()
}

function splitParentLine(text: string) {
  const separatorIndex = text.indexOf(':')
  if (separatorIndex < 0) {
    return { label: null, value: text }
  }
  return {
    label: text.slice(0, separatorIndex).trim(),
    value: text.slice(separatorIndex + 1).trim(),
  }
}

export default function Sidebar({
  basePath,
  roleLabelKey,
  profileLines,
  nav,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const { pathname, search } = useLocation()
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState(false)

  const fullPath = (itemPath: string) => `${basePath}/${itemPath}`
  const allPaths = useMemo(() => nav.flatMap((group) => group.items.map((item) => fullPath(item.path))), [basePath, nav])
  const matchedActivePath = allPaths
    .filter((path) => pathname === path || pathname.startsWith(path + '/'))
    .sort((a, b) => b.length - a.length)[0]
  const searchParams = new URLSearchParams(search)
  const activePath =
    pathname === `${basePath}/leaders/sales` && searchParams.has('leaderCode')
      ? `${basePath}/leaders`
      : pathname === `${basePath}/partners/sales` && searchParams.has('partnerCode')
        ? `${basePath}/partners`
        : pathname === `${basePath}/merchants/sales` && searchParams.has('merchantCode')
          ? `${basePath}/merchants`
          : matchedActivePath
  const activeGroupKey = nav.find((group) => group.items.some((item) => fullPath(item.path) === activePath))?.titleKey
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(activeGroupKey ? [activeGroupKey] : []))

  useEffect(() => {
    if (!activeGroupKey) return
    setOpenGroups((current) => {
      if (current.has(activeGroupKey)) return current
      const next = new Set(current)
      next.add(activeGroupKey)
      return next
    })
  }, [activeGroupKey])

  const parentLine = profileLines.find((line) => line.variant === 'parent')
  const titleLine = profileLines.find((line) => line.variant === 'title')
  const codeLine = profileLines.find((line) => line.variant === 'muted')
  const parent = parentLine ? splitParentLine(parentLine.text) : null

  return (
    <>
      {mobileOpen && <button type="button" className={styles.scrim} aria-label={t('common.sidebar.closeMenu')} onClick={onMobileClose} />}
      <aside className={[styles.sidebar, collapsed && styles.collapsed, mobileOpen && styles.mobileOpen].filter(Boolean).join(' ')}>
        <div className={styles.brandRow}>
          <div className={styles.brandGroup}>
            <span className={styles.logoMark} aria-hidden="true">
              <img alt="KORION" className={styles.logoImage} src="/images/korion_b.png" />
            </span>
            {!collapsed && (
              <div className={styles.brandText}>
                <strong>{t('common.brand')}</strong>
                <span>{t(roleLabelKey)}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className={styles.collapseButton}
            aria-label={collapsed ? t('common.sidebar.expand') : t('common.sidebar.collapse')}
            onClick={() => setCollapsed((value) => !value)}
          >
            {collapsed ? <PanelLeftOpen size={16} aria-hidden="true" /> : <PanelLeftClose size={16} aria-hidden="true" />}
          </button>
          <button type="button" className={styles.mobileCloseButton} aria-label={t('common.sidebar.closeMenu')} onClick={onMobileClose}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {parent && !collapsed && (
          <div className={styles.profileParentSummary}>
            <span>{parent.label || t('sidebar.profile.parent')}</span>
            <strong>{parent.value}</strong>
          </div>
        )}

        {!collapsed && (
          <section className={styles.profileCard} aria-label={t('sidebar.profile.title')}>
            <div className={styles.profileHeader}>
              <div className={styles.profileTitleBlock}>
                <span className={styles.profileEyebrow}>{t('sidebar.profile.title')}</span>
                <strong className={styles.profilePrimary}>{titleLine?.text ?? t(roleLabelKey)}</strong>
              </div>
            </div>
            <dl className={styles.profileMeta}>
              <div className={styles.profileMetaRow}>
                <dt className={styles.profileMetaLabel}>{t('sidebar.profile.code')}</dt>
                <dd className={styles.profileMetaCode}>{normalizeCode(codeLine?.text ?? 'HQ-ADMIN-001')}</dd>
              </div>
            </dl>
          </section>
        )}

        {!collapsed && <div className={styles.allLabel}>{t('common.allList')}</div>}

        <nav className={styles.nav} aria-label={t('common.allList')}>
          {nav.map((group) => {
            const isGroupActive = group.titleKey === activeGroupKey
            const isOpen = openGroups.has(group.titleKey)
            const Icon = GROUP_ICONS[group.titleKey] ?? Map

            return (
              <div
                key={group.titleKey}
                className={[styles.group, isGroupActive && styles.groupActive, isOpen && styles.groupOpen].filter(Boolean).join(' ')}
              >
                <button
                  type="button"
                  className={[styles.groupButton, isGroupActive && styles.groupButtonActive].filter(Boolean).join(' ')}
                  aria-expanded={isOpen}
                  title={collapsed ? t(group.titleKey) : undefined}
                  onClick={() => {
                    setOpenGroups((current) => {
                      const next = new Set(current)
                      if (next.has(group.titleKey)) {
                        next.delete(group.titleKey)
                      } else {
                        next.add(group.titleKey)
                      }
                      return next
                    })
                  }}
                >
                  <Icon className={styles.groupIcon} size={18} aria-hidden="true" />
                  {!collapsed && <span className={styles.groupLabel}>{t(group.titleKey)}</span>}
                  {!collapsed && <ChevronDown className={styles.chevron} size={16} aria-hidden="true" />}
                </button>

                {!collapsed && isOpen && (
                  <div className={styles.subNav}>
                    {group.items.map((item) => {
                      const itemPath = fullPath(item.path)
                      return (
                        <NavLink
                          key={item.path}
                          to={itemPath}
                          aria-current={itemPath === activePath ? 'page' : undefined}
                          className={[styles.item, itemPath === activePath && styles.itemActive].filter(Boolean).join(' ')}
                          onClick={onMobileClose}
                        >
                          {t(item.labelKey)}
                        </NavLink>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
