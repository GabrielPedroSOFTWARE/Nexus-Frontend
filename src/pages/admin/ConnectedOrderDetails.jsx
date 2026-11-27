import { useEffect, useState } from 'react'
import { Check, ChevronDown, ClipboardList, History, Paperclip, RefreshCw, X } from 'lucide-react'
import { apiRequest } from '../../shared/api/httpClient.js'
import { getRequestDetails } from '../../features/service-requests/frequency.js'
import { ORDER_STATUS_STEPS, orderStatusCode, orderStatusLabel } from '../../shared/orderStatus.js'
import { assignTechnician, cancelOrder, changeOrderStatus, getOrderDetails, listActiveTechnicians, listOrders, listUsers, returnOrderToQueue } from '../../features/admin/api.js'
import { isOverdueOrder } from '../../features/admin/dashboardMetrics.js'
import { FormRequirementsNote } from '../../shared/ui/FormRequirementsNote.jsx'
import { formatBrazilianPhone } from '../../shared/phone.js'

const display = value => value == null || value === '' ? 'Não informado' : String(value)
const date = value => value ? String(value).slice(0, 10).split('-').reverse().join('/') : 'Não informado'
const dateInput = value => typeof value === 'string' ? value.slice(0, 10) : ''
const orderOpenedAt = order => {
  const value = order?.dataHoraAbertura || order?.dataInicioManutencao || order?.dataManutencao
  const timestamp = value ? Date.parse(value) : Number.NaN
  return Number.isFinite(timestamp) ? timestamp : 0
}
const backendDate = value => {
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}
const localTodayInput = () => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

