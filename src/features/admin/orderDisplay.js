import { isOverdueOrder } from './dashboardMetrics.js'
import { orderStatusCode, orderStatusLabel } from '../../shared/orderStatus.js'

const priorityLabels = ['Baixa', 'Média', 'Alta']

export function equipmentLabel(order) {
  if (order?.apelido) return String(order.apelido)
  if (order?.idPC == null || order.idPC === '') return '—'
  return `PC-${String(order.idPC).padStart(4, '0')}`
}

export function userNamesByCpf(users) {
  const names = new Map()
  const ambiguousMasks = new Set()
  for (const user of Array.isArray(users) ? users : []) {
    const cpf = String(user?.cpfExibicao || user?.cpf || '').trim()
    const digits = cpf.replace(/\D/g, '')
    if (digits.length === 11 && user?.nome) {
      names.set(digits, String(user.nome))
      continue
    }
    if (/\*/.test(cpf) && user?.nome) {
      if (names.has(cpf) && names.get(cpf) !== String(user.nome)) ambiguousMasks.add(cpf)
      else names.set(cpf, String(user.nome))
    }
  }
  for (const cpf of ambiguousMasks) names.delete(cpf)
  return names
}

export function requesterLabel(order, namesByCpf) {
  const requesterName = String(order?.nomeUsuario || '').trim()
  if (requesterName) return requesterName
  const cpf = String(order?.cpfUsuarioDescriptografado || order?.cpfUsuario || order?.idUsuario || '')
  const digits = cpf.replace(/\D/g, '')
  const name = digits.length === 11 ? namesByCpf?.get(digits) : namesByCpf?.get(cpf.trim())
  if (name) return name
  return digits.length === 11 ? `***.***.***-${digits.slice(-2)}` : cpf || '—'
}

export function priorityLabel(value) {
  if (value == null || value === '') return '—'
  const code = Number(value)
  return Number.isInteger(code) && code >= 0 && code < priorityLabels.length ? priorityLabels[code] : '—'
}

export function visibleStatus(order, now) {
  return isOverdueOrder(order, now) ? 'Atrasada' : orderStatusLabel(order?.status)
}

export function statusTone(order, now) {
  if (isOverdueOrder(order, now)) return 'overdue'
  const status = orderStatusCode(order?.status)
  return status == null ? 'unknown' : `status-${status}`
}

function parseLocalDateTime(value) {
  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(value)
  if (!match) return null
  const [, year, month, day, hour, minute, second = '0'] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
  return Number.isNaN(date.getTime()) ? null : date
}

export function orderMttrMinutes(order) {
  if (Number(order?.status) !== 5) return null
  const start = parseLocalDateTime(order?.dataHoraInicioDiagnostico)
  const end = parseLocalDateTime(order?.dataHoraConclusao)
  if (!start || !end || end < start) return null
  const ready = parseLocalDateTime(order?.dataHoraProntaRetirada)
  const waitMinutes = ready ? Math.max(0, Math.floor((end - ready) / 60000)) : 0
  return Math.max(0, Math.floor((end - start) / 60000) - waitMinutes)
}

export function formatDuration(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0) return '—'
  const wholeMinutes = Math.round(minutes)
  const days = Math.floor(wholeMinutes / 1440)
  const hours = Math.floor((wholeMinutes % 1440) / 60)
  const rest = wholeMinutes % 60
  if (days) return `${days}d ${hours}h${rest ? ` ${rest}min` : ''}`
  if (hours) return `${hours}h${rest ? `${rest}min` : ''}`
  return `${rest}min`
}

export function formatDate(value) {
  if (typeof value !== 'string') return '—'
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return value
  return `${match[3]}/${match[2]}/${match[1]}`
}
