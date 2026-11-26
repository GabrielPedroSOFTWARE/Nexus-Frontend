import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { demoUsers } from '../../features/users/demoData.js'

export function UserManagement({ onToast }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState(demoUsers)
  const [pendingChanges, setPendingChanges] = useState({})
  const [query, setQuery] = useState('')
  const userKey = user => String(user.cpf)
  const editedUser = user => ({ ...user, ...pendingChanges[userKey(user)] })
  const stageChanges = (user, changes) => setPendingChanges(current => ({
    ...current,
    [userKey(user)]: { ...current[userKey(user)], ...changes },
  }))
  const changedUsers = users.filter(user => {
    const edited = editedUser(user)
    return user.role !== edited.role || user.admin !== edited.admin || user.active !== edited.active
  })
  const filteredUsers = users.filter(user => `${user.name} ${user.cpf}`.toLowerCase().includes(query.trim().toLowerCase()))
  const saveChanges = () => {
    if (!changedUsers.length) return
    setUsers(current => current.map(user => ({ ...user, ...pendingChanges[userKey(user)] })))
    setPendingChanges({})
    onToast('Demonstração: alterações aplicadas apenas nesta sessão.')
  }
  const cancelChanges = () => {
    setPendingChanges({})
    onToast('Alterações descartadas.')
  }

  return <PageFrame mode="admin" active="home" profileName="Admin" onToast={onToast} onOpenAccess={() => navigate('/admin/solicitacoes')}>
    <main className="page-content user-management-content">
      <h1 className="page-title user-management-title">Gestão de Usuários</h1>
      <section className="panel users-panel">
        <div className="users-toolbar"><label className="users-search"><Search size={19} /><input aria-label="Pesquisar usuário por nome ou CPF" placeholder="Pesquisar usuário por nome ou CPF" value={query} onChange={e => setQuery(e.target.value)} />{query && <button type="button" aria-label="Limpar busca" onClick={() => setQuery('')}><X size={16} /></button>}</label><button type="button" className="users-unlink-button" onClick={() => navigate('/admin/desvincular-ativo')}>Desvincular ativo</button></div>
        <div className="table-scroll users-table-scroll"><table className="users-table"><thead><tr><th>NOME</th><th>CPF</th><th>TIPO DE ACESSO</th><th>PERMISSÃO ADM</th><th>STATUS</th><th>AÇÕES</th></tr></thead><tbody>
          {filteredUsers.map(user => {
            const edited = editedUser(user)
            return <tr key={user.cpf}><td><b className="user-name-cell">{user.name}</b></td><td>{user.cpf}</td><td><select aria-label={`Tipo de acesso de ${user.name}`} value={edited.role} onChange={e => stageChanges(user, { role: e.target.value, ...(e.target.value === 'Usuário solicitante' ? { admin: false } : {}) })}><option>Usuário solicitante</option><option>Técnico / Gestor</option></select></td>
              <td><button className={`permission-toggle ${edited.admin ? 'is-enabled' : ''}`} role="switch" aria-checked={edited.admin} aria-label={`Permissão administrativa de ${user.name}`} disabled={edited.role === 'Usuário solicitante' && !edited.admin} onClick={() => stageChanges(user, { admin: !edited.admin })}><span /></button><span className="permission-label">{edited.admin ? 'Sim' : 'Não'}</span></td>
              <td><span className={`user-status ${edited.active ? 'active' : 'inactive'}`}><i />{edited.active ? 'Ativo' : 'Inativo'}</span></td><td><button className={`user-action-button ${edited.active ? 'deactivate' : 'activate'}`} onClick={() => stageChanges(user, { active: !edited.active })}>{edited.active ? 'Desativar' : 'Ativar'}</button></td></tr>
          })}
          {!filteredUsers.length && <tr><td className="users-empty" colSpan="6">Nenhum usuário encontrado.</td></tr>}
        </tbody></table></div>
        <div className="users-batch-actions">
          <p className="users-pending-count" aria-live="polite">{changedUsers.length === 1 ? '1 usuário com alteração pendente.' : changedUsers.length ? `${changedUsers.length} usuários com alterações pendentes.` : 'Nenhuma alteração pendente.'}</p>
          <div className="users-batch-buttons">
            <button className="outline-button" type="button" disabled={!changedUsers.length} onClick={cancelChanges}>Cancelar</button>
            <button className="primary-button" type="button" disabled={!changedUsers.length} onClick={saveChanges}>Salvar Alterações</button>
          </div>
        </div>
      </section>
    </main>
  </PageFrame>
}
