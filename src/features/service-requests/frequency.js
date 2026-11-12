export const FREQUENCY_OPTIONS = [
  'Sempre que utiliza',
  'Mais de uma vez por semana',
  'Raramente',
  'Não sei informar',
  'Começou hoje',
]

export function getRequestDetails(order = {}) {
  const problem = typeof order.problema === 'string' ? order.problema : ''
  const match = problem.match(/\r?\nFrequência: ([^\r\n]+)$/u)
  const embeddedFrequency = match && FREQUENCY_OPTIONS.includes(match[1]) ? match[1] : ''
  const separateFrequency = typeof order.frequencia === 'string' ? order.frequencia.trim() : ''
  const canSeparate = embeddedFrequency && (!separateFrequency || separateFrequency === embeddedFrequency)

  return {
    problem: (canSeparate ? problem.slice(0, match.index) : problem) || order.descricao || 'Sem descrição',
    frequency: separateFrequency || embeddedFrequency || '',
  }
}
