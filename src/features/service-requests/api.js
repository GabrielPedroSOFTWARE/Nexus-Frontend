import { apiRequest } from '../../shared/api/httpClient.js'

export function listUserOrders() {
  return apiRequest('/listar-pedidos-usuario')
}

export function createServiceRequest(formData) {
  const payload = new FormData()
  const problem = String(formData.get('problema') || '').trim()
  payload.append('idPC', String(formData.get('idPC') || ''))
  const frequency = String(formData.get('frequencia') || '').trim()
  payload.append('problema', frequency ? problem + '\nFrequência: ' + frequency : problem)
  payload.append('descricao', problem)
  payload.append('frequencia', frequency)
  const file = formData.get('arquivoImagem')
  if (file instanceof File && file.size > 0) payload.append('arquivoImagem', file)
  return apiRequest('/criar-pedido', { method: 'POST', body: payload }).then(result => {
    if (typeof result !== 'string' || !result.toLowerCase().includes('pedido salvo com sucesso')) throw new Error(typeof result === 'string' && result ? result : 'Não foi possível confirmar o envio.')
    return result
  })
}
