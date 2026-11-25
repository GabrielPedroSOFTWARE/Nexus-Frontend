import { useEffect, useState } from 'react'
import { HashRouter, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth.js'
import { useEquipment } from '../features/equipment/useEquipment.js'
import { useServiceRequest } from '../features/service-requests/useServiceRequest.js'
import { demoServiceOrders } from '../features/service-orders/demoData.js'
import { mapBackendEquipment } from '../features/equipment/mapBackendEquipment.js'
import { RequestModal } from '../features/service-requests/RequestModal.jsx'
import { AccessRequestForm } from '../features/access-requests/AccessRequestForm.jsx'
import { ScanModal } from '../features/equipment/ScanModal.jsx'
import { ServiceModal } from '../features/service-orders/ServiceDetailsModal.jsx'
import { ToastViewport } from './ToastViewport.jsx'
import { AppRoutes } from './routes.jsx'

function NexusApp() {
  const location = useLocation()
  const navigate = useNavigate()
  const [toast, setToast] = useState(null)
  const [accessRequestOpen, setAccessRequestOpen] = useState(false)
  const [service, setService] = useState(null)
  const showToast = (message, type = 'success') => setToast({ message, type })
  const closeToast = () => setToast(null)
  const { session, setSession, handleLogin } = useAuth(navigate, showToast)
  const { equipmentStatus, scannerState, setScannerState, macbookAdded, scannedEquipment, registeredEquipment, setRegisteredEquipment, startScan, confirmScan, refreshEquipment, removeEquipment } = useEquipment(session, showToast)
  const { requestOpen, setRequestOpen, submitRequest } = useServiceRequest(showToast)
  const openService = item => setService(item || demoServiceOrders[0])
  const closeService = () => setService(null)
  const displayName = session?.nome || (session?.isAdmin ? 'Administrador'
    : session?.perfil === 'SUPPORT_MANAGER' ? 'Técnico / Gestor' : 'Usuário')

  useEffect(() => {
    const logout = () => {
      setSession(null)
      setRegisteredEquipment([])
    }
    window.addEventListener('nexus:logout', logout)
    return () => window.removeEventListener('nexus:logout', logout)
  }, [])

  useEffect(() => {
    if (location.pathname === '/sair') navigate('/')
  }, [location.pathname, navigate])

  return <>
    <AppRoutes
      pathname={location.pathname}
      session={session}
      equipmentStatus={equipmentStatus}
      refreshEquipment={refreshEquipment}
      removeEquipment={removeEquipment}
      onToast={showToast}
      openRequest={() => setRequestOpen(true)}
      profileName={displayName}
      onScan={startScan}
      macbookAdded={macbookAdded}
      registeredEquipment={registeredEquipment}
      openService={openService}
      onLogin={handleLogin}
      onAccessRequest={() => setAccessRequestOpen(true)}
    />
    {requestOpen && <RequestModal onClose={() => setRequestOpen(false)} onSubmit={submitRequest} equipment={registeredEquipment.map(mapBackendEquipment)} />}
    {accessRequestOpen && <AccessRequestForm onClose={() => setAccessRequestOpen(false)} onToast={showToast} />}
    {scannerState && <ScanModal status={scannerState} onClose={() => setScannerState('')} onComplete={() => setScannerState('complete')} onConfirm={confirmScan} equipment={scannedEquipment} />}
    {service && <ServiceModal service={service} onClose={closeService} onToast={showToast} />}
    <ToastViewport toast={toast} onClose={closeToast} />
  </>
}

export default function App() {
  return <HashRouter><NexusApp /></HashRouter>
}
