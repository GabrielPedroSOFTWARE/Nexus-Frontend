const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const SESSION_KEY = 'nexus.local.session'

export const isPagesConnection = import.meta.env.PROD && /^http:\/\/127\.0\.0\.1(?::\d+)?$/.test(API_BASE_URL)
export const hasLocalApi = Boolean(API_BASE_URL) && !(isPagesConnection && new URLSearchParams(window.location.search).get('modo') === 'demonstracao')

export function loadSession() {
  try {
    return JSON.parse(window.sessionStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

export function saveSession(session) {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  window.sessionStorage.removeItem(SESSION_KEY)
}

export async function apiRequest(path, options = {}) {
  if (!hasLocalApi) throw new Error('A API local não está configurada.')

  const method = options.method || 'GET'
  const body = options.body
  const headers = {}
  const isFormData = body instanceof FormData

  if (body !== undefined && !isFormData) headers['Content-Type'] = 'application/json'

  const session = loadSession()
  if (options.requiresAuth !== false && session?.token) {
    headers.Authorization = 'Bearer ' + session.token
  }

  let response
  try {
    response = await fetch(API_BASE_URL + path, {
      method,
      headers,
      ...(isPagesConnection ? { targetAddressSpace: 'loopback' } : {}),
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    })
  } catch {
    throw new Error(isPagesConnection
      ? 'Não foi possível conectar ao backend. Confira se ele está iniciado neste computador e se permite o acesso do site e autorize o acesso local no navegador.'
      : 'Não foi possível conectar ao backend local. Confira se ele está iniciado em localhost:8080.')
  }

  const raw = await response.text()
  let result = raw
  try {
    result = raw ? JSON.parse(raw) : null
  } catch {
    // Alguns endpoints do Spring retornam texto simples.
  }

  if (!response.ok) {
    const message = typeof result === 'string'
      ? result
      : result?.message || result?.detail || ('Falha na API (' + response.status + ').')
    throw new Error(message)
  }

  return result
}
