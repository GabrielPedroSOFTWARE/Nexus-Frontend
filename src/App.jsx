import { useEffect, useMemo, useState } from 'react'
import { HashRouter, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity, ArrowLeft, ArrowRight, BarChart3, Bell, Barcode, CalendarDays,
  Check, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, CircleUserRound,
  ClipboardList, Clock3, Cpu, FileText, HardDrive, Headphones, Laptop, CircleAlert, TriangleAlert,
  ListFilter, Monitor, Paperclip, Plus, RefreshCw, Search, Settings, ShieldCheck,
  Trash2, Upload, UserRound, Wrench, X, Circle, Loader, LoaderCircle, Eye, EyeOff,
} from 'lucide-react'
import {
  CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, BarChart, Bar,
} from 'recharts'

const NAVY = '#33435f'
const BRAND_ASSET = `${import.meta.env.BASE_URL}nexus-logo.png`
const USER_AVATAR_ASSET = `${import.meta.env.BASE_URL}nexus-avatar-user.png`
const ADMIN_AVATAR_ASSET = `${import.meta.env.BASE_URL}nexus-avatar-admin.png`
const DESKTOP_ASSET = `${import.meta.env.BASE_URL}nexus-pc-desktop.png`
const MACBOOK_ASSET = `${import.meta.env.BASE_URL}nexus-pc-macbook.png`
const STATUS = {
  diagnosis: { text: 'Em diagnóstico', color: '#c9d8ff', ink: '#30466e' },
  waiting: { text: 'Aguardando peças', color: '#ffe4c7', ink: '#825a35' },
  late: { text: 'Atrasada', color: '#ff888b', ink: '#7e282b' },
  done: { text: 'Concluída', color: '#71f166', ink: '#174b1b' },
  inUse: { text: 'Em uso', color: '#58ba58', ink: '#174b1b' },
  maintenance: { text: 'Em Manutenção', color: '#ffe0bf', ink: '#825b35' },
  active: { text: 'Em andamento', color: '#d7e2ff', ink: '#334a78' },
}

const serviceOrders = [
  { id: 'OS-2026-0010', equipment: 'PC-0010', user: 'João', status: 'diagnosis', priority: 'Baixa', mttr: '2h30min' },
  { id: 'OS-2026-0009', equipment: 'PC-0009', user: 'Gabriel', status: 'waiting', priority: 'Média', mttr: '-----' },
  { id: 'OS-2026-0008', equipment: 'PC-0008', user: 'Claudio', status: 'late', priority: 'Alta', mttr: '4h10min' },
  { id: 'OS-2026-0007', equipment: 'PC-0007', user: 'Pedro', status: 'done', priority: 'Concluída', mttr: '1h30min' },
  { id: 'OS-2026-0006', equipment: 'PC-0006', user: 'Ana', status: 'done', priority: 'Concluída', mttr: '2h45min' },
  { id: 'OS-2026-0005', equipment: 'PC-0005', user: 'Cássia', status: 'done', priority: 'Concluída', mttr: '3h20min' },
  { id: 'OS-2026-0004', equipment: 'PC-0004', user: 'Guilherme', status: 'done', priority: 'Concluída', mttr: '2h30min' },
]

function BrandMark({ size = 96, className = '' }) {
  return <img className={`brand-mark ${className}`} width={size} height={size} src={BRAND_ASSET} alt="NEXUS" />
}

function Avatar({ admin = false, size = 'md' }) {
  return (
    <span className={`avatar avatar-${size} ${admin ? 'avatar-admin' : ''}`} aria-hidden="true">
      <img src={admin ? ADMIN_AVATAR_ASSET : USER_AVATAR_ASSET} alt="" />
    </span>
  )
}

function ComputerGraphic({ laptopMode = false }) {
  return <span className={`computer-graphic ${laptopMode ? 'laptop-graphic' : ''}`} aria-hidden="true">
    <img className="computer-graphic-image" src={laptopMode ? MACBOOK_ASSET : DESKTOP_ASSET} alt="" />
  </span>
}

function Toast({ message, onClose }) {
  if (!message) return null
  return <div className="toast" role="status"><CheckCircle2 size={20} />{message}<button onClick={onClose} aria-label="Fechar aviso"><X size={16} /></button></div>
}

function StatusPill({ type, children }) {
  const status = STATUS[type] || STATUS.active
  return <span className="status-pill" style={{ '--pill-bg': status.color, '--pill-ink': status.ink }}>{children || status.text}</span>
}

