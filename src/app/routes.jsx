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

export function AppRoutes({ pathname, session, equipmentStatus, refreshEquipment, removeEquipment, onToast, openRequest, profileName, onScan, macbookAdded, registeredEquipment, openService, onLogin, onAccessRequest }) {
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
  if (pathname !== '/' && (!session || (hasLocalApi && !session.token))) return <Navigate to="/" replace />
  if (isAdminRoute && !session?.isAdmin) return <Navigate to="/home" replace />
  if (isAdminRoute && hasLocalApi) return <ConnectedAdmin pathname={pathname} profileName={profileName} onToast={onToast} />
  switch (pathname) {
    case '/home':
      return <UserHome onToast={onToast} openRequest={openRequest} profileName={profileName} registeredEquipment={registeredEquipment} equipmentStatus={equipmentStatus} refreshEquipment={refreshEquipment} />
    case '/meus-pcs':
      return <MyComputers onToast={onToast} equipmentStatus={equipmentStatus} refreshEquipment={refreshEquipment} removeEquipment={removeEquipment} onScan={onScan} macbookAdded={macbookAdded} registeredEquipment={registeredEquipment} profileName={profileName} />
    case '/historico':
      return <HistoryPage onToast={onToast} profileName={profileName} />
    case '/admin':
      return <AdminHome onToast={onToast} openService={openService} />
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
    default:
      return <LoginPage onLogin={onLogin} onToast={onToast} onAccessRequest={onAccessRequest} />
  }
}
