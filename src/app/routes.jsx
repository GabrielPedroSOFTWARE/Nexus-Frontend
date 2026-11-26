import { Navigate } from 'react-router-dom'
import { hasLocalApi } from '../shared/api/httpClient.js'
import { ConnectedAdmin } from '../pages/admin/ConnectedAdmin.jsx'
import { LoginPage } from '../pages/auth/LoginPage.jsx'
import { UserHome } from '../pages/user/HomePage.jsx'
import { MyComputers } from '../pages/user/ComputersPage.jsx'
import { HistoryPage } from '../pages/user/HistoryPage.jsx'
import { AdminHome } from '../pages/admin/DashboardPage.jsx'
import { AdminOrders } from '../pages/admin/OrdersPage.jsx'
import { AdminMaintenance } from '../pages/admin/MaintenancePage.jsx'
import { AccessRequestReview } from '../pages/admin/AccessRequestsPage.jsx'
import { UserManagement } from '../pages/admin/UsersPage.jsx'
import { UserRegistration } from '../pages/admin/UserRegistrationPage.jsx'
import { AdminEquipmentManagement } from '../pages/admin/EquipmentManagementPage.jsx'
import { UnlinkActivePage } from '../pages/admin/UnlinkActivePage.jsx'

export function AppRoutes({ pathname, session, equipmentStatus, refreshEquipment, removeEquipment, onToast, openRequest, profileName, onScan, macbookAdded, registeredEquipment, openService, onLogin, onAccessRequest }) {
  const isBackofficeRoute = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAdminOnlyRoute = ['/admin/usuarios', '/admin/solicitacoes', '/admin/cadastro-usuario', '/admin/equipamentos', '/admin/desvincular-ativo'].includes(pathname)
  const isUserRoute = ['/home', '/meus-pcs', '/historico'].includes(pathname)
  const perfil = String(session?.perfil || '').toUpperCase()
  const isAdmin = Boolean(session?.isAdmin || String(session?.admin).toLowerCase() === 'true')
  const isBackoffice = Boolean(session?.isBackoffice || isAdmin || perfil === 'SUPPORT_MANAGER')
  const isUser = perfil === 'USER' || (!hasLocalApi && !perfil && !isBackoffice)
  if (pathname !== '/' && (!session || (hasLocalApi && !session.token))) return <Navigate to="/" replace />
  if (isAdminOnlyRoute && !isAdmin) return <Navigate to={isBackoffice ? '/admin' : '/home'} replace />
  if (isBackofficeRoute && !isBackoffice) return <Navigate to="/home" replace />
  if (isUserRoute && !isUser) return <Navigate to={isBackoffice ? '/admin' : '/'} replace />
  if (pathname === '/admin/desvincular-ativo') return <UnlinkActivePage onToast={onToast} profileName={profileName} />
  if (isBackofficeRoute && hasLocalApi) return <ConnectedAdmin pathname={pathname} profileName={profileName} profile={perfil} isAdmin={isAdmin} onToast={onToast} />
  switch (pathname) {
    case '/home':
      return <UserHome onToast={onToast} openRequest={openRequest} profileName={profileName} registeredEquipment={registeredEquipment} equipmentStatus={equipmentStatus} refreshEquipment={refreshEquipment} />
    case '/meus-pcs':
      return <MyComputers onToast={onToast} equipmentStatus={equipmentStatus} refreshEquipment={refreshEquipment} removeEquipment={removeEquipment} onScan={onScan} macbookAdded={macbookAdded} registeredEquipment={registeredEquipment} profileName={profileName} />
    case '/historico':
      return <HistoryPage onToast={onToast} profileName={profileName} />
    case '/admin':
      return <AdminHome onToast={onToast} openService={openService} profile={perfil} profileName={profileName} isAdmin={isAdmin} />
    case '/admin/ordens':
      return <AdminOrders onToast={onToast} openService={openService} />
    case '/admin/manutencoes':
      return <AdminMaintenance onToast={onToast} openService={openService} />
    case '/admin/usuarios':
      return <UserManagement onToast={onToast} />
    case '/admin/solicitacoes':
      return <AccessRequestReview onToast={onToast} />
    case '/admin/cadastro-usuario':
      return <UserRegistration onToast={onToast} />
    case '/admin/equipamentos':
      return <AdminEquipmentManagement profileName={profileName} />
    default:
      return <LoginPage onLogin={onLogin} onToast={onToast} onAccessRequest={onAccessRequest} />
  }
}
