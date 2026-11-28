import { Avatar } from '../ui/Avatar.jsx'
import { BrandMark } from '../ui/BrandMark.jsx'
import { clearSession, loadSession } from '../api/httpClient.js'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown } from 'lucide-react'

export function AppHeader({ mode, active, onNotifications, onToast, profileName, canManageUsers, hasUnread = false, profileOpen = false, setProfileOpen = () => {} }) {
  const navigate = useNavigate()
  const isBackofficeArea = mode === 'admin'
  const session = loadSession()
  const perfil = String(session?.perfil || '').toUpperCase()
  const isAdmin = Boolean(session?.isAdmin || String(session?.admin).toLowerCase() === 'true')
  const canManage = canManageUsers ?? isAdmin
  const canSwitchArea = isBackofficeArea ? perfil === 'USER' : isAdmin || perfil === 'SUPPORT_MANAGER'
  const greetingName = profileName || (isAdmin ? 'Administrador' : perfil === 'SUPPORT_MANAGER' ? 'Técnico / Gestor' : 'Usuário')
  const nav = isBackofficeArea
    ? [
        ['Início', '/admin', 'home'],
        ['Ordens de Serviço', '/admin/ordens', 'orders'],
        ['Manutenções', '/admin/manutencoes', 'maintenance'],
      ]
    : [
        ['Início', '/home', 'home'],
        ['Meus PCs', '/meus-pcs', 'computers'],
        ['Histórico', '/historico', 'history'],
      ]

  return (
    <header className={`topbar ${isBackofficeArea ? 'topbar-admin' : ''}`}>
      <button className="brand-home" onClick={() => navigate(isBackofficeArea ? '/admin' : '/home')} aria-label="NEXUS início"><BrandMark size={110} /></button>
      <nav className="main-nav" aria-label="Navegação principal">
        {nav.map(([label, path, key]) => (
          <button key={key} className={`nav-link ${active === key ? 'is-active' : ''}`} onClick={() => navigate(path)}>{label}</button>
        ))}
      </nav>
      <div className="topbar-actions">
        <button className="bell-button" onClick={onNotifications} aria-label={hasUnread ? 'Notificações não lidas' : 'Notificações'}><Bell size={27} />{hasUnread && <span className="bell-unread-dot" aria-hidden="true" />}</button>
        <button className="profile-trigger" onClick={() => setProfileOpen(v => !v)} aria-expanded={profileOpen}>
          <Avatar admin={isBackofficeArea} />
          <span>Olá, {greetingName}!</span>
          <ChevronDown size={22} />
        </button>
      </div>
      {profileOpen && <div className="profile-menu">
        <strong>{greetingName}</strong>
        {canSwitchArea && <button onClick={() => { navigate(isBackofficeArea ? '/home' : '/admin'); setProfileOpen(false) }}>{isBackofficeArea ? 'Área do usuário' : 'Área administrativa'}</button>}
        {canManage && <>
          <button onClick={() => { navigate('/admin/usuarios'); setProfileOpen(false) }}>Gestão de usuários</button>
          <button onClick={() => { navigate('/admin/equipamentos'); setProfileOpen(false) }}>Gestão de equipamentos</button>
          <button onClick={() => { navigate('/admin/solicitacoes'); setProfileOpen(false) }}>Solicitações de acesso</button>
          <button onClick={() => { navigate('/admin/cadastro-usuario'); setProfileOpen(false) }}>Cadastrar usuário</button>
        </>}
        <button onClick={() => { clearSession(); window.dispatchEvent(new Event('nexus:logout')); navigate('/'); onToast('Sessão encerrada') }}>Sair do sistema</button>
      </div>}
    </header>
  )
}
