import { useEffect, useState } from 'react'
import { apiRequest } from '../api/httpClient.js'
import { orderStatusLabel } from '../orderStatus.js'
import { ChevronRight, X } from 'lucide-react'

export function NotificationsPanel({ demo, mode, open, onClose, onSelect }) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!open || demo) return undefined
    let active = true
    setItems(null); setError('')
    const isUser = mode === 'user'
    const endpoint = isUser ? '/user/retornar-notificacoes-usuario' : '/backoffice/retornar-notificacoes-backoffice'
    apiRequest(endpoint).then(data => {
      if (!Array.isArray(data)) throw new Error('Resposta inválida do backend.')
      if (active) setItems(data.map(item => ({
        id: item.id,
        resumo: isUser ? item.resumo : item.mensagem,
        pedidoId: item.idPedido,
        prazo: item.prazo,
        dataCriacao: item.dataCriacao,
        status: item.status,
        lida: item.lida,
      })))
    }).catch(() => { if (active) setError('Não foi possível carregar as notificações. Tente novamente.') })
    return () => { active = false }
  }, [open, demo, mode])
  const selectNotification = async item => {
    try {
      if (mode === 'user' && !item.lida) await apiRequest('/user/marcar-notificacao-usuario/' + encodeURIComponent(item.id), { method: 'PATCH' })
      onSelect(item)
    } catch { setError('Não foi possível atualizar a notificação. Tente novamente.') }
  }
  if (!open) return null
  const requests = [['Lucas Santos', 'Ontem - 00:11'], ['Matheus Moraes', '29/09/2026 - 07:51'], ['Sergio Prates', '28/09/2026 - 23:42']]
  return <div className="notifications-panel">
    <div className="notifications-heading"><strong>{demo ? 'Solicitações de cadastro' : 'Notificações'}</strong><button onClick={onClose} aria-label="Fechar notificações"><X size={16} /></button></div>
    {demo ? requests.map(([name, date]) => <button className="notification-item" key={name} onClick={() => onSelect(name)}><span className="notification-dot" /><span><b>{name} solicitou acesso</b><small>{date}</small></span><ChevronRight size={21} /></button>) : <>
      {error ? <p role="alert" style={{ padding: '12px' }}>{error}</p> : items === null ? <p style={{ padding: '12px' }}>Carregando...</p> : items.length === 0 ? <p style={{ padding: '12px' }}>Nenhuma notificação encontrada.</p> : items.map(item => <button className="notification-item" key={item.id} onClick={() => selectNotification(item)}><span className={`notification-dot ${item.lida ? 'is-read' : ''}`} /><span><b>{item.resumo || 'Atualização de manutenção'}</b><small>{mode === 'user' && item.status != null ? orderStatusLabel(item.status) : item.pedidoId ? `Ordem ${item.pedidoId}` : ''}{item.prazo ? ` · Prazo: ${item.prazo}` : ''}{item.dataCriacao ? ` · ${new Intl.DateTimeFormat('pt-BR').format(new Date(item.dataCriacao))}` : ''}</small></span><ChevronRight size={21} /></button>)}
    </>}
  </div>
}
