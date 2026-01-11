import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import WorkerLayout from './components/layout/WorkerLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import CustomerDetails from './pages/CustomerDetails'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import TimeTracking from './pages/TimeTracking'
import Invoices from './pages/Invoices'
import Estimates from './pages/Estimates'
import EstimateDetails from './pages/EstimateDetails'
import Billing from './pages/Billing'
import BillingSuccess from './pages/BillingSuccess'
import BillingCancel from './pages/BillingCancel'
import WorkerDashboard from './pages/worker/WorkerDashboard'
import WorkerTimeLogging from './pages/worker/TimeLogging'
import BrandingSettings from './pages/settings/BrandingSettings'
import { useAuth } from './contexts/AuthContext'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // Se não estiver logado, mostrar página de login
  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Worker routes
  if (user?.role === 'WORKER') {
    return (
      <Routes>
        <Route path="/login" element={<Navigate to="/worker" replace />} />
        <Route path="/" element={<WorkerLayout />}>
          <Route index element={<Navigate to="/worker" replace />} />
          <Route path="worker" element={<WorkerDashboard />} />
          <Route path="worker/time-logging" element={<WorkerTimeLogging />} />
          <Route path="*" element={<Navigate to="/worker" replace />} />
        </Route>
      </Routes>
    )
  }

  // Admin/Manager/Sales routes
  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/dashboard" replace />} />
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="customers" element={<Customers />} />
        <Route path="customers/:id" element={<CustomerDetails />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="time-tracking" element={<TimeTracking />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="estimates" element={<Estimates />} />
        <Route path="estimates/:id" element={<EstimateDetails />} />
        <Route path="billing" element={<Billing />} />
        <Route path="billing/success" element={<BillingSuccess />} />
        <Route path="billing/cancel" element={<BillingCancel />} />
        <Route path="settings/branding" element={<BrandingSettings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App
