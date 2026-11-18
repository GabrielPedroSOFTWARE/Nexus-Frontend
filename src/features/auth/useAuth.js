import { useState } from 'react'
import { hasLocalApi, loadSession, saveSession } from '../../shared/api/httpClient.js'
import { authenticate } from './api.js'

export function useAuth(navigate, showToast) {
  const [session, setSession] = useState(() => loadSession())
  const handleLogin = async credentials => {
    if (!hasLocalApi) {
      const demoIdentity = String(credentials.cpf || '').toLowerCase()
      const isAdmin = /admin/i.test(demoIdentity)
      const perfil = /tec|support|suporte/i.test(demoIdentity) ? 'SUPPORT'
        : /gestor|manager/i.test(demoIdentity) ? 'MANAGER' : 'USER'
      const nextSession = { cpf: credentials.cpf, perfil, isAdmin, isBackoffice: isAdmin || perfil !== 'USER', demo: true }
      saveSession(nextSession)
      setSession(nextSession)
      navigate(nextSession.isBackoffice ? '/admin' : '/home')
      return
    }
    try {
      const response = await authenticate(credentials)
      if (!response?.token) throw new Error('Resposta de autenticação inválida.')
      const perfil = String(response.perfil || '').toUpperCase()
      const isAdmin = String(response?.admin).toLowerCase() === 'true'
      const isBackoffice = isAdmin || ['SUPPORT', 'MANAGER'].includes(perfil)
      const nextSession = {
        ...response,
        cpf: credentials.cpf,
        perfil,
        isAdmin,
        isBackoffice,
      }
      saveSession(nextSession)
      setSession(nextSession)
      navigate(isBackoffice ? '/admin' : '/home')
    } catch (error) {
      showToast(error.message || 'Não foi possível entrar no sistema.')
    }
  }

  return { session, setSession, handleLogin }
}
