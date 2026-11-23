import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ChevronRight, CircleAlert, ClipboardList, Clock3, FileText, ListFilter, LoaderCircle, Monitor, Search, Settings, SlidersHorizontal, TriangleAlert, UserRound, X } from 'lucide-react'
import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { ConnectedOrderDetails } from './ConnectedOrderDetails.jsx'
import { orderStatusCode, orderStatusLabel } from '../../shared/orderStatus.js'
import { approveUser, rejectUser, updateUser, getMtbf, getMttr, getTotals, listAssignedOrders, listOrders, listPendingUsers, listUsers, registerUser } from '../../features/admin/api.js'
import { buildDashboardMetrics, isOverdueOrder } from '../../features/admin/dashboardMetrics.js'
import { PasswordRequirements } from '../../features/auth/PasswordRequirements.jsx'
import { FormRequirementsNote } from '../../shared/ui/FormRequirementsNote.jsx'
import { isPasswordValid, PASSWORD_POLICY_MESSAGE } from '../../features/auth/passwordPolicy.js'
import { ConnectedDashboardCharts } from '../../features/admin/ConnectedDashboardCharts.jsx'
import { ConnectedOrdersOverview } from '../../features/admin/ConnectedOrdersOverview.jsx'
import { equipmentLabel, formatDate, formatDuration, orderMttrMinutes, priorityLabel, requesterLabel, statusTone, userNamesByCpf, visibleStatus } from '../../features/admin/orderDisplay.js'
import '../../styles/connected-admin.css'