function AppHeader({ mode, active, onNotifications, onProfile, onToast }) {
  const navigate = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const isAdmin = mode === 'admin'
  const nav = isAdmin
    ? [
        ['Início', '/admin', 'home'],
        ['Ordens de Serviço', '/admin/ordens', 'orders'],
        ['Manutenções', '/admin/manutencoes', 'maintenance'],
      ]
    : [
        ['Início', '/home', 'home'],
        ['Meus PCs', '/meus-pcs', 'computers'],
        ['Histórico', '/historico', 'history'],
      ]

  return (
    <header className="topbar">
      <button className="brand-home" onClick={() => navigate(isAdmin ? '/admin' : '/home')} aria-label="NEXUS início"><BrandMark size={110} /></button>
      <nav className="main-nav" aria-label="Navegação principal">
        {nav.map(([label, path, key]) => (
          <button key={key} className={`nav-link ${active === key ? 'is-active' : ''}`} onClick={() => navigate(path)}>{label}</button>
        ))}
      </nav>
      <div className="topbar-actions">
        <button className="bell-button" onClick={onNotifications} aria-label="Notificações"><Bell size={27} />{isAdmin && <i>3</i>}</button>
        <button className="profile-trigger" onClick={() => setProfileOpen(v => !v)} aria-expanded={profileOpen}>
          <Avatar admin={isAdmin} />
          <span>Olá, {isAdmin ? 'Admin' : 'Usuário'}!</span>
          <ChevronDown size={22} />
        </button>
      </div>
      {profileOpen && <div className="profile-menu">
        <strong>{isAdmin ? 'Administrador' : 'Solicitante'}</strong>
        <button onClick={() => { navigate(isAdmin ? '/home' : '/admin'); setProfileOpen(false) }}>{isAdmin ? 'Área do usuário' : 'Área administrativa'}</button>
        {isAdmin && <button onClick={() => { navigate('/admin/cadastro-usuario'); setProfileOpen(false) }}>Cadastrar usuário</button>}
        <button onClick={() => { navigate('/'); onToast('Sessão encerrada') }}>Sair do sistema</button>
      </div>}
    </header>
  )
}

function NotificationsPanel({ open, onClose, onSelect }) {
  if (!open) return null
  const requests = [
    ['Lucas Santos', 'Ontem - 00:11'],
    ['Matheus Moraes', '29/09/2026 - 07:51'],
    ['Sergio Prates', '28/09/2026 - 23:42'],
  ]
  return <div className="notifications-panel">
    <div className="notifications-heading"><strong>Solicitações de cadastro</strong><button onClick={onClose} aria-label="Fechar notificações"><X size={16} /></button></div>
    {requests.map(([name, date]) => <button className="notification-item" key={name} onClick={() => onSelect(name)}>
      <span className="notification-dot" />
      <span><b>{name} solicitou acesso</b><small>{date}</small></span>
      <ChevronRight size={21} />
    </button>)}
  </div>
}

function PageFrame({ mode, active, children, onToast, onOpenService }) {
  const [notices, setNotices] = useState(false)
  const navigate = useNavigate()
  const toast = onToast
  const openNotification = () => setNotices(value => !value)
  return <div className="app-page">
    <AppHeader mode={mode} active={active} onNotifications={openNotification} onToast={toast} />
    <NotificationsPanel open={notices} onClose={() => setNotices(false)} onSelect={() => { setNotices(false); onOpenService?.() }} />
    {children}
  </div>
}

function LoginPage({ onToast }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const login = event => {
    event.preventDefault()
    navigate(email.toLowerCase().includes('admin') ? '/admin' : '/home')
  }

  return <main className="auth-screen">
    <section className="auth-brand-panel">
      <img className="hero-brand-reference auth-hero-mark" src={BRAND_ASSET} alt="NEXUS" />
      <div className="auth-brand-copy">
        <h2>Bem-vindo ao <span>NEXUS</span></h2>
        <p>Gerencie, acompanhe e otimize a<br />manutenção de seus hardwares</p>
      </div>
    </section>
    <section className="auth-form-panel">
      <form className="auth-card" onSubmit={login}>
        <h1>Acessar Sistema</h1>
        <p className="auth-subtitle">Faça login para continuar</p>
        <label>Email</label>
        <div className="input-with-icon"><UserRound size={21} /><input type="email" autoComplete="username" placeholder="ex: usuario@gmail.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
        <label>Senha</label>
        <div className="input-with-icon"><ShieldCheck size={21} /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={e => setPassword(e.target.value)} required /><button type="button" className="input-action" onClick={() => setShowPassword(v => !v)} aria-label="Mostrar ou ocultar senha">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
        <div className="login-options"><label className="remember"><input type="checkbox" /> Lembrar-me</label><button type="button" onClick={() => onToast('Entre em contato com o administrador do sistema')}>Esqueci a senha?</button></div>
        <button className="primary-button login-button" type="submit">Fazer Login</button>
        <div className="or-divider"><span />OU<span /></div>
        <p className="access-instructions">Solicite o acesso à plataforma enviando para este email:<br /><a href="mailto:admin@gmail.com">admin@gmail.com</a> as seguintes informações: nome<br />completo, cpf e login de rede institucional.</p>
      </form>
    </section>
  </main>
}

