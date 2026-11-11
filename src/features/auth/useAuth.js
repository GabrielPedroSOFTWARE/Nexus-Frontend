import { useState } from 'react'
import { hasLocalApi, loadSession, saveSession } from '../../shared/api/httpClient.js'
import { authenticate } from './api.js'

export function useAuth(navigate, showToast) {
  const [session, setSession] = useState(() => loadSession())
  const handleLogin = async credentials => {
    if (!hasLocalApi) {
      const nextSession = { login: credentials.login, isAdmin: /admin|tec/i.test(credentials.login), demo: true }
      saveSession(nextSession)
      setSession(nextSession)
      navigate(nextSession.isAdmin ? '/admin' : '/home')
      return
    }
    try {
      const response = await authenticate(credentials)
      if (!response?.token) throw new Error('Resposta de autenticação inválida.')
      const nextSession = {
        ...response,
        login: credentials.login,
        isAdmin: String(response?.admin).toLowerCase() === 'true',
      }
      saveSession(nextSession)
      setSession(nextSession)
      navigate(nextSession.isAdmin ? '/admin' : '/home')
    } catch (error) {
      showToast(error.message || 'Não foi possível entrar no sistema.')
    }
  }

  return { session, setSession, handleLogin }
}
