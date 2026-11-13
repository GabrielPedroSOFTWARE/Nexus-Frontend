import { StatusPill } from '../../shared/ui/StatusPill.jsx'
import { STATUS } from '../../shared/constants.js'
import { useState } from 'react'
import { Check, ChevronDown, ClipboardList, History, Paperclip, RefreshCw, X } from 'lucide-react'

export function ServiceModal({ service, onClose, onToast }) {
  const [status, setStatus] = useState(service?.status || 'diagnosis')
  const [menu, setMenu] = useState(false)
  const [notes, setNotes] = useState('')
  const [assignOpen, setAssignOpen] = useState(false)
  const [assignedTech, setAssignedTech] = useState('')
  const [techOptionsOpen, setTechOptionsOpen] = useState(true)
  const technicians = ['Carlos Mendes', 'Rafael Souza', 'Marina Lopes']
  const steps = [
    ['Recebida', '24/06/2026 · 08:40'], ['Em diagnóstico', 'Em andamento desde 10:05'],
    ['Em manutenção', 'Formatação e peça técnica'], ['Aguardando peças', 'Opcional: se faltar peça'],
    ['Pronta para retirada', 'O usuário é avisado'], ['Concluída', 'Registra a solução aplicada'],
  ]
  return <div className="modal-backdrop service-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <section className="service-modal">
      <div className="service-modal-heading"><span className="modal-icon"><ClipboardList size={26} /></span><div className="service-title-group"><small>ORDEM DE SERVIÇO</small><h2>{service?.id || 'OS-2026-0010'}</h2></div><StatusPill type="done">● Prioridade · {service?.priority || 'Baixa'}</StatusPill><span className="date-chip">Início &nbsp; 24/06/2026</span><span className="date-chip">Prazo &nbsp; 29/06/2026</span><button className="assign-technician-button" onClick={() => { setTechOptionsOpen(true); setAssignOpen(true) }}>{assignedTech ? `Técnico: ${assignedTech}` : 'Atribuir técnico'}</button><button onClick={onClose} aria-label="Fechar"><X /></button></div>
      <div className="service-modal-body">
        <div className="service-detail-column">
          <article className="detail-card client-card"><h3>CLIENTE</h3><div className="detail-grid"><p><small>NOME</small><b>João Pedro Arantes</b></p><p><small>SETOR</small><b>Recursos Humanos</b></p><p><small>TELEFONE</small><b>(61) 91234-4321</b></p><p><small>CPF</small><b>***.123.123-**</b></p></div></article>
          <article className="detail-card specs-card"><h3>ESPECIFICAÇÕES DA MÁQUINA</h3><div className="detail-grid spec-grid"><p><small>MODELO</small><b>Desktop Lenovo<br />ThinkCentre</b></p><p><small>PATRIMÔNIO</small><b>123456</b></p><p><small>SISTEMA OPERACIONAL</small><b>Windows 11 Pro</b></p><p><small>ARMAZENAMENTO</small><b>SSD 1TB</b></p><p><small>EQUIPAMENTO</small><b>PC-0010</b></p><p><small>CPU</small><b>Intel Core i5 10500F</b></p><p><small>MEMÓRIA RAM</small><b>8GB DDR4 · 2666 MHz</b></p><p><small>GPU</small><b>Intel Graphics</b></p></div><button type="button" className="equipment-history-link" onClick={() => onToast('Histórico de manutenção disponível na versão conectada.')}><History size={16} />Consultar Histórico de Manutenções</button></article>
          <article className="detail-card problem-card"><div className="section-title-row"><h3>PROBLEMA RELATADO</h3><span className="frequency-chip">Frequência &nbsp; Sempre que utiliza a máquina</span></div><p>O usuário relata problemas recorrentes de lentidão no equipamento, com desempenho abaixo do esperado e incompatível com o histórico de utilização da máquina. Informa que a demora na inicialização do sistema e na abertura de programas tem impactado diretamente a execução de suas atividades.</p></article>
          <article className="detail-card observations-card"><h3>OBSERVAÇÕES DO TÉCNICO</h3><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Nenhuma observação registrada até o momento." /></article>
          <article className="detail-card attachments-card"><h3>ANEXOS</h3><button onClick={() => onToast('Abrindo anexo Fotos PC.JPG')}><Paperclip size={23} />Fotos PC.JPG</button></article>
        </div>
        <aside className="service-status-column"><h3>STATUS DA OS</h3><StatusPill type={status} /><small className="updated-text">Atualizado em 24/06/2026 às 10:05 por Admin</small>
          <div className="timeline">{steps.map((step, index) => <div className={`timeline-step ${index <= (status === 'late' ? 2 : status === 'done' ? 5 : 1) ? 'reached' : ''} ${index === (status === 'late' ? 2 : status === 'done' ? 5 : 1) ? 'timeline-current' : ''}`} key={step[0]}><span>{index <= 1 ? <Check size={13} /> : null}</span><div><b>{step[0]}</b><small>{step[1]}</small></div></div>)}</div>
          <div className="status-menu-wrap"><button className="change-status-button" onClick={() => setMenu(v => !v)}><RefreshCw size={16} />Alterar status <ChevronDown size={16} /></button>{menu && <div className="status-menu">{['diagnosis', 'waiting', 'late', 'done'].map(type => <button key={type} onClick={() => { setStatus(type); setMenu(false); onToast(`Status atualizado: ${STATUS[type].text}`) }}>{STATUS[type].text}</button>)}</div>}</div>
          <div className="change-history"><h4>HISTÓRICO DE ALTERAÇÕES</h4><p><i />Em diagnóstico<small>24/06/2026 às 10:05 · Admin</small></p><p><i />Recebida<small>24/06/2026 às 08:40 · Sistemas · OS aberta</small></p></div>
        </aside>
      </div>
    </section>
    {assignOpen && <div className="assign-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setAssignOpen(false) }}><section className="assign-dialog">
      <h2>Atribuir técnico</h2>
      <p className="assign-order-info">{service?.id || 'OS-2026-0010'} · {service?.equipment || 'PC-0010'} · João Pedro Arantes</p>
      <label className="assign-technician-select">Técnico</label>
      <div className="assign-dropdown"><button type="button" className="assign-select-trigger" aria-expanded={techOptionsOpen} onClick={() => setTechOptionsOpen(value => !value)}>{assignedTech || 'Selecione um técnico'}<ChevronDown size={17} className={techOptionsOpen ? 'is-expanded' : ''} /></button>
        {techOptionsOpen && <div className="assign-tech-options">{technicians.map((technician, index) => <button type="button" className={index === 0 && !assignedTech ? 'is-highlighted' : ''} key={technician} onClick={() => { setAssignedTech(technician); setTechOptionsOpen(false) }}>{technician}</button>)}</div>}
      </div>
      <div className="assign-dialog-actions"><button type="button" className="outline-button" onClick={() => setAssignOpen(false)}>Cancelar</button><button type="button" className="primary-button" onClick={() => { if (!assignedTech) { onToast('Selecione um técnico para continuar'); setTechOptionsOpen(true); return } setAssignOpen(false); onToast(`Ordem atribuída a ${assignedTech}`) }}>Confirmar</button></div>
    </section></div>}
  </div>
}
