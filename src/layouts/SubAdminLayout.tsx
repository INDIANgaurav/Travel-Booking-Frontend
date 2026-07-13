import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../store/authSlice';
import { 
  LayoutDashboard, Users, Briefcase, CreditCard, 
  PackageOpen, DollarSign, LogOut, ShieldCheck, 
  Menu, Headset, CheckCircle, FileText, Building2
} from 'lucide-react';

export default function SubAdminLayout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      dispatch(logout());
    }, 0);
  };

  // Define department-specific navigation
  const getNavItems = () => {
    const commonNav = [
      {
        title: 'Overview',
        items: [
          { name: 'Dashboard', path: '/sub-admin/dashboard', icon: <LayoutDashboard size={20} /> },
        ]
      }
    ];

    const dept = user?.department;

    if (dept === 'Sales') {
      commonNav.push({
        title: 'Sales Operations',
        items: [
          { name: 'Lead Management', path: '/sub-admin/sales/leads', icon: <Users size={20} /> },
          { name: 'Package Promotion', path: '/sub-admin/sales/packages', icon: <PackageOpen size={20} /> },
          { name: 'Agent Onboarding', path: '/sub-admin/sales/agents', icon: <Briefcase size={20} /> },
        ]
      });
    } else if (dept === 'Operations') {
      commonNav.push({
        title: 'Operations Hub',
        items: [
          { name: 'Booking Verification', path: '/sub-admin/ops/verification', icon: <CheckCircle size={20} /> },
          { name: 'Ticket Management', path: '/sub-admin/ops/tickets', icon: <FileText size={20} /> },
          { name: 'Property Approvals', path: '/sub-admin/ops/properties', icon: <Building2 size={20} /> },
          { name: 'Travel Coordination', path: '/sub-admin/ops/coordination', icon: <Briefcase size={20} /> },
        ]
      });
    } else if (dept === 'Customer Support') {
      commonNav.push({
        title: 'Support Desk',
        items: [
          { name: 'Query Management', path: '/sub-admin/support/queries', icon: <Headset size={20} /> },
          { name: 'Booking Assistance', path: '/sub-admin/support/assistance', icon: <CreditCard size={20} /> },
          { name: 'Refund Support', path: '/sub-admin/support/refunds', icon: <DollarSign size={20} /> },
        ]
      });
    } else if (dept === 'Accounts') {
      commonNav.push({
        title: 'Finance Hub',
        items: [
          { name: 'Transaction Monitor', path: '/sub-admin/accounts/transactions', icon: <DollarSign size={20} /> },
          { name: 'Invoice Generation', path: '/sub-admin/accounts/invoices', icon: <FileText size={20} /> },
          { name: 'Payment Reconciliation', path: '/sub-admin/accounts/reconciliation', icon: <CreditCard size={20} /> },
        ]
      });
    }

    return commonNav;
  };

  const navGroups = getNavItems();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <div 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-[#0b1120] text-gray-400 flex flex-col transition-all duration-300 shadow-2xl relative z-20`}
      >
        <div className="h-16 flex items-center justify-between px-4 text-white border-b border-gray-800">
          {isSidebarOpen && <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 truncate pr-2">Travel Sub-Admin</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
            <Menu size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 space-y-6 hidden-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="px-3">
              {isSidebarOpen && <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{group.title}</p>}
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center ${isSidebarOpen ? 'justify-start px-4' : 'justify-center'} py-2.5 rounded-xl transition-all duration-200 group ${
                      location.pathname.startsWith(item.path) 
                        ? 'bg-blue-600/10 text-blue-500 font-medium' 
                        : 'hover:bg-gray-800/50 hover:text-gray-200'
                    }`}
                  >
                    <span className={`${location.pathname.startsWith(item.path) ? 'text-blue-500' : 'text-gray-500 group-hover:text-gray-300'} transition-colors`}>
                      {item.icon}
                    </span>
                    {isSidebarOpen && <span className="ml-3 text-sm truncate">{item.name}</span>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white flex items-center justify-between px-8 shadow-sm relative z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-bold text-gray-800 truncate">
              {user?.department} Department
            </h1>
          </div>

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors border border-transparent hover:border-gray-100"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-700 truncate max-w-[120px]">{user?.name || 'Sub Admin'}</p>
                <p className="text-xs text-gray-500 uppercase font-medium">{user?.department}</p>
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-gray-50 mb-1 bg-gray-50/50">
                  <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[#f8fafc]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
