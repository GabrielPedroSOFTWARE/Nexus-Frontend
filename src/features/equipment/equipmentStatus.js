import { orderStatusCode } from '../../shared/orderStatus.js'

// Concluída (5) e Cancelada (6) encerram a O.S.; os demais status contam como abertos.
const CLOSED_ORDER_CODES = new Set([5, 6])

export const EQUIPMENT_IN_MAINTENANCE = { status: 'Em manutenção', statusType: 'equipmentMaintenance' }
export const EQUIPMENT_IN_USE = { status: 'Em uso', statusType: 'inUse' }

export function isOpenOrder(order) {
  const code = orderStatusCode(order?.status)
  return code !== null && code >= 0 && !CLOSED_ORDER_CODES.has(code)
}

export function equipmentStatusFromOrders(equipmentId, orders) {
  if (equipmentId == null || equipmentId === '' || !Array.isArray(orders)) return EQUIPMENT_IN_USE
  const targetId = String(equipmentId)
  const hasOpenOrder = orders.some(order => order?.idPC != null && order.idPC !== '' && String(order.idPC) === targetId && isOpenOrder(order))
  return hasOpenOrder ? EQUIPMENT_IN_MAINTENANCE : EQUIPMENT_IN_USE
}
