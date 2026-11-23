import { useState } from 'react'
import { apiRequest, hasLocalApi } from '../../shared/api/httpClient.js'
import { normalizeCpf } from '../../shared/cpf.js'
import { PasswordRequirements } from '../auth/PasswordRequirements.jsx'
import { FormRequirementsNote } from '../../shared/ui/FormRequirementsNote.jsx'
import { isPasswordValid, PASSWORD_POLICY_MESSAGE } from '../auth/passwordPolicy.js'
import { X, UserRoundPlus } from 'lucide-react'

export function AccessRequestForm({ onClose, onToast }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const submit = async event => {
    event.preventDefault()
    if (!hasLocalApi) { onClose(); onToast('Demonstração: nenhuma solicitação foi enviada.'); return }
    const data = new FormData(event.currentTarget)
    const cpf = normalizeCpf(data.get('cpf'))
    if (cpf.length !== 11) { setError('Informe os 11 dígitos do CPF.'); return }
    const password = String(data.get('senha') || '')
    const confirmPassword = String(data.get('confirmarSenha') || '')
    if (!isPasswordValid(password)) { setError(PASSWORD_POLICY_MESSAGE); return }
    if (password !== confirmPassword) { setError(''); return }
    setBusy(true); setError('')
    try {
      await apiRequest('/cadastrar', { method: 'POST', requiresAuth: false, body: {
        nome: String(data.get('nome')).trim(), cpf,
        setor: String(data.get('setor')).trim(), email: String(data.get('email')).trim(),
        justificativa: String(data.get('justificativa')).trim(), senha: password,
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
      <FormRequirementsNote />
      <label>Nome completo <em>*</em><input name="nome" required placeholder="Digite seu nome completo" /></label>
      <label>CPF <em>*</em><input name="cpf" type="text" inputMode="numeric" maxLength="11" pattern="[0-9]{11}" title="Digite os 11 números do CPF." required placeholder="Ex.: 12345678900" /></label>
      <label>Setor <em>*</em><input name="setor" required placeholder="Ex.: Financeiro" /></label>
      <label>E-mail institucional <em>*</em><input name="email" type="email" required placeholder="nome@instituicao.edu.br" /></label>
      <label>Justificativa <em>*</em><textarea name="justificativa" required placeholder="Conte por que precisa acessar o sistema" /></label>
      {hasLocalApi && <>
        <label>Senha <em>*</em><input name="senha" type="password" autoComplete="new-password" value={password} onChange={e => { setPassword(e.target.value); setError('') }} required /></label>
        <PasswordRequirements value={password} />
        <label>Confirmar senha <em>*</em><input name="confirmarSenha" type="password" autoComplete="new-password" aria-invalid={Boolean(confirmPassword && confirmPassword !== password)} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError('') }} required /></label>
        {confirmPassword && confirmPassword !== password && <small className="password-match-warning" role="alert">As senhas não conferem.</small>}
      </>}
      {error && <p role="alert">{error}</p>}
      <div className="access-form-actions"><button type="button" className="outline-button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" disabled={busy}>{busy ? 'Enviando...' : 'Enviar solicitação'}</button></div>
    </form>
  </div>
}
