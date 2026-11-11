import { hasLocalApi } from '../../shared/api/httpClient.js'
import { BRAND_ASSET } from '../../shared/assets.js'
import { useState } from 'react'
import { Eye, EyeOff, Mail, LockKeyhole } from 'lucide-react'

export function LoginPage({ onAccessRequest, onLogin }) {
  const [networkLogin, setNetworkLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const login = event => {
    event.preventDefault()
    onLogin({ login: networkLogin.trim(), senha: password })
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
        {!hasLocalApi && <p role="status">Modo demonstração: o login é simulado e não conecta ao backend.</p>}
        <label>Login de rede <em>*</em></label>
        <div className="input-with-icon"><Mail size={19} /><input type="text" autoComplete="username" placeholder="Digite seu login de rede" value={networkLogin} onChange={e => setNetworkLogin(e.target.value)} required /></div>
        <label>Senha <em>*</em></label>
        <div className="input-with-icon"><LockKeyhole size={19} /><input type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={e => setPassword(e.target.value)} required /><button type="button" className="input-action" onClick={() => setShowPassword(v => !v)} aria-label="Mostrar ou ocultar senha">{showPassword ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>
        <div className="login-options"><label className="remember"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Lembrar-me</label></div>
        <button className="primary-button login-button" type="submit">Fazer Login</button>
        <div className="or-divider"><span />OU<span /></div>
        <button className="access-request-button" type="button" onClick={onAccessRequest}>Solicitar acesso</button>
      </form>
    </section>
  </main>
}
