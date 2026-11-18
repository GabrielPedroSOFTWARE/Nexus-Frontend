import { apiRequest } from '../../shared/api/httpClient.js'
import { normalizeCpf } from '../../shared/cpf.js'

export function authenticate(credentials) {
  const cpf = normalizeCpf(credentials.cpf)
  if (cpf.length !== 11) return Promise.reject(new Error('Informe os 11 dígitos do CPF.'))
  return apiRequest('/login', { method: 'POST', body: { cpf, senha: credentials.senha }, requiresAuth: false })
}
