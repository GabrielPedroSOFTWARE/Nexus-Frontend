import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { StatusPill } from '../../shared/ui/StatusPill.jsx'
import { demoServiceOrders } from '../../features/service-orders/demoData.js'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ClipboardList, Clock3, ListFilter, Settings, LoaderCircle } from 'lucide-react'

export function AdminMaintenance({ onToast, openService }) {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('Todas')
  const visibleRows = demoServiceOrders.slice(0, 3).filter(row => filter === 'Todas' || (filter === 'Atrasadas' && row.status === 'late') || (filter === 'Em diagnóstico' && row.status === 'diagnosis') || (filter === 'Aguardando' && row.status === 'waiting'))
  return <PageFrame mode="admin" active="maintenance" onToast={onToast} onOpenService={openService} onOpenAccess={() => navigate('/admin/solicitacoes')}>
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
