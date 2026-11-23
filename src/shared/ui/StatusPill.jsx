import { STATUS } from '../constants.js'

export function StatusPill({ type, children }) {
  const status = STATUS[type] || STATUS.active
  return <span className="status-pill" style={{ '--pill-bg': status.color, '--pill-ink': status.ink }}>{children || status.text}</span>
}
