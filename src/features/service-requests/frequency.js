export const FREQUENCY_OPTIONS = [
  'Sempre que utiliza',
  'Mais de uma vez por semana',
  'Raramente',
  'Não sei informar',
  'Começou hoje',
]

// Códigos provisórios a confirmar com o responsável pelo backend.
export function getFrequencyCode(label) {
  const code = FREQUENCY_OPTIONS.indexOf(label)
  if (code < 0) throw new Error('Selecione uma frequência válida.')
  return code
}

function getFrequencyLabel(value) {
  if (typeof value === 'string' && FREQUENCY_OPTIONS.includes(value.trim())) return value.trim()
  if (typeof value !== 'number' && (typeof value !== 'string' || !/^[0-4]$/.test(value.trim()))) return ''
  const code = Number(value)
  return Number.isInteger(code) ? FREQUENCY_OPTIONS[code] || '' : ''
}

export function getRequestDetails(order = {}) {
  const problem = typeof order.problema === 'string' ? order.problema : ''
  const match = problem.match(/\r?\nFrequência: ([^\r\n]+)$/u)
  const embeddedFrequency = match && FREQUENCY_OPTIONS.includes(match[1]) ? match[1] : ''
  const separateFrequency = getFrequencyLabel(order.frequencia)
  const canSeparate = embeddedFrequency && (!separateFrequency || separateFrequency === embeddedFrequency)

  return {
    problem: (canSeparate ? problem.slice(0, match.index) : problem) || order.descricao || 'Sem descrição',
    frequency: separateFrequency || embeddedFrequency || '',
  }
}
