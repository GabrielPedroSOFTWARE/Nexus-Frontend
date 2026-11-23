import { useNavigate } from 'react-router-dom'
import { Monitor } from 'lucide-react'
import { demoServiceOrders } from '../../features/service-orders/demoData.js'
import { PageFrame } from '../../shared/layout/PageFrame.jsx'

export function AdminEquipmentManagement({ profileName }) {
  const navigate = useNavigate()
  return <PageFrame mode="admin" active="home" profileName={profileName}>
    <main className="page-content maintenance-content connected-admin">
      <h1 className="page-title">Gestão de equipamentos</h1>
      <div className="connected-dashboard-toolbar"><span>Exemplo demonstrativo de equipamentos citados nas ordens de serviço.</span><button className="outline-button" onClick={() => navigate('/admin')}>Voltar ao painel</button></div>
      <section className="panel connected-panel connected-equipment-summary"><h2>Resumo de equipamentos</h2><div className="connected-equipment-total"><Monitor aria-hidden="true" /><span>Total de máquinas</span><b>32</b></div></section>
      <section className="panel connected-panel connected-equipment-list"><h2>Equipamentos associados às ordens de serviço</h2>
        <p className="equipment-api-notice">Esta lista contém dados fictícios do modo de demonstração. A versão conectada depende de uma rota administrativa do backend para exibir e alterar o inventário completo.</p>
        <div className="table-scroll"><table className="data-table"><thead><tr><th>EQUIPAMENTO</th><th>ORDEM DE SERVIÇO</th><th>STATUS DA ORDEM</th></tr></thead><tbody>
          {demoServiceOrders.map(order => <tr key={order.id}><td>{order.equipment}</td><td>{order.id}</td><td>{order.status === 'waiting' ? 'Aguardando peças' : order.status === 'diagnosis' ? 'Em diagnóstico' : order.status === 'late' ? 'Atrasada' : 'Concluída'}</td></tr>)}
        </tbody></table></div>
      </section>
    </main>
  </PageFrame>
}