function ProgressSteps({ current = 2 }) {
  const steps = ['Recebido', 'Em diagnóstico', 'Em preparo', 'Aguardando retirada']
  return <div className="progress-steps">
    {steps.map((step, index) => <div className={`progress-step ${index < current ? 'complete' : ''} ${index === current ? 'current' : ''}`} key={step}>
      <span className="step-icon">{index < current ? <CheckCircle2 size={29} /> : index === current ? <Loader size={34} /> : <Circle size={34} />}</span>
      {index < steps.length - 1 && <span className={`step-line ${index < current ? 'complete' : ''}`} />}
      <b>{step}</b>
    </div>)}
  </div>
}

function UserHome({ onToast, openRequest }) {
  const navigate = useNavigate()
  return <PageFrame mode="user" active="home" onToast={onToast}>
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

function RequestModal({ onClose, onSubmit }) {
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <form className="request-modal" onSubmit={e => { e.preventDefault(); onSubmit() }}>
      <div className="modal-title"><span className="modal-icon"><Wrench size={23} /></span><h2>Solicitar nova manutenção</h2><button type="button" onClick={onClose} aria-label="Fechar"><X size={23} /></button></div>
      <div className="form-section"><label>EQUIPAMENTO <em>*</em><small>Selecione o equipamento que necessita de manutenção</small></label><select required defaultValue=""><option value="" disabled>▣ &nbsp; Selecione a máquina</option><option>PC-0010 · Desktop de usuário</option></select></div>
      <div className="form-section"><label>O QUE ESTÁ ACONTECENDO? <em>*</em><small>Descreva o que está acontecendo de errado com o equipamento</small></label><textarea required placeholder="Ex.: O equipamento está muito lento, travando, etc..." /></div>
      <div className="form-section frequency-section"><label>COM QUE FREQUÊNCIA OCORRE O PROBLEMA? <em>*</em><small>Assim a equipe pode avaliar melhor a frequência com que o problema relatado ocorre</small></label><div className="radio-grid">
        {['Sempre que utiliza', 'Mais de uma vez por semana', 'Raramente', 'Não sei informar', 'Começou hoje'].map(item => <label key={item}><input type="radio" name="frequency" required />{item}</label>)}
      </div></div>
      <div className="form-section attach-section"><label>ANEXAR ARQUIVOS <small>(opcional)</small><small>Arquivos de vídeo ou prints podem ajudar na solução do problema!</small></label><label className="dropzone"><Paperclip size={24} /><span>Arraste arquivos aqui ou clique para selecionar<small>Vídeo, JPG, PNG, PDF, etc.</small></span><input type="file" multiple /></label></div>
      <small className="required-note">Todos os campos com <em>*</em> são obrigatórios.</small>
      <button className="submit-request" type="submit">Enviar solicitação</button>
    </form>
  </div>
}

const computerInventory = {
  desktop: {
    id: '001', nickname: 'Desktop de usuário', status: 'Em Manutenção', statusType: 'maintenance',
    lastMaintenance: 'Em andamento', warranty: '-------------', model: 'Desktop Lenovo ThinkCenter',
    kind: 'desktop', cpu: 'Intel core i5 10500F', ram: '8GB', gpu: 'Intel graphics', operatingSystem: 'Window 11 PRO',
    details: [['Armazenamento', 'SSD 1TB'], ['Memória', '8GB, DDR4, 2666 MHZ']],
  },
  macbook: {
    id: '002', nickname: 'MacBook de usuário', status: 'Em uso', statusType: 'inUse',
    lastMaintenance: '28/06/2026', warranty: '12/2026', model: 'MacBook air',
    kind: 'laptop', cpu: 'Apple M3', ram: '16GB', gpu: 'Apple Silicon', operatingSystem: 'MacOS',
    details: [['S.O', 'MacOS'], ['CPU', 'Apple M3'], ['Tela', 'Liquid Retina 13,6 Polegadas'], ['GPU', 'Apple Silicon']],
  },
}

function DeviceCard({ device, onHistory }) {
  return <article className="device-card">
    <h3>{device.model}</h3>
    <div className="device-card-main"><ComputerGraphic laptopMode={device.kind === 'laptop'} /><div><p><b>CPU:</b> {device.cpu}</p><p><b>RAM:</b> {device.ram}</p><p><b>GPU:</b> {device.gpu}</p><p><b>S.O:</b> {device.operatingSystem}</p></div></div>
    <div className="device-details"><b>MAIS DETALHES</b>{device.details.map(([label, value]) => <p key={label}><b>{label}:</b> {value}</p>)}</div>
    <button onClick={onHistory}>HISTÓRICO DE MANUTENÇÕES <ChevronRight size={17} /></button>
  </article>
}

function MyComputers({ onToast, onScan, macbookAdded }) {
  const navigate = useNavigate()
  const devices = [computerInventory.desktop, ...(macbookAdded ? [computerInventory.macbook] : [])]
  return <PageFrame mode="user" active="computers" onToast={onToast}>
    <main className="page-content computers-content">
      <div className="page-title-row"><h1 className="page-title">Olá, usuário! Seus Computadores.</h1><button className="outline-button scan-button" onClick={onScan}><Barcode size={22} />Leitura automática</button></div>
      <div className="table-scroll computers-table-scroll">
        <div className="computers-table" role="table" aria-label="Computadores cadastrados">
          <div className="computers-table-head" role="row">
            {['PC ID', 'APELIDO', 'STATUS', 'ULTIMA MANUTENÇÃO', 'GARANTIA', 'AÇÕES'].map(label => <span role="columnheader" key={label}>{label}</span>)}
          </div>
          <div className="computers-table-body" role="rowgroup">
            {devices.map(device => <div className="computers-table-row" role="row" key={device.id}>
              <span role="cell">{device.id}</span>
              <span role="cell">{device.nickname}</span>
              <span role="cell"><StatusPill type={device.statusType}>{device.status}</StatusPill></span>
              <span role="cell">{device.lastMaintenance}</span>
              <span role="cell">{device.warranty}</span>
              <span role="cell" className="action-cell"><button aria-label={`Atualizar ${device.nickname}`} onClick={() => onToast('Dados atualizados')}><RefreshCw size={20} /></button><button aria-label={`Excluir ${device.nickname}`} onClick={() => onToast('Equipamento removido da lista')}><Trash2 size={20} /></button></span>
            </div>)}
          </div>
        </div>
      </div>
      <div className="device-card-list">{devices.map(device => <DeviceCard key={device.id} device={device} onHistory={() => navigate('/historico')} />)}</div>
    </main>
  </PageFrame>
}

function HistoryPage({ onToast }) {
  const history = [
    ['Pedido de usuário', 'Em Manutenção', 'Troca de SSD', '----------------', 'João Silva', 'maintenance'],
    ['Pedido de usuário', 'Concluída', 'Lentidão', '30/05/2026', 'João Silva', 'done'],
    ['Pedido de usuário', 'Concluída', 'Não liga', '12/04/2026', 'Carlos Costa', 'done'],
  ]
  return <PageFrame mode="user" active="history" onToast={onToast}>
    <main className="page-content history-content">
      <h1 className="page-title">Histórico de manutenções</h1>
      <div className="history-summary"><div><ListFilter /><b>3</b><span>Totais</span></div><div><CheckCircle2 /><b>2</b><span>Concluídas</span></div><div><Clock3 /><b>1</b><span>Em andamento</span></div></div>
      <div className="history-list">{history.map(row => <div className="history-row" key={row[2]}>
        {row.map((cell, index) => index === 5 ? <span key={index}><StatusPill type={cell}>{row[1]}</StatusPill></span> : <span key={index} className={index === 0 ? 'history-order' : ''}>{cell}</span>)}
      </div>)}</div>
    </main>
  </PageFrame>
}

function ScanModal({ status, onClose, onComplete, onConfirm }) {
  useEffect(() => {
    if (status !== 'reading') return undefined
    const timer = window.setTimeout(onComplete, 1800)
    return () => window.clearTimeout(timer)
  }, [status, onComplete])
  return <div className="modal-backdrop scan-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    {status === 'reading' ? <section className="scan-modal">
      <div className="scan-title"><FileText size={37} /><h2>FAZENDO LEITURA</h2></div>
      <div className="scan-symbol"><Monitor size={123} /><Settings size={73} /></div>
      <strong>REALIZANDO LEITURA</strong>
      <div className="scan-progress"><i /></div>
    </section> : <section className="scan-modal scan-complete">
      <div className="scan-title"><CheckCircle2 size={42} /><h2>LEITURA CONCLUÍDA</h2></div>
      <article className="scan-device"><h3>MacBook Air</h3><div><ComputerGraphic laptopMode /><ul><li><b>CPU:</b> Apple M3</li><li><b>RAM:</b> 16GB</li><li><b>Armazenamento:</b> 512 GB</li><li><b>GPU:</b> Apple Silicon</li></ul></div><hr /><h3>MAIS DETALHES</h3><p>• <b>CPU:</b> Apple M3</p><p>• <b>Tela:</b> Liquid Retina 13,6 Polegadas</p><p>• <b>GPU:</b> Apple Silicon</p></article>
      <div className="scan-complete-actions"><button className="accept-button" onClick={onConfirm}><Check size={19} /> Concluir</button><button className="cancel-button" onClick={onClose}><X size={19} /> Cancelar</button></div>
    </section>}
  </div>
}

