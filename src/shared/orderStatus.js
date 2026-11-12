// Correspondência provisória baseada na ordem das etapas do protótipo.
export const ORDER_STATUS_STEPS = [
  'Recebida',
  'Em diagnóstico',
  'Em manutenção',
  'Aguardando peças',
  'Pronta para retirada',
  'Concluída',
]

export function orderStatusCode(value) {
  if (typeof value === 'number') return Number.isInteger(value) ? value : null
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null
  const number = Number(value)
  return Number.isSafeInteger(number) ? number : null
}

export function orderStatusLabel(value) {
  const code = orderStatusCode(value)
  if (code === null) return 'Não informado'
  return ORDER_STATUS_STEPS[code] ?? `Status não identificado (${code})`
}
