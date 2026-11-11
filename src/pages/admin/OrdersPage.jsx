import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { STATUS } from '../../shared/constants.js'
import { demoServiceOrders, demoMtbfData, demoMttrData } from '../../features/service-orders/demoData.js'
import { SimpleServiceTable } from '../../features/service-orders/ServiceOrderTable.jsx'
import { StatusDonut, TrendCard } from '../../features/service-orders/ServiceOrderCharts.jsx'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, ClipboardList, Clock3, Search, X, SlidersHorizontal } from 'lucide-react'

export function AdminOrders({ onToast, openService }) {
  const navigate = useNavigate()
  const [month, setMonth] = useState('JUL/2026')
  const [query, setQuery] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState('Todos')
  const filteredOrders = demoServiceOrders.filter(order => {
    const matchesQuery = order.id.toLowerCase().includes(query.trim().toLowerCase())
    const matchesStatus = statusFilter === 'Todos' || STATUS[order.status]?.text === statusFilter
    return matchesQuery && matchesStatus
  })
  return <PageFrame mode="admin" active="orders" onToast={onToast} onOpenService={openService} onOpenAccess={() => navigate('/admin/solicitacoes')}>
    <main className="page-content orders-content">
      <h1 className="page-title page-title-icon"><ClipboardList />Ordens de Serviço</h1>
      <div className="orders-overview">
        <section className="panel trends-panel">
          <div className="section-title-row"><h2>Desempenho (MTBF E MTTR)</h2><select aria-label="Mês" value={month} onChange={e => setMonth(e.target.value)}><option>JUL/2026</option><option>JUN/2026</option><option>MAI/2026</option></select></div>
          <div className="trends-grid"><TrendCard title="MTBF" value="28 Dias" caption="Tempo médio entre falhas" color="#8877ff" data={demoMtbfData} icon={CalendarDays} /><TrendCard title="MTTR" value="4h32min" caption="Tempo médio de reparo" color="#70ee71" data={demoMttrData} icon={Clock3} /></div>
        </section>
        <section className="panel orders-status-panel"><h2>Ordens de serviço por status</h2><div className="orders-donut-row"><div className="donut-container"><StatusDonut /><div className="donut-center"><b>10</b><span>Total de OS</span></div></div><div className="chart-legend vertical-legend"><span><i className="green-dot" />Concluídas <small>7(70%)</small></span><span><i className="blue-dot" />Em andamento <small>3(30%)</small></span><span><i className="orange-dot" />Aguardando peças <small>1(10%)</small></span><span><i className="pink-dot" />Atrasadas <small>1(10%)</small></span></div></div></section>
      </div>
      <section className="panel orders-table-panel">
      <div className="orders-table-heading"><h2>Ordens de serviço</h2><div className="orders-controls">
          <label className="orders-search"><Search size={19} /><input aria-label="Buscar por número da ordem de serviço" placeholder="Buscar por nº da O.S. (ex: OS-2026-0010)" value={query} onChange={e => setQuery(e.target.value)} />{query && <button type="button" aria-label="Limpar busca" onClick={() => setQuery('')}><X size={16} /></button>}</label>
          <div className="orders-filter-wrap"><button className={`orders-filter-button ${filterOpen ? 'is-open' : ''}`} type="button" onClick={() => setFilterOpen(value => !value)} aria-expanded={filterOpen}><SlidersHorizontal size={18} />Filtros</button>
            {filterOpen && <div className="orders-filter-menu"><label>Status da ordem<select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>Todos</option>{Object.values(STATUS).map(status => status.text).filter((value, index, all) => all.indexOf(value) === index).map(value => <option key={value}>{value}</option>)}</select></label><button type="button" onClick={() => { setStatusFilter('Todos'); setQuery('') }}>Limpar filtros</button></div>}
          </div>
        </div></div>
        <SimpleServiceTable rows={filteredOrders} onSelect={openService} />
        {!filteredOrders.length && <p className="empty-orders">Nenhuma ordem encontrada com esses filtros.</p>}
      </section>
    </main>
  </PageFrame>
}