function MetricCard({ icon: Icon, value, title, percentage, tone = 'blue' }) {
  const showPercentage = tone === 'orange' || tone === 'red'
  return <article className={`metric-card metric-${tone}`}><div className="metric-icon"><Icon size={35} /></div><div className="metric-value">{value}</div><p>{title}</p><div className="metric-progress-row"><div className="metric-track"><i style={{ width: `${percentage}%` }} /></div>{showPercentage && <span className="metric-percent">{percentage}%</span>}</div><button>Ver todas</button></article>
}

function AdminHome({ onToast, openService }) {
  const navigate = useNavigate()
  return <PageFrame mode="admin" active="home" onToast={onToast} onOpenService={openService}>
    <main className="page-content admin-home-content">
      <h1 className="page-title">Olá, Admin! Bem-vindo ao NEXUS.</h1>
      <div className="admin-dashboard-grid">
        <section className="admin-main-column">
          <article className="panel general-summary">
            <div className="section-title-row"><h2>RESUMO GERAL</h2><span className="updated-chip">Atualizado Agora</span></div>
            <div className="metric-grid">
              <MetricCard icon={FileText} value="10" title="Ordens de serviço no total" percentage={80} tone="blue" />
              <MetricCard icon={Settings} value="3" title="Manutenções ativas" percentage={35} tone="cyan" />
              <MetricCard icon={Clock3} value="2" title="Aguardando peças" percentage={75} tone="orange" />
              <MetricCard icon={Activity} value="1" title="Atrasada" percentage={25} tone="red" />
            </div>
          </article>
          <article className="panel admin-active-list">
            <h2>MANUTENÇÕES ATIVAS</h2>
            <SimpleServiceTable rows={serviceOrders.slice(0, 3)} onSelect={openService} compact />
          </article>
          <article className="panel alerts-card"><h2>ALERTAS E PENDÊNCIAS</h2><p className="alert-line alert-red"><span className="alert-icon"><CircleAlert size={19} /></span>Você tem 01 manutenção atrasada</p><p className="alert-line alert-orange"><span className="alert-icon"><TriangleAlert size={19} /></span>Você tem 01 manutenção aguardando peças</p></article>
        </section>
        <aside className="admin-side-column">
          <article className="panel stats-panel"><div className="section-title-row"><h2>ESTATÍSTICAS</h2><span className="date-chip">JUN/2026</span></div>
            <div className="stat-row"><UserRound /><span>Total de usuários</span><b>20</b></div>
            <div className="stat-row"><Monitor /><span>Total de máquinas</span><b>32</b></div>
            <div className="stat-row"><Cpu /><span>Peças em estoque</span><b>64</b></div>
            <div className="status-chart-wrap"><StatusDonut compact /><div className="chart-legend"><span><i className="blue-dot" />O.S dentro do prazo</span><span><i className="pink-dot" />O.S atrasadas</span></div></div>
            <div className="bar-chart-wrap"><ResponsiveContainer width="100%" height={150}><BarChart data={[{ name: 'O.S TOTAIS', value: 10 }, { name: 'FINALIZADAS', value: 7 }, { name: 'O.S ATIVAS', value: 3 }]} layout="vertical" margin={{ left: 4, right: 18, top: 4, bottom: 4 }}><CartesianGrid vertical horizontal={false} stroke="#e1e5eb" /><XAxis type="number" tick={{ fontSize: 12, fill: '#67758b' }} /><YAxis type="category" dataKey="name" width={112} tick={{ fontSize: 11, fill: '#536177' }} axisLine={false} tickLine={false} /><Bar dataKey="value" fill="#8b75f5" radius={[0, 5, 5, 0]} barSize={25} /></BarChart></ResponsiveContainer></div>
          </article>
        </aside>
      </div>
    </main>
  </PageFrame>
}

