import { apiRequest } from '../../shared/api/httpClient.js'

export function authenticate(credentials) {
  return apiRequest('/login', { method: 'POST', body: credentials, requiresAuth: false })
}
