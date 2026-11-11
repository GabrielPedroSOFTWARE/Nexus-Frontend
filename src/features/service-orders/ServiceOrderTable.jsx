import { StatusPill } from '../../shared/ui/StatusPill.jsx'

export function SimpleServiceTable({ rows, onSelect, compact = false }) {
  return <div className="table-scroll"><table className={`data-table service-table ${compact ? 'compact-table' : ''}`}><thead><tr><th>OS</th><th>EQUIPAMENTO</th><th>USUÁRIO</th><th>STATUS</th>{!compact && <><th>PRIORIDADE</th><th>MTTR</th></>}</tr></thead><tbody>{rows.map(row => <tr key={row.id}><td><button className="link-button" onClick={() => onSelect?.(row)}>{row.id}</button></td><td>{row.equipment}</td><td>{row.user}</td><td><StatusPill type={row.status} /></td>{!compact && <><td><StatusPill type={row.priority === 'Baixa' ? 'done' : row.priority === 'Média' ? 'waiting' : row.priority === 'Alta' ? 'late' : row.status}>{row.priority}</StatusPill></td><td>{row.mttr}</td></>}</tr>)}</tbody></table></div>
}
