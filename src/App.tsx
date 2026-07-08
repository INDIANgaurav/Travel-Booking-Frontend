import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from './store/authSlice'

// Pages
import AuthPage from './pages/public/AuthPage'
import LandingPage from './pages/public/LandingPage'
import DashboardLayout from './layouts/DashboardLayout'
import HomePage from './pages/dashboard/user/HomePage'
import ProfilePage from './pages/dashboard/user/ProfilePage'
import FlightTicket from './pages/dashboard/user/FlightTicket'
import TravellersPage from './pages/dashboard/user/TravellersPage'
import SecurityPage from './pages/dashboard/user/SecurityPage'
import BookingsPage from './pages/dashboard/user/BookingsPage'
import SearchResultsPage from './pages/dashboard/user/SearchResultsPage'
import PlaceholderPage from './pages/dashboard/user/PlaceholderPage'
import FlightSearchResults from './pages/public/FlightSearchResults'
import FlightBookingPage from './pages/public/FlightBookingPage'
import ForgotPasswordPage from './pages/public/ForgotPasswordPage'
import ResetPasswordPage from './pages/public/ResetPasswordPage'

import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/dashboard/admin/AdminDashboard'
import AdminUsers from './pages/dashboard/admin/AdminUsers'
import AdminBookings from './pages/dashboard/admin/AdminBookings'
import AdminProfile from './pages/dashboard/admin/AdminProfile'
import AdminAgents from './pages/dashboard/admin/AdminAgents'
import AdminFinance from './pages/dashboard/admin/AdminFinance'
import AdminInventory from './pages/dashboard/admin/AdminInventory'
import AdminSettings from './pages/dashboard/admin/AdminSettings'
import AdminSubAdmins from './pages/dashboard/admin/AdminSubAdmins'
import SubAdminDashboard from './pages/dashboard/subadmin/SubAdminDashboard'

import SubAdminLayout from './layouts/SubAdminLayout'
import { Toaster } from 'react-hot-toast'

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  const getRedirectPath = (role?: string) => {
    if (role === 'SUPER_ADMIN') return '/admin';
    if (role === 'SUB_ADMIN') return '/sub-admin';
    if (role === 'AGENT') return '/agent-portal';
    return '/dashboard/home';
  };

  // A simple wrapper to protect routes
  const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
    if (!isAuthenticated) return <Navigate to="/login" replace />
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      return <Navigate to={getRedirectPath(user.role)} replace /> // Prevent redirect loop
    }
    return <>{children}</>
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={getRedirectPath(user?.role)} /> : <AuthPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to={getRedirectPath(user?.role)} /> : <AuthPage />} />
        <Route path="/search" element={<FlightSearchResults />} />
        <Route path="/book/:flightId" element={<FlightBookingPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected User Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['USER']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard/home" replace />} />
          <Route path="home" element={<PlaceholderPage title="Dashboard Home" />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="bookings" element={<PlaceholderPage title="My Bookings" />} />
          <Route path="profile" element={<PlaceholderPage title="My Profile" />} />
        </Route>

        <Route path="/agent-portal" element={<div className="p-8">Agent Dashboard</div>} />
        
        {/* Sub Admin Routes */}
        <Route 
          path="/sub-admin" 
          element={
            <ProtectedRoute allowedRoles={['SUB_ADMIN']}>
              <SubAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/sub-admin/dashboard" replace />} />
          <Route path="dashboard" element={<SubAdminDashboard />} />
          {/* Sales */}
          <Route path="sales/leads" element={<PlaceholderPage title="Lead Management" />} />
          <Route path="sales/packages" element={<PlaceholderPage title="Package Promotion" />} />
          <Route path="sales/agents" element={<PlaceholderPage title="Agent Onboarding" />} />
          {/* Ops */}
          <Route path="ops/verification" element={<PlaceholderPage title="Booking Verification" />} />
          <Route path="ops/tickets" element={<PlaceholderPage title="Ticket Management" />} />
          <Route path="ops/coordination" element={<PlaceholderPage title="Travel Coordination" />} />
          {/* Support */}
          <Route path="support/queries" element={<PlaceholderPage title="Query Management" />} />
          <Route path="support/assistance" element={<PlaceholderPage title="Booking Assistance" />} />
          <Route path="support/refunds" element={<PlaceholderPage title="Refund Support" />} />
          {/* Accounts */}
          <Route path="accounts/transactions" element={<PlaceholderPage title="Transaction Monitor" />} />
          <Route path="accounts/invoices" element={<PlaceholderPage title="Invoice Generation" />} />
          <Route path="accounts/reconciliation" element={<PlaceholderPage title="Payment Reconciliation" />} />
        </Route>

        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="sub-admins" element={<AdminSubAdmins />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="invoice/:id" element={<FlightTicket />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
