import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Circle, Clock3, Headphones, Loader, Monitor, Plus, RefreshCw } from 'lucide-react'
import { listUserNotifications } from '../../features/notifications/api.js'
import { listUserOrders } from '../../features/service-requests/api.js'
import { orderStatusCode } from '../../shared/orderStatus.js'
import { hasLocalApi } from '../../shared/api/httpClient.js'
import { mapBackendEquipment } from '../../features/equipment/mapBackendEquipment.js'
import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { ComputerGraphic } from '../../shared/ui/ComputerGraphic.jsx'
import { StatusPill } from '../../shared/ui/StatusPill.jsx'

const USER_MAINTENANCE_STEPS = ['Recebida', 'Em diagnóstico', 'Em preparo', 'Pronto para retirada']

function userProgressIndex(status) {
  const code = orderStatusCode(status)
  if (code === null || code < 0 || code > 4) return null
  if (code === 2 || code === 3) return 2
  if (code === 4) return 3
  return code
}

function latestUserNotification(notifications) {
  return Array.isArray(notifications) ? notifications[0] || null : null
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

function MaintenanceStatusCard({ order, notification, loading, ordersError, notificationsLoading, notificationsError, onHistory }) {
  const current = order ? userProgressIndex(order.status) : null
  const description = notificationDescription(notification)
  const deadline = formatDeadline(notification?.prazo)
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

export function UserHome({ onToast, openRequest, profileName, registeredEquipment, equipmentStatus, refreshEquipment }) {
  const navigate = useNavigate()
  const device = registeredEquipment?.[0] && mapBackendEquipment(registeredEquipment[0])
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
  const latestNotification = latestUserNotification(notifications)
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
            loading={hasLocalApi && orders === null && !ordersError}
            ordersError={hasLocalApi && ordersError}
            notificationsLoading={hasLocalApi && notifications === null && !notificationsError}
            notificationsError={hasLocalApi && notificationsError}
            onHistory={hasLocalApi ? () => navigate('/historico') : undefined}
          />
        </section>
        <aside className="user-side-column">
          <article className="panel equipment-summary">
            <h3>RESUMO DO EQUIPAMENTO</h3>
            {hasLocalApi
              ? equipmentStatus === 'error'
                ? <p>Não foi possível carregar os equipamentos.</p>
                : device
                  ? <div className="equipment-summary-body"><ComputerGraphic /><div><p><b>Modelo:</b> {device.model}</p><p><b>CPU:</b> {device.cpu}</p><p><b>RAM:</b> {device.ram}</p><p><b>GPU:</b> {device.gpu}</p></div></div>
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
