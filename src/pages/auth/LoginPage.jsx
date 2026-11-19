import { hasLocalApi } from '../../shared/api/httpClient.js'
import { BRAND_ASSET } from '../../shared/assets.js'
import { normalizeCpf } from '../../shared/cpf.js'
import { FormRequirementsNote } from '../../shared/ui/FormRequirementsNote.jsx'
import { useState } from 'react'
import { Eye, EyeOff, UserRound, LockKeyhole } from 'lucide-react'

export function LoginPage({ onAccessRequest, onLogin, onToast }) {
  const [cpf, setCpf] = useState(() => {
    try { return localStorage.getItem('nexus.remembered.cpf') || '' } catch { return '' }
  })
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  return <main className="auth-screen">
    <section className="auth-brand-panel">
      <img className="hero-brand-reference auth-hero-mark" src={BRAND_ASSET} alt="NEXUS" />
      <div className="auth-brand-copy">
        <h2>Bem-vindo ao <span>NEXUS</span></h2>
        <p>Gerencie, acompanhe e otimize a<br />manutenção de seus hardwares</p>
      </div>
    </section>
    <section className="auth-form-panel">
      <form className="auth-card" onSubmit={login}>
        <h1>Acessar Sistema</h1>
        <p className="auth-subtitle">Faça login para continuar</p>
        <FormRequirementsNote includeOptional />
        {!hasLocalApi && <p role="status">Modo demonstração: a autenticação é simulada. Digite “admin” para abrir o painel.</p>}
        <label>CPF <em>*</em></label>
        <div className="input-with-icon"><UserRound size={19} /><input type="text" inputMode={hasLocalApi ? 'numeric' : 'text'} autoComplete="username" maxLength={hasLocalApi ? 14 : 32} placeholder={hasLocalApi ? 'Digite seu CPF' : 'Digite seu CPF ou admin na demonstração'} value={cpf} onChange={e => setCpf(hasLocalApi ? e.target.value.slice(0, 14) : e.target.value)} required /></div>
        <label>Senha <em>*</em></label>
        <div className="input-with-icon"><LockKeyhole size={19} /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={e => setPassword(e.target.value)} required /><button type="button" className="input-action" onClick={() => setShowPassword(v => !v)} aria-label="Mostrar ou ocultar senha">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
        <div className="login-options">
          <label className="remember"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Lembrar-me (opcional)</label>
          <button type="button" className="password-recovery-button" onClick={() => onToast?.('Para recuperar sua senha, entre em contato com o administrador do sistema.')}>Recuperar senha</button>
        </div>
        <button className="primary-button login-button" type="submit">Fazer Login</button>
        <div className="or-divider"><span />OU<span /></div>
        <button className="access-request-button" type="button" onClick={onAccessRequest}>Solicitar acesso</button>
      </form>
    </section>
  </main>
}
