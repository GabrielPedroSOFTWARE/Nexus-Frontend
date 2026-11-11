import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { StatusPill } from '../../shared/ui/StatusPill.jsx'
import { hasLocalApi } from '../../shared/api/httpClient.js'
import { listUserOrders } from '../../features/service-requests/api.js'
import { useEffect, useState } from 'react'
import { ListFilter } from 'lucide-react'

export function HistoryPage({ onToast, profileName }) {
  const [apiHistory, setApiHistory] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!hasLocalApi) return undefined
    let active = true
    listUserOrders()
      .then(items => { if (active) { if (!Array.isArray(items)) throw new Error('Resposta inválida do backend.'); setApiHistory(items) } })
      .catch(err => { if (active) setError(err.message || 'Não foi possível carregar o histórico.') })
    return () => { active = false }
  }, [])
  const history = hasLocalApi
    ? (apiHistory || []).map(order => [order.id || 'Pedido', order.status == null ? 'Não informado' : 'Status ' + order.status, order.problema || order.descricao || 'Sem descrição', order.dataManutencao || '—', order.tecnico || 'Não atribuído', 'active'])
    : [['Pedido de usuário', 'Em Manutenção', 'Troca de SSD', '—', 'João Silva', 'maintenance'], ['Pedido de usuário', 'Concluída', 'Lentidão', '30/05/2026', 'João Silva', 'done'], ['Pedido de usuário', 'Concluída', 'Não liga', '12/04/2026', 'Carlos Costa', 'done']]
  return <PageFrame mode="user" active="history" onToast={onToast} profileName={profileName}>
    <main className="page-content history-content"><h1 className="page-title">Histórico de manutenções</h1>
      {error ? <p role="alert">Não foi possível carregar o histórico: {error}</p> : hasLocalApi && apiHistory === null ? <p>Carregando histórico...</p> : <>
        <div className="history-summary"><div><ListFilter /><b>{history.length}</b><span>Totais</span></div></div>
        {!history.length && <p>Nenhuma manutenção encontrada.</p>}
        <div className="history-list">{history.map((row, rowIndex) => <div className="history-row" key={row[0] + '-' + rowIndex}>
          {row.map((cell, index) => index === 5 ? <span key={index}><StatusPill type={cell}>{row[1]}</StatusPill></span> : <span key={index} className={index === 0 ? 'history-order' : ''}>{cell}</span>)}
        </div>)}</div>
      </>}
    </main>
  </PageFrame>
}
