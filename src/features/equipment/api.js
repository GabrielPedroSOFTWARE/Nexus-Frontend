import { apiRequest } from '../../shared/api/httpClient.js'

export function listUserEquipment() {
  return apiRequest('/listar-equipamentos-usuario')
}

export function deleteEquipment(id) {
  return apiRequest('/remover-equipamento/' + encodeURIComponent(id), { method: 'DELETE' })
}

export function detectEquipment() {
  return apiRequest('/pecas')
}

export function addEquipment(equipment) {
  return apiRequest('/adicionar-equipamento', {
    method: 'POST',
    body: { ...equipment, pedidos: [] },
  })
}
