import { hasLocalApi } from '../../shared/api/httpClient.js'
import { FREQUENCY_OPTIONS } from './frequency.js'
import { Paperclip, Wrench, X } from 'lucide-react'

export function RequestModal({ onClose, onSubmit, equipment }) {
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
    <form className="request-modal" onSubmit={e => { e.preventDefault(); onSubmit(new FormData(e.currentTarget)) }}>
      <div className="modal-title"><span className="modal-icon"><Wrench size={23} /></span><h2>Solicitar nova manutenção</h2><button type="button" onClick={onClose} aria-label="Fechar"><X size={23} /></button></div>
      <div className="form-section"><label>EQUIPAMENTO <em>*</em><small>Selecione o equipamento que necessita de manutenção</small></label><select name="idPC" required defaultValue=""><option value="" disabled>▣ &nbsp; Selecione a máquina</option>{hasLocalApi ? equipment.map(item => <option key={item.id} value={item.id}>{item.nickname} · {item.id}</option>) : <option value="PC-0010">PC-0010 · Desktop de usuário</option>}</select></div>
      <div className="form-section"><label>O QUE ESTÁ ACONTECENDO? <em>*</em><small>Descreva o que está acontecendo de errado com o equipamento</small></label><textarea name="problema" required placeholder="Ex.: O equipamento está muito lento, travando, etc..." /></div>
      <div className="form-section frequency-section"><label>COM QUE FREQUÊNCIA OCORRE O PROBLEMA? <em>*</em><small>Assim a equipe pode avaliar melhor a frequência com que o problema relatado ocorre</small></label><div className="radio-grid">
        {FREQUENCY_OPTIONS.map(item => <label key={item}><input type="radio" name="frequencia" value={item} required />{item}</label>)}
      </div></div>
      <div className="form-section attach-section"><label>ANEXAR ARQUIVOS <small>(opcional)</small><small>Arquivos de vídeo ou prints podem ajudar na solução do problema!</small></label><label className="dropzone"><Paperclip size={24} /><span>Arraste arquivos aqui ou clique para selecionar<small>Vídeo, JPG, PNG, PDF, etc.</small></span><input type="file" name="arquivoImagem" /></label></div>
      <small className="required-note">Todos os campos com <em>*</em> são obrigatórios.</small>
      <button className="submit-request" type="submit">Enviar solicitação</button>
    </form>
  </div>
}
