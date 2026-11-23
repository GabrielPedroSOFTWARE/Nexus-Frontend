import { PageFrame } from '../../shared/layout/PageFrame.jsx'
import { StatusPill } from '../../shared/ui/StatusPill.jsx'
import { DeviceCard } from '../../features/equipment/DeviceCard.jsx'
import { mapBackendEquipment } from '../../features/equipment/mapBackendEquipment.js'
import { demoComputerInventory } from '../../features/equipment/demoData.js'
import { hasLocalApi } from '../../shared/api/httpClient.js'
import { useNavigate } from 'react-router-dom'
import { Barcode, RefreshCw, Trash2 } from 'lucide-react'

export function MyComputers({ onToast, equipmentStatus, refreshEquipment, removeEquipment, onScan, macbookAdded, registeredEquipment, profileName }) {
  const navigate = useNavigate()
  const devices = hasLocalApi
    ? (registeredEquipment || []).map(mapBackendEquipment)
    : [demoComputerInventory.desktop, ...(macbookAdded ? [demoComputerInventory.macbook] : [])]
  return <PageFrame mode="user" active="computers" onToast={onToast} profileName={profileName}>
    <main className="page-content computers-content">
      <div className="page-title-row"><h1 className="page-title">Olá, usuário! Seus Computadores.</h1><button className="outline-button scan-button" onClick={onScan}><Barcode size={22} />Leitura automática</button></div>
      <div className="table-scroll computers-table-scroll">
        <div className="computers-table" role="table" aria-label="Computadores cadastrados">
          <div className="computers-table-head" role="row">
            {['PC ID', 'APELIDO', 'STATUS', 'ULTIMA MANUTENÇÃO', 'GARANTIA', 'AÇÕES'].map(label => <span role="columnheader" key={label}>{label}</span>)}
          </div>
          <div className="computers-table-body" role="rowgroup">
            {devices.map(device => <div className="computers-table-row" role="row" key={device.id}>
              <span role="cell">{device.id}</span>
              <span role="cell">{device.nickname}</span>
              <span role="cell"><StatusPill type={device.statusType}>{device.status}</StatusPill></span>
              <span role="cell">{device.lastMaintenance}</span>
              <span role="cell">{device.warranty}</span>
              <span role="cell" className="action-cell"><button aria-label={`Atualizar lista de ${device.nickname}`} onClick={() => { if (hasLocalApi) { refreshEquipment(); onToast('Atualizando lista de equipamentos') } else onToast('Demonstração: dados de exemplo') }}><RefreshCw size={20} /></button><button aria-label={`Excluir ${device.nickname}`} onClick={() => removeEquipment(device.id)}><Trash2 size={20} /></button></span>
            </div>)}
          </div>
        </div>
      </div>
      {hasLocalApi && equipmentStatus === 'error' && <p role="alert">Não foi possível carregar os equipamentos.</p>}
      {hasLocalApi && equipmentStatus === 'loading' && <p>Carregando equipamentos...</p>}
      {hasLocalApi && equipmentStatus === 'ready' && devices.length === 0 && <p>Nenhum equipamento cadastrado.</p>}
      <div className="device-card-list">{devices.map(device => <DeviceCard key={device.id} device={device} onHistory={() => navigate(hasLocalApi ? '/historico?equipamento=' + encodeURIComponent(device.id) : '/historico')} />)}</div>
    </main>
  </PageFrame>
}