function SimpleServiceTable({ rows, onSelect, compact = false }) {
  return <div className="table-scroll"><table className={`data-table service-table ${compact ? 'compact-table' : ''}`}><thead><tr><th>OS</th><th>EQUIPAMENTO</th><th>USUÁRIO</th><th>STATUS</th>{!compact && <><th>PRIORIDADE</th><th>MTTR</th></>}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><button className="link-button" onClick={() => onSelect?.(row)}>{row.id}</button></td><td>{row.equipment}</td><td>{row.user}</td><td><StatusPill type={row.status} /></td>{!compact && <><td><StatusPill type={row.priority === 'Baixa' ? 'done' : row.priority === 'Média' ? 'waiting' : row.priority === 'Alta' ? 'late' : row.status}>{row.priority}</StatusPill></td><td>{row.mttr}</td></>}</tr>)}</tbody></table></div>
}

const mtbfData = [
  { month: 'JAN', value: 2.6 }, { month: 'FEV', value: 4.1 }, { month: 'MAR', value: 5 },
  { month: 'ABR', value: 3.4 }, { month: 'MAI', value: 3.2 }, { month: 'JUN', value: 4.5 }, { month: 'JUL', value: 3.6 },
]
const mttrData = [
  { month: 'JAN', value: 0.4 }, { month: 'FEV', value: 1.2 }, { month: 'MAR', value: 2.1 },
  { month: 'ABR', value: 5.4 }, { month: 'MAI', value: 7.4 }, { month: 'JUN', value: 4.5 }, { month: 'JUL', value: 8.8 },
]

