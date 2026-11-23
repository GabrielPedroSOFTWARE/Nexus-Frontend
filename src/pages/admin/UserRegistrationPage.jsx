import { BRAND_ASSET } from '../../shared/assets.js'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { FormRequirementsNote } from '../../shared/ui/FormRequirementsNote.jsx'

export function UserRegistration({ onToast }) {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  return <main className="registration-screen">
    <section className="registration-brand-panel">
      <button className="back-button" onClick={() => navigate('/admin')} aria-label="Voltar"><ArrowLeft /></button>
      <img className="hero-brand-reference registration-hero-mark" src={BRAND_ASSET} alt="NEXUS" />
      <p>Olá admin, cadastre<br />novos usuários no<br /><span>NEXUS</span></p>
    </section>
    <section className="registration-form-panel"><form className="registration-card" onSubmit={e => { e.preventDefault(); setSubmitted(true); onToast('Usuário cadastrado com sucesso') }}>
      <h1>Cadastrar usuário</h1><p>Os dados do usuário foram enviados pelo email, consulte-os para cadastra-los.</p><FormRequirementsNote className="required-intro" />
      <label>Nome completo <em>*</em><input required placeholder="Digite o nome completo do usuário" /></label>
      <label>CPF <em>*</em><input type="text" inputMode="numeric" maxLength="11" pattern="[0-9]{11}" title="Digite os 11 números do CPF." required placeholder="Digite os 11 números do CPF" /></label>
      <button className="primary-button" type="submit">Cadastrar</button>
      {submitted && <small className="form-success">Cadastro enviado por e-mail.</small>}
    </form></section>
  </main>
}
