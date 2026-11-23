import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { demoServiceOrders } from '../../features/service-orders/demoData.js'
import { SimpleServiceTable } from '../../features/service-orders/ServiceOrderTable.jsx'
import { StatusDonut } from '../../features/service-orders/ServiceOrderCharts.jsx'
import { useNavigate } from 'react-router-dom'
import { Activity, Clock3, Cpu, FileText, CircleAlert, TriangleAlert, Monitor, Settings, UserRound } from 'lucide-react'
import { CartesianGrid, ResponsiveContainer, XAxis, YAxis, BarChart, Bar } from 'recharts'

export function MetricCard({ icon: Icon, value, title, percentage, tone = 'blue', onClick }) {
  const showPercentage = tone === 'orange' || tone === 'red'
  return <article className={`metric-card metric-${tone}`}><div className="metric-icon"><Icon size={35} /></div><div className="metric-value">{value}</div><p>{title}</p><div className="metric-progress-row"><div className="metric-track"><i style={{ width: `${percentage}%` }} /></div>{showPercentage && <span className="metric-percent">{percentage}%</span>}</div><button type="button" onClick={onClick}>Ver todas</button></article>
}

function DashboardStat({ icon: Icon, label, value, onClick }) {
  const content = <><Icon aria-hidden="true" /><span>{label}</span><b>{value}</b>{onClick && <span className="stat-row-chevron" aria-hidden="true">›</span>}</>
  return onClick
    ? <button type="button" className="stat-row dashboard-stat-link" onClick={onClick} aria-label={`${label}: ${value}. Abrir gestão`}>{content}</button>
    : <div className="stat-row">{content}</div>
}

export function AdminHome({ onToast, openService, profile = '', profileName, isAdmin = false }) {
  const navigate = useNavigate()
  const roleLabel = isAdmin ? 'Administrador' : 'Técnico / Gestor'
  return <PageFrame mode="admin" active="home" profileName={profileName || roleLabel} canManageUsers={isAdmin} onToast={onToast} onOpenService={openService} onOpenAccess={() => navigate('/admin/solicitacoes')}>
    <main className="page-content admin-home-content">
      <h1 className="page-title">Olá, {roleLabel}! Bem-vindo ao NEXUS.</h1>
      <p className="demo-data-notice">Modo de demonstração: os indicadores e gráficos desta tela usam dados fictícios.</p>
      <div className="admin-dashboard-grid">
        <section className="admin-main-column">
          <article className="panel general-summary">
            <div className="section-title-row"><h2>RESUMO GERAL</h2><span className="updated-chip">Atualizado Agora</span></div>
            <div className="metric-grid">
              <MetricCard icon={FileText} value="10" title="Ordens de serviço no total" percentage={80} tone="blue" onClick={() => navigate('/admin/ordens')} />
              <MetricCard icon={Settings} value="3" title="Manutenções ativas" percentage={35} tone="cyan" onClick={() => navigate('/admin/manutencoes')} />
              <MetricCard icon={Clock3} value="2" title="Aguardando peças" percentage={75} tone="orange" onClick={() => navigate('/admin/manutencoes')} />
              <MetricCard icon={Activity} value="1" title="Atrasada" percentage={25} tone="red" onClick={() => navigate('/admin/manutencoes')} />
            </div>
          </article>
          <article className="panel admin-active-list">
            <div className="section-title-row"><h2>MANUTENÇÕES ATIVAS</h2><button className="admin-assigned-orders" onClick={() => navigate('/admin/manutencoes')}>Ver O.S. atribuídas a mim</button></div>
            <SimpleServiceTable rows={demoServiceOrders.slice(0, 3)} onSelect={openService} compact />
          </article>
          <article className="panel alerts-card"><h2>ALERTAS E PENDÊNCIAS</h2><p className="alert-line alert-red"><span className="alert-icon"><CircleAlert size={19} /></span>Você tem 01 manutenção atrasada</p><p className="alert-line alert-orange"><span className="alert-icon"><TriangleAlert size={19} /></span>Você tem 01 manutenção aguardando peças</p></article>
        </section>
        <aside className="admin-side-column">
          <article className="panel stats-panel"><div className="section-title-row"><h2>ESTATÍSTICAS</h2><span className="date-chip">JUN/2026</span></div>
            <DashboardStat icon={UserRound} label="Total de usuários" value="20" onClick={isAdmin ? () => navigate('/admin/usuarios') : undefined} />
            <DashboardStat icon={Monitor} label="Total de máquinas" value="32" onClick={isAdmin ? () => navigate('/admin/equipamentos') : undefined} />
            <div className="stat-row"><Cpu /><span>Peças em estoque</span><b>64</b></div>
            <div className="status-chart-wrap"><StatusDonut compact /><div className="chart-legend"><span><i className="blue-dot" />O.S dentro do prazo</span><span><i className="pink-dot" />O.S atrasadas</span></div></div>
            <div className="bar-chart-wrap"><ResponsiveContainer width="100%" height={150}><BarChart data={[{ name: 'O.S TOTAIS', value: 10 }, { name: 'FINALIZADAS', value: 7 }, { name: 'O.S ATIVAS', value: 3 }]} layout="vertical" margin={{ left: 4, right: 18, top: 4, bottom: 4 }}><CartesianGrid vertical horizontal={false} stroke="#e1e5eb" /><XAxis type="number" tick={{ fontSize: 12, fill: '#67758b' }} /><YAxis type="category" dataKey="name" width={112} tick={{ fontSize: 11, fill: '#536177' }} axisLine={false} tickLine={false} /><Bar dataKey="value" fill="#8b75f5" radius={[0, 5, 5, 0]} barSize={25} /></BarChart></ResponsiveContainer></div>
          </article>
        </aside>
      </div>
    </main>
  </PageFrame>
}
