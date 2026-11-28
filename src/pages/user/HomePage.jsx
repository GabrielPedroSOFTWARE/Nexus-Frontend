import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, Clock3, Headphones, Loader, Monitor, Plus, RefreshCw } from 'lucide-react'
import { listUserNotifications } from '../../features/notifications/api.js'
import { listUserOrders } from '../../features/service-requests/api.js'
import { orderStatusCode } from '../../shared/orderStatus.js'
import { hasLocalApi } from '../../shared/api/httpClient.js'
import { mapBackendEquipment } from '../../features/equipment/mapBackendEquipment.js'
import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { GENERIC_DESKTOP_IMAGE, GENERIC_NOTEBOOK_IMAGE } from '../../features/equipment/assets.js'
import { StatusPill } from '../../shared/ui/StatusPill.jsx'

const USER_MAINTENANCE_STEPS = ['Recebida', 'Em diagnóstico', 'Em preparo', 'Pronto para retirada']

function userProgressIndex(status) {
  const code = orderStatusCode(status)
  if (code === null || code < 0 || code > 4) return null
  if (code === 2 || code === 3) return 2
  if (code === 4) return 3
  return code
}

function notificationStatus(notification) {
  return notification?.status ?? notification?.statusPedido ?? notification?.statusManutencao ?? notification?.novoStatus ?? notification?.etapa
}

function isFinishedNotification(notification) {
  const rawStatus = notificationStatus(notification)
  const code = orderStatusCode(rawStatus)
  if (code === 5 || code === 6) return true
  const text = String(rawStatus ?? '').toLowerCase()
  return text.includes('conclu') || text.includes('cancel')
}

function isReturnToQueueNotification(notification) {
  if (!notification || isFinishedNotification(notification)) return false
  const rawStatus = notificationStatus(notification)
  const text = String(rawStatus ?? '').toLowerCase()
  const description = notificationDescription(notification).toLowerCase()
  return orderStatusCode(rawStatus) === 0 || text.includes('recebida') || description.includes('volta à fila') || description.includes('devolvid')
}

function hasAssignedTechnician(order) {
  return Boolean(
    (order?.cpfTecnico && String(order.cpfTecnico).trim()) ||
    (order?.cpfTecnicoDescriptografado && String(order.cpfTecnicoDescriptografado).trim())
  )
}

function notificationsForActiveOrder(order, notifications) {
  if (!order || !Array.isArray(notifications) || notifications.length === 0) return []

  const assigned = hasAssignedTechnician(order)
  const orderId = order?.id != null ? String(order.id) : ''
  const hasOrderIdField = notifications.some(item =>
    (item?.idPedido ?? item?.pedidoId ?? item?.codigoPedido ?? item?.idOrdem ?? item?.pedido?.id) != null
  )

  if (hasOrderIdField && orderId) {
    const orderNotifications = notifications.filter(item => {
      const itemOrderId = item?.idPedido ?? item?.pedidoId ?? item?.codigoPedido ?? item?.idOrdem ?? item?.pedido?.id
      return itemOrderId != null && String(itemOrderId) === orderId
    })
    if (assigned && isReturnToQueueNotification(orderNotifications[0])) return []
    return orderNotifications
  }

  const first = notifications[0]
  if (!first || isFinishedNotification(first)) return []

  if (orderStatusCode(order.status) === 0) {
    return !assigned && isReturnToQueueNotification(first) ? [first] : []
  }

  const currentNotifications = []
  for (const item of notifications) {
    if (isFinishedNotification(item)) break
    currentNotifications.push(item)
  }
  return currentNotifications
}

function latestOrderDeadline(order, orderNotifications) {
  if (orderStatusCode(order?.status) === 0) return ''
  if (order?.dataFinalManutencao) return order.dataFinalManutencao
  if (order?.prazo) return order.prazo

  for (const item of orderNotifications) {
    if (isReturnToQueueNotification(item)) break
    if (item?.prazo) return item.prazo
  }
  return ''
}

function notificationDescription(notification) {
  return String(notification?.['descrição'] ?? notification?.descricao ?? '').trim()
}

function formatDeadline(value) {
  if (!value) return ''
  const dateOnly = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('pt-BR')
}

function orderOpenedAt(order) {
  const value = order?.dataHoraAbertura || order?.dataInicioManutencao || order?.dataManutencao
  const timestamp = value ? Date.parse(value) : Number.NaN
  return Number.isFinite(timestamp) ? timestamp : 0
}

function newestActiveOrder(orders) {
  if (!Array.isArray(orders)) return null
  return orders
    .filter(order => {
      const code = orderStatusCode(order.status)
      return code !== null && code >= 0 && code <= 4
    })
    .slice()
    .sort((a, b) => orderOpenedAt(b) - orderOpenedAt(a))[0] || null
}

