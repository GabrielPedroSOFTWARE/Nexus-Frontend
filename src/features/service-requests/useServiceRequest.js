import { useState } from 'react'
import { hasLocalApi } from '../../shared/api/httpClient.js'
import { createServiceRequest } from './api.js'

export function useServiceRequest(showToast) {
  const [requestOpen, setRequestOpen] = useState(false)
  const submitRequest = async formData => {
    if (!hasLocalApi) {
      setRequestOpen(false)
      showToast('Demonstração: nenhuma solicitação foi enviada.')
      return
    }
    try {
      await createServiceRequest(formData)
      setRequestOpen(false)
      showToast('Solicitação enviada com sucesso')
    } catch (error) {
      showToast(error.message || 'Não foi possível enviar a solicitação.')
    }
  }

  return { requestOpen, setRequestOpen, submitRequest }
}
