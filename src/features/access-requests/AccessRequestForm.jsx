import { useState } from 'react'
import { apiRequest, hasLocalApi } from '../../shared/api/httpClient.js'
import { formatCpf, normalizeCpf } from '../../shared/cpf.js'
import { isBrazilianPhoneValid, maskBrazilianPhoneInput, normalizeBrazilianPhone } from '../../shared/phone.js'
import { PasswordRequirements } from '../auth/PasswordRequirements.jsx'
import { FormRequirementsNote } from '../../shared/ui/FormRequirementsNote.jsx'
import { isPasswordValid, PASSWORD_POLICY_MESSAGE } from '../auth/passwordPolicy.js'
import { Eye, EyeOff, X, UserRoundPlus } from 'lucide-react'

export function AccessRequestForm({ onClose, onToast }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
const [showPassword, setShowPassword] = useState(false)
  const eyeBtn = { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', width: 'auto', padding: 4, cursor: 'pointer', display: 'flex', color: '#64748b' }
  const submit = async event => {
    event.preventDefault()
    if (!hasLocalApi) { onClose(); onToast('Demonstração: nenhuma solicitação foi enviada.'); return }
    const data = new FormData(event.currentTarget)
    const cleanCpf = normalizeCpf(data.get('cpf'))
    if (cleanCpf.length !== 11) { setError('Informe os 11 dígitos do CPF.'); return }
    const telephone = normalizeBrazilianPhone(data.get('telefone'))
    if (!isBrazilianPhoneValid(telephone)) { setError('Informe um telefone com DDD, com 10 ou 11 números.'); return }
    const password = String(data.get('senha') || '')
    const confirmPassword = String(data.get('confirmarSenha') || '')
    if (!isPasswordValid(password)) { setError(PASSWORD_POLICY_MESSAGE); return }
    if (password !== confirmPassword) { setError(''); return }
    setBusy(true); setError('')
    try {
      await apiRequest('/cadastrar', { method: 'POST', requiresAuth: false, body: {
        nome: String(data.get('nome')).trim(), cpf: cleanCpf,
        setor: String(data.get('setor')).trim(), email: String(data.get('email')).trim(),
        telefone: telephone,
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
      <label>CPF <em>*</em><input name="cpf" type="text" inputMode="numeric" value={cpf} onChange={e => { setCpf(formatCpf(e.target.value)); setError('') }} pattern="\d{3}\.\d{3}\.\d{3}-\d{2}" title="Digite os 11 números do CPF." required placeholder="000.000.000-00" /></label>
      <label>Setor <em>*</em><input name="setor" required placeholder="Ex.: Financeiro" /></label>
      <label>E-mail <em>*</em><input name="email" type="email" required placeholder="nome@email.com" /></label>
      <label>Telefone para contato <em>*</em><input name="telefone" type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={e => { setPhone(maskBrazilianPhoneInput(e.target.value)); setError('') }} pattern="\(\d{2}\) \d{4,5}-\d{4}" required placeholder="(61) 91234-5678" title="Informe um telefone com DDD, com 10 ou 11 números." /></label>
      <label>Justificativa <em>*</em><textarea name="justificativa" required placeholder="Conte por que precisa acessar o sistema" /></label>
      {hasLocalApi && <>
        <label>Senha <em>*</em>
          <div style={{ position: 'relative', width: '100%' }}>
            <input name="senha" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={e => { setPassword(e.target.value); setError('') }} style={{ width: '100%', paddingRight: 40, margin: 0, boxSizing: 'border-box' }} required />
            <button type="button" style={eyeBtn} onClick={() => setShowPassword(v => !v)} aria-label="Mostrar ou ocultar senha">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button>
          </div>
        </label>
        <PasswordRequirements value={password} />
        <label>Confirmar senha <em>*</em><input name="confirmarSenha" type={showPassword ? 'text' : 'password'} autoComplete="new-password" aria-invalid={Boolean(confirmPassword && confirmPassword !== password)} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError('') }} required /></label>
        {confirmPassword && confirmPassword !== password && <small className="password-match-warning" role="alert">As senhas não conferem.</small>}
      </>}
      {error && <p role="alert">{error}</p>}
      <div className="access-form-actions"><button type="button" className="outline-button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit" disabled={busy}>{busy ? 'Enviando...' : 'Enviar solicitação'}</button></div>
    </form>
  </div>
}