export function ProgressSteps({ current }) {
  return <div className="progress-steps" role="list" aria-label="Etapas da manutenção">
    {USER_MAINTENANCE_STEPS.map((step, index) => <div className={'progress-step ' + (index < current ? 'complete' : '') + ' ' + (index === current ? 'current' : '')} key={step} role="listitem" aria-current={index === current ? 'step' : undefined}>
      <span className="step-icon" aria-hidden="true">{index < current ? <CheckCircle2 size={29} /> : index === current ? <Loader size={34} /> : <Circle size={34} />}</span>
      {index < USER_MAINTENANCE_STEPS.length - 1 && <span className={'step-line ' + (index < current ? 'complete' : '')} aria-hidden="true" />}
      <b>{step}</b>
    </div>)}
  </div>
}

function MaintenanceStatusCard({ order, notification, deadlineValue, loading, ordersError, notificationsLoading, notificationsError, onHistory }) {
  const current = order ? userProgressIndex(order.status) : null
  const description = notificationDescription(notification)
  const deadline = formatDeadline(deadlineValue ?? notification?.prazo)
  const id = String(order?.id || '')
  const displayId = id.startsWith('OS') ? id : 'OS #' + id

  return <article className="panel active-service-card">
    <div className="section-title-row">
      <h2>STATUS DE MANUTENÇÃO ATIVA</h2>
      {order && <span className="service-number">{displayId}</span>}
    </div>
    {ordersError
      ? <p role="alert">Não foi possível carregar a manutenção agora.</p>
      : loading
        ? <p>Carregando manutenção...</p>
        : !order || current === null
          ? <p className="service-empty-state">Nenhuma manutenção ativa no momento.</p>
          : <>
            <ProgressSteps current={current} />
            {deadline && <div className="forecast-line"><b>PREVISÃO:</b> {deadline}</div>}
            <div className="description-block">
              <h3>DESCRIÇÃO</h3>
              <p>{notificationsLoading ? 'Carregando atualização...' : notificationsError ? 'Descrição indisponível no momento.' : description || 'Nenhuma atualização registrada.'}</p>
            </div>
            {current < 3 && <p className="service-notice">Notificaremos assim que o PC estiver pronto para retirada</p>}
          </>}
    {onHistory && <button className="outline-button" onClick={onHistory}>Ver histórico</button>}
  </article>
}

function equipmentKey(item, index) {
  return String(item?.id ?? item?.idEquipamento ?? `${item?.model || 'pc'}-${index}`)
}

