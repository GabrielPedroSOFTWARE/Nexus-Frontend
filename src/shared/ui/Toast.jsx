import { CheckCircle2, CircleX, X } from 'lucide-react'

export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null
  const isError = type === 'error'
  const Icon = isError ? CircleX : CheckCircle2
  return <div className={`toast ${isError ? 'toast-error' : 'toast-success'}`} role={isError ? 'alert' : 'status'}><Icon aria-hidden="true" size={20} />{message}<button onClick={onClose} aria-label="Fechar aviso"><X size={16} /></button></div>
}
