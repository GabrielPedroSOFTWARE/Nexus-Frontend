import { ComputerGraphic } from '../../shared/ui/ComputerGraphic.jsx'
import { ChevronRight } from 'lucide-react'

export function DeviceCard({ device, onHistory }) {
  return <article className="device-card">
    <h3>{device.model}</h3>
    <div className="device-card-main"><ComputerGraphic laptopMode={device.kind === 'laptop'} /><div><p><b>CPU:</b> {device.cpu}</p><p><b>RAM:</b> {device.ram}</p><p><b>GPU:</b> {device.gpu}</p><p><b>S.O:</b> {device.operatingSystem}</p></div></div>
    <div className="device-details"><b>MAIS DETALHES</b>{device.details.map(([label, value]) => <p key={label}><b>{label}:</b> {value}</p>)}</div>
    <button onClick={onHistory}>HISTÓRICO DE MANUTENÇÕES <ChevronRight size={17} /></button>
  </article>
}