export function UserHome({ onToast, openRequest, profileName, registeredEquipment, equipmentStatus, refreshEquipment }) {
  const navigate = useNavigate()
  const devices = Array.isArray(registeredEquipment)
    ? registeredEquipment.map(mapBackendEquipment)
    : []

  const [selectedKey, setSelectedKey] = useState('')

  const selectedIndex = Math.max(
    0,
    devices.findIndex((item, index) => equipmentKey(item, index) === selectedKey)
  )
  const device = devices[selectedIndex] || null
  const currentKey = device ? equipmentKey(device, selectedIndex) : ''
  const isNotebook = device?.ehNotebook === true
  const [orders, setOrders] = useState(null)
  const [ordersError, setOrdersError] = useState(false)
  const [notifications, setNotifications] = useState(null)
  const [notificationsError, setNotificationsError] = useState(false)

  useEffect(() => {
    if (!hasLocalApi) return undefined
    let active = true
    listUserOrders()
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Resposta inválida.')
        if (active) setOrders(data)
      })
      .catch(() => { if (active) setOrdersError(true) })
    listUserNotifications()
      .then(data => {
        if (!Array.isArray(data)) throw new Error('Resposta inválida.')
        if (active) setNotifications(data)
      })
      .catch(() => { if (active) setNotificationsError(true) })
    return () => { active = false }
  }, [])

  const activeOrder = newestActiveOrder(orders)
  console.log('OS ativa:', activeOrder)
  const activeOrderNotifications = notificationsForActiveOrder(activeOrder, notifications)
  const latestNotification = activeOrderNotifications[0] || null
  const activeDeadline = latestOrderDeadline(activeOrder, activeOrderNotifications)
  const demoOrder = { id: '0001', status: 2 }
  const demoNotification = { 'descrição': 'Adição de 8GB de memória RAM iniciada às 14:30.\nPendente: Substituição do SSD.' }

  const handleNewMaintenance = () => {
    if (!hasLocalApi) {
      openRequest()
      return
    }
    if (equipmentStatus === 'error') {
      onToast('Não foi possível verificar seus equipamentos.', 'error')
      return
    }
    if (equipmentStatus !== 'ready') {
      onToast('Aguarde o carregamento dos equipamentos.', 'error')
      return
    }
    if (!registeredEquipment?.length) {
      onToast('Cadastre um computador para solicitar manutenção.', 'error')
      navigate('/meus-pcs')
      return
    }
    openRequest()
  }

  return <PageFrame mode="user" active="home" onToast={onToast} profileName={profileName}>
    <main className="page-content user-home-content">
      <h1 className="page-title">Olá, {hasLocalApi ? profileName : 'usuário'}! Bem-vindo ao NEXUS.</h1>
      <div className="user-home-grid">
        <section className="user-main-column">
          <MaintenanceStatusCard
            order={hasLocalApi ? activeOrder : demoOrder}
            notification={hasLocalApi ? latestNotification : demoNotification}
            deadlineValue={hasLocalApi ? activeDeadline : ''}
            loading={hasLocalApi && orders === null && !ordersError}
            ordersError={hasLocalApi && ordersError}
            notificationsLoading={hasLocalApi && notifications === null && !notificationsError}
            notificationsError={hasLocalApi && notificationsError}
            onHistory={hasLocalApi ? () => navigate('/historico') : undefined}
          />
        </section>
        <aside className="user-side-column">
          {hasLocalApi && equipmentStatus === 'ready' && devices.length > 0 && (
    <div className="equipment-selector">
      <label htmlFor="home-equipment-select">EQUIPAMENTO</label>
      <select
        id="home-equipment-select"
        value={currentKey}
        onChange={event => setSelectedKey(event.target.value)}
      >
        {devices.map((item, index) => {
          const key = equipmentKey(item, index)
          const tipo = item.ehNotebook ? 'Notebook' : 'Desktop'
          const nome = item.model || `Equipamento ${index + 1}`
          return (
            <option key={key} value={key}>
              {tipo} — {nome}
            </option>
          )
        })}
      </select>
    </div>
  )}
          <article className="panel equipment-summary">
            <h3>RESUMO DO EQUIPAMENTO</h3>
            {hasLocalApi
              ? equipmentStatus === 'error'
                ? <p>Não foi possível carregar os equipamentos.</p>
                : device
                  ? <div className="equipment-summary-body"><img
                        className={`device-type-image ${isNotebook ? 'is-notebook' : 'is-desktop'}`}
                        src={isNotebook ? GENERIC_NOTEBOOK_IMAGE : GENERIC_DESKTOP_IMAGE}
                        alt={isNotebook ? 'Imagem genérica de notebook' : 'Imagem genérica de desktop'}
                        style={isNotebook
                        ? { width: '120px', height: '120px', objectFit: 'contain', flexShrink: 0 }
                        : { width: '100px', height: '140px', objectFit: 'cover', flexShrink: 0 }}
                      /><div><p><b>Modelo:</b> {device.model}</p><p><b>CPU:</b> {device.cpu}</p><p><b>RAM:</b> {device.ram}</p><p><b>GPU:</b> {device.gpu}</p></div></div>
                  : <p>{equipmentStatus === 'ready' ? 'Nenhum equipamento cadastrado.' : 'Carregando equipamentos...'}</p>
              : <div className="equipment-summary-body"><ComputerGraphic /><div><p><b>CPU:</b> Intel core i5 10500F</p><p><b>RAM:</b> 8GB</p><p><b>GPU:</b> Intel graphics</p><p><b>S.O:</b> Windows 11 PRO</p></div></div>}
          </article>
          <h2 className="subsection-heading">AÇÕES RÁPIDAS</h2>
          <div className="quick-actions">
            <button onClick={handleNewMaintenance}><Plus /><b>NOVA MANUTENÇÃO</b></button>
            <button onClick={() => navigate('/historico')}><Clock3 /><b>VER HISTÓRICO</b></button>
            {hasLocalApi
              ? <>
                <button onClick={() => { refreshEquipment(); onToast('Atualizando lista de equipamentos') }}><RefreshCw /><b>ATUALIZAR DADOS</b></button>
                <button onClick={() => navigate('/meus-pcs')}><Monitor /><b>MEUS COMPUTADORES</b></button>
              </>
              : <>
                <button onClick={() => onToast('Dados do equipamento atualizados')}><RefreshCw /><b>ATUALIZAR DADOS</b></button>
                <button onClick={() => onToast('Suporte rápido disponível pelo e-mail admin@gmail.com')}><Headphones /><b>SUPORTE RÁPIDO</b></button>
              </>}
          </div>
          {!hasLocalApi && <>
            <h2 className="subsection-heading equipment-heading">EQUIPAMENTO CADASTRADO</h2>
            <button className="registered-device" onClick={() => navigate('/meus-pcs')}><Monitor /><span><b>PC</b><small>Desktop de Usuário</small></span><StatusPill type="equipmentMaintenance" /></button>
          </>}
        </aside>
      </div>
    </main>
  </PageFrame>
}
