import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { ORDER_STATUS_STEPS, orderStatusCode, orderStatusLabel } from '../../shared/orderStatus.js'
import { approveUser, assignTechnician, changeOrderStatus, changeUserProfile, getTotals, listOrders, listPendingUsers, listUsers, registerUser, toggleUserAdmin, toggleUserStatus } from '../../features/admin/api.js'
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
function OrderDetails({ order, onClose, onSaved }) {
  const [status, setStatus] = useState('')
  const [observation, setObservation] = useState('')
  const [description, setDescription] = useState('')
  const [technician, setTechnician] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const downloadAttachment = () => {
    try {
      const bytes = Uint8Array.from(atob(order.foto), char => char.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }))
      const link = document.createElement('a'); link.href = url; link.download = 'anexo.bin'; link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch { setMessage('Não foi possível abrir o anexo.') }
  }
  const saveStatus = async event => {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      await changeOrderStatus(order.id, { novoStatusId: status, observacao: observation, descricao: description })
      setMessage('Status atualizado.'); await onSaved()
    } catch (error) { setMessage('Não foi possível alterar o status: ' + error.message) }
    finally { setBusy(false) }
  }
  const saveTechnician = async event => {
    event.preventDefault(); setBusy(true); setMessage('')
    try { await assignTechnician(order.id, technician.trim()); setMessage('Técnico atribuído.'); await onSaved() }
    catch (error) { setMessage('Não foi possível atribuir o técnico: ' + error.message) }
    finally { setBusy(false) }
  }
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}><section className="connected-dialog" role="dialog" aria-modal="true" aria-label="Detalhes da ordem">
    <div className="section-title-row"><h2>Ordem {display(order.id)}</h2><button type="button" className="outline-button" onClick={onClose}>Fechar</button></div>
    <p><b>Equipamento:</b> {display(order.apelido || order.idPC)} &nbsp; <b>Usuário:</b> {display(order.idUsuario)}</p>
    <p><b>Problema:</b> {display(order.problema)} &nbsp; <b>Status:</b> {orderStatusLabel(order.status)}</p>
    <p><b>Técnico:</b> {display(order.idTecnico || order.tecnico)} &nbsp; <b>Observação:</b> {display(order.observacoesTecnico)}</p>
    <div className="timeline" aria-label="Etapas da manutenção">{ORDER_STATUS_STEPS.map((step, index) => <div className={`timeline-step ${orderStatusCode(order.status) === index ? 'timeline-current reached' : ''}`} key={step} aria-current={orderStatusCode(order.status) === index ? 'step' : undefined}><span /><div><b>{step}</b>{index === 3 && <small>Opcional: se faltar peça</small>}</div></div>)}</div>
    {order.foto && <p><button type="button" className="outline-button" onClick={downloadAttachment}>Baixar anexo</button></p>}
    <form onSubmit={saveStatus} className="connected-form"><h3>Alterar status</h3><label>Status<select aria-label="Status" required value={status} onChange={e => setStatus(e.target.value)}><option value="">Selecione o status</option>{ORDER_STATUS_STEPS.map((label, code) => <option key={code} value={String(code)}>{label}</option>)}</select></label>{status === '1' && <label>Observação<input required value={observation} onChange={e => setObservation(e.target.value)} /></label>}{status === '5' && <label>Descrição da conclusão<input required value={description} onChange={e => setDescription(e.target.value)} /></label>}<button className="primary-button" disabled={busy}>Salvar status</button></form>
    <form onSubmit={saveTechnician} className="connected-form"><h3>Atribuir técnico</h3><label>Identificador do técnico<input required value={technician} onChange={e => setTechnician(e.target.value)} /></label><button className="primary-button" disabled={busy}>Atribuir técnico</button></form>
    {message && <p role="status">{message}</p>}
  </section></div>
}
function Orders({ compact = false, activeOnly = false }) {
  const state = useRemote(listOrders)
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const visible = (state.data || []).filter(order => (!activeOnly || (order.status != null && ![5, 6].includes(Number(order.status)))) && `${order.id} ${order.idUsuario} ${order.idPC}`.toLowerCase().includes(query.toLowerCase().trim()))
  return <AdminPanel title={compact ? 'Ordens de serviço' : activeOnly ? 'Manutenções ativas' : 'Ordens de serviço cadastradas'}><RemoteState state={state} empty="Nenhuma ordem encontrada.">
    <label className="connected-search">Pesquisar ordem, usuário ou equipamento<input value={query} onChange={e => setQuery(e.target.value)} /></label><OrderTable orders={compact ? visible.slice(0, 5) : visible} onSelect={setSelected} />{!visible.length && <p>Nenhuma ordem corresponde à pesquisa.</p>}
  </RemoteState>{selected && <OrderDetails order={selected} onClose={() => setSelected(null)} onSaved={async () => { await state.refresh(); setSelected(null) }} />}</AdminPanel>
}
function Dashboard() {
  const totals = useRemote(getTotals)
  const pending = useRemote(listPendingUsers)
  return <><div className="connected-grid"><AdminPanel title="Resumo geral"><RemoteState state={totals}><p><b>Total de usuários:</b> {display(totals.data?.totalUsuarios)}</p><p><b>Total de máquinas:</b> {display(totals.data?.totalMaquinas)}</p></RemoteState><RemoteState state={pending} empty="Nenhuma solicitação pendente.">{pending.data && <p><b>Solicitações de acesso pendentes:</b> {pending.data.length}</p>}</RemoteState></AdminPanel><AdminPanel title="Indicadores"><p>Os indicadores de prazo e desempenho ainda não estão disponíveis.</p></AdminPanel></div><Orders compact /></>
}
function Pending() {
  const state = useRemote(listPendingUsers)
  const [profiles, setProfiles] = useState({})
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const approve = async user => {
    const role = profiles[user.id] || 'USER'; setBusy(user.id); setMessage('')
    try { await approveUser(user.id, role); setMessage('Acesso liberado.'); await state.refresh() }
    catch (error) { setMessage('Não foi possível liberar o acesso: ' + error.message) }
    finally { setBusy('') }
  }
  return <AdminPanel title="Solicitações de acesso"><RemoteState state={state} empty="Nenhuma solicitação pendente.">{state.data?.map(user => <article key={user.id} className="connected-user"><h3>{display(user.nome)}</h3><p>Login: {display(user.login)} · E-mail: {display(user.email)} · Setor: {display(user.setor)}</p><p>Justificativa: {display(user.justificativa)}</p><label>Perfil <select value={profiles[user.id] || 'USER'} onChange={e => setProfiles({ ...profiles, [user.id]: e.target.value })}><option value="USER">Solicitante</option><option value="SUPPORT">Técnico</option><option value="MANAGER">Gestor</option></select></label> <button className="primary-button" disabled={!!busy} onClick={() => approve(user)}>Liberar acesso</button></article>)}</RemoteState>{message && <p role="status">{message}</p>}<p>O backend não disponibiliza uma operação de negar solicitação.</p></AdminPanel>
}
function Users() {
  const state = useRemote(listUsers)
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const action = async (user, task, label) => {
    if (!window.confirm(label + ' para ' + (user.nome || user.login) + '?')) return
    setBusy(user.id); setMessage('')
    try { await task(); setMessage('Alteração salva.'); await state.refresh() }
    catch (error) { setMessage('Não foi possível salvar a alteração: ' + error.message) }
    finally { setBusy('') }
  }
  return <AdminPanel title="Gestão de usuários"><RemoteState state={state} empty="Nenhum outro usuário encontrado."><div className="table-scroll"><table className="data-table"><thead><tr><th>NOME</th><th>LOGIN</th><th>PERFIL</th><th>ADMIN</th><th>STATUS</th><th>AÇÕES</th></tr></thead><tbody>{state.data?.map(user => <tr key={user.id}><td>{display(user.nome)}</td><td>{display(user.login)}</td><td><select aria-label={`Perfil de ${user.nome || user.login}`} value={user.perfil || 'PENDENT'} disabled={!!busy} onChange={e => action(user, () => changeUserProfile(user.id, e.target.value), 'Alterar perfil')}>
    {Object.entries(roles).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></td><td>{user.ehAdmin ? 'Sim' : 'Não'}</td><td>{display(user.status)}</td><td><button className="outline-button" disabled={!!busy} onClick={() => action(user, () => toggleUserAdmin(user.id), 'Alterar permissão administrativa')}>Alterar admin</button> <button className="outline-button" disabled={!!busy || !['Ativo','Inativo'].includes(user.status)} onClick={() => action(user, () => toggleUserStatus(user.id), 'Alterar status da conta')}>{user.status === 'Ativo' ? 'Desativar' : 'Ativar'}</button></td></tr>)}</tbody></table></div></RemoteState>{message && <p role="status">{message}</p>}</AdminPanel>
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
