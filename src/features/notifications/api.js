import { apiRequest } from '../../shared/api/httpClient.js'

export function listUserNotifications() {
  return apiRequest('/user/retornar-notificacoes-usuario')
}
