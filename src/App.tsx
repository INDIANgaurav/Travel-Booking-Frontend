import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser, selectShowAgentOnboarding } from './store/authSlice'

// Pages
import LandingPage from './pages/public/LandingPage'
import DashboardLayout from './layouts/DashboardLayout'
import FlightTicket from './pages/dashboard/user/FlightTicket'
import FlightInvoice from './pages/dashboard/user/FlightInvoice'
import PlaceholderPage from './pages/dashboard/user/PlaceholderPage'
import SearchResultsPage from './pages/dashboard/user/SearchResultsPage'

import BookingsPage from './pages/dashboard/user/BookingsPage'
import ProfilePage from './pages/dashboard/user/ProfilePage'
import WalletPage from './pages/dashboard/user/WalletPage'
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
import PendingApprovalPage from './pages/public/PendingApprovalPage'
import FeatureComingSoonPage from './pages/public/FeatureComingSoonPage'
import InactiveAccountPage from './pages/public/InactiveAccountPage'
import AgentSignUpPage from './pages/public/AgentSignUpPage'
import RetailAgentLoginPage from './pages/public/RetailAgentLoginPage'
import B2BAgentHomePage from './pages/public/B2BAgentHomePage'
import B2BAgentCheckout from './pages/public/B2BAgentCheckout'
import DynamicPageViewer from './pages/public/DynamicPageViewer'
import B2BAgentDashboard from './pages/public/B2BAgentDashboard'
import B2BBankDetails from './pages/public/B2BBankDetails'
import B2BWalletPage from './pages/public/B2BWalletPage'
import B2BPaxCalendar from './pages/public/B2BPaxCalendar'
import B2BInvoice from './pages/public/B2BInvoice'
import B2BCreditNote from './pages/public/B2BCreditNote'
import B2BDebitNote from './pages/public/B2BDebitNote'
import B2BGstInvoice from './pages/public/B2BGstInvoice'
import B2BOfflineBooking from './pages/public/B2BOfflineBooking'
import B2BMarkup from './pages/public/B2BMarkup'
import B2BAccountStatement from './pages/public/B2BAccountStatement'
import B2BBookingStatus from './pages/public/B2BBookingStatus'
import B2BManageBooking from './pages/public/B2BManageBooking'
import B2BDashboardLayout from './layouts/B2BDashboardLayout'
import SupplierLoginPage from './pages/public/SupplierLoginPage'
import SupplierDashboardLayout from './layouts/SupplierDashboardLayout'
import SupplierDashboard from './pages/supplier/SupplierDashboard'
import SeriesFareManager from './pages/supplier/SeriesFareManager'
import SupplierUserManagement from './pages/supplier/SupplierUserManagement'
import SupplierBookingHistory from './pages/supplier/SupplierBookingHistory'
import SupplierQueueHistory from './pages/supplier/SupplierQueueHistory'

