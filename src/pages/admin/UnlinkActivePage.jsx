import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Laptop, Monitor } from 'lucide-react'
import { listEquipmentByUser, listUsers, unlinkEquipmentForAdmin } from '../../features/admin/api.js'
import { equipmentStatusFromOrders } from '../../features/equipment/equipmentStatus.js'
import { hasLocalApi } from '../../shared/api/httpClient.js'
import { formatCpf, normalizeCpf } from '../../shared/cpf.js'
import { PageFrame } from '../../shared/layout/PageFrame.jsx'

function userCpfLabel(user) {
  if (user?.cpfExibicao) return user.cpfExibicao
  return normalizeCpf(user?.cpf).length === 11 ? formatCpf(user.cpf) : 'CPF não informado'
}

function equipmentName(equipment) {
  return [equipment.fabricante, equipment.modelo].filter(Boolean).join(' ').trim()
    || equipment.apelido
    || 'Equipamento'
}

function equipmentCode(equipment, index) {
  const id = String(equipment.id ?? '')
  return /^\d+$/.test(id) ? `PC ${id.padStart(3, '0')}` : `Ativo ${String(index + 1).padStart(3, '0')}`
}

function equipmentStatus(equipment) {
  if (equipment.pedidoEmAberto === true) return 'Em manutenção'
  if (equipment.pedidoEmAberto === false) return 'Em uso'
  if (Array.isArray(equipment.pedidos)) return equipmentStatusFromOrders(equipment.id, equipment.pedidos).status
  return ''
}

