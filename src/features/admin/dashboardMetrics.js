const STATUS_DEFINITIONS = [
  { code: 0, name: 'Recebida', color: '#33435f' },
  { code: 1, name: 'Em diagnóstico', color: '#4263eb' },
  { code: 2, name: 'Em manutenção', color: '#8877ff' },
  { code: 3, name: 'Aguardando peças', color: '#ef9b45' },
  { code: 4, name: 'Pronta para retirada', color: '#239b8e' },
  { code: 5, name: 'Concluída', color: '#5b8e7d' },
  { code: 6, name: 'Cancelada', color: '#a16b82' },
]

function normalizedStatus(value) {
  if (value == null || (typeof value === 'string' && value.trim() === '')) return 'sem-status'
  const code = Number(value)
  return Number.isInteger(code) ? code : String(value)
}

function parseLocalDate(value) {
  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
  if (!match) return null
  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}

export function buildDashboardMetrics(orders, now = new Date()) {
  const safeOrders = Array.isArray(orders) ? orders : []
  const statusCounts = new Map()
  for (const order of safeOrders) {
    const status = normalizedStatus(order?.status)
    statusCounts.set(status, (statusCounts.get(status) || 0) + 1)
  }

  const statuses = STATUS_DEFINITIONS.map(status => ({ ...status, count: statusCounts.get(status.code) || 0 }))
  for (const [code, count] of statusCounts) {
    if (typeof code === 'number' && !STATUS_DEFINITIONS.some(status => status.code === code)) {
      statuses.push({ code, name: `Código ${code}`, color: '#8791a5', count })
    } else if (code === 'sem-status') {
      statuses.push({ code, name: 'Sem status', color: '#8791a5', count })
    } else if (typeof code === 'string') {
      statuses.push({ code, name: `Código ${code}`, color: '#8791a5', count })
    }
  }

  const monthlyKeys = []
  for (let offset = 5; offset >= 0; offset -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    monthlyKeys.push({
      key,
      label: new Intl.DateTimeFormat('pt-BR', { month: 'short', year: '2-digit' }).format(date).replace('.', ''),
      count: 0,
    })
  }
  const monthByKey = new Map(monthlyKeys.map(month => [month.key, month]))
  let ordersWithDate = 0
  for (const order of safeOrders) {
    const date = parseLocalDate(order?.dataInicioManutencao)
    if (!date) continue
    ordersWithDate += 1
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const month = monthByKey.get(key)
    if (month) month.count += 1
  }

  const active = safeOrders.filter(order => {
    const status = normalizedStatus(order?.status)
    return Number.isInteger(status) && status >= 0 && status <= 4
  }).length

  return {
    total: safeOrders.length,
    active,
    completed: statusCounts.get(5) || 0,
    canceled: statusCounts.get(6) || 0,
    waitingForParts: statusCounts.get(3) || 0,
    statuses,
    months: monthlyKeys,
    ordersWithDate,
  }
}