function TrendCard({ title, value, caption, color, data, icon: Icon }) {
  return <article className="trend-card"><h3>{title}</h3><div className="trend-value"><Icon size={27} style={{ color }} /><b>{value}</b></div><p>{caption}</p><ResponsiveContainer width="100%" height={138}><LineChart data={data} margin={{ top: 9, right: 2, bottom: 1, left: -23 }}><CartesianGrid stroke="#e5e8ee" vertical horizontal /><XAxis dataKey="month" tick={{ fontSize: 10, fill: '#68758a' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 9, fill: '#68758a' }} axisLine={false} tickLine={false} /><Tooltip /><Line dataKey="value" type="linear" stroke={color} strokeWidth={2.5} dot={{ r: 3, fill: color, strokeWidth: 0 }} /></LineChart></ResponsiveContainer></article>
}

function StatusDonut({ compact = false }) {
  const data = compact
    ? [{ value: 75, color: '#307db7' }, { value: 25, color: '#ff7c82' }]
    : [
        { value: 58.34, color: '#72ee71' }, { value: 25, color: '#a9c4ff' },
        { value: 8.33, color: '#ffcfac' }, { value: 8.33, color: '#ff8e96' },
      ]
  const circumference = 2 * Math.PI * 37.5
  let offset = 0
  return <div className={`donut-chart ${compact ? 'donut-compact' : ''}`}>
    <svg viewBox="0 0 100 100" role="img" aria-label={compact ? '75% dentro do prazo e 25% atrasadas' : 'Ordens de serviço por status'}>
      <circle cx="50" cy="50" r="37.5" fill="none" stroke="#edf0f5" strokeWidth="25" />
      {data.map((entry, index) => {
        const length = (entry.value / 100) * circumference
        const currentOffset = offset
        offset += length
        return <circle key={index} cx="50" cy="50" r="37.5" fill="none" stroke={entry.color} strokeWidth="25" strokeDasharray={`${length} ${circumference}`} strokeDashoffset={-currentOffset} transform="rotate(-90 50 50)" />
      })}
    </svg>
    {!compact && <div className="donut-center"><b>10</b><span>Total de OS</span></div>}
  </div>
}

function AdminOrders({ onToast, openService }) {
  const [month, setMonth] = useState('JUL/2026')
  return <PageFrame mode="admin" active="orders" onToast={onToast} onOpenService={openService}>
    <main className="page-content orders-content">
      <h1 className="page-title page-title-icon"><ClipboardList />Ordens de Serviço</h1>
      <div className="orders-overview">
        <section className="panel trends-panel">
          <div className="section-title-row"><h2>Desempenho (MTBF E MTTR)</h2><select aria-label="Mês" value={month} onChange={e => setMonth(e.target.value)}><option>JUL/2026</option><option>JUN/2026</option><option>MAI/2026</option></select></div>
          <div className="trends-grid"><TrendCard title="MTBF" value="28 Dias" caption="Tempo médio entre falhas" color="#8877ff" data={mtbfData} icon={CalendarDays} /><TrendCard title="MTTR" value="4h32min" caption="Tempo médio de reparo" color="#70ee71" data={mttrData} icon={Clock3} /></div>
        </section>
        <section className="panel orders-status-panel"><h2>Ordens de serviço por status</h2><div className="orders-donut-row"><div className="donut-container"><StatusDonut /><div className="donut-center"><b>10</b><span>Total de OS</span></div></div><div className="chart-legend vertical-legend"><span><i className="green-dot" />Concluídas <small>7(70%)</small></span><span><i className="blue-dot" />Em andamento <small>3(30%)</small></span><span><i className="orange-dot" />Aguardando peças <small>1(10%)</small></span><span><i className="pink-dot" />Atrasadas <small>1(10%)</small></span></div></div></section>
      </div>
      <section className="panel orders-table-panel"><h2>Ordens de serviço</h2><SimpleServiceTable rows={serviceOrders} onSelect={openService} /></section>
    </main>
  </PageFrame>
}

