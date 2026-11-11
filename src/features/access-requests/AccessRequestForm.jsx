import { hasLocalApi } from '../../shared/api/httpClient.js'
import { X, UserRoundPlus } from 'lucide-react'

export function AccessRequestForm({ onClose, onToast }) {
  if (hasLocalApi) return <div className="modal-backdrop"><section className="access-form-card"><div className="modal-title"><h2>Solicitar acesso</h2><button onClick={onClose} aria-label="Fechar"><X size={22} /></button></div><p>A solicitação de acesso ainda não está disponível. Procure o administrador do sistema.</p><button className="outline-button" onClick={onClose}>Fechar</button></section></div>
  return <div className="modal-backdrop access-form-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <form className="access-form-card" onSubmit={e => { e.preventDefault(); onClose(); onToast('Demonstração: nenhuma solicitação foi enviada.') }}>
      <div className="modal-title"><span className="modal-icon"><UserRoundPlus size={22} /></span><h2>Solicitar acesso</h2><button type="button" onClick={onClose} aria-label="Fechar"><X size={22} /></button></div>
      <p>Preencha seus dados para enviar uma solicitação de acesso ao NEXUS.</p>
      <label>Nome completo<input required placeholder="Digite seu nome completo" /></label>
      <label>Login de rede<input required placeholder="Ex.: fcosta" /></label>
      <label>Setor<input required placeholder="Ex.: Financeiro" /></label>
      <label>E-mail institucional<input type="email" required placeholder="nome@instituicao.edu.br" /></label>
      <label>Justificativa<textarea required placeholder="Conte por que precisa acessar o sistema" /></label>
      <div className="access-form-actions"><button type="button" className="outline-button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit">Enviar solicitação</button></div>
    </form>
  </div>
}
