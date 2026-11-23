import { apiRequest } from '../../shared/api/httpClient.js'
import { normalizeCpf } from '../../shared/cpf.js'
import { isPasswordValid, PASSWORD_POLICY_MESSAGE } from './passwordPolicy.js'

export function authenticate(credentials) {
  const cpf = normalizeCpf(credentials.cpf)
  if (cpf.length !== 11) return Promise.reject(new Error('Informe os 11 dígitos do CPF.'))
  return apiRequest('/login', { method: 'POST', body: { cpf, senha: credentials.senha }, requiresAuth: false })
}

export function requestPasswordReset(cpfValue) {
  const cpf = normalizeCpf(cpfValue)
  if (cpf.length !== 11) return Promise.reject(new Error('Informe os 11 dígitos do CPF.'))
  return apiRequest('/esqueci-senha', { method: 'POST', body: { cpf }, requiresAuth: false })
}

export function checkPasswordRecovery(code) {
  if (!code) return Promise.reject(new Error('Código de recuperação ausente.'))
  return apiRequest('/status-recuperacao?codigo=' + encodeURIComponent(code), { requiresAuth: false })
}

export function resetPassword(code, newPassword) {
  if (!code) return Promise.reject(new Error('Código de recuperação ausente.'))
  if (!isPasswordValid(newPassword)) return Promise.reject(new Error(PASSWORD_POLICY_MESSAGE))
  return apiRequest('/redefinir-senha', { method: 'POST', body: { codigoEspera: code, novaSenha: newPassword }, requiresAuth: false })
}