function AdminMaintenance({ onToast, openService }) {
  const [filter, setFilter] = useState('Todas')
  const visibleRows = serviceOrders.slice(0, 3).filter(row => filter === 'Todas' || (filter === 'Atrasadas' && row.status === 'late') || (filter === 'Em diagnóstico' && row.status === 'diagnosis') || (filter === 'Aguardando' && row.status === 'waiting'))
  return <PageFrame mode="admin" active="maintenance" onToast={onToast} onOpenService={openService}>
    <main className="page-content maintenance-content">
      <h1 className="page-title page-title-icon"><span className="maintenance-title-glyph" aria-hidden="true"><ClipboardList /><Settings /></span>Manutenções Ativas</h1>
      <section className="maintenance-summary">
        <div className="maintenance-summary-title"><Settings size={28} /><b>MANUTENÇÕES EM ANDAMENTO</b></div>
        <button onClick={() => setFilter('Todas')}><ListFilter /><b>3</b><span>Totais</span></button>
        <button onClick={() => setFilter('Atrasadas')}><Activity /><b>1</b><span>Atrasadas</span></button>
        <button onClick={() => setFilter('Em diagnóstico')}><LoaderCircle /><b>1</b><span>Em diagnóstico</span></button>
        <button onClick={() => setFilter('Aguardando')}><Clock3 /><b>1</b><span>Aguardando</span></button>
      </section>
      <section className="panel maintenance-table-panel"><div className="table-scroll"><table className="data-table maintenance-table"><thead><tr><th>OS</th><th>EQUIPAMENTO</th><th>USUÁRIO</th><th>DATA INÍCIO</th><th>PRAZO</th><th>STATUS</th></tr></thead><tbody>{visibleRows.map((row, index) => <tr key={row.id}><td><button className="link-button" onClick={() => openService(row)}>{row.id}</button></td><td>{row.equipment}</td><td>{row.user === 'João' ? 'João' : row.user === 'Gabriel' ? 'Gabriel' : 'Claudio'}</td><td>{['24/06/2026', '22/06/2026', '20/06/2026'][index]}</td><td>{['29/06/2026', '27/06/2026', '25/06/2026'][index]}</td><td><StatusPill type={row.status} /></td></tr>)}</tbody></table></div></section>
    </main>
  </PageFrame>
}

function ServiceModal({ service, onClose, onToast }) {
  const [status, setStatus] = useState(service?.status || 'diagnosis')
  const [menu, setMenu] = useState(false)
  const [notes, setNotes] = useState('')
  const steps = [
    ['Recebida', '24/06/2026 · 08:40'], ['Em diagnóstico', 'Em andamento desde 10:05'],
    ['Em manutenção', 'Formatação e peça técnica'], ['Aguardando peças', 'Opcional: se faltar peça'],
    ['Pronta para retirada', 'O usuário é avisado'], ['Concluída', 'Registra a solução aplicada'],
  ]
  return <div className="modal-backdrop service-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <section className="service-modal">
      <div className="service-modal-heading"><span className="modal-icon"><ClipboardList size={26} /></span><div className="service-title-group"><small>ORDEM DE SERVIÇO</small><h2>{service?.id || 'OS-2026-0010'}</h2></div><StatusPill type="done">● Prioridade · {service?.priority || 'Baixa'}</StatusPill><span className="date-chip">Início &nbsp; 24/06/2026</span><span className="date-chip">Prazo &nbsp; 29/06/2026</span><button onClick={onClose} aria-label="Fechar"><X /></button></div>
      <div className="service-modal-body">
        <div className="service-detail-column">
          <article className="detail-card client-card"><h3>CLIENTE</h3><div className="detail-grid"><p><small>NOME</small><b>João Pedro Arantes</b></p><p><small>SETOR</small><b>Recursos Humanos</b></p><p><small>TELEFONE</small><b>(61) 91234-4321</b></p><p><small>CPF</small><b>***.123.123-**</b></p></div></article>
          <article className="detail-card specs-card"><h3>ESPECIFICAÇÕES DA MÁQUINA</h3><div className="detail-grid spec-grid"><p><small>MODELO</small><b>Desktop Lenovo<br />ThinkCentre</b></p><p><small>PATRIMÔNIO</small><b>123456</b></p><p><small>SISTEMA OPERACIONAL</small><b>Windows 11 Pro</b></p><p><small>ARMAZENAMENTO</small><b>SSD 1TB</b></p><p><small>EQUIPAMENTO</small><b>PC-0010</b></p><p><small>CPU</small><b>Intel Core i5 10500F</b></p><p><small>MEMÓRIA RAM</small><b>8GB DDR4 · 2666 MHz</b></p><p><small>GPU</small><b>Intel Graphics</b></p></div></article>
          <article className="detail-card problem-card"><div className="section-title-row"><h3>PROBLEMA RELATADO</h3><span className="frequency-chip">Frequência &nbsp; Sempre que utiliza a máquina</span></div><p>O usuário relata problemas recorrentes de lentidão no equipamento, com desempenho abaixo do esperado e incompatível com o histórico de utilização da máquina. Informa que a demora na inicialização do sistema e na abertura de programas tem impactado diretamente a execução de suas atividades.</p></article>
          <article className="detail-card observations-card"><h3>OBSERVAÇÕES DO TÉCNICO</h3><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Nenhuma observação registrada até o momento." /></article>
          <article className="detail-card attachments-card"><h3>ANEXOS</h3><button onClick={() => onToast('Abrindo anexo Fotos PC.JPG')}><Paperclip size={23} />Fotos PC.JPG</button></article>
        </div>
        <aside className="service-status-column"><h3>STATUS DA OS</h3><StatusPill type={status} /><small className="updated-text">Atualizado em 24/06/2026 às 10:05 por Admin</small>
          <div className="timeline">{steps.map((step, index) => <div className={`timeline-step ${index <= (status === 'late' ? 2 : status === 'done' ? 5 : 1) ? 'reached' : ''} ${index === (status === 'late' ? 2 : status === 'done' ? 5 : 1) ? 'timeline-current' : ''}`} key={step[0]}><span>{index <= 1 ? <Check size={13} /> : null}</span><div><b>{step[0]}</b><small>{step[1]}</small></div></div>)}</div>
          <div className="status-menu-wrap"><button className="change-status-button" onClick={() => setMenu(v => !v)}><RefreshCw size={16} />Alterar status <ChevronDown size={16} /></button>{menu && <div className="status-menu">{['diagnosis', 'waiting', 'late', 'done'].map(type => <button key={type} onClick={() => { setStatus(type); setMenu(false); onToast(`Status atualizado: ${STATUS[type].text}`) }}>{STATUS[type].text}</button>)}</div>}</div>
          <div className="change-history"><h4>HISTÓRICO DE ALTERAÇÕES</h4><p><i />Em diagnóstico<small>24/06/2026 às 10:05 · Admin</small></p><p><i />Recebida<small>24/06/2026 às 08:40 · Sistemas · OS aberta</small></p></div>
        </aside>
      </div>
    </section>
  </div>
}