import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/dashboard/admin/AdminDashboard'
import AdminPendingUsers from './pages/dashboard/admin/AdminPendingUsers'
import AdminManageUsers from './pages/dashboard/admin/AdminManageUsers'
import AdminPendingQueue from './pages/dashboard/admin/AdminPendingQueue'
import AdminBookings from './pages/dashboard/admin/AdminBookings'
import AdminProfile from './pages/dashboard/admin/AdminProfile'
import AdminFinance from './pages/dashboard/admin/AdminFinance'
import AdminLedger from './pages/dashboard/admin/AdminLedger'
import SupplierManagement from './pages/dashboard/admin/SupplierManagement'
import CugSuppliersManager from './pages/dashboard/admin/CugSuppliersManager'
import AdminInventory from './pages/dashboard/admin/AdminInventory'
import AdminSubAdmins from './pages/dashboard/admin/AdminSubAdmins'
import AdminSMSSettings from './pages/dashboard/admin/settings/AdminSMSSettings'
import AdminRoleMaster from './pages/dashboard/admin/settings/AdminRoleMaster'
import AdminPGMapping from './pages/dashboard/admin/settings/AdminPGMapping'
import AdminDynamicPages from './pages/dashboard/admin/settings/AdminDynamicPages'
import AdminB2BRequests from './pages/dashboard/admin/AdminB2BRequests'
import AdminUserProfile from './pages/dashboard/admin/AdminUserProfile'
import AdminFDMaker from './pages/dashboard/admin/AdminFDMaker'
import AdminFDReport from './pages/dashboard/admin/AdminFDReport'
import AdminFDArchive from './pages/dashboard/admin/AdminFDArchive'
import AdminFDSlowMovingSector from './pages/dashboard/admin/AdminFDSlowMovingSector'
import AdminOfflineTopUps from './pages/dashboard/admin/AdminOfflineTopUps'
import AdminWithdrawals from './pages/dashboard/admin/AdminWithdrawals'
import AdminCommissionList from './pages/dashboard/admin/commissions/AdminCommissionList'
import AdminCommissionAdd from './pages/dashboard/admin/commissions/AdminCommissionAdd'
import AdminCommissionGroups from './pages/dashboard/admin/commissions/AdminCommissionGroups'
import AdminBankAccounts from './pages/dashboard/admin/treasury/AdminBankAccounts'
import AdminRecordPayment from './pages/dashboard/admin/treasury/AdminRecordPayment'
import AdminSettlementQueue from './pages/dashboard/admin/treasury/AdminSettlementQueue'
import AdminInvoiceCenter from './pages/dashboard/admin/treasury/AdminInvoiceCenter'
import AdminFlightSalesReport from './pages/dashboard/admin/reports/AdminFlightSalesReport'
import AdminDebitNoteReport from './pages/dashboard/admin/reports/AdminDebitNoteReport'
import AdminCreditNoteReport from './pages/dashboard/admin/reports/AdminCreditNoteReport'
import AdminCancellationHistory from './pages/dashboard/admin/reports/AdminCancellationHistory'
import AdminHotelCancellations from './pages/dashboard/admin/reports/AdminHotelCancellations'
import AdminPGReport from './pages/dashboard/admin/reports/AdminPGReport'
import AdminAgentOutstanding from './pages/dashboard/admin/reports/AdminAgentOutstanding'
import AdminAgentActivation from './pages/dashboard/admin/reports/AdminAgentActivation'
import AdminSupplierMapping from './pages/dashboard/admin/reports/AdminSupplierMapping'
import AdminFareQuoteReport from './pages/dashboard/admin/reports/AdminFareQuoteReport'
import AdminPassengerCalendar from './pages/dashboard/admin/reports/AdminPassengerCalendar'
import SubAdminDashboard from './pages/dashboard/subadmin/SubAdminDashboard'