const roles = { USER: 'Solicitante', SUPPORT_MANAGER: 'Técnico / Gestor', PENDENT: 'Pendente' }
const display = value => value == null || value === '' ? '—' : String(value)
const noPendingUsers = () => Promise.resolve([])

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
  if (state.error) return <div role="alert"><p>Não foi possível carregar os dados. Tente novamente.</p><button className="outline-button" onClick={state.refresh}>Tentar novamente</button></div>
  if (Array.isArray(state.data) && !state.data.length && empty) return <p>{empty}</p>
  return children
}
function AdminPanel({ title, children }) {
  return <section className="panel connected-panel"><h2>{title}</h2>{children}</section>
}
function OrderTable({ orders, onSelect }) {
  return <div className="table-scroll"><table className="data-table"><thead><tr><th>ORDEM</th><th>EQUIPAMENTO</th><th>USUÁRIO</th><th>STATUS</th><th>PRIORIDADE</th><th>TÉCNICO</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><button className="link-button" onClick={() => onSelect(order)}>{display(order.id)}</button></td><td>{display(order.apelido || order.idPC)}</td><td>{display(order.idUsuario)}</td><td>{orderStatusLabel(order.status)}</td><td>{order.prioridade == null ? '—' : `Código ${order.prioridade}`}</td><td>{display(order.idTecnico || order.tecnico)}</td></tr>)}</tbody></table></div>
}
function OrdersTable({ state, compact = false, activeOnly = false, isAdmin = false, title }) {
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const visible = (state.data || []).filter(order => (!activeOnly || (order.status != null && ![5, 6].includes(Number(order.status)))) && `${order.id} ${order.idUsuario} ${order.idPC}`.toLowerCase().includes(query.toLowerCase().trim()))
  return <AdminPanel title={title || (compact ? 'Ordens de serviço' : activeOnly ? 'Manutenções ativas' : 'Ordens de serviço cadastradas')}><RemoteState state={state} empty="Nenhuma ordem encontrada.">
    <label className="connected-search">Pesquisar ordem, usuário ou equipamento<input value={query} onChange={e => setQuery(e.target.value)} /></label><OrderTable orders={compact ? visible.slice(0, 5) : visible} onSelect={setSelected} />{!visible.length && <p>Nenhuma ordem corresponde à pesquisa.</p>}
  </RemoteState>{selected && <ConnectedOrderDetails order={selected} isAdmin={isAdmin} onClose={() => setSelected(null)} onSaved={async () => { await state.refresh(); setSelected(null) }} />}</AdminPanel>
}
function Orders({ compact = false, activeOnly = false, isAdmin = false, loader = listOrders, title }) {
  const state = useRemote(loader)
  return <OrdersTable state={state} compact={compact} activeOnly={activeOnly} isAdmin={isAdmin} title={title} />
}
function DashboardMetric({ icon: Icon, title, value, percentage, tone, onClick }) {
  return <article className={`metric-card metric-${tone}`}>
    <div className="metric-icon"><Icon size={35} /></div><div className="metric-value">{value}</div><p>{title}</p>
    <div className="metric-progress-row"><div className="metric-track"><i style={{ width: `${percentage}%` }} /></div></div>
    <button type="button" onClick={onClick}>Ver todas</button>
  </article>
}
function DashboardStat({ icon: Icon, label, value, onClick }) {
  const content = <><Icon aria-hidden="true" /><span>{label}</span><b>{display(value)}</b>{onClick && <ChevronRight aria-hidden="true" size={19} />}</>
  return onClick
    ? <button type="button" className="stat-row connected-dashboard-stat-link" onClick={onClick} aria-label={`${label}: ${display(value)}. Abrir gestão`}>
        {content}
      </button>
    : <div className="stat-row">{content}</div>
}
function DashboardActiveOrders({ state, isAdmin, isTechnician, onOpenOrders }) {
  const [selected, setSelected] = useState(null)
  const activeOrders = (state.data || []).filter(order => {
    const status = Number(order.status)
    return Number.isInteger(status) && status >= 0 && status <= 4
  }).slice(0, 3)
  return <section className="panel admin-active-list dashboard-active-orders">
    <div className="section-title-row"><h2>MANUTENÇÕES ATIVAS</h2><button className="admin-assigned-orders" onClick={onOpenOrders}>{isTechnician ? 'Ver O.S. atribuídas a mim' : 'Ver todas as O.S.'}</button></div>
    <RemoteState state={state}>
      <div className="table-scroll"><table className="data-table compact-table"><thead><tr><th>OS</th><th>EQUIPAMENTO</th><th>USUÁRIO</th><th>STATUS</th></tr></thead><tbody>
        {activeOrders.map(order => <tr key={order.id}><td><button className="link-button" onClick={() => setSelected(order)}>{display(order.id)}</button></td><td>{display(order.apelido || order.idPC)}</td><td>{display(order.nomeUsuario || order.usuario || 'Solicitante')}</td><td>{orderStatusLabel(order.status)}</td></tr>)}
        {!activeOrders.length && <tr><td colSpan="4">Nenhuma manutenção ativa.</td></tr>}
      </tbody></table></div>
    </RemoteState>
    {selected && <ConnectedOrderDetails order={selected} isAdmin={isAdmin} onClose={() => setSelected(null)} onSaved={async () => { await state.refresh(); setSelected(null) }} />}
  </section>
}
function DashboardAlerts({ orders, pending, isAdmin }) {
  const metrics = buildDashboardMetrics(orders.data)
  const hasAlerts = metrics.overdue > 0 || metrics.waitingForParts > 0 || metrics.canceled > 0 || (isAdmin && (pending.data || []).length > 0)
  return <section className="panel alerts-card connected-alerts-card"><h2>ALERTAS E PENDÊNCIAS</h2>
    <RemoteState state={orders}>
      {metrics.overdue > 0 && <p className="alert-line alert-red"><span className="alert-icon"><CircleAlert size={19} /></span>{metrics.overdue} O.S. atrasada(s)</p>}
      {metrics.waitingForParts > 0 && <p className="alert-line alert-orange"><span className="alert-icon"><TriangleAlert size={19} /></span>{metrics.waitingForParts} O.S. aguardando peças</p>}
      {metrics.canceled > 0 && <p className="alert-line alert-red"><span className="alert-icon"><CircleAlert size={19} /></span>{metrics.canceled} O.S. cancelada(s)</p>}
      {isAdmin && <RemoteState state={pending}>{(pending.data || []).length > 0 && <p className="alert-line alert-orange"><span className="alert-icon"><TriangleAlert size={19} /></span>{pending.data.length} solicitação(ões) de acesso pendente(s)</p>}</RemoteState>}
      {!hasAlerts && (!isAdmin || (!pending.loading && !pending.error)) && <p className="connected-no-alerts">Nenhuma pendência identificada nos dados disponíveis.</p>}
    </RemoteState>
  </section>
}
function Dashboard({ isAdmin, profile }) {
  const isTechnician = !isAdmin
  const orders = useRemote(isTechnician ? listAssignedOrders : listOrders)
  const totals = useRemote(getTotals)
  const pending = useRemote(isAdmin ? listPendingUsers : noPendingUsers)
  const mtbf = useRemote(getMtbf)
  const mttr = useRemote(getMttr)
  const navigate = useNavigate()
  const metrics = buildDashboardMetrics(orders.data)
  const percent = value => metrics.total ? Math.round(value / metrics.total * 100) : 0
  const roleLabel = isAdmin ? 'Administrador' : 'Técnico / Gestor'
  const refresh = () => { orders.refresh(); totals.refresh(); pending.refresh(); mtbf.refresh(); mttr.refresh() }
  const openOrderList = () => navigate(isTechnician ? '/admin/minhas-ordens' : '/admin/ordens')
  return <>
    <h1 className="page-title connected-dashboard-greeting">Olá, {roleLabel}! Bem-vindo ao NEXUS.</h1>
    <div className="connected-dashboard-toolbar"><span>Dados da sessão atual.</span><button className="outline-button" onClick={refresh}>Atualizar dados</button></div>
    <div className="admin-dashboard-grid connected-reference-grid">
      <section className="admin-main-column">
        <article className="panel general-summary connected-summary-panel"><div className="section-title-row"><h2>RESUMO GERAL</h2><span className="updated-chip">Dados atuais</span></div>
          <RemoteState state={orders}><div className="metric-grid">
            <DashboardMetric icon={FileText} value={metrics.total} title="Ordens de serviço no total" percentage={metrics.total ? 100 : 0} tone="blue" onClick={openOrderList} />
            <DashboardMetric icon={Settings} value={metrics.active} title="Manutenções ativas" percentage={percent(metrics.active)} tone="cyan" onClick={openOrderList} />
            <DashboardMetric icon={Clock3} value={metrics.waitingForParts} title="Aguardando peças" percentage={percent(metrics.waitingForParts)} tone="orange" onClick={openOrderList} />
            <DashboardMetric icon={CircleAlert} value={metrics.overdue} title="Atrasadas" percentage={percent(metrics.overdue)} tone="red" onClick={openOrderList} />
          </div></RemoteState>
        </article>
        <DashboardActiveOrders state={orders} isAdmin={isAdmin} isTechnician={isTechnician} onOpenOrders={openOrderList} />
        <DashboardAlerts orders={orders} pending={pending} isAdmin={isAdmin} />
      </section>
      <aside className="admin-side-column connected-dashboard-side">
        <section className="panel stats-panel connected-statistics-panel"><div className="section-title-row"><h2>ESTATÍSTICAS</h2><span className="date-chip">SESSÃO</span></div>
          <RemoteState state={totals}>
            <DashboardStat icon={UserRound} label="Total de usuários" value={totals.data?.totalUsuarios} onClick={isAdmin ? () => navigate('/admin/usuarios') : undefined} />
            <DashboardStat icon={Monitor} label="Total de máquinas" value={totals.data?.totalMaquinas} onClick={isAdmin ? () => navigate('/admin/equipamentos') : undefined} />
          </RemoteState>
        </section>
        <RemoteState state={orders}><ConnectedDashboardCharts orders={orders.data || []} mtbf={mtbf} mttr={mttr} /></RemoteState>
      </aside>
    </div>
  </>
}
function equipmentRowsFromOrders(orders) {
  const equipment = new Map()
  for (const order of Array.isArray(orders) ? orders : []) {
    const name = order.apelido || order.idPC
    if (name == null || name === '') continue
    const key = String(order.idPC ?? name)
    const current = equipment.get(key) || { key, name: String(name), orderCount: 0 }
    current.orderCount += 1
    equipment.set(key, current)
  }
  return [...equipment.values()]
}
function EquipmentManagement() {
  const totals = useRemote(getTotals)
  const orders = useRemote(listOrders)
  const rows = equipmentRowsFromOrders(orders.data)
  const refresh = () => { totals.refresh(); orders.refresh() }
  return <>
    <div className="connected-dashboard-toolbar"><span>Total de máquinas cadastradas e máquinas relacionadas a ordens de serviço.</span><button className="outline-button" onClick={refresh}>Atualizar dados</button></div>
    <section className="panel connected-panel connected-equipment-summary"><h2>Resumo de equipamentos</h2>
      <RemoteState state={totals}><div className="connected-equipment-total"><Monitor aria-hidden="true" /><span>Total de máquinas cadastradas</span><b>{display(totals.data?.totalMaquinas)}</b></div></RemoteState>
    </section>
    <section className="panel connected-panel connected-equipment-list"><h2>Equipamentos relacionados às ordens de serviço</h2>
    <RemoteState state={orders} empty="Nenhuma ordem disponível para identificar equipamentos.">
        <div className="table-scroll"><table className="data-table"><thead><tr><th>EQUIPAMENTO</th><th>ORDENS VINCULADAS</th></tr></thead><tbody>
          {rows.map(row => <tr key={row.key}><td>{row.name}</td><td>{row.orderCount}</td></tr>)}
          {!rows.length && <tr><td colSpan="2">Nenhum equipamento identificado nas ordens.</td></tr>}
        </tbody></table></div>
      </RemoteState>
    </section>
  </>
}
function ConnectedOrdersPage({ isAdmin }) {
  const orders = useRemote(isAdmin ? listOrders : listAssignedOrders)
  const [period, setPeriod] = useState(() => {
    const now = new Date()
    return { ano: now.getFullYear(), mes: now.getMonth() + 1 }
  })
  const loadMtbf = useCallback(() => getMtbf(period.ano, period.mes), [period.ano, period.mes])
  const loadMttr = useCallback(() => getMttr(period.ano, period.mes), [period.ano, period.mes])
  const mtbf = useRemote(loadMtbf)
  const mttr = useRemote(loadMttr)
  const users = useRemote(isAdmin ? listUsers : noPendingUsers)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const usersByCpf = userNamesByCpf(users.data)
  const updatePeriod = (field, value) => setPeriod(current => ({ ...current, [field]: value }))
  const visibleOrders = (orders.data || []).filter(order => {
    const matchesQuery = `${order.id || ''} ${equipmentLabel(order)} ${requesterLabel(order, usersByCpf)}`.toLowerCase().includes(query.trim().toLowerCase())
    const status = orderStatusCode(order.status)
    const matchesFilter = filter === 'all' || (filter === 'overdue' && isOverdueOrder(order)) || (filter === 'active' && status != null && status >= 0 && status <= 4) || (filter.startsWith('status:') && status === Number(filter.slice(7)))
    return matchesQuery && matchesFilter
  })
  const filterLabel = filter === 'all' ? 'Todas as ordens' : filter === 'overdue' ? 'Atrasadas' : filter === 'active' ? 'Em andamento' : visibleStatus({ status: Number(filter.slice(7)) })
  return <>
    <h1 className="page-title page-title-icon connected-orders-title"><ClipboardList aria-hidden="true" />Ordens de Serviço</h1>
    <ConnectedOrdersOverview orders={orders.data || []} ordersState={orders} mtbf={mtbf} mttr={mttr} period={period} onPeriodChange={updatePeriod} />
    <section className="panel connected-order-table-panel">
      <div className="connected-order-table-heading"><h2>Ordens de serviço</h2><div className="connected-order-controls">
        <label className="connected-order-search"><Search size={18} aria-hidden="true" /><input aria-label="Buscar ordem de serviço" placeholder="Buscar por nº da O.S., equipamento ou usuário" value={query} onChange={event => setQuery(event.target.value)} />{query && <button type="button" aria-label="Limpar busca" onClick={() => setQuery('')}><X size={16} /></button>}</label>
        <div className="connected-order-filter-wrap"><button className={`connected-order-filter-button ${filterOpen ? 'is-open' : ''}`} type="button" onClick={() => setFilterOpen(value => !value)} aria-expanded={filterOpen}><SlidersHorizontal size={17} />Filtros</button>
          {filterOpen && <div className="connected-order-filter-menu"><label>Status da ordem<select value={filter} onChange={event => setFilter(event.target.value)}><option value="all">Todas as ordens</option><option value="active">Em andamento</option><option value="overdue">Atrasadas</option>{['Recebida', 'Em diagnóstico', 'Em manutenção', 'Aguardando peças', 'Pronta para retirada', 'Concluída', 'Cancelada'].map((label, status) => <option key={status} value={`status:${status}`}>{label}</option>)}</select></label><button type="button" onClick={() => { setQuery(''); setFilter('all') }}>Limpar filtros</button></div>}
        </div>
      </div></div>
      <RemoteState state={orders} empty="Nenhuma ordem de serviço cadastrada.">
        <div className="table-scroll connected-order-table-scroll"><table className="data-table connected-order-table"><thead><tr><th>OS</th><th>EQUIPAMENTO</th><th>USUÁRIO</th><th>STATUS</th><th>PRIORIDADE</th><th>MTTR</th></tr></thead><tbody>
          {visibleOrders.map(order => <tr key={order.id}><td><button className="link-button" onClick={() => setSelected(order)}>{display(order.id)}</button></td><td>{equipmentLabel(order)}</td><td>{requesterLabel(order, usersByCpf)}</td><td><span className={`connected-order-badge tone-${statusTone(order)}`}>{visibleStatus(order)}</span></td><td><span className={`connected-order-badge ${order.prioridade == null || order.prioridade === '' ? 'priority-unknown' : `priority-${Number(order.prioridade)}`}`}>{priorityLabel(order.prioridade)}</span></td><td>{formatDuration(orderMttrMinutes(order))}</td></tr>)}
          {!visibleOrders.length && <tr><td className="connected-order-empty" colSpan="6">Nenhuma ordem corresponde aos filtros selecionados.</td></tr>}
        </tbody></table></div>
      </RemoteState>
      {filter !== 'all' && <p className="connected-filter-summary">Filtro atual: {filterLabel}</p>}
      {selected && <ConnectedOrderDetails order={selected} isAdmin={isAdmin} onClose={() => setSelected(null)} onSaved={async () => { await Promise.all([orders.refresh(), mtbf.refresh(), mttr.refresh()]); setSelected(null) }} />}
    </section>
  </>
}

