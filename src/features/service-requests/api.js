import { apiRequest } from '../../shared/api/httpClient.js'

export function listUserOrders() {
  return apiRequest('/listar-pedidos-usuario')
}

export function createServiceRequest(formData) {
  const payload = new FormData()
  const problem = String(formData.get('problema') || '').trim()
  payload.append('idPC', String(formData.get('idPC') || ''))
  payload.append('problema', problem)
  payload.append('descricao', problem)
  payload.append('frequencia', String(formData.get('frequencia') || ''))
  const file = formData.get('arquivoImagem')
  if (file instanceof File && file.size > 0) payload.append('arquivoImagem', file)
  return apiRequest('/criar-pedido', { method: 'POST', body: payload })
}