function UserRegistration({ onToast }) {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  return <main className="registration-screen">
    <section className="registration-brand-panel">
      <button className="back-button" onClick={() => navigate('/admin')} aria-label="Voltar"><ArrowLeft /></button>
      <img className="hero-brand-reference registration-hero-mark" src={BRAND_ASSET} alt="NEXUS" />
      <p>Olá admin, cadastre<br />novos usuários no<br /><span>NEXUS</span></p>
    </section>
    <section className="registration-form-panel"><form className="registration-card" onSubmit={e => { e.preventDefault(); setSubmitted(true); onToast('Usuário cadastrado com sucesso') }}>
      <h1>Cadastrar usuário</h1><p>Os dados do usuário foram enviados pelo email, consulte-os para cadastra-los.</p><div className="required-intro"><em>*</em> Campos obrigatórios</div>
      <label>Nome completo <em>*</em><input required placeholder="Digite o nome completo do usuário" /></label>
      <label>CPF <em>*</em><input required placeholder="Digite o cpf do usuário (ex: 12345678900)" /></label>
      <label>Login de rede institucional <em>*</em><input required placeholder="Digite o login de rede institucional do usuário" /></label>
      <button className="primary-button" type="submit">Cadastrar</button>
      {submitted && <small className="form-success">Cadastro enviado por e-mail.</small>}
    </form></section>
  </main>
}

function ToastViewport({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(onClose, 3600)
    return () => window.clearTimeout(timer)
  }, [toast, onClose])
  return <Toast message={toast} onClose={onClose} />
}

function NexusApp() {
  const location = useLocation()
  const navigate = useNavigate()
  const [toast, setToast] = useState('')
  const [requestOpen, setRequestOpen] = useState(false)
  const [scannerState, setScannerState] = useState('')
  const [macbookAdded, setMacbookAdded] = useState(false)
  const [service, setService] = useState(null)
  const showToast = message => setToast(message)
  const closeToast = () => setToast('')
  const openService = item => setService(item || serviceOrders[0])
  const closeService = () => setService(null)
  const completeScan = () => setScannerState('complete')
  const confirmScan = () => {
    setMacbookAdded(true)
    setScannerState('')
  }

  useEffect(() => {
    if (location.pathname === '/sair') navigate('/')
  }, [location.pathname, navigate])

  const page = useMemo(() => {
    switch (location.pathname) {
      case '/home': return <UserHome onToast={showToast} openRequest={() => setRequestOpen(true)} />
      case '/meus-pcs': return <MyComputers onToast={showToast} onScan={() => setScannerState('reading')} macbookAdded={macbookAdded} />
      case '/historico': return <HistoryPage onToast={showToast} />
      case '/admin': return <AdminHome onToast={showToast} openService={openService} />
      case '/admin/ordens': return <AdminOrders onToast={showToast} openService={openService} />
      case '/admin/manutencoes': return <AdminMaintenance onToast={showToast} openService={openService} />
      case '/admin/cadastro-usuario': return <UserRegistration onToast={showToast} />
      default: return <LoginPage onToast={showToast} />
    }
  }, [location.pathname, macbookAdded])

  return <>
    {page}
    {requestOpen && <RequestModal onClose={() => setRequestOpen(false)} onSubmit={() => { setRequestOpen(false); showToast('Solicitação enviada com sucesso') }} />}
    {scannerState && <ScanModal status={scannerState} onClose={() => setScannerState('')} onComplete={completeScan} onConfirm={confirmScan} />}
    {service && <ServiceModal service={service} onClose={closeService} onToast={showToast} />}
    <ToastViewport toast={toast} onClose={closeToast} />
  </>
}

export default function App() {
  return <HashRouter><NexusApp /></HashRouter>
}