export function UnlinkActivePage({ onToast, profileName }) {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState(false)
  const [usersRevision, setUsersRevision] = useState(0)
  const [selectedUserKey, setSelectedUserKey] = useState('')
  const [equipment, setEquipment] = useState([])
  const [equipmentLoading, setEquipmentLoading] = useState(false)
  const [equipmentError, setEquipmentError] = useState(false)
  const [equipmentRevision, setEquipmentRevision] = useState(0)
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!hasLocalApi) {
      setUsersLoading(false)
      return undefined
    }
    let active = true
    setUsersLoading(true)
    setUsersError(false)
    listUsers().then(data => {
      if (!active) return
      setUsers(data)
      setSelectedUserKey(current => current || String(data[0]?.cpf ?? data[0]?.id ?? ''))
    }).catch(() => {
      if (active) setUsersError(true)
    }).finally(() => {
      if (active) setUsersLoading(false)
    })
    return () => { active = false }
  }, [usersRevision])

  const selectedUser = users.find(user => String(user.cpf ?? user.id ?? '') === selectedUserKey)
  const selectedCpf = selectedUser?.cpf || ''

  useEffect(() => {
    if (!hasLocalApi || !selectedCpf) {
      setEquipment([])
      setEquipmentLoading(false)
      setEquipmentError(false)
      setSelectedEquipmentId('')
      return undefined
    }
    let active = true
    setEquipment([])
    setEquipmentLoading(true)
    setEquipmentError(false)
    setSelectedEquipmentId('')
    listEquipmentByUser(selectedCpf).then(data => {
      if (active) setEquipment(data)
    }).catch(() => {
      if (active) setEquipmentError(true)
    }).finally(() => {
      if (active) setEquipmentLoading(false)
    })
    return () => { active = false }
  }, [selectedCpf, equipmentRevision])

  const selectedEquipment = equipment.find(item => String(item.id) === selectedEquipmentId)

  const changeUser = event => {
    setSelectedUserKey(event.target.value)
    setSelectedEquipmentId('')
    setReason('')
  }

  const unlinkSelectedEquipment = async () => {
    if (!selectedEquipment || busy) return
    setBusy(true)
    try {
      await unlinkEquipmentForAdmin(selectedEquipment.id, reason)
      onToast('Ativo desvinculado com sucesso.')
      setSelectedEquipmentId('')
      setReason('')
      setEquipmentRevision(value => value + 1)
    } catch {
      onToast('Não foi possível desvincular o ativo. Tente novamente.', 'error')
    } finally {
      setBusy(false)
    }
  }

  const cancelUnlink = () => {
    setSelectedEquipmentId('')
    setReason('')
  }

  return <PageFrame mode="admin" active="home" profileName={profileName} canManageUsers onToast={onToast}>
    <main className="page-content connected-admin unlink-active-page">
      <div className="unlink-page-heading">
        <h1 className="page-title">Desvincular ativo</h1>
        <button type="button" className="outline-button unlink-back-button" onClick={() => navigate('/admin/usuarios')}><ArrowLeft size={16} />Voltar</button>
      </div>
      {!hasLocalApi ? <section className="panel unlink-unavailable" role="status">Conecte o backend para carregar usuários e ativos.</section> : <div className="unlink-active-grid">
        <section className="panel unlink-assets-panel">
          <h2>ATIVOS DO USUÁRIO</h2>
          {usersLoading ? <p className="unlink-state">Carregando usuários...</p> : usersError ? <div className="unlink-state" role="alert"><p>Não foi possível carregar os usuários.</p><button type="button" className="outline-button" onClick={() => setUsersRevision(value => value + 1)}>Tentar novamente</button></div> : users.length === 0 ? <p className="unlink-state">Nenhum usuário disponível para desvinculação.</p> : <>
            <label className="unlink-user-select">USUÁRIO<select value={selectedUserKey} onChange={changeUser}>
              {users.map(user => {
                const key = String(user.cpf ?? user.id ?? '')
                return <option key={key} value={key}>{user.nome || 'Usuário sem nome'} · CPF {userCpfLabel(user)}</option>
              })}
            </select></label>
            <div className="unlink-assets-heading">ATIVOS VINCULADOS ({equipment.length})</div>
            {equipmentLoading ? <p className="unlink-state">Carregando ativos...</p> : equipmentError ? <div className="unlink-state" role="alert"><p>Não foi possível carregar os ativos deste usuário.</p><button type="button" className="outline-button" onClick={() => setEquipmentRevision(value => value + 1)}>Tentar novamente</button></div> : equipment.length === 0 ? <p className="unlink-state">Este usuário não possui ativos vinculados.</p> : <div className="unlink-equipment-list" role="radiogroup" aria-label="Selecione o ativo para desvincular">
              {equipment.map((item, index) => {
                const id = String(item.id ?? '')
                const title = `${equipmentCode(item, index)} · ${equipmentName(item)}`
                const status = equipmentStatus(item)
                const Icon = item.ehNotebook === true ? Laptop : Monitor
                return <label className={`unlink-equipment-option ${selectedEquipmentId === id ? 'is-selected' : ''}`} key={id || index}>
                  <input type="radio" name="unlink-equipment" value={id} checked={selectedEquipmentId === id} disabled={!id || busy} onChange={() => { setSelectedEquipmentId(id); setReason('') }} />
                  <Icon aria-hidden="true" size={21} />
                  <span className="unlink-equipment-copy"><b>{title}</b><small>{item.patrimonio || item.numeroPatrimonio ? `Patrimônio ${item.patrimonio || item.numeroPatrimonio}` : 'Vinculado ao usuário selecionado'}</small></span>
                  {status && <span className={`unlink-equipment-status ${status === 'Em manutenção' ? 'is-maintenance' : 'is-in-use'}`}>{status}</span>}
                </label>
              })}
            </div>}
          </>}
        </section>

        <section className="panel unlink-details-panel">
          <h2>DESVINCULAÇÃO</h2>
          <div className="unlink-selected-details"><small>ATIVO SELECIONADO</small><b>{selectedEquipment ? `${equipmentCode(selectedEquipment, equipment.indexOf(selectedEquipment))} · ${equipmentName(selectedEquipment)}` : 'Selecione um ativo'}</b><small>USUÁRIO</small><b>{selectedUser?.nome || 'Selecione um usuário'}</b></div>
          <label className="unlink-reason-label" htmlFor="unlink-reason">MOTIVO DA DESVINCULAÇÃO (OPCIONAL)<textarea id="unlink-reason" value={reason} onChange={event => setReason(event.target.value)} placeholder="Escreva o motivo, se desejar." maxLength={500} disabled={!selectedEquipment || busy} /></label>
          <p className="unlink-hint">O ativo ficará disponível para novo vínculo.</p>
          <button type="button" className="primary-button unlink-submit-button" disabled={!selectedEquipment || busy} onClick={unlinkSelectedEquipment}>{busy ? 'Desvinculando...' : 'Desvincular ativo'}</button>
          <button type="button" className="outline-button unlink-cancel-button" disabled={busy} onClick={cancelUnlink}>Cancelar</button>
        </section>
      </div>}
    </main>
  </PageFrame>
}
