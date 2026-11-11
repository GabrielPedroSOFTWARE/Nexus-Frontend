import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { demoServiceOrders } from '../../features/service-orders/demoData.js'
import { SimpleServiceTable } from '../../features/service-orders/ServiceOrderTable.jsx'
import { StatusDonut } from '../../features/service-orders/ServiceOrderCharts.jsx'
import { useNavigate } from 'react-router-dom'
import { Activity, Clock3, Cpu, FileText, CircleAlert, TriangleAlert, Monitor, Settings, UserRound } from 'lucide-react'
import { CartesianGrid, ResponsiveContainer, XAxis, YAxis, BarChart, Bar } from 'recharts'

export function MetricCard({ icon: Icon, value, title, percentage, tone = 'blue' }) {
  const showPercentage = tone === 'orange' || tone === 'red'
  return <article className={`metric-card metric-${tone}`}><div className="metric-icon"><Icon size={35} /></div><div className="metric-value">{value}</div><p>{title}</p><div className="metric-progress-row"><div className="metric-track"><i style={{ width: `${percentage}%` }} /></div>{showPercentage && <span className="metric-percent">{percentage}%</span>}</div><button>Ver todas</button></article>
}

export function AdminHome({ onToast, openService }) {
  const navigate = useNavigate()
  return <PageFrame mode="admin" active="home" profileName="Técnico" onToast={onToast} onOpenService={openService} onOpenAccess={() => navigate('/admin/solicitacoes')}>
    <main className="page-content admin-home-content">
      <h1 className="page-title">Olá, Técnico! Bem-vindo ao NEXUS.</h1>
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
            <div className="section-title-row"><h2>MANUTENÇÕES ATIVAS</h2><button className="admin-assigned-orders" onClick={() => navigate('/admin/manutencoes')}>Ver O.S. atribuídas a mim</button></div>
            <SimpleServiceTable rows={demoServiceOrders.slice(0, 3)} onSelect={openService} compact />
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
