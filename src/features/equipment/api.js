import { apiRequest } from '../../shared/api/httpClient.js'

export function listUserEquipment() {
  return apiRequest('/listar-equipamentos-usuario')
}

export function deleteEquipment(id) {
  return apiRequest('/remover-equipamento/' + encodeURIComponent(id), { method: 'DELETE' }).then(result => {
    if (typeof result !== 'string' || result.trim().toLowerCase() !== 'peça deletada') throw new Error(typeof result === 'string' && result ? result : 'Não foi possível confirmar a exclusão.')
    return result
  })
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
