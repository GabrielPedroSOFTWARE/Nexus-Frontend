import { useEffect, useState } from 'react'
import { apiRequest } from '../api/httpClient.js'
import { orderStatusLabel } from '../orderStatus.js'
import { ChevronRight, X } from 'lucide-react'

export function NotificationsPanel({ demo, open, onClose, onSelect }) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => {
    if (!open || demo) return undefined
    let active = true
    setItems(null); setError('')
    apiRequest('/retornar-notificacoes-usuario').then(data => {
      if (!Array.isArray(data)) throw new Error('Resposta inválida do backend.')
      if (active) setItems(data.map(({ id, resumo, prazo, status, lida }) => ({ id, resumo, prazo, status, lida })))
    }).catch(err => { if (active) setError(err.message || 'Não foi possível carregar as notificações.') })
    return () => { active = false }
  }, [open, demo])
  const selectNotification = async item => {
    try {
      if (!item.lida) await apiRequest('/marcar-notificacao/' + encodeURIComponent(item.id), { method: 'PATCH' })
      onSelect(item)
    } catch (err) { setError(err.message || 'Não foi possível marcar a notificação como lida.') }
  }
  if (!open) return null
  const requests = [['Lucas Santos', 'Ontem - 00:11'], ['Matheus Moraes', '29/09/2026 - 07:51'], ['Sergio Prates', '28/09/2026 - 23:42']]
  return <div className="notifications-panel">
    <div className="notifications-heading"><strong>{demo ? 'Solicitações de cadastro' : 'Notificações'}</strong><button onClick={onClose} aria-label="Fechar notificações"><X size={16} /></button></div>
    {demo ? requests.map(([name, date]) => <button className="notification-item" key={name} onClick={() => onSelect(name)}><span className="notification-dot" /><span><b>{name} solicitou acesso</b><small>{date}</small></span><ChevronRight size={21} /></button>) : <>
      {error ? <p role="alert" style={{ padding: '12px' }}>Não foi possível carregar as notificações: {error}</p> : items === null ? <p style={{ padding: '12px' }}>Carregando...</p> : items.length === 0 ? <p style={{ padding: '12px' }}>Nenhuma notificação encontrada.</p> : items.map(item => <button className="notification-item" key={item.id} onClick={() => selectNotification(item)}><span className="notification-dot" /><span><b>{item.resumo || 'Atualização de manutenção'}</b><small>{orderStatusLabel(item.status)}{item.prazo ? ` · Prazo: ${item.prazo}` : ''}</small></span><ChevronRight size={21} /></button>)}
    </>}
  </div>
}
