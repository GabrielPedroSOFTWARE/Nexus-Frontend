import { Avatar } from '../ui/Avatar.jsx'
import { BrandMark } from '../ui/BrandMark.jsx'
import { clearSession, hasLocalApi, loadSession } from '../api/httpClient.js'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ChevronDown } from 'lucide-react'

export function AppHeader({ mode, active, onNotifications, onToast, profileName }) {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const isAdmin = mode === 'admin'
  const greetingName = profileName || (isAdmin ? 'Admin' : 'Usuário')
  const nav = isAdmin
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
    <header className={`topbar ${isAdmin ? 'topbar-admin' : ''}`}>
      <button className="brand-home" onClick={() => navigate(isAdmin ? '/admin' : '/home')} aria-label="NEXUS início"><BrandMark size={110} /></button>
      <nav className="main-nav" aria-label="Navegação principal">
        {nav.map(([label, path, key]) => (
          <button key={key} className={`nav-link ${active === key ? 'is-active' : ''}`} onClick={() => navigate(path)}>{label}</button>
        ))}
      </nav>
      <div className="topbar-actions">
        <button className="bell-button" onClick={onNotifications} aria-label="Notificações"><Bell size={27} />{isAdmin && !hasLocalApi && <i>3</i>}</button>
        <button className="profile-trigger" onClick={() => setProfileOpen(v => !v)} aria-expanded={profileOpen}>
          <Avatar admin={isAdmin} />
          <span>Olá, {greetingName}!</span>
          <ChevronDown size={22} />
        </button>
      </div>
      {profileOpen && <div className="profile-menu">
        <strong>{greetingName === 'Admin' ? 'Administrador' : greetingName === 'Técnico' ? 'Técnico' : 'Solicitante'}</strong>
        {(isAdmin || loadSession()?.isAdmin) && <button onClick={() => { navigate(isAdmin ? '/home' : '/admin'); setProfileOpen(false) }}>{isAdmin ? 'Área do usuário' : 'Área administrativa'}</button>}
        {isAdmin && <>
          <button onClick={() => { navigate('/admin/usuarios'); setProfileOpen(false) }}>Gestão de usuários</button>
          <button onClick={() => { navigate('/admin/solicitacoes'); setProfileOpen(false) }}>Solicitações de acesso</button>
          <button onClick={() => { navigate('/admin/cadastro-usuario'); setProfileOpen(false) }}>Cadastrar usuário</button>
        </>}
        <button onClick={() => { clearSession(); window.dispatchEvent(new Event('nexus:logout')); navigate('/'); onToast('Sessão encerrada') }}>Sair do sistema</button>
      </div>}
    </header>
  )
}
