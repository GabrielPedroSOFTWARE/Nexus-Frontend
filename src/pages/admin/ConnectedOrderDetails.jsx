import { useEffect, useState } from 'react'
import { Check, ChevronDown, ClipboardList, History, Paperclip, RefreshCw, X } from 'lucide-react'
import { apiRequest } from '../../shared/api/httpClient.js'
import { getRequestDetails } from '../../features/service-requests/frequency.js'
import { ORDER_STATUS_STEPS, orderStatusCode, orderStatusLabel } from '../../shared/orderStatus.js'
import { assignTechnician, changeOrderStatus, listUsers } from '../../features/admin/api.js'

const display = value => value == null || value === '' ? 'Não informado' : String(value)
const date = value => value ? String(value).slice(0, 10).split('-').reverse().join('/') : 'Não informado'

export function ConnectedOrderDetails({ order, onClose, onSaved }) {
  const details = getRequestDetails(order)
  const [users, setUsers] = useState([])
  const [history, setHistory] = useState(null)
  const [equipmentHistory, setEquipmentHistory] = useState(null)
  const [historyError, setHistoryError] = useState('')
  const [status, setStatus] = useState('')
  const [observation, setObservation] = useState('')
  const [description, setDescription] = useState('')
  const [technician, setTechnician] = useState('')
  const [assignOpen, setAssignOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    let active = true
    listUsers().then(data => { if (active) setUsers(data) }).catch(() => { if (active) setMessage('Não foi possível carregar os usuários e técnicos.') })
    apiRequest('/retornar-historico-pedido-alt/' + encodeURIComponent(order.id))
      .then(data => { if (active) setHistory(Array.isArray(data) ? data : []) })
      .catch(() => { if (active) setHistoryError('Não foi possível carregar o histórico de alterações.') })
    return () => { active = false }
  }, [order.id])
  const client = users.find(user => user.id === order.idUsuario)
  const technicians = users.filter(user => ['SUPPORT', 'MANAGER'].includes(user.perfil) && user.status === 'Ativo')
  const selectedStatus = orderStatusCode(order.status)
  const downloadAttachment = () => {
    try {
      const bytes = Uint8Array.from(atob(order.foto), char => char.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes], { type: order.tipoArquivoFoto || 'application/octet-stream' }))
      const link = document.createElement('a'); link.href = url; link.download = order.nomeArquivoFoto || 'anexo.bin'; link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch { setMessage('Não foi possível abrir o anexo.') }
  }
  const saveStatus = async event => {
    event.preventDefault(); setBusy(true); setMessage('')
    try { await changeOrderStatus(order.id, { novoStatusId: status, observacao: observation, descricao: description }); await onSaved() }
    catch (error) { setMessage('Não foi possível alterar o status: ' + error.message) }
    finally { setBusy(false) }
  }
  const saveTechnician = async event => {
    event.preventDefault(); setBusy(true); setMessage('')
    try { await assignTechnician(order.id, technician); await onSaved() }
    catch (error) { setMessage('Não foi possível atribuir o técnico: ' + error.message) }
    finally { setBusy(false) }
  }
  const loadEquipmentHistory = async () => {
    if (order.idPC == null) return
    try { const data = await apiRequest('/listar-pedidos-equipamento/' + encodeURIComponent(order.idPC)); setEquipmentHistory(Array.isArray(data) ? data : []) }
    catch (error) { setMessage('Não foi possível consultar o histórico do equipamento: ' + error.message) }
  }
  return <div className="modal-backdrop service-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <section className="service-modal" role="dialog" aria-modal="true" aria-label="Detalhes da ordem">
      <div className="service-modal-heading"><span className="modal-icon"><ClipboardList size={26} /></span><div className="service-title-group"><small>ORDEM DE SERVIÇO</small><h2>{display(order.id)}</h2></div><span className="frequency-chip">Prioridade · {order.prioridade == null ? 'Não informada' : `Código ${order.prioridade}`}</span><span className="date-chip">Início &nbsp; {date(order.dataInicioManutencao)}</span><span className="date-chip">Prazo &nbsp; {date(order.dataFinalManutencao)}</span><button className="assign-technician-button" onClick={() => setAssignOpen(true)}>Atribuir técnico</button><button type="button" onClick={onClose} aria-label="Fechar"><X /></button></div>
      <div className="service-modal-body"><div className="service-detail-column">
        <article className="detail-card client-card"><h3>CLIENTE</h3><div className="detail-grid"><p><small>NOME</small><b>{display(client?.nome)}</b></p><p><small>SETOR</small><b>{display(client?.setor)}</b></p><p><small>TELEFONE</small><b>{display(client?.telefone)}</b></p><p><small>CPF</small><b>Não informado</b></p></div></article>
        <article className="detail-card specs-card"><h3>ESPECIFICAÇÕES DA MÁQUINA</h3><div className="detail-grid spec-grid"><p><small>MODELO</small><b>Não informado</b></p><p><small>PATRIMÔNIO</small><b>Não informado</b></p><p><small>SISTEMA OPERACIONAL</small><b>Não informado</b></p><p><small>ARMAZENAMENTO</small><b>Não informado</b></p><p><small>EQUIPAMENTO</small><b>{display(order.apelido || order.idPC)}</b></p><p><small>CPU</small><b>Não informado</b></p><p><small>MEMÓRIA RAM</small><b>Não informado</b></p><p><small>GPU</small><b>Não informado</b></p></div><button type="button" className="equipment-history-link" disabled={order.idPC == null} onClick={loadEquipmentHistory}><History size={16} />Consultar Histórico de Manutenções</button></article>
        {equipmentHistory && <article className="detail-card"><h3>HISTÓRICO DE MANUTENÇÕES</h3>{equipmentHistory.length ? equipmentHistory.map(item => <p key={item.id}>{display(item.id)} · {orderStatusLabel(item.status)} · {date(item.dataInicioManutencao)}</p>) : <p>Nenhuma manutenção encontrada.</p>}</article>}
        <article className="detail-card problem-card"><div className="section-title-row"><h3>PROBLEMA RELATADO</h3><span className="frequency-chip">Frequência &nbsp; {details.frequency || 'Não informada'}</span></div><p>{details.problem}</p></article>
        <article className="detail-card observations-card"><h3>OBSERVAÇÕES DO TÉCNICO</h3><p>{order.observacoesTecnico || 'Nenhuma observação registrada até o momento.'}</p></article>
        <article className="detail-card attachments-card"><h3>ANEXOS</h3>{order.foto ? <button type="button" onClick={downloadAttachment}><Paperclip size={23} />{order.nomeArquivoFoto || 'Baixar anexo'}</button> : <p>Nenhum anexo.</p>}</article>
      </div><aside className="service-status-column"><h3>STATUS DA OS</h3><span className="status-pill">{orderStatusLabel(order.status)}</span><div className="timeline" aria-label="Etapas da manutenção">{ORDER_STATUS_STEPS.map((step, index) => <div className={`timeline-step ${selectedStatus != null && index <= selectedStatus ? 'reached' : ''} ${selectedStatus === index ? 'timeline-current' : ''}`} key={step} aria-current={selectedStatus === index ? 'step' : undefined}><span>{selectedStatus != null && index < selectedStatus ? <Check size={13} /> : null}</span><div><b>{step}</b>{index === 3 && <small>Opcional: se faltar peça</small>}</div></div>)}</div>
        <button type="button" className="change-status-button" onClick={() => setStatusOpen(value => !value)}><RefreshCw size={16} />Alterar status <ChevronDown size={16} /></button>
        {statusOpen && <form onSubmit={saveStatus} className="connected-form"><label>Status<select required value={status} onChange={e => setStatus(e.target.value)}><option value="">Selecione o status</option>{ORDER_STATUS_STEPS.map((label, code) => <option key={code} value={String(code)}>{label}</option>)}</select></label>{status === '1' && <label>Observação<input required value={observation} onChange={e => setObservation(e.target.value)} /></label>}{status === '5' && <label>Descrição da conclusão<input required value={description} onChange={e => setDescription(e.target.value)} /></label>}<button className="primary-button" disabled={busy}>Salvar status</button></form>}
        <div className="change-history"><h4>HISTÓRICO DE ALTERAÇÕES</h4>{historyError && <p role="alert">{historyError}</p>}{history === null && !historyError && <p>Carregando...</p>}{history?.length === 0 && <p>Nenhuma alteração registrada.</p>}{history?.map(item => <p key={item.id}><i />{display(item.alteracao)}<small>{display(item.dataHora)}</small></p>)}</div>
      </aside></div>{message && <p role="alert">{message}</p>}
    {assignOpen && <div className="assign-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setAssignOpen(false) }}><form className="assign-dialog" role="dialog" aria-modal="true" aria-label="Atribuir técnico" onSubmit={saveTechnician}><h2>Atribuir técnico</h2><p className="assign-order-info">{display(order.id)} · {display(order.apelido || order.idPC)}</p><label className="assign-technician-select">Técnico<select required value={technician} onChange={e => setTechnician(e.target.value)}><option value="">Selecione um técnico</option>{technicians.map(user => <option key={user.id} value={user.id}>{user.nome || user.login}</option>)}</select></label>{!technicians.length && <p>Nenhum técnico ativo disponível.</p>}<div className="assign-dialog-actions"><button type="button" className="outline-button" onClick={() => setAssignOpen(false)}>Cancelar</button><button className="primary-button" disabled={busy || !technicians.length}>Confirmar</button></div></form></div>}
    </section>
  </div>
}
