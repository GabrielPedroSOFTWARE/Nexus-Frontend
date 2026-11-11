import { useState } from 'react'
import { apiRequest, hasLocalApi } from '../../shared/api/httpClient.js'
import { X, UserRoundPlus } from 'lucide-react'

export function AccessRequestForm({ onClose, onToast }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const submit = async event => {
    event.preventDefault()
    if (!hasLocalApi) { onClose(); onToast('Demonstração: nenhuma solicitação foi enviada.'); return }
    const data = new FormData(event.currentTarget)
    setBusy(true); setError('')
    try {
      await apiRequest('/cadastrar', { method: 'POST', requiresAuth: false, body: {
        id: crypto.randomUUID(), nome: String(data.get('nome')).trim(), login: String(data.get('login')).trim(),
        setor: String(data.get('setor')).trim(), email: String(data.get('email')).trim(),
        justificativa: String(data.get('justificativa')).trim(), senha: String(data.get('senha')),
        perfil: 'PENDENT', status: 'Aguardando análise', ehAdmin: false, versaoToken: 1,
      } })
      onClose(); onToast('Solicitação enviada. Aguarde a aprovação do administrador.')
    } catch (err) { setError(err.message || 'Não foi possível enviar a solicitação.') }
    finally { setBusy(false) }
  }
  return <div className="modal-backdrop access-form-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <form className="access-form-card" onSubmit={submit}>
      <div className="modal-title"><span className="modal-icon"><UserRoundPlus size={22} /></span><h2>Solicitar acesso</h2><button type="button" onClick={onClose} aria-label="Fechar"><X size={22} /></button></div>
      <p>Preencha seus dados para enviar uma solicitação de acesso ao NEXUS.</p>
      <label>Nome completo<input name="nome" required placeholder="Digite seu nome completo" /></label>
      <label>Login de rede<input name="login" required placeholder="Ex.: fcosta" /></label>
      <label>Setor<input name="setor" required placeholder="Ex.: Financeiro" /></label>
      <label>E-mail institucional<input name="email" type="email" required placeholder="nome@instituicao.edu.br" /></label>
      <label>Justificativa<textarea name="justificativa" required placeholder="Conte por que precisa acessar o sistema" /></label>
      {hasLocalApi && <label>Senha<input name="senha" type="password" autoComplete="new-password" required /></label>}
      {error && <p role="alert">{error}</p>}
      <div className="access-form-actions"><button type="button" className="outline-button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" disabled={busy}>{busy ? 'Enviando...' : 'Enviar solicitação'}</button></div>
    </form>
  </div>
}
