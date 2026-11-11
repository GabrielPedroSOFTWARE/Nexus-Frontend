import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function AccessRequestReview({ onToast }) {
  const navigate = useNavigate()
  const [accessType, setAccessType] = useState('Usuário solicitante')
  const [decision, setDecision] = useState('')
  const decide = nextDecision => {
    setDecision(nextDecision)
    onToast(nextDecision === 'approved' ? `Acesso liberado como ${accessType}` : 'Solicitação de acesso negada')
  }
  return <PageFrame mode="admin" active="home" profileName="Admin" onToast={onToast} onOpenAccess={() => navigate('/admin/solicitacoes')}>
    <main className="page-content access-review-content">
      <h1 className="page-title">Solicitação de Acesso</h1>
      <div className="access-review-grid">
        <section className="panel request-details-panel">
          <h2 className="figma-panel-title">DADOS DA SOLICITAÇÃO</h2>
          <div className="request-data-grid">
            <div><small>NOME</small><b>Fernanda Costa</b></div>
            <div><small>LOGIN DE REDE</small><b>fcosta</b></div>
            <div><small>SETOR</small><b>Financeiro</b></div>
            <div><small>E-MAIL</small><b>fernanda.costa@empresa.com</b></div>
            <div><small>DATA DA SOLICITAÇÃO</small><b>06/11/2026 às 08:47</b></div>
            <div><small>STATUS</small><span className={`request-status ${decision || 'pending'}`}>{decision === 'approved' ? 'Acesso liberado' : decision === 'denied' ? 'Negada' : 'Aguardando análise'}</span></div>
            <div className="request-justification"><small>JUSTIFICATIVA DA SOLICITAÇÃO</small><b>Preciso de acesso ao sistema para abrir chamados de manutenção dos equipamentos do setor Financeiro.</b></div>
          </div>
        </section>
        <section className="panel access-decision-panel">
          <h2 className="figma-panel-title">DEFINIR ACESSO</h2><span className="access-type-label">TIPO DE ACESSO</span>
          <div className="access-choice-list">
            {[
              ['Usuário solicitante'],
              ['Técnico / Gestor'],
            ].map(([value]) => <label key={value} className={`access-choice ${accessType === value ? 'selected' : ''}`}><input type="radio" name="accessType" value={value} checked={accessType === value} onChange={() => setAccessType(value)} /><span>{value}</span></label>)}
          </div>
          <small className="access-hint">Defina o tipo de acesso antes de liberar.</small>
          <div className="access-decision-actions"><button className="approve-access-button" onClick={() => decide('approved')} disabled={!!decision}>Liberar acesso</button><button className="deny-access-button" onClick={() => decide('denied')} disabled={!!decision}>Negar acesso</button></div>
          {decision && <button className="review-another-button" onClick={() => { setDecision(''); navigate('/admin/usuarios') }}>Ir para gestão de usuários <ChevronRight size={17} /></button>}
        </section>
      </div>
    </main>
  </PageFrame>
}