export function ConnectedOrderDetails({ order, onClose, onSaved, isAdmin = false }) {
  const details = getRequestDetails(order)
  const [users, setUsers] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [techniciansLoading, setTechniciansLoading] = useState(true)
  const [orderDetails, setOrderDetails] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(true)
  const [detailsError, setDetailsError] = useState('')
  const [history, setHistory] = useState(null)
  const [equipmentHistory, setEquipmentHistory] = useState(null)
  const [historyError, setHistoryError] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [equipmentHistoryOpen, setEquipmentHistoryOpen] = useState(false)
  const [equipmentHistoryLoading, setEquipmentHistoryLoading] = useState(false)
  const [equipmentHistoryError, setEquipmentHistoryError] = useState('')
  const [status, setStatus] = useState('')
  const [observation, setObservation] = useState('')
  const [description, setDescription] = useState('')
  const [justification, setJustification] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelJustification, setCancelJustification] = useState('')
  const [returnOpen, setReturnOpen] = useState(false)
  const [returnJustification, setReturnJustification] = useState('')
  const [deadline, setDeadline] = useState(() => dateInput(order.dataFinalManutencao))
  const [technician, setTechnician] = useState('')
  const [assignOpen, setAssignOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    let active = true
    setOrderDetails(null)
    setDetailsLoading(true)
    setDetailsError('')
    setTechnicians([])
    setTechniciansLoading(true)
    getOrderDetails(order.id)
      .then(data => { if (active) setOrderDetails(data) })
      .catch(() => { if (active) setDetailsError('Não foi possível carregar os dados complementares desta O.S.') })
      .finally(() => { if (active) setDetailsLoading(false) })
    listActiveTechnicians()
      .then(data => { if (active) setTechnicians(data) })
      .catch(() => { if (active) setMessage('Não foi possível carregar a lista de técnicos.') })
      .finally(() => { if (active) setTechniciansLoading(false) })
    if (isAdmin) {
      listUsers().then(data => { if (active) setUsers(data) }).catch(() => { if (active) setMessage('Não foi possível carregar os usuários e técnicos.') })
    } else {
      setUsers([])
    }
    return () => { active = false }
  }, [order.id, isAdmin])
  const userCpf = order.cpfUsuario || order.idUsuario
  const client = orderDetails?.solicitante || users.find(user => String(user.cpf || user.id) === String(userCpf))
  const equipment = orderDetails?.equipamento
  const equipmentModel = [equipment?.fabricante, equipment?.modelo].filter(Boolean).join(' ')
  const equipmentType = order.apelido || (equipment
    ? `${equipment.ehNotebook ? 'Notebook' : 'Desktop'}${equipment.id ? ` · PC-${String(equipment.id).padStart(4, '0')}` : ''}`
    : order.idPC)
  const detailValue = value => detailsLoading ? 'Carregando...' : display(value)
  const listValue = values => Array.isArray(values) && values.length ? values.join(', ') : null
  const orderedEquipmentHistory = equipmentHistory?.slice().sort((a, b) => orderOpenedAt(b) - orderOpenedAt(a))
  const selectedStatus = orderStatusCode(order.status)
  const nextStatus = status === '' ? null : Number(status)
  const isOverdue = isOverdueOrder(order)
  const changingStatus = selectedStatus != null && nextStatus != null && nextStatus !== selectedStatus
  const requiresDeadlineForTransition = selectedStatus != null && nextStatus != null && ((selectedStatus < 2 && nextStatus === 2) || (selectedStatus > 1 && nextStatus === 1))
  const requiresDeadline = changingStatus && (requiresDeadlineForTransition || isOverdue)
  const requiresObservation = selectedStatus === 0 && nextStatus === 1
  const requiresJustification = requiresDeadline || (selectedStatus != null && nextStatus != null && selectedStatus > nextStatus)
  const deadlineIsNew = !isOverdue || (deadline && deadline !== dateInput(order.dataFinalManutencao) && deadline >= localTodayInput())
  const canChangeStatus = selectedStatus != null && ![5, 6].includes(selectedStatus) && Boolean(order.cpfTecnico || order.idTecnico || order.tecnico)
  const canCancel = selectedStatus != null && selectedStatus !== 6 && (isAdmin || Boolean(order.cpfTecnico || order.idTecnico || order.tecnico))
  const canReturnToQueue = selectedStatus != null && ![5, 6].includes(selectedStatus) && Boolean(order.cpfTecnico || order.idTecnico || order.tecnico)
  const phone = formatBrazilianPhone(order.telefoneUsuario || client?.telefone)
  const downloadAttachment = () => {
    try {
      const bytes = Uint8Array.from(atob(order.foto), char => char.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes], { type: order.tipoArquivoFoto || 'application/octet-stream' }))
      const link = document.createElement('a'); link.href = url; link.download = order.nomeArquivoFoto || 'anexo.bin'; link.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch { setMessage('Não foi possível abrir o anexo.') }
  }
  const saveStatus = async event => {
    event.preventDefault()
    if (requiresDeadline && !deadline) { setMessage('Informe o novo prazo de manutenção.'); return }
    if (isOverdue && changingStatus && (deadline === dateInput(order.dataFinalManutencao) || deadline < localTodayInput())) {
      setMessage('Informe um novo prazo válido para a manutenção.'); return
    }
    if (requiresJustification && !justification.trim()) { setMessage('Informe a justificativa da alteração.'); return }
    setBusy(true); setMessage('')
    const values = { novoStatusId: status, observacao: observation, descricao: description }
    if (requiresDeadline) values.prazo = backendDate(deadline)
    if (requiresJustification) values.justificativa = justification.trim()
    try { await changeOrderStatus(order.id, values); await onSaved() }
    catch { setMessage('Não foi possível alterar o status. Tente novamente.') }
    finally { setBusy(false) }
  }
  const saveCancellation = async event => {
    event.preventDefault()
    const reason = cancelJustification.trim()
    if (!reason) { setMessage('Informe a justificativa para cancelar a O.S.'); return }
    setBusy(true); setMessage('')
    try { await cancelOrder(order.id, reason); await onSaved() }
    catch { setMessage('Não foi possível cancelar a O.S. Tente novamente.') }
    finally { setBusy(false) }
  }
  const saveReturnToQueue = async event => {
    event.preventDefault()
    const reason = returnJustification.trim()
    if (!reason) { setMessage('Informe a justificativa para devolver a O.S. à fila.'); return }
    setBusy(true); setMessage('')
    try {
      await returnOrderToQueue(order.id, reason)
      const refreshedOrders = await listOrders()
      const refreshedOrder = refreshedOrders.find(item => String(item.id) === String(order.id))
      if (!refreshedOrder || Number(refreshedOrder.status) !== 0 || refreshedOrder.cpfTecnico || refreshedOrder.idTecnico || refreshedOrder.tecnico) {
        throw new Error('A alteração não foi confirmada.')
      }
      await onSaved()
    }
    catch { setMessage('Não foi possível devolver a O.S. à fila. Tente novamente.') }
    finally { setBusy(false) }
  }
  const saveTechnician = async event => {
    event.preventDefault(); setBusy(true); setMessage('')
    try { await assignTechnician(order.id, technician); await onSaved() }
    catch { setMessage('Não foi possível atribuir o técnico. Tente novamente.') }
    finally { setBusy(false) }
  }
  const loadEquipmentHistory = async () => {
    if (order.idPC == null) return
    if (equipmentHistoryOpen) { setEquipmentHistoryOpen(false); return }
    setEquipmentHistoryOpen(true); setEquipmentHistoryLoading(true); setEquipmentHistoryError('')
    try {
      const data = await apiRequest('/listar-pedidos-equipamento/' + encodeURIComponent(order.idPC))
      if (!Array.isArray(data)) throw new Error('Resposta inválida do backend.')
      setEquipmentHistory(data)
    } catch (error) { setEquipmentHistoryError('Não foi possível consultar o histórico do equipamento: ' + error.message) }
    finally { setEquipmentHistoryLoading(false) }
  }
  const loadChangeHistory = async () => {
    if (historyOpen) { setHistoryOpen(false); return }
    setHistoryOpen(true); setHistoryLoading(true); setHistoryError('')
    try {
      const data = await apiRequest('/backoffice/retornar-historico-pedido-alt/' + encodeURIComponent(order.id))
      if (!Array.isArray(data)) throw new Error('Resposta inválida do backend.')
      setHistory(data)
    } catch (error) { setHistoryError('Não foi possível carregar o histórico de alterações: ' + error.message) }
    finally { setHistoryLoading(false) }
  }
  return <div className="modal-backdrop service-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <section className="service-modal" role="dialog" aria-modal="true" aria-label="Detalhes da ordem">
      <div className="service-modal-heading"><span className="modal-icon"><ClipboardList size={26} /></span><div className="service-title-group"><small>ORDEM DE SERVIÇO</small><h2>{display(order.id)}</h2></div><span className="frequency-chip">Prioridade · {order.prioridade == null ? 'Não informada' : `Código ${order.prioridade}`}</span><span className="date-chip">Início &nbsp; {date(order.dataInicioManutencao)}</span><span className="date-chip">Prazo &nbsp; {date(order.dataFinalManutencao)}</span><button className="assign-technician-button" onClick={() => setAssignOpen(true)}>Atribuir técnico</button>{canReturnToQueue && <button type="button" className="return-queue-button" onClick={() => setReturnOpen(true)}>Devolver à fila</button>}<button type="button" onClick={onClose} aria-label="Fechar"><X /></button></div>
      <div className="service-modal-body"><div className="service-detail-column">
        <article className="detail-card client-card"><h3>CLIENTE</h3><div className="detail-grid"><p><small>NOME</small><b>{detailValue(client?.nome)}</b></p><p><small>SETOR</small><b>{detailValue(client?.setor)}</b></p><p><small>TELEFONE</small><b>{detailValue(phone)}</b></p><p><small>CPF</small><b>{detailValue(client?.cpfExibicao || order.cpfUsuarioDescriptografado)}</b></p></div>{detailsError && <p role="status">{detailsError}</p>}</article>
        <article className="detail-card specs-card"><h3>ESPECIFICAÇÕES DA MÁQUINA</h3><div className="detail-grid spec-grid"><p><small>MODELO</small><b>{detailValue(equipmentModel || null)}</b></p><p><small>PATRIMÔNIO</small><b>{detailValue(equipment?.numeroSerie)}</b></p><p><small>SISTEMA OPERACIONAL</small><b>{detailValue(equipment?.sistemaOperacional)}</b></p><p><small>ARMAZENAMENTO</small><b>{detailValue(listValue(equipment?.discos))}</b></p><p><small>EQUIPAMENTO</small><b>{detailValue(equipmentType)}</b></p><p><small>CPU</small><b>{detailValue(equipment?.processador)}</b></p><p><small>MEMÓRIA RAM</small><b>{detailValue(equipment?.ram == null ? null : `${equipment.ram} GB`)}</b></p><p><small>GPU</small><b>{detailValue(listValue(equipment?.placasDeVideo))}</b></p></div><button type="button" className="equipment-history-link" disabled={order.idPC == null} aria-expanded={equipmentHistoryOpen} aria-controls="equipment-history" onClick={loadEquipmentHistory}><History size={16} />Consultar Histórico de Manutenções</button></article>
        {equipmentHistoryOpen && <article className="detail-card" id="equipment-history"><h3>HISTÓRICO DE MANUTENÇÕES</h3>{equipmentHistoryLoading ? <p>Carregando...</p> : equipmentHistoryError ? <p role="alert">{equipmentHistoryError}</p> : orderedEquipmentHistory?.length ? orderedEquipmentHistory.map(item => <p key={item.id}>{display(item.id)} · {orderStatusLabel(item.status)} · {date(item.dataInicioManutencao)}</p>) : <p>Nenhuma manutenção encontrada.</p>}</article>}
        <article className="detail-card problem-card"><div className="section-title-row"><h3>PROBLEMA RELATADO</h3><span className="frequency-chip">Frequência &nbsp; {details.frequency || 'Não informada'}</span></div><p style={{ fontSize: '16px' }}>{details.problem}</p></article>
        <article className="detail-card observations-card"><h3>OBSERVAÇÕES DO TÉCNICO</h3><p>{order.observacoesTecnico || 'Nenhuma observação registrada até o momento.'}</p></article>
        <article className="detail-card attachments-card"><h3>ANEXOS</h3>{order.foto ? <button type="button" onClick={downloadAttachment}><Paperclip size={23} />{order.nomeArquivoFoto || 'Baixar anexo'}</button> : <p>Nenhum anexo.</p>}</article>
      </div><aside className="service-status-column"><h3>STATUS DA OS</h3><span className="status-pill">{orderStatusLabel(order.status)}</span><div className="timeline" aria-label="Etapas da manutenção">{ORDER_STATUS_STEPS.map((step, index) => <div className={`timeline-step ${selectedStatus != null && index <= selectedStatus ? 'reached' : ''} ${selectedStatus === index ? 'timeline-current' : ''}`} key={step} aria-current={selectedStatus === index ? 'step' : undefined}><span>{selectedStatus != null && index < selectedStatus ? <Check size={13} /> : null}</span><div><b>{step}</b>{index === 3 && <small>Opcional: se faltar peça</small>}</div></div>)}</div>
        {canChangeStatus && <button type="button" className="change-status-button" onClick={() => setStatusOpen(value => !value)}><RefreshCw size={16} />Alterar status <ChevronDown size={16} /></button>}
        {statusOpen && canChangeStatus && <form onSubmit={saveStatus} className="connected-form"><FormRequirementsNote /><label>Status <em>*</em><select required value={status} onChange={e => { setStatus(e.target.value); if (isOverdue) { setDeadline(''); setJustification('') } }}><option value="">Selecione o status</option>{ORDER_STATUS_STEPS.map((label, code) => code === 0 || code === 6 ? null : <option key={code} value={String(code)}>{label}</option>)}</select></label>{requiresDeadline && <label>{isOverdue ? 'Novo prazo de manutenção' : 'Prazo de manutenção'} <em>*</em><input type="date" required min={isOverdue ? localTodayInput() : undefined} value={deadline} onChange={e => setDeadline(e.target.value)} /></label>}{requiresObservation && <label>Observação <em>*</em><input required value={observation} onChange={e => setObservation(e.target.value)} /></label>}{requiresJustification && <label>Justificativa <em>*</em><textarea required maxLength={500} rows="3" value={justification} onChange={e => setJustification(e.target.value)} placeholder="Explique o motivo da definição desse prazo ou do status." /></label>}{status === '5' && <label>Descrição da conclusão <em>*</em><input required value={description} onChange={e => setDescription(e.target.value)} /></label>}<button className="primary-button" disabled={busy || (requiresDeadline && !deadlineIsNew) || (requiresJustification && !justification.trim())}>Salvar status</button></form>}
        {canCancel && <button type="button" className="cancel-order-button" aria-expanded={cancelOpen} onClick={() => { setCancelOpen(value => !value); setMessage('') }}>Cancelar O.S.</button>}
        {cancelOpen && canCancel && <form onSubmit={saveCancellation} className="connected-form cancel-order-form"><label>Justificativa do cancelamento <em>*</em><textarea required rows="4" value={cancelJustification} onChange={e => setCancelJustification(e.target.value)} placeholder="Explique por que esta ordem será cancelada." /></label><div className="cancel-order-actions"><button type="button" className="outline-button" disabled={busy} onClick={() => setCancelOpen(false)}>Voltar</button><button type="submit" className="cancel-order-confirm-button" disabled={busy || !cancelJustification.trim()}>{busy ? 'Cancelando...' : 'Confirmar cancelamento'}</button></div></form>}
        <div className="change-history"><button type="button" className="change-history-link" aria-expanded={historyOpen} aria-controls="change-history-content" onClick={loadChangeHistory}>HISTÓRICO DE ALTERAÇÕES</button>{historyOpen && <div id="change-history-content">{historyLoading ? <p>Carregando...</p> : historyError ? <p role="alert">{historyError}</p> : history?.length ? history.map(item => <p key={item.id}><i />{display(item.alteracao)}<small>{display(item.dataHora)}</small></p>) : <p>Nenhuma alteração registrada.</p>}</div>}</div>
      </aside></div>{message && <p role="alert">{message}</p>}
    {assignOpen && <div className="assign-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setAssignOpen(false) }}><form className="assign-dialog" role="dialog" aria-modal="true" aria-label="Atribuir técnico" onSubmit={saveTechnician}><h2>Atribuir técnico</h2><FormRequirementsNote /><p className="assign-order-info">{display(order.id)} · {display(order.apelido || order.idPC)}</p><label className="assign-technician-select">Técnico <em>*</em><select required value={technician} onChange={e => setTechnician(e.target.value)} disabled={techniciansLoading}><option value="">{techniciansLoading ? 'Carregando técnicos...' : 'Selecione um técnico'}</option>{technicians.map(user => <option key={user.id} value={user.id}>{user.nome || 'Técnico'}</option>)}</select></label>{!techniciansLoading && !technicians.length && <p>Nenhum técnico ativo disponível.</p>}<div className="assign-dialog-actions"><button type="button" className="outline-button" onClick={() => setAssignOpen(false)}>Cancelar</button><button className="primary-button" disabled={busy || techniciansLoading || !technicians.length}>Confirmar</button></div></form></div>}
    {returnOpen && canReturnToQueue && <div className="assign-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setReturnOpen(false) }}><form className="assign-dialog return-queue-dialog" role="dialog" aria-modal="true" aria-label="Devolver O.S. à fila" onSubmit={saveReturnToQueue}><h2>Devolver O.S. à fila</h2><FormRequirementsNote /><p className="assign-order-info">{display(order.id)} · {display(order.apelido || order.idPC)}</p><label>Justificativa <em>*</em><textarea required maxLength={500} rows="4" value={returnJustification} onChange={e => setReturnJustification(e.target.value)} placeholder="Explique por que esta O.S. deve voltar à fila." /></label><div className="assign-dialog-actions"><button type="button" className="outline-button" disabled={busy} onClick={() => setReturnOpen(false)}>Cancelar</button><button className="primary-button" disabled={busy || !returnJustification.trim()}>{busy ? 'Devolvendo...' : 'Devolver à fila'}</button></div></form></div>}
    </section>
  </div>
}
