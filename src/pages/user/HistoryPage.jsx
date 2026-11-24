import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckCircle2, Clock3, History, ListFilter } from 'lucide-react'
import { listUserOrders } from '../../features/service-requests/api.js'
import { getRequestDetails } from '../../features/service-requests/frequency.js'
import { hasLocalApi } from '../../shared/api/httpClient.js'
import { orderStatusCode, orderStatusLabel } from '../../shared/orderStatus.js'
import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { StatusPill } from '../../shared/ui/StatusPill.jsx'

function historyTimestamp(order) {
  const value = order?.dataHoraAbertura || order?.dataInicioManutencao || order?.dataManutencao
  const timestamp = value ? Date.parse(value) : Number.NaN
  return Number.isFinite(timestamp) ? timestamp : 0
}

function formatHistoryDate(value) {
  if (typeof value !== 'string' || !value) return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value
}

function historyStatusType(value) {
  const types = ['active', 'diagnosis', 'maintenance', 'waiting', 'ready', 'done', 'cancelled']
  const code = orderStatusCode(value)
  return code == null ? 'active' : types[code] || 'active'
}

function formatEquipmentId(value) {
  if (value == null || value === '') return '—'
  return /^\d+$/.test(String(value)) ? String(value).padStart(3, '0') : String(value)
}

function toHistoryCard(order, index) {
  const details = getRequestDetails(order)
  const hasTechnician = order.cpfTecnicoDescriptografado || order.cpfTecnico || order.idTecnico
  return {
    key: order.id || `${order.idPC || 'pc'}-${index}`,
    equipmentId: formatEquipmentId(order.idPC),
    nickname: order.apelido || '—',
    status: orderStatusLabel(order.status),
    statusType: historyStatusType(order.status),
    problem: details.problem,
    date: formatHistoryDate(order.dataInicioManutencao || order.dataManutencao || order.dataHoraAbertura),
    technician: order.tecnico || order.nomeTecnico || (hasTechnician ? 'Técnico atribuído' : 'Não atribuído'),
    statusCode: orderStatusCode(order.status),
  }
}

const demoOrders = [
  { id: 'OS-2026-0010', idPC: '001', apelido: 'Desktop de usuário', status: 2, problema: 'Troca de SSD', dataInicioManutencao: '', cpfTecnico: 'tecnico-designado' },
  { id: 'OS-2026-0009', idPC: '001', apelido: 'Desktop de usuário', status: 5, problema: 'Lentidão', dataInicioManutencao: '2026-05-30', tecnico: 'João Silva' },
  { id: 'OS-2026-0008', idPC: '001', apelido: 'Desktop de usuário', status: 5, problema: 'Não liga', dataInicioManutencao: '2026-04-12', tecnico: 'Carlos Costa' },
]

function HistorySummary({ total, completed, inProgress }) {
  const metrics = [
    { label: 'Totais', value: total, Icon: ListFilter, tone: 'total' },
    { label: 'Concluídas', value: completed, Icon: CheckCircle2, tone: 'completed' },
    { label: 'Em andamento', value: inProgress, Icon: Clock3, tone: 'in-progress' },
  ]
  return <section className="history-summary" aria-label="Resumo do histórico">
    <div className="history-summary-title"><ListFilter aria-hidden="true" /><b>Resumo de Histórico</b></div>
    <div className="history-summary-metrics">
      {metrics.map(({ label, value, Icon, tone }) => <div className={`history-summary-card ${tone}`} key={label}>
        <Icon aria-hidden="true" /><b>{value}</b><span>{label}</span>
      </div>)}
    </div>
  </section>
}

function HistoryCard({ item }) {
  return <article className="history-card">
    <div className="history-field"><span className="history-field-label">PC ID</span><span className="history-field-value">{item.equipmentId}</span></div>
    <div className="history-field"><span className="history-field-label">Apelido</span><span className="history-field-value">{item.nickname}</span></div>
    <div className="history-field"><span className="history-field-label">Status</span><span className="history-field-value"><StatusPill type={item.statusType}>{item.status}</StatusPill></span></div>
    <div className="history-field history-problem-field"><span className="history-field-label">Problema</span><span className="history-field-value">{item.problem}</span></div>
    <div className="history-field"><span className="history-field-label">Data</span><span className="history-field-value">{item.date}</span></div>
    <div className="history-field"><span className="history-field-label">Técnico</span><span className="history-field-value">{item.technician}</span></div>
  </article>
}

export function HistoryPage({ profileName }) {
  const [searchParams] = useSearchParams()
  const equipmentId = searchParams.get('equipamento')
  const [apiHistory, setApiHistory] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!hasLocalApi) return undefined
    let active = true
    listUserOrders()
      .then(items => { if (active) { if (!Array.isArray(items)) throw new Error('Resposta inválida do backend.'); setApiHistory(items) } })
      .catch(err => { if (active) setError(err.message || 'Não foi possível carregar o histórico.') })
    return () => { active = false }
  }, [])

  const orders = hasLocalApi
    ? (apiHistory || []).filter(order => !equipmentId || String(order.idPC) === equipmentId).slice().sort((a, b) => historyTimestamp(b) - historyTimestamp(a))
    : demoOrders
  const history = orders.map(toHistoryCard)
  const completed = history.filter(item => item.statusCode === 5).length
  const inProgress = history.filter(item => item.statusCode != null && item.statusCode >= 0 && item.statusCode <= 4).length

  return <PageFrame mode="user" active="history" profileName={profileName}>
    <main className="page-content history-content">
      <header className="history-title page-title-icon">
        <History aria-hidden="true" />
        <h1 className="page-title">{equipmentId && hasLocalApi ? `Histórico do equipamento ${equipmentId}` : 'Histórico de manutenções'}</h1>
      </header>
      {error
        ? <p role="alert">Não foi possível carregar o histórico.</p>
        : hasLocalApi && apiHistory === null
          ? <p>Carregando histórico...</p>
          : <>
            <HistorySummary total={history.length} completed={completed} inProgress={inProgress} />
            {!history.length
              ? <p className="history-empty">Nenhuma manutenção encontrada.</p>
              : <div className="history-list">{history.map(item => <HistoryCard item={item} key={item.key} />)}</div>}
          </>}
    </main>
  </PageFrame>
}
