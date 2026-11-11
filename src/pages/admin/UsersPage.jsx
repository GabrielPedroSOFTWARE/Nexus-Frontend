import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { demoUsers } from '../../features/users/demoData.js'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'

export function UserManagement({ onToast }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState(demoUsers)
  const [query, setQuery] = useState('')
  const filteredUsers = users.filter(user => `${user.name} ${user.login} ${user.cpf}`.toLowerCase().includes(query.trim().toLowerCase()))
  const updateUser = (login, changes) => setUsers(current => current.map(user => user.login === login ? { ...user, ...changes } : user))
  return <PageFrame mode="admin" active="home" profileName="Técnico" onToast={onToast} onOpenAccess={() => navigate('/admin/solicitacoes')}>
    <main className="page-content user-management-content">
      <h1 className="page-title user-management-title">Gestão de Usuários</h1>
      <section className="panel users-panel">
        <div className="users-toolbar"><label className="users-search"><Search size={19} /><input aria-label="Pesquisar usuário por nome, login ou CPF" placeholder="Pesquisar usuário por nome, login ou CPF" value={query} onChange={e => setQuery(e.target.value)} />{query && <button type="button" aria-label="Limpar busca" onClick={() => setQuery('')}><X size={16} /></button>}</label></div>
        <div className="table-scroll users-table-scroll"><table className="users-table"><thead><tr><th>NOME</th><th>LOGIN DE REDE</th><th>TIPO DE ACESSO</th><th>PERMISSÃO ADM</th><th>STATUS</th><th>AÇÕES</th></tr></thead><tbody>
          {filteredUsers.map(user => <tr key={user.login}><td><b className="user-name-cell">{user.name}</b></td><td>{user.login}</td><td><select aria-label={`Tipo de acesso de ${user.name}`} value={user.role} onChange={e => updateUser(user.login, { role: e.target.value })}><option>Usuário solicitante</option><option>Técnico</option><option>Gestor</option></select></td><td><button className={`permission-toggle ${user.admin ? 'is-enabled' : ''}`} role="switch" aria-checked={user.admin} aria-label={`Permissão administrativa de ${user.name}`} onClick={() => updateUser(user.login, { admin: !user.admin })}><span /></button><span className="permission-label">{user.admin ? 'Sim' : 'Não'}</span></td><td><span className={`user-status ${user.active ? 'active' : 'inactive'}`}><i />{user.active ? 'Ativo' : 'Inativo'}</span></td><td><button className={`user-action-button ${user.active ? 'deactivate' : 'activate'}`} onClick={() => { updateUser(user.login, { active: !user.active }); onToast(`${user.name} ${user.active ? 'desativado' : 'ativado'}`) }}>{user.active ? 'Desativar' : 'Ativar'}</button></td></tr>)}
          {!filteredUsers.length && <tr><td className="users-empty" colSpan="6">Nenhum usuário encontrado.</td></tr>}
        </tbody></table></div>
      </section>
    </main>
  </PageFrame>
}
