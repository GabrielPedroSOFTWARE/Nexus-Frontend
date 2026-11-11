import { ChevronRight, X } from 'lucide-react'

export function NotificationsPanel({ demo, open, onClose, onSelect }) {
  if (!open) return null
  const requests = demo ? [
    ['Lucas Santos', 'Ontem - 00:11'],
    ['Matheus Moraes', '29/09/2026 - 07:51'],
    ['Sergio Prates', '28/09/2026 - 23:42'],
  ] : []
  return <div className="notifications-panel">
    <div className="notifications-heading"><strong>Solicitações de cadastro</strong><button onClick={onClose} aria-label="Fechar notificações"><X size={16} /></button></div>
    {!demo && <p style={{ padding: '12px' }}>Notificações ainda não estão disponíveis.</p>}
    {requests.map(([name, date]) => <button className="notification-item" key={name} onClick={() => onSelect(name)}>
      <span className="notification-dot" />
      <span><b>{name} solicitou acesso</b><small>{date}</small></span>
      <ChevronRight size={21} />
    </button>)}
  </div>
}
