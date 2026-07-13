import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from './store/authSlice'

// Pages
import LandingPage from './pages/public/LandingPage'
import DashboardLayout from './layouts/DashboardLayout'
import FlightTicket from './pages/dashboard/user/FlightTicket'
import PlaceholderPage from './pages/dashboard/user/PlaceholderPage'
import SearchResultsPage from './pages/dashboard/user/SearchResultsPage'

import BookingsPage from './pages/dashboard/user/BookingsPage'
import ProfilePage from './pages/dashboard/user/ProfilePage'
import WishlistPage from './pages/dashboard/user/WishlistPage'
import PropertiesPage from './pages/dashboard/user/PropertiesPage'
import FlightSearchResults from './pages/public/FlightSearchResults'
import FlightBookingPage from './pages/public/FlightBookingPage'
import ForgotPasswordPage from './pages/public/ForgotPasswordPage'
import ResetPasswordPage from './pages/public/ResetPasswordPage'
import PartnerConnect from './pages/dashboard/partner/PartnerConnect'
import HotelSearchResults from './pages/public/HotelSearchResults'
import HotelDetailsPage from './pages/public/HotelDetailsPage'
import HotelCheckout from './pages/public/HotelCheckout'
import HotelBookingSuccess from './pages/public/HotelBookingSuccess'

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
import AgentLayout from './layouts/AgentLayout'
import AgentDashboard from './pages/dashboard/agent/AgentDashboard'
import { Toaster } from 'react-hot-toast'

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  const getRedirectPath = (role?: string) => {
    if (role === 'SUPER_ADMIN') return '/admin';
    if (role === 'SUB_ADMIN') return '/sub-admin';
    if (role === 'AGENT') return '/agent-portal';
    return '/';
  };

  // A simple wrapper to protect routes
  const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: string[] }) => {
    if (!isAuthenticated) return <Navigate to="/" replace />
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      return <Navigate to={getRedirectPath(user.role)} replace /> // Prevent redirect loop
    }
    return <>{children ? children : <Outlet />}</>
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Partner Routes */}
        <Route path="/partner/connect" element={<PartnerConnect />} />

        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/flights/search" element={<FlightSearchResults />} />
        <Route path="/hotels/search" element={<HotelSearchResults />} />
        <Route path="/hotels/checkout" element={<HotelCheckout />} />
        <Route path="/hotels/booking-success" element={<HotelBookingSuccess />} />
        <Route path="/hotels/:id" element={<HotelDetailsPage />} />
        <Route path="/flights/book" element={<FlightBookingPage />} />
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
          <Route index element={<Navigate to="/" replace />} />
          <Route path="home" element={<Navigate to="/" replace />} />
          <Route path="search" element={<SearchResultsPage />} />
          <Route path="bookings" element={<BookingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="invoice/:id" element={<FlightTicket />} />
        </Route>

        {/* Agent Routes */}
        <Route path="/agent-portal" element={<ProtectedRoute allowedRoles={['AGENT']} />}>
          <Route element={<AgentLayout />}>
            <Route index element={<Navigate to="/agent-portal/dashboard" replace />} />
            <Route path="dashboard" element={<AgentDashboard />} />
            {/* Additional agent routes can be added here */}
            <Route path="*" element={<div className="p-8">Agent Page Coming Soon</div>} />
          </Route>
        </Route>
        
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
          <Route path="ops/properties" element={<AdminInventory />} />
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
