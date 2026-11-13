import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { ConnectedOrderDetails } from './ConnectedOrderDetails.jsx'
import { orderStatusLabel } from '../../shared/orderStatus.js'
import { approveUser, rejectUser, updateUser, getTotals, listOrders, listPendingUsers, listUsers, registerUser } from '../../features/admin/api.js'
import '../../styles/connected-admin.css'

const roles = { USER: 'Solicitante', SUPPORT: 'Técnico', MANAGER: 'Gestor', PENDENT: 'Pendente' }
const display = value => value == null || value === '' ? '—' : String(value)

function useRemote(loader) {
  const [state, setState] = useState({ loading: true, data: null, error: '' })
  const refresh = useCallback(async () => {
    setState(current => ({ ...current, loading: true, error: '' }))
    try { setState({ loading: false, data: await loader(), error: '' }) }
    catch (error) { setState({ loading: false, data: null, error: error.message || 'Não foi possível carregar os dados.' }) }
  }, [loader])
  useEffect(() => { refresh() }, [refresh])
  return { ...state, refresh }
}
function RemoteState({ state, empty, children }) {
  if (state.loading) return <p>Carregando...</p>
  if (state.error) return <div role="alert"><p>Não foi possível carregar os dados: {state.error}</p><button className="outline-button" onClick={state.refresh}>Tentar novamente</button></div>
  if (Array.isArray(state.data) && !state.data.length) return <p>{empty}</p>
  return children
}
function AdminPanel({ title, children }) {
  return <section className="panel connected-panel"><h2>{title}</h2>{children}</section>
}
function OrderTable({ orders, onSelect }) {
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>ORDEM</th><th>EQUIPAMENTO</th><th>USUÁRIO</th><th>STATUS</th><th>PRIORIDADE</th><th>TÉCNICO</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><button className="link-button" onClick={() => onSelect(order)}>{display(order.id)}</button></td><td>{display(order.apelido || order.idPC)}</td><td>{display(order.idUsuario)}</td><td>{orderStatusLabel(order.status)}</td><td>{order.prioridade == null ? '—' : `Código ${order.prioridade}`}</td><td>{display(order.idTecnico || order.tecnico)}</td></tr>)}</tbody></table></div>
}
function Orders({ compact = false, activeOnly = false }) {
  const state = useRemote(listOrders)
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const visible = (state.data || []).filter(order => (!activeOnly || (order.status != null && ![5, 6].includes(Number(order.status)))) && `${order.id} ${order.idUsuario} ${order.idPC}`.toLowerCase().includes(query.toLowerCase().trim()))
  return <AdminPanel title={compact ? 'Ordens de serviço' : activeOnly ? 'Manutenções ativas' : 'Ordens de serviço cadastradas'}><RemoteState state={state} empty="Nenhuma ordem encontrada.">
    <label className="connected-search">Pesquisar ordem, usuário ou equipamento<input value={query} onChange={e => setQuery(e.target.value)} /></label><OrderTable orders={compact ? visible.slice(0, 5) : visible} onSelect={setSelected} />{!visible.length && <p>Nenhuma ordem corresponde à pesquisa.</p>}
  </RemoteState>{selected && <ConnectedOrderDetails order={selected} onClose={() => setSelected(null)} onSaved={async () => { await state.refresh(); setSelected(null) }} />}</AdminPanel>
}
function Dashboard() {
  const totals = useRemote(getTotals)
  const pending = useRemote(listPendingUsers)
  return <><div className="connected-grid"><AdminPanel title="Resumo geral"><RemoteState state={totals}><p><b>Total de usuários:</b> {display(totals.data?.totalUsuarios)}</p><p><b>Total de máquinas:</b> {display(totals.data?.totalMaquinas)}</p></RemoteState><RemoteState state={pending} empty="Nenhuma solicitação pendente.">{pending.data && <p><b>Solicitações de acesso pendentes:</b> {pending.data.length}</p>}</RemoteState></AdminPanel><AdminPanel title="Indicadores"><p>Os indicadores de prazo e desempenho ainda não estão disponíveis.</p></AdminPanel></div><Orders compact /></>
}
function Pending() {
  const state = useRemote(listPendingUsers)
  const [profiles, setProfiles] = useState({})
  const [selectedId, setSelectedId] = useState('')
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const approve = async user => {
    const role = profiles[user.id] || 'USER'; setBusy(user.id); setMessage('')
    try { await approveUser(user.id, role); setMessage('Acesso liberado.'); await state.refresh() }
    catch (error) { setMessage('Não foi possível liberar o acesso: ' + error.message) }
    finally { setBusy('') }
  }
  const reject = async user => {
    if (!window.confirm('Negar a solicitação de ' + (user.nome || user.login) + '? O cadastro pendente será excluído.')) return
    setBusy(user.id); setMessage('')
    try { await rejectUser(user.id); setMessage('Solicitação negada.'); await state.refresh() }
    catch (error) { setMessage('Não foi possível negar a solicitação: ' + error.message) }
    finally { setBusy('') }
  }
  const selected = state.data?.find(user => user.id === selectedId) || state.data?.[0]
  return <RemoteState state={state} empty="Nenhuma solicitação pendente.">{selected && <div className="access-review-grid">
    <section className="panel request-details-panel"><h2 className="figma-panel-title">DADOS DA SOLICITAÇÃO</h2>
      {state.data.length > 1 && <label>Solicitação<select value={selected.id} onChange={e => setSelectedId(e.target.value)}>{state.data.map(user => <option key={user.id} value={user.id}>{display(user.nome)}</option>)}</select></label>}
      <div className="request-data-grid"><div><small>NOME</small><b>{display(selected.nome)}</b></div><div><small>LOGIN DE REDE</small><b>{display(selected.login)}</b></div><div><small>SETOR</small><b>{display(selected.setor)}</b></div><div><small>E-MAIL</small><b>{display(selected.email)}</b></div><div><small>DATA DA SOLICITAÇÃO</small><b>{display(selected.dataHoraCadastro)}</b></div><div><small>STATUS</small><span className="request-status pending">{display(selected.status)}</span></div><div className="request-justification"><small>JUSTIFICATIVA DA SOLICITAÇÃO</small><b>{display(selected.justificativa)}</b></div></div>
    </section><section className="panel access-decision-panel"><h2 className="figma-panel-title">DEFINIR ACESSO</h2><span className="access-type-label">TIPO DE ACESSO</span><div className="access-choice-list">{[['USER','Usuário solicitante'],['SUPPORT','Técnico'],['MANAGER','Gestor']].map(([value,label]) => <label className={`access-choice ${(profiles[selected.id] || 'USER') === value ? 'selected' : ''}`} key={value}><input type="radio" name="perfil" value={value} checked={(profiles[selected.id] || 'USER') === value} onChange={() => setProfiles({ ...profiles, [selected.id]: value })} /><span>{label}</span></label>)}</div><small className="access-hint">Defina o tipo de acesso antes de liberar.</small><div className="access-decision-actions"><button className="approve-access-button" disabled={!!busy} onClick={() => approve(selected)}>Liberar acesso</button><button className="deny-access-button" disabled={!!busy} onClick={() => reject(selected)}>Negar acesso</button></div>{message && <p role="status">{message}</p>}</section>
  </div>}</RemoteState>
}
function Users() {
  const state = useRemote(listUsers)
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const action = async (user, task, label) => {
    if (!window.confirm(label + ' para ' + (user.nome || user.login) + '?')) return
    setBusy(user.id); setMessage('')
    try { await task(); setMessage('Alteração salva.'); await state.refresh() }
    catch (error) { setMessage('Não foi possível salvar a alteração: ' + error.message) }
    finally { setBusy('') }
  }
  return <section className="panel users-panel"><RemoteState state={state} empty="Nenhum outro usuário encontrado."><div className="users-toolbar"><label className="users-search"><input aria-label="Pesquisar usuário por nome ou login" placeholder="Pesquisar usuário por nome ou login" value={query} onChange={e => setQuery(e.target.value)} /></label></div><div className="table-scroll users-table-scroll"><table className="users-table"><thead><tr><th>NOME</th><th>LOGIN DE REDE</th><th>TIPO DE ACESSO</th><th>PERMISSÃO ADM</th><th>STATUS</th><th>AÇÕES</th></tr></thead><tbody>{state.data?.filter(user => `${user.nome || ''} ${user.login || ''}`.toLowerCase().includes(query.trim().toLowerCase())).map(user => <tr key={user.id}><td>{display(user.nome)}</td><td>{display(user.login)}</td><td><select aria-label={`Perfil de ${user.nome || user.login}`} value={user.perfil || 'PENDENT'} disabled={!!busy} onChange={e => action(user, () => updateUser(user, { perfil: e.target.value }), 'Alterar perfil')}>
    {Object.entries(roles).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></td><td>{user.ehAdmin ? 'Sim' : 'Não'}</td><td>{display(user.status)}</td><td><button className="outline-button" disabled={!!busy} onClick={() => action(user, () => updateUser(user, { ehAdmin: !user.ehAdmin }), 'Alterar permissão administrativa')}>Alterar admin</button> <button className="outline-button" disabled={!!busy || !['Ativo','Inativo'].includes(user.status)} onClick={() => action(user, () => updateUser(user, { status: user.status === 'Ativo' ? 'Inativo' : 'Ativo' }), 'Alterar status da conta')}>{user.status === 'Ativo' ? 'Desativar' : 'Ativar'}</button></td></tr>)}</tbody></table></div></RemoteState>{message && <p role="status">{message}</p>}</section>
}
function Registration() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const submit = async event => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    setBusy(true); setMessage('')
    try {
      await registerUser({ id: crypto.randomUUID(), nome: String(data.get('nome')).trim(), login: String(data.get('login')).trim(), cpf: String(data.get('cpf')).trim(), email: String(data.get('email')).trim(), setor: String(data.get('setor')).trim(), senha: String(data.get('senha')), perfil: 'PENDENT', status: 'Aguardando análise', ehAdmin: false, versaoToken: 1 })
      form.reset(); setMessage('Cadastro enviado. A conta precisa ser aprovada na lista de solicitações.')
    } catch (error) { setMessage('Não foi possível cadastrar o usuário: ' + error.message) }
    finally { setBusy(false) }
  }
  return <AdminPanel title="Cadastro de usuário"><form className="connected-form" onSubmit={submit}>
    <label>Nome completo<input name="nome" required /></label><label>Login de rede<input name="login" required /></label><label>CPF<input name="cpf" required /></label><label>E-mail<input name="email" type="email" required /></label><label>Setor<input name="setor" required /></label><label>Senha inicial<input name="senha" type="password" autoComplete="new-password" required /></label><button className="primary-button" disabled={busy}>Cadastrar usuário</button>
  </form>{message && <p role="status">{message}</p>}</AdminPanel>
}
export function ConnectedAdmin({ pathname, onToast, profileName }) {
  const navigate = useNavigate()
  const active = pathname === '/admin/ordens' ? 'orders' : pathname === '/admin/manutencoes' ? 'maintenance' : 'home'
  return <PageFrame mode="admin" active={active} onToast={onToast} profileName={profileName} onOpenAccess={() => navigate('/admin/solicitacoes')}><main className="page-content connected-admin"><h1 className="page-title">{pathname === '/admin' ? 'Painel administrativo' : pathname === '/admin/usuarios' ? 'Gestão de usuários' : pathname === '/admin/solicitacoes' ? 'Solicitações de acesso' : pathname === '/admin/cadastro-usuario' ? 'Cadastrar usuário' : pathname === '/admin/manutencoes' ? 'Manutenções ativas' : 'Ordens de serviço'}</h1>
    {pathname === '/admin' ? <Dashboard /> : pathname === '/admin/usuarios' ? <Users /> : pathname === '/admin/solicitacoes' ? <Pending /> : pathname === '/admin/cadastro-usuario' ? <Registration /> : <Orders activeOnly={pathname === '/admin/manutencoes'} />}
  </main></PageFrame>
}
