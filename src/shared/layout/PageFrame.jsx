import { hasLocalApi } from '../api/httpClient.js'
import { AppHeader } from './AppHeader.jsx'
import { NotificationsPanel } from './NotificationsPanel.jsx'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function PageFrame({ mode, active, children, onToast, onOpenService, onOpenAccess, profileName, canManageUsers }) {
  const [openMenu, setOpenMenu] = useState(null)
  const [hasUnread, setHasUnread] = useState(false)
  const navigate = useNavigate()
  const toast = onToast
  const openNotification = () => setOpenMenu(current => current === 'notifications' ? null : 'notifications')
  const setProfileOpen = value => setOpenMenu(current => {
  const shouldOpen = typeof value === 'function' ? value(current === 'profile') : value
  return shouldOpen ? 'profile' : null
})
  return <div className="app-page">
    <AppHeader mode={mode} active={active} onNotifications={openNotification} profileOpen={openMenu === 'profile'} setProfileOpen={setProfileOpen} onToast={toast} profileName={profileName} canManageUsers={canManageUsers} hasUnread={hasUnread} />
    {!hasLocalApi && <div role="status" style={{ textAlign: 'center', background: '#fff3cd', padding: '8px', color: '#5c4700' }}>Modo demonstração: dados e ações são simulados.</div>}
    <NotificationsPanel demo={!hasLocalApi} mode={mode} open={openMenu === 'notifications'} onUnreadChange={setHasUnread} onClose={() => setOpenMenu(null)} onSelect={() => { setOpenMenu(null); if (hasLocalApi) navigate(mode === 'admin' ? '/admin/ordens' : '/historico'); else (onOpenAccess || onOpenService)?.() }} />
    {children}
  </div>
}