function ConnectedMaintenancePage({ isAdmin }) {
  const orders = useRemote(isAdmin ? listOrders : listAssignedOrders)
  const users = useRemote(isAdmin ? listUsers : noPendingUsers)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const safeOrders = orders.data || []
  const usersByCpf = userNamesByCpf(users.data)
  const activeOrders = safeOrders.filter(order => {
    const status = orderStatusCode(order.status)
    return status != null && status >= 0 && status <= 4
  })
  const metrics = buildDashboardMetrics(safeOrders)
  const filterItems = [
    { key: 'all', label: 'Totais', value: metrics.active, Icon: ListFilter },
    { key: 'overdue', label: 'Atrasadas', value: metrics.overdue, Icon: Activity },
    { key: 'diagnosis', label: 'Em diagnóstico', value: activeOrders.filter(order => orderStatusCode(order.status) === 1).length, Icon: LoaderCircle },
    { key: 'waiting', label: 'Aguardando peças', value: activeOrders.filter(order => orderStatusCode(order.status) === 3).length, Icon: Clock3 },
  ]
  const visibleOrders = activeOrders.filter(order => {
    const status = orderStatusCode(order.status)
    const matchesFilter = filter === 'all' || (filter === 'overdue' && isOverdueOrder(order)) || (filter === 'diagnosis' && status === 1) || (filter === 'waiting' && status === 3)
    return matchesFilter
  })
  const filterDescription = filterItems.find(item => item.key === filter)?.label || 'Ativas'

  return <>
    <h1 className="page-title page-title-icon connected-orders-title"><span className="connected-maintenance-title-icon" aria-hidden="true"><Monitor /><Settings /></span>Manutenções Ativas</h1>
    <RemoteState state={orders}>
      <section className="connected-maintenance-summary" aria-label="Resumo de manutenções">
        <div className="connected-maintenance-summary-title"><Settings aria-hidden="true" /><b>MANUTENÇÕES EM ANDAMENTO</b></div>
        {filterItems.map(({ key, label, value, Icon }) => <button key={key} type="button" className={`connected-maintenance-metric ${filter === key ? 'is-selected' : ''}`} onClick={() => setFilter(key)} aria-pressed={filter === key}>
          <Icon aria-hidden="true" /><b>{value}</b><span>{label}</span>
        </button>)}
      </section>
      <section className="panel connected-order-table-panel connected-maintenance-table-panel">
        <div className="table-scroll connected-order-table-scroll"><table className="data-table connected-maintenance-table"><thead><tr><th>OS</th><th>EQUIPAMENTO</th><th>USUÁRIO</th><th>DATA INÍCIO</th><th>PRAZO</th><th>STATUS</th></tr></thead><tbody>
          {visibleOrders.map(order => <tr key={order.id}><td><button className="link-button" onClick={() => setSelected(order)}>{display(order.id)}</button></td><td>{equipmentLabel(order)}</td><td>{requesterLabel(order, usersByCpf)}</td><td>{formatDate(order.dataInicioManutencao || order.dataHoraAbertura)}</td><td>{formatDate(order.dataFinalManutencao)}</td><td><span className={`connected-order-badge tone-${statusTone(order)}`}>{visibleStatus(order)}</span></td></tr>)}
          {!visibleOrders.length && <tr><td className="connected-order-empty" colSpan="6">Nenhuma manutenção {filter === 'all' ? 'ativa' : filterDescription.toLowerCase()} encontrada.</td></tr>}
        </tbody></table></div>
        {selected && <ConnectedOrderDetails order={selected} isAdmin={isAdmin} onClose={() => setSelected(null)} onSaved={async () => { await orders.refresh(); setSelected(null) }} />}
      </section>
    </RemoteState>
  </>
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
    catch { setMessage('Não foi possível liberar o acesso. Tente novamente.') }
    finally { setBusy('') }
  }
  const reject = async user => {
    if (!window.confirm('Negar a solicitação de ' + (user.nome || user.cpfExibicao) + '? O cadastro pendente será excluído.')) return
    setBusy(user.id); setMessage('')
    try { await rejectUser(user.id); setMessage('Solicitação negada.'); await state.refresh() }
    catch { setMessage('Não foi possível negar a solicitação. Tente novamente.') }
    finally { setBusy('') }
  }
  const selected = state.data?.find(user => user.id === selectedId) || state.data?.[0]
  return <RemoteState state={state} empty="Nenhuma solicitação pendente.">{selected && <div className="access-review-grid">
    <section className="panel request-details-panel"><h2 className="figma-panel-title">DADOS DA SOLICITAÇÃO</h2>
      {state.data.length > 1 && <label>Solicitação<select value={selected.id} onChange={e => setSelectedId(e.target.value)}>{state.data.map(user => <option key={user.id} value={user.id}>{display(user.nome)}</option>)}</select></label>}
      <div className="request-data-grid"><div><small>NOME</small><b>{display(selected.nome)}</b></div><div><small>CPF</small><b>{display(selected.cpfExibicao)}</b></div><div><small>SETOR</small><b>{display(selected.setor)}</b></div><div><small>E-MAIL</small><b>{display(selected.email)}</b></div><div><small>DATA DA SOLICITAÇÃO</small><b>{display(selected.dataHoraCadastro)}</b></div><div><small>STATUS</small><span className="request-status pending">{display(selected.status)}</span></div><div className="request-justification"><small>JUSTIFICATIVA DA SOLICITAÇÃO</small><b>{display(selected.justificativa)}</b></div></div>
    </section><section className="panel access-decision-panel"><h2 className="figma-panel-title">DEFINIR ACESSO</h2><span className="access-type-label">TIPO DE ACESSO</span><div className="access-choice-list">{[['USER','Usuário solicitante'],['SUPPORT_MANAGER','Técnico / Gestor']].map(([value,label]) => <label className={`access-choice ${(profiles[selected.id] || 'USER') === value ? 'selected' : ''}`} key={value}><input type="radio" name="perfil" value={value} checked={(profiles[selected.id] || 'USER') === value} onChange={() => setProfiles({ ...profiles, [selected.id]: value })} /><span>{label}</span></label>)}</div><small className="access-hint">Defina o tipo de acesso antes de liberar.</small><div className="access-decision-actions"><button className="approve-access-button" disabled={!!busy} onClick={() => approve(selected)}>Liberar acesso</button><button className="deny-access-button" disabled={!!busy} onClick={() => reject(selected)}>Negar acesso</button></div>{message && <p role="status">{message}</p>}</section>
  </div>}</RemoteState>
}
function Users() {
  const state = useRemote(listUsers)
  const [busy, setBusy] = useState('')
  const [message, setMessage] = useState('')
  const [query, setQuery] = useState('')
  const action = async (user, task, label) => {
    if (!window.confirm(label + ' para ' + (user.nome || user.cpfExibicao) + '?')) return
    setBusy(user.id); setMessage('')
    try { await task(); setMessage('Alteração salva.'); await state.refresh() }
    catch { setMessage('Não foi possível salvar a alteração. Tente novamente.') }
    finally { setBusy('') }
  }
  const filteredUsers = (state.data || []).filter(user => `${user.nome || ''} ${user.cpfExibicao || ''}`.toLowerCase().includes(query.trim().toLowerCase()))
  return <section className="panel users-panel"><RemoteState state={state} empty="Nenhum outro usuário encontrado.">
    <div className="users-toolbar"><label className="users-search"><Search size={19} /><input aria-label="Pesquisar usuário por nome ou CPF" placeholder="Pesquisar usuário por nome ou CPF" value={query} onChange={e => setQuery(e.target.value)} />{query && <button type="button" aria-label="Limpar busca" onClick={() => setQuery('')}><X size={16} /></button>}</label></div>
    <div className="table-scroll users-table-scroll"><table className="users-table"><thead><tr><th>NOME</th><th>CPF</th><th>TIPO DE ACESSO</th><th>PERMISSÃO ADM</th><th>STATUS</th><th>AÇÕES</th></tr></thead><tbody>
      {filteredUsers.map(user => <tr key={user.id}><td><b className="user-name-cell">{display(user.nome)}</b></td><td>{display(user.cpfExibicao)}</td><td><select aria-label={`Perfil de ${user.nome || user.cpfExibicao}`} value={user.perfil || 'PENDENT'} disabled={!!busy} onChange={e => action(user, () => updateUser(user, { perfil: e.target.value }), 'Alterar perfil')}>
        {Object.entries(roles).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></td>
        <td><button className={`permission-toggle ${user.ehAdmin ? 'is-enabled' : ''}`} role="switch" aria-checked={!!user.ehAdmin} aria-label={`Permissão administrativa de ${user.nome || user.cpfExibicao}`} disabled={!!busy} onClick={() => action(user, () => updateUser(user, { ehAdmin: !user.ehAdmin }), 'Alterar permissão administrativa')}><span /></button><span className="permission-label">{user.ehAdmin ? 'Sim' : 'Não'}</span></td>
        <td><span className={`user-status ${user.status === 'Ativo' ? 'active' : user.status === 'Inativo' ? 'inactive' : ''}`}>{display(user.status)}</span></td>
        <td><button className={`user-action-button ${user.status === 'Ativo' ? 'deactivate' : 'activate'}`} disabled={!!busy || !['Ativo', 'Inativo'].includes(user.status)} onClick={() => action(user, () => updateUser(user, { status: user.status === 'Ativo' ? 'Inativo' : 'Ativo' }), 'Alterar status da conta')}>{user.status === 'Ativo' ? 'Desativar' : 'Ativar'}</button></td></tr>)}
      {!filteredUsers.length && <tr><td className="users-empty" colSpan="6">Nenhum usuário encontrado.</td></tr>}
    </tbody></table></div></RemoteState>{message && <p role="status">{message}</p>}</section>
}
function Registration() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const submit = async event => {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const password = String(data.get('senha') || '')
    const confirmPassword = String(data.get('confirmarSenha') || '')
    if (!isPasswordValid(password)) { setMessage(PASSWORD_POLICY_MESSAGE); return }
    if (password !== confirmPassword) { setMessage(''); return }
    setBusy(true); setMessage('')
    try {
      await registerUser({ nome: String(data.get('nome')).trim(), cpf: String(data.get('cpf')).trim(), email: String(data.get('email')).trim(), setor: String(data.get('setor')).trim(), senha: password, perfil: 'PENDENT', status: 'Aguardando análise', ehAdmin: false, versaoToken: 1 })
      form.reset(); setPassword(''); setConfirmPassword(''); setMessage('Cadastro enviado. A conta precisa ser aprovada na lista de solicitações.')
    } catch (error) { setMessage('Não foi possível cadastrar o usuário: ' + error.message) }
    finally { setBusy(false) }
  }
  return <AdminPanel title="Cadastro de usuário"><form className="connected-form" onSubmit={submit}>
    <FormRequirementsNote />
    <label>Nome completo <em>*</em><input name="nome" required /></label><label>CPF <em>*</em><input name="cpf" type="text" inputMode="numeric" maxLength="11" pattern="[0-9]{11}" title="Digite os 11 números do CPF." required /></label><label>E-mail <em>*</em><input name="email" type="email" required /></label><label>Setor <em>*</em><input name="setor" required /></label>
    <label>Senha inicial <em>*</em><input name="senha" type="password" autoComplete="new-password" value={password} onChange={e => { setPassword(e.target.value); setMessage('') }} required /></label>
    <PasswordRequirements value={password} />
    <label>Confirmar senha inicial <em>*</em><input name="confirmarSenha" type="password" autoComplete="new-password" aria-invalid={Boolean(confirmPassword && confirmPassword !== password)} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setMessage('') }} required /></label>
    {confirmPassword && confirmPassword !== password && <small className="password-match-warning" role="alert">As senhas não conferem.</small>}
    <button className="primary-button" disabled={busy}>Cadastrar usuário</button>
  </form>{message && <p role="status">{message}</p>}</AdminPanel>
}
export function ConnectedAdmin({ pathname, onToast, profileName, profile = '', isAdmin = false }) {
  const navigate = useNavigate()
  const active = pathname === '/admin/ordens' || pathname === '/admin/minhas-ordens' ? 'orders' : pathname === '/admin/manutencoes' ? 'maintenance' : 'home'
  const pageTitle = pathname === '/admin/usuarios' ? 'Gestão de Usuários' : pathname === '/admin/solicitacoes' ? 'Solicitações de acesso' : pathname === '/admin/cadastro-usuario' ? 'Cadastrar usuário' : pathname === '/admin/equipamentos' ? 'Equipamentos' : pathname === '/admin/minhas-ordens' ? 'Ordens atribuídas a mim' : pathname === '/admin/manutencoes' ? 'Manutenções ativas' : 'Ordens de serviço'
  return <PageFrame mode="admin" active={active} onToast={onToast} profileName={profileName} canManageUsers={isAdmin} onOpenAccess={isAdmin ? () => navigate('/admin/solicitacoes') : undefined}><main className={`page-content connected-admin ${pathname === '/admin' ? 'admin-home-content connected-admin-home' : ''}`}>
    {pathname === '/admin' ? <Dashboard isAdmin={isAdmin} profile={profile} /> : pathname === '/admin/ordens' ? <ConnectedOrdersPage isAdmin={isAdmin} /> : pathname === '/admin/manutencoes' ? <ConnectedMaintenancePage isAdmin={isAdmin} /> : <><h1 className="page-title">{pageTitle}</h1>
      {pathname === '/admin/usuarios' ? <Users /> : pathname === '/admin/solicitacoes' ? <Pending /> : pathname === '/admin/cadastro-usuario' ? <Registration /> : pathname === '/admin/equipamentos' ? <EquipmentManagement /> : <Orders isAdmin={isAdmin} loader={pathname === '/admin/minhas-ordens' || !isAdmin ? listAssignedOrders : listOrders} title={pathname === '/admin/minhas-ordens' ? 'Ordens atribuídas a mim' : undefined} />}
    </>}
  </main></PageFrame>
}
