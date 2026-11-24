import { orderStatusCode } from '../../shared/orderStatus.js'

// Concluída (5) e Cancelada (6) encerram a O.S.; os demais status contam como abertos.
const CLOSED_ORDER_CODES = new Set([5, 6])

export const EQUIPMENT_IN_MAINTENANCE = { status: 'Em manutenção', statusType: 'equipmentMaintenance' }
export const EQUIPMENT_IN_USE = { status: 'Em uso', statusType: 'inUse' }

export function isOpenOrder(order) {
  const code = orderStatusCode(order?.status)
  return code !== null && code >= 0 && !CLOSED_ORDER_CODES.has(code)
}

function ordersForEquipment(equipmentId, orders) {
  if (equipmentId == null || equipmentId === '' || !Array.isArray(orders)) return []
  const targetId = String(equipmentId)
  return orders.filter(order => order?.idPC != null && order.idPC !== '' && String(order.idPC) === targetId)
}

function parseMaintenanceDate(value) {
  if (typeof value !== 'string') return null
  const raw = value.trim()
  if (!raw) return null

  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(raw)
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?/.exec(raw)
  if (iso) {
    if (hasTimezone) {
      const timestamp = Date.parse(raw)
      if (!Number.isFinite(timestamp)) return null
      return { timestamp, formatted: new Date(timestamp).toLocaleDateString('pt-BR') }
    }
    const timestamp = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), Number(iso[4] || 0), Number(iso[5] || 0), Number(iso[6] || 0)).getTime()
    return Number.isFinite(timestamp) ? { timestamp, formatted: `${iso[3]}/${iso[2]}/${iso[1]}` } : null
  }

  const br = /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(raw)
  if (br) {
    const timestamp = new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]), Number(br[4] || 0), Number(br[5] || 0), Number(br[6] || 0)).getTime()
    return Number.isFinite(timestamp) ? { timestamp, formatted: `${br[1]}/${br[2]}/${br[3]}` } : null
  }

  return null
}

function completedOrderDateCandidate(order) {
  const candidates = [order?.dataHoraConclusao, order?.dataHoraProntaRetirada, order?.dataInicioManutencao, order?.dataManutencao, order?.dataHoraAbertura]
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim()
  }
  return ''
}

export function equipmentStatusFromOrders(equipmentId, orders) {
  const hasOpenOrder = ordersForEquipment(equipmentId, orders).some(isOpenOrder)
  return hasOpenOrder ? EQUIPMENT_IN_MAINTENANCE : EQUIPMENT_IN_USE
}

export function lastMaintenanceFromOrders(equipmentId, orders) {
  const deviceOrders = ordersForEquipment(equipmentId, orders)
  if (deviceOrders.some(isOpenOrder)) return 'Em manutenção'

  const completed = deviceOrders
    .filter(order => orderStatusCode(order?.status) === 5)
    .map(order => parseMaintenanceDate(completedOrderDateCandidate(order)))
    .filter(Boolean)
    .sort((a, b) => (b.timestamp === a.timestamp ? 0 : b.timestamp > a.timestamp ? 1 : -1))

  return completed[0]?.formatted || '-----'
}
