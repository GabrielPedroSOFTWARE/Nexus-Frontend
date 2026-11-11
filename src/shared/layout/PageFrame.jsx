import { hasLocalApi } from '../api/httpClient.js'
import { AppHeader } from './AppHeader.jsx'
import { NotificationsPanel } from './NotificationsPanel.jsx'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function PageFrame({ mode, active, children, onToast, onOpenService, onOpenAccess, profileName }) {
  const [notices, setNotices] = useState(false)
  const navigate = useNavigate()
  const toast = onToast
  const openNotification = () => setNotices(value => !value)
  return <div className="app-page">
    <AppHeader mode={mode} active={active} onNotifications={openNotification} onToast={toast} profileName={profileName} />
    {!hasLocalApi && <div role="status" style={{ textAlign: 'center', background: '#fff3cd', padding: '8px', color: '#5c4700' }}>Modo demonstração: dados e ações são simulados.</div>}
    <NotificationsPanel demo={!hasLocalApi} open={notices} onClose={() => setNotices(false)} onSelect={() => { setNotices(false); (onOpenAccess || onOpenService)?.() }} />
    {children}
  </div>
}
