import { hasLocalApi, isPagesConnection } from '../../shared/api/httpClient.js'
import { BRAND_ASSET } from '../../shared/assets.js'
import { formatCpf, formatCpfOrDemo, normalizeCpf } from '../../shared/cpf.js'
import { checkPasswordRecovery, requestPasswordReset, resetPassword } from '../../features/auth/api.js'
import { PasswordRequirements } from '../../features/auth/PasswordRequirements.jsx'
import { FormRequirementsNote } from '../../shared/ui/FormRequirementsNote.jsx'
import { isPasswordValid, PASSWORD_POLICY_MESSAGE } from '../../features/auth/passwordPolicy.js'
import { useState } from 'react'
import { Eye, EyeOff, UserRound, LockKeyhole } from 'lucide-react'

export function LoginPage({ onAccessRequest, onLogin }) {
  const [cpf, setCpf] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus.remembered.cpf') || ''
      return formatCpfOrDemo(saved, !hasLocalApi)
    } catch { return '' }
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authView, setAuthView] = useState('login')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [recoveryBusy, setRecoveryBusy] = useState(false)
  const [recoveryMessage, setRecoveryMessage] = useState('')
  const [recoveryError, setRecoveryError] = useState('')
  const [remember, setRemember] = useState(() => {
    try { return Boolean(localStorage.getItem('nexus.remembered.cpf')) } catch { return false }
  })
  const login = event => {
    event.preventDefault()
    try {
      if (remember) localStorage.setItem('nexus.remembered.cpf', hasLocalApi ? normalizeCpf(cpf) : cpf.trim())
      else localStorage.removeItem('nexus.remembered.cpf')
      localStorage.removeItem('nexus.remembered.login')
    } catch { /* O login continua disponível sem armazenamento local. */ }
    onLogin({ cpf: hasLocalApi ? normalizeCpf(cpf) : cpf.trim(), senha: password })
  }

  const openRecovery = () => {
    setCpf(current => formatCpf(current))
    setRecoveryMessage('')
    setRecoveryError('')
    setAuthView('request')
  }

  const backToLogin = () => {
    setRecoveryMessage('')
    setRecoveryError('')
    setAuthView('login')
  }

  const submitRecoveryRequest = async event => {
    event.preventDefault()
    setRecoveryBusy(true); setRecoveryMessage(''); setRecoveryError('')
    try {
      const response = await requestPasswordReset(cpf)
      if (!response?.codigoEspera) throw new Error('O backend não retornou o código de recuperação.')
      setRecoveryCode(response.codigoEspera)
      setAuthView('waiting')
      setRecoveryMessage('Solicitação enviada. Abra o link recebido por e-mail para confirmar a recuperação.')
    } catch (error) {
      setRecoveryError(error.message || 'Não foi possível solicitar a recuperação da senha.')
    } finally { setRecoveryBusy(false) }
  }

  const checkRecoveryConfirmation = async () => {
    setRecoveryBusy(true); setRecoveryMessage(''); setRecoveryError('')
    try {
      const response = await checkPasswordRecovery(recoveryCode)
      if (!response?.confirmado) {
        setRecoveryError('A confirmação ainda não foi identificada. Abra o link do e-mail e tente novamente.')
        return
      }
      setAuthView('reset')
      setRecoveryMessage('E-mail confirmado. Defina sua nova senha.')
    } catch (error) {
      setRecoveryError(error.message || 'Não foi possível verificar a confirmação.')
    } finally { setRecoveryBusy(false) }
  }

  const submitNewPassword = async event => {
    event.preventDefault()
    if (!isPasswordValid(newPassword)) {
      setRecoveryError(PASSWORD_POLICY_MESSAGE)
      return
    }
    if (newPassword !== confirmPassword) {
      setRecoveryError('')
      return
    }
    setRecoveryBusy(true); setRecoveryMessage(''); setRecoveryError('')
    try {
      await resetPassword(recoveryCode, newPassword)
      setPassword(''); setNewPassword(''); setConfirmPassword(''); setRecoveryCode('')
      setAuthView('login')
      setRecoveryMessage('Senha alterada com sucesso. Faça login com a nova senha.')
    } catch (error) {
      setRecoveryError(error.message || 'Não foi possível redefinir a senha.')
    } finally { setRecoveryBusy(false) }
  }

  const recoveryFeedback = <>{recoveryError && <p className="auth-feedback error" role="alert">{recoveryError}</p>}{recoveryMessage && <p className="auth-feedback success" role="status">{recoveryMessage}</p>}</>

  const recoveryContent = authView === 'request' ? <form className="auth-card recovery-card" onSubmit={submitRecoveryRequest}>
    <h1>Recuperar senha</h1>
    <p className="auth-subtitle">Informe seu CPF para receber o link de recuperação</p>
    <FormRequirementsNote />
    <label htmlFor="recovery-cpf">CPF <em>*</em></label>
    <div className="input-with-icon"><UserRound size={19} /><input id="recovery-cpf" type="text" inputMode="numeric" autoComplete="username" pattern="\d{3}\.\d{3}\.\d{3}-\d{2}" title="Digite os 11 números do CPF." placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(formatCpf(e.target.value))} required /></div>
    {recoveryFeedback}
    <button className="primary-button login-button" type="submit" disabled={recoveryBusy}>{recoveryBusy ? 'Enviando...' : 'Enviar link de recuperação'}</button>
    <button className="auth-secondary-button" type="button" onClick={backToLogin}>Voltar para o login</button>
  </form> : authView === 'waiting' ? <section className="auth-card recovery-card">
    <h1>Confirme seu e-mail</h1>
    <p className="auth-subtitle">Abra o link enviado pelo NEXUS. Depois, volte para esta tela e verifique a confirmação.</p>
    {recoveryFeedback}
    <button className="primary-button login-button" type="button" onClick={checkRecoveryConfirmation} disabled={recoveryBusy}>{recoveryBusy ? 'Verificando...' : 'Já confirmei o link'}</button>
    <button className="auth-secondary-button" type="button" onClick={() => { setRecoveryError(''); setRecoveryMessage(''); setAuthView('request') }}>Usar outro CPF</button>
    <button className="auth-secondary-button muted" type="button" onClick={backToLogin}>Voltar para o login</button>
  </section> : <form className="auth-card recovery-card" onSubmit={submitNewPassword}>
    <h1>Nova senha</h1>
    <p className="auth-subtitle">Escolha uma senha que atenda aos requisitos abaixo</p>
    <FormRequirementsNote />
    <label>Nova senha <em>*</em></label>
    <div className="input-with-icon"><LockKeyhole size={19} /><input type={showNewPassword ? 'text' : 'password'} autoComplete="new-password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setRecoveryError('') }} required /><button type="button" className="input-action" onClick={() => setShowNewPassword(value => !value)} aria-label="Mostrar ou ocultar nova senha">{showNewPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
    <PasswordRequirements value={newPassword} />
    <label>Confirmar nova senha <em>*</em></label>
    <div className="input-with-icon"><LockKeyhole size={19} /><input type={showNewPassword ? 'text' : 'password'} autoComplete="new-password" aria-invalid={Boolean(confirmPassword && confirmPassword !== newPassword)} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setRecoveryError('') }} required /></div>
    {confirmPassword && confirmPassword !== newPassword && <small className="password-match-warning" role="alert">As senhas não conferem.</small>}
    {recoveryFeedback}
    <button className="primary-button login-button" type="submit" disabled={recoveryBusy}>{recoveryBusy ? 'Salvando...' : 'Salvar nova senha'}</button>
    <button className="auth-secondary-button" type="button" onClick={backToLogin}>Cancelar</button>
  </form>

  return <main className="auth-screen">
    <section className="auth-brand-panel">
      <img className="hero-brand-reference auth-hero-mark" src={BRAND_ASSET} alt="NEXUS" />
      <div className="auth-brand-copy">
        <h2>Bem-vindo ao <span>NEXUS</span></h2>
        <p>Gerencie, acompanhe e otimize a<br />manutenção de seus hardwares</p>
      </div>
    </section>
    <section className="auth-form-panel">
      {authView !== 'login' ? recoveryContent : <form className="auth-card" onSubmit={login}>
        <h1>Acessar Sistema</h1>
        <p className="auth-subtitle">Faça login para continuar</p>
        {isPagesConnection && <p className="local-connection-note">O NEXUS se conecta ao backend e ao relay iniciados neste computador. No primeiro acesso, permita a conexão local quando o navegador solicitar.</p>}
        <FormRequirementsNote includeOptional />
        {!hasLocalApi && <p role="status">Modo demonstração: a autenticação é simulada. Digite “admin” para abrir o painel.</p>}
        {recoveryFeedback}
        <label htmlFor="login-cpf">CPF <em>*</em></label>
        <div className="input-with-icon"><UserRound size={19} /><input id="login-cpf" type="text" inputMode={hasLocalApi ? 'numeric' : 'text'} autoComplete="username" pattern={hasLocalApi ? '\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}' : undefined} title={hasLocalApi ? 'Digite os 11 números do CPF.' : undefined} placeholder={hasLocalApi ? '000.000.000-00' : '000.000.000-00 ou admin na demonstração'} value={cpf} onChange={e => setCpf(formatCpfOrDemo(e.target.value, !hasLocalApi))} required /></div>
        <label htmlFor="login-password">Senha <em>*</em></label>
        <div className="input-with-icon"><LockKeyhole size={19} /><input id="login-password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={e => setPassword(e.target.value)} required /><button type="button" className="input-action" onClick={() => setShowPassword(v => !v)} aria-label="Mostrar ou ocultar senha">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
        <div className="login-options"><label className="remember"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Lembrar-me <small>(opcional)</small></label><button type="button" onClick={openRecovery}>Esqueci minha senha</button></div>
        <button className="primary-button login-button" type="submit">Fazer Login</button>
        <div className="or-divider"><span />OU<span /></div>
        <button className="access-request-button" type="button" onClick={onAccessRequest}>Solicitar acesso</button>
      </form>}
    </section>
  </main>
}
