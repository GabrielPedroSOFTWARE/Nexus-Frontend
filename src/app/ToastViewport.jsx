import { Toast } from '../shared/ui/Toast.jsx'
import { useEffect } from 'react'

export function ToastViewport({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined
    const timer = window.setTimeout(onClose, 3600)
    return () => window.clearTimeout(timer)
  }, [toast, onClose])
  return <Toast message={toast} onClose={onClose} />
}
