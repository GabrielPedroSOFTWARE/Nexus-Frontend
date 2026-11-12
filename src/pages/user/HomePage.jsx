import { hasLocalApi } from '../../shared/api/httpClient.js'
import { mapBackendEquipment } from '../../features/equipment/mapBackendEquipment.js'
import { orderStatusLabel } from '../../shared/orderStatus.js'
import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { ComputerGraphic } from '../../shared/ui/ComputerGraphic.jsx'
import { StatusPill } from '../../shared/ui/StatusPill.jsx'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { listUserOrders } from '../../features/service-requests/api.js'
import { CheckCircle2, Clock3, Headphones, Monitor, Plus, RefreshCw, Circle, Loader } from 'lucide-react'

export function ProgressSteps({ current = 2 }) {
  const steps = ['Recebido', 'Em diagnóstico', 'Em preparo', 'Aguardando retirada']
  return <div className="progress-steps">
    {steps.map((step, index) => <div className={`progress-step ${index < current ? 'complete' : ''} ${index === current ? 'current' : ''}`} key={step}>
      <span className="step-icon">{index < current ? <CheckCircle2 size={29} /> : index === current ? <Loader size={34} /> : <Circle size={34} />}</span>
      {index < steps.length - 1 && <span className={`step-line ${index < current ? 'complete' : ''}`} />}
      <b>{step}</b>
    </div>)}
  </div>
}

export function UserHome({ onToast, openRequest, profileName, registeredEquipment, equipmentStatus, refreshEquipment }) {
  const navigate = useNavigate()
  const device = registeredEquipment?.[0] && mapBackendEquipment(registeredEquipment[0])
  const [orders, setOrders] = useState(null)
  const [ordersError, setOrdersError] = useState('')
  useEffect(() => {
    if (!hasLocalApi) return undefined
    let active = true
    listUserOrders().then(data => { if (!Array.isArray(data)) throw new Error('Resposta inválida do backend.'); if (active) setOrders(data) }).catch(error => { if (active) setOrdersError(error.message) })
    return () => { active = false }
  }, [])
  const latestOrder = orders?.slice().sort((a, b) => String(b.dataInicioManutencao || b.dataManutencao || '').localeCompare(String(a.dataInicioManutencao || a.dataManutencao || '')))[0]
  if (hasLocalApi) return <PageFrame mode="user" active="home" onToast={onToast} profileName={profileName}>
    <main className="page-content user-home-content"><h1 className="page-title">Olá, {profileName}! Bem-vindo ao NEXUS.</h1>
      <div className="user-home-grid"><section className="user-main-column"><article className="panel active-service-card"><h2>SOLICITAÇÃO RECENTE</h2>{ordersError ? <p role="alert">Não foi possível carregar as solicitações: {ordersError}</p> : orders === null ? <p>Carregando solicitações...</p> : latestOrder ? <><p><b>Ordem:</b> {latestOrder.id}</p><p><b>Status:</b> {orderStatusLabel(latestOrder.status)}</p><p><b>Problema:</b> {latestOrder.problema || 'Não informado'}</p></> : <p>Nenhuma solicitação cadastrada.</p>}<button className="outline-button" onClick={() => navigate('/historico')}>Ver histórico</button></article></section>
        <aside className="user-side-column"><article className="panel equipment-summary"><h3>RESUMO DO EQUIPAMENTO</h3>{equipmentStatus === 'error' ? <p>Não foi possível carregar os equipamentos.</p> : device ? <div className="equipment-summary-body"><ComputerGraphic /><div><p><b>Modelo:</b> {device.model}</p><p><b>CPU:</b> {device.cpu}</p><p><b>RAM:</b> {device.ram}</p><p><b>GPU:</b> {device.gpu}</p></div></div> : <p>{equipmentStatus === 'error' ? 'Não foi possível carregar os equipamentos.' : equipmentStatus === 'ready' ? 'Nenhum equipamento cadastrado.' : 'Carregando equipamentos...'}</p>}</article>
        <h2 className="subsection-heading">AÇÕES RÁPIDAS</h2><div className="quick-actions"><button onClick={openRequest}><Plus /><b>NOVA MANUTENÇÃO</b></button><button onClick={() => navigate('/historico')}><Clock3 /><b>VER HISTÓRICO</b></button><button onClick={() => { refreshEquipment(); onToast('Atualizando lista de equipamentos') }}><RefreshCw /><b>ATUALIZAR DADOS</b></button><button onClick={() => navigate('/meus-pcs')}><Monitor /><b>MEUS COMPUTADORES</b></button></div></aside></div>
    </main></PageFrame>
  return <PageFrame mode="user" active="home" onToast={onToast} profileName={profileName}>
    <main className="page-content user-home-content">
      <h1 className="page-title">Olá, usuário! Bem-vindo ao NEXUS.</h1>
      <div className="user-home-grid">
        <section className="user-main-column">
          <article className="panel active-service-card">
            <div className="section-title-row"><h2>STATUS DE MANUTENÇÃO ATIVA</h2><span className="service-number">OS #0001</span></div>
            <ProgressSteps current={2} />
            <div className="forecast-line"><b>PREVISÃO:</b> Hoje, 17h</div>
            <div className="description-block"><h3>DESCRIÇÃO</h3><p>Última atualização: Adição de 8GB de memória RAM iniciada às 14:30.</p><p>Pendente: Substituição do SSD.</p></div>
            <p className="service-notice">Notificaremos assim que o PC estiver pronto para retirada</p>
          </article>
        </section>
        <aside className="user-side-column">
          <article className="panel equipment-summary">
            <h3>RESUMO DO EQUIPAMENTO</h3>
            <div className="equipment-summary-body"><ComputerGraphic /><div><p><b>CPU:</b> Intel core i5 10500F</p><p><b>RAM:</b> 8GB</p><p><b>GPU:</b> Intel graphics</p><p><b>S.O:</b> Windows 11 PRO</p></div></div>
          </article>
          <h2 className="subsection-heading">AÇÕES RÁPIDAS</h2>
          <div className="quick-actions">
            <button onClick={openRequest}><Plus /><b>NOVA MANUTENÇÃO</b></button>
            <button onClick={() => navigate('/historico')}><Clock3 /><b>VER HISTÓRICO</b></button>
            <button onClick={() => onToast('Dados do equipamento atualizados')}><RefreshCw /><b>ATUALIZAR DADOS</b></button>
            <button onClick={() => onToast('Suporte rápido disponível pelo e-mail admin@gmail.com')}><Headphones /><b>SUPORTE RÁPIDO</b></button>
          </div>
          <h2 className="subsection-heading equipment-heading">EQUIPAMENTO CADASTRADO</h2>
          <button className="registered-device" onClick={() => navigate('/meus-pcs')}><Monitor /><span><b>PC</b><small>Desktop de Usuário</small></span><StatusPill type="maintenance" /></button>
        </aside>
      </div>
    </main>
  </PageFrame>
}
