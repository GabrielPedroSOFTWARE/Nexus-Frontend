import { hasLocalApi } from '../../shared/api/httpClient.js'
import { ComputerGraphic } from '../../shared/ui/ComputerGraphic.jsx'
import { useEffect } from 'react'
import { Check, CheckCircle2, FileText, Monitor, Settings, X } from 'lucide-react'

export function ScanModal({ status, onClose, onComplete, onConfirm, equipment }) {
  useEffect(() => {
    if (status !== 'reading' || hasLocalApi) return undefined
    const timer = window.setTimeout(onComplete, 1800)
    return () => window.clearTimeout(timer)
  }, [status, onComplete])
  return <div className="modal-backdrop scan-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    {status === 'reading' ? <section className="scan-modal">
      <div className="scan-title"><FileText size={37} /><h2>FAZENDO LEITURA</h2></div>
      <div className="scan-symbol"><Monitor size={123} /><Settings size={73} /></div>
      <strong>REALIZANDO LEITURA</strong>
      <div className="scan-progress"><i /></div>
    </section> : <section className="scan-modal scan-complete">
      <div className="scan-title"><CheckCircle2 size={42} /><h2>LEITURA CONCLUÍDA</h2></div>
      <article className="scan-device"><h3>{equipment ? [equipment.fabricante, equipment.modelo].filter(Boolean).join(' ') : 'MacBook Air'}</h3><div><ComputerGraphic laptopMode={equipment ? /macbook|notebook|laptop/i.test((equipment.modelo || '') + ' ' + (equipment.fabricante || '')) : true} /><ul><li><b>CPU:</b> {equipment?.processador || 'Apple M3'}</li><li><b>RAM:</b> {equipment ? equipment.ram + 'GB' : '16GB'}</li><li><b>Armazenamento:</b> {equipment?.discos?.join(', ') || '512 GB'}</li><li><b>GPU:</b> {equipment?.placasDeVideo?.join(', ') || 'Apple Silicon'}</li></ul></div><hr /><h3>MAIS DETALHES</h3><p>• <b>Fabricante:</b> {equipment?.fabricante || 'Apple'}</p><p>• <b>Modelo:</b> {equipment?.modelo || 'MacBook Air'}</p><p>• <b>Garantia:</b> {equipment?.garantia || 'Não informada'}</p></article>
      <div className="scan-complete-actions"><button className="accept-button" onClick={onConfirm}><Check size={19} /> Concluir</button><button className="cancel-button" onClick={onClose}><X size={19} /> Cancelar</button></div>
    </section>}
  </div>
}
