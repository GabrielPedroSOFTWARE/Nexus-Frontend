import { ChevronRight } from 'lucide-react'
import { GENERIC_DESKTOP_IMAGE, GENERIC_NOTEBOOK_IMAGE } from './assets.js'

export function DeviceCard({ device, onHistory }) {
  const isNotebook = device.ehNotebook === true

  return <article className="device-card">
    <h3>{device.model}</h3>
    <div className="device-card-main">
      <img
        className={`device-type-image ${isNotebook ? 'is-notebook' : 'is-desktop'}`}
        src={isNotebook ? GENERIC_NOTEBOOK_IMAGE : GENERIC_DESKTOP_IMAGE}
        alt={isNotebook ? 'Imagem genérica de notebook' : 'Imagem genérica de desktop'}
        loading="lazy"
      />
      <div><p><b>CPU:</b> {device.cpu}</p><p><b>RAM:</b> {device.ram}</p><p><b>GPU:</b> {device.gpu}</p><p><b>S.O:</b> {device.operatingSystem}</p></div>
    </div>
    <div className="device-details"><b>MAIS DETALHES</b>{device.details.map(([label, value]) => <p key={label}><b>{label}:</b> {value}</p>)}</div>
    <button onClick={onHistory}>HISTÓRICO DE MANUTENÇÕES <ChevronRight size={17} /></button>
  </article>
}