import SubAdminLayout from './layouts/SubAdminLayout'
import AgentLayout from './layouts/AgentLayout'
import AgentDashboard from './pages/dashboard/agent/AgentDashboard'
import { Toaster } from 'react-hot-toast'
import AgentOnboardingModal from './components/agent/AgentOnboardingModal'

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)
  const showAgentOnboarding = useSelector(selectShowAgentOnboarding)

  const getRedirectPath = (roles: string[] = []) => {
    if (roles.includes('SUPER_ADMIN')) return '/admin';
    if (roles.includes('SUB_ADMIN')) return '/sub-admin';
    if (roles.includes('B2B_AGENT') || roles.includes('SELLER')) return '/b2b/home';
    if (roles.includes('SUPPLIER_AGENT') || roles.includes('SUPPLIER_STAFF')) return '/supplier-portal/dashboard';
    return '/';
  };

  // A simple wrapper to protect routes
  const ProtectedRoute = ({ children, allowedRoles }: { children?: React.ReactNode, allowedRoles?: string[] }) => {
    if (!isAuthenticated) return <Navigate to="/" replace />
    if (user && user.isActive === false) return <Navigate to="/inactive-account" replace />
    if (user && user.roles && user.roles.includes('B2B_AGENT') && (user.agentStatus === 'PENDING' || user.agentStatus === 'INCOMPLETE')) {
      return <Navigate to="/pending-approval" replace />
    }
    if (allowedRoles && user && user.roles && !user.roles.some((role: string) => allowedRoles.includes(role))) {
      return <Navigate to={getRedirectPath(user.roles)} replace /> // Prevent redirect loop
    }
    return <>{children ? children : <Outlet />}</>
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <AgentOnboardingModal isOpen={showAgentOnboarding} />
      <Routes>
        {/* Partner Routes */}
        <Route path="/partner/connect" element={<PartnerConnect />} />

        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/flights/search" element={<FlightSearchResults />} />
        <Route path="/flights/booking" element={<FlightBookingPage />} />
        <Route path="/hotels/search" element={<HotelSearchResults />} />
        <Route path="/hotels/details" element={<HotelDetailsPage />} />
        <Route path="/hotels/checkout" element={<HotelCheckout />} />
        <Route path="/hotels/success" element={<HotelBookingSuccess />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:resettoken" element={<ResetPasswordPage />} />
        <Route path="/partner-connect" element={<PartnerConnect />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/inactive-account" element={<InactiveAccountPage />} />
        <Route path="/page/:pageName" element={<DynamicPageViewer />} />

        {/* New Agent Sign Up, Agent Login, Agent B2B Engine & Supplier Login Public Routes */}
        <Route path="/b2b/coming-soon" element={<FeatureComingSoonPage />} />
        <Route path="/b2b/signup" element={<AgentSignUpPage />} />
        <Route path="/b2b/login" element={<RetailAgentLoginPage />} />
        <Route path="/b2b/home" element={<B2BAgentHomePage />} />
        <Route path="/b2b/checkout" element={<B2BAgentCheckout />} />
        
        {/* B2B Inner Tools Route */}
        <Route element={<ProtectedRoute allowedRoles={['B2B_AGENT', 'B2B_AGENT', 'SELLER', 'SUPPLIER_AGENT', 'SUPER_ADMIN', 'SUB_ADMIN']} />}>
          <Route element={<B2BDashboardLayout />}>
            <Route path="/b2b/account-statement" element={<B2BAccountStatement />} />
            <Route path="/b2b/booking-status" element={<B2BBookingStatus />} />
            <Route path="/b2b/manage-booking" element={<B2BManageBooking />} />
            <Route path="/b2b/profile" element={<ProfilePage />} />
            <Route path="/b2b/dashboard" element={<B2BAgentDashboard />}>
              <Route path="bank-details" element={<B2BBankDetails />} />
              <Route path="wallet" element={<B2BWalletPage />} />
              <Route path="pax-calendar" element={<B2BPaxCalendar />} />
              <Route path="invoice" element={<B2BInvoice />} />
              <Route path="invoice/:id" element={<FlightInvoice />} />
              <Route path="credit-note" element={<B2BCreditNote />} />
              <Route path="debit-note" element={<B2BDebitNote />} />
              <Route path="gst-invoice" element={<B2BGstInvoice />} />
              <Route path="offline-booking" element={<B2BOfflineBooking />} />
              <Route path="markup" element={<B2BMarkup />} />
            </Route>
          </Route>
        </Route>

        <Route path="/supplier/login" element={<SupplierLoginPage />} />

        {/* Supplier Portal Routes (New Real Agent / Supplier UI) */}
        <Route path="/supplier-portal" element={<ProtectedRoute allowedRoles={['SUPPLIER_AGENT', 'SUPPLIER_STAFF']} />}>
          <Route element={<SupplierDashboardLayout />}>
            <Route index element={<Navigate to="/supplier-portal/dashboard" replace />} />
            <Route path="dashboard" element={<SupplierDashboard />} />
            <Route path="series-fare" element={<SeriesFareManager />} />
            <Route path="users" element={<SupplierUserManagement />} />
            <Route path="history" element={<SupplierBookingHistory />} />
            <Route path="ledger" element={<B2BAccountStatement />} />
            <Route path="series-queue" element={<SupplierQueueHistory />} />
          </Route>
        </Route>

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
          <Route path="wallet" element={<WalletPage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="properties" element={<PropertiesPage />} />
          <Route path="ticket/:id" element={<FlightTicket />} />
          <Route path="invoice/:id" element={<FlightInvoice />} />
        </Route>

        {/* Agent Routes */}
        <Route path="/agent-portal" element={<ProtectedRoute allowedRoles={['B2B_AGENT']} />}>
          <Route element={<AgentLayout />}>
            <Route index element={<Navigate to="/agent-portal/dashboard" replace />} />
            <Route path="dashboard" element={<AgentDashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="bookings" element={<BookingsPage />} />
            <Route path="ticket/:id" element={<FlightTicket />} />
            <Route path="invoice/:id" element={<FlightInvoice />} />
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
          <Route path="queue" element={<AdminPendingQueue />} />
          <Route path="pending-users" element={<AdminPendingUsers />} />
          <Route path="manage-users" element={<AdminManageUsers />} />
          <Route path="user-profile/:id" element={<AdminUserProfile />} />
          <Route path="sub-admins" element={<AdminSubAdmins />} />
          <Route path="b2b-requests" element={<AdminB2BRequests />} />
          <Route path="offline-topups" element={<AdminOfflineTopUps />} />
          <Route path="withdrawals" element={<AdminWithdrawals />} />
          <Route path="commissions" element={<AdminCommissionList />} />
          <Route path="commissions/add" element={<AdminCommissionAdd />} />
          <Route path="commissions/groups" element={<AdminCommissionGroups />} />
          <Route path="treasury/banks" element={<AdminBankAccounts />} />
          <Route path="treasury/record-payment" element={<AdminRecordPayment />} />
          <Route path="treasury/queue" element={<AdminSettlementQueue />} />
          <Route path="treasury/invoices" element={<AdminInvoiceCenter />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="finance" element={<AdminFinance />} />
          <Route path="ledger" element={<AdminLedger />} />
          <Route path="suppliers" element={<SupplierManagement />} />
          <Route path="cug-suppliers" element={<CugSuppliersManager />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="fd-maker" element={<AdminFDMaker />} />
          <Route path="fd-report" element={<AdminFDReport />} />
          <Route path="fd-archive" element={<AdminFDArchive />} />
          <Route path="fd-slow-moving" element={<AdminFDSlowMovingSector />} />
          <Route path="profile" element={<AdminProfile />} />
          
          <Route path="settings/sms-emails" element={<AdminSMSSettings />} />
          <Route path="settings/roles" element={<AdminRoleMaster />} />
          <Route path="settings/pg-mapping" element={<AdminPGMapping />} />
          <Route path="settings/pages" element={<AdminDynamicPages />} />
          
          {/* Reports */}
          <Route path="reports/passenger-calendar" element={<AdminPassengerCalendar />} />
          <Route path="reports/fare-quotes" element={<AdminFareQuoteReport />} />
          <Route path="reports/debit-notes" element={<AdminDebitNoteReport />} />
          <Route path="reports/credit-notes" element={<AdminCreditNoteReport />} />
          <Route path="reports/flight-sales" element={<AdminFlightSalesReport />} />
          <Route path="reports/cancellations" element={<AdminCancellationHistory />} />
          <Route path="reports/hotel-cancellations" element={<AdminHotelCancellations />} />
          <Route path="reports/pg-reports" element={<AdminPGReport />} />
          <Route path="reports/agent-outstanding" element={<AdminAgentOutstanding />} />
          <Route path="reports/agent-activation" element={<AdminAgentActivation />} />
          <Route path="reports/supplier-mapping" element={<AdminSupplierMapping />} />

          <Route path="ticket/:id" element={<FlightTicket />} />
          <Route path="invoice/:id" element={<FlightInvoice />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App

