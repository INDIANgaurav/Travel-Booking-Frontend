import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, ChevronDown, User as UserIcon, Settings, Menu, Briefcase, DollarSign, PackageOpen, LayoutGrid, ChevronRight, ShieldCheck, Globe, FileText } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../store/authSlice';
import TopNavbar from '../components/layout/TopNavbar';

export default function AdminLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev => prev.includes(name) ? [] : [name]);
  };

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      dispatch(logout());
    }, 0);
  };

  const navGroups = [
    {
      title: 'Main',
      items: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
      ]
    },
    {
      title: 'Inventory & Suppliers',
      items: [
        { 
          name: 'Vendor Network', 
          icon: <Globe size={20} />,
          subItems: [
            { name: 'All Vendors', path: '/admin/suppliers' }
          ]
        },
        { 
          name: 'TrippeChalo FD', 
          icon: <PackageOpen size={20} />,
          subItems: [
            { name: 'FD Maker', path: '/admin/fd-maker' },
            { name: 'FD Report', path: '/admin/fd-report' },
            { name: 'FD Archive', path: '/admin/fd-archive' },
            { name: 'Slow Moving Sector', path: '/admin/fd-slow-moving' }
          ]
        },
        { 
          name: 'CUG Network', 
          icon: <ShieldCheck size={20} />,
          subItems: [
            { name: 'CUG Mappings', path: '/admin/cug-suppliers' }
          ]
        },
        { name: 'CMS & Inventory', path: '/admin/inventory', icon: <LayoutGrid size={20} /> },
      ]
    },
    {
      title: 'People & Access',
      items: [
        { 
          name: 'User Directory', 
          icon: <Users size={20} />,
          subItems: [
            { name: 'Active Users', path: '/admin/manage-users' },
            { name: 'Pending Approvals', path: '/admin/pending-users' }
          ]
        },
        { name: 'Sub-Admin Roles', path: '/admin/sub-admins', icon: <ShieldCheck size={20} /> },
        { name: 'B2B Registrations', path: '/admin/b2b-requests', icon: <Briefcase size={20} /> },
      ]
    },
    {
      title: 'Finance & Accounts',
      items: [
        { 
          name: 'Treasury & Payments', 
          icon: <DollarSign size={20} />,
          subItems: [
            { name: 'Bank Accounts', path: '/admin/treasury/banks' },
            { name: 'Record Payment', path: '/admin/treasury/record-payment' },
            { name: 'Settlement Queue', path: '/admin/treasury/queue' },
            { name: 'Invoice Center', path: '/admin/treasury/invoices' },
            { name: 'Wallet Recharge', path: '/admin/offline-topups' }
          ]
        },
        { name: 'Financial Hub', path: '/admin/finance', icon: <DollarSign size={20} /> },
        { name: 'Global Ledger', path: '/admin/ledger', icon: <CreditCard size={20} /> },
        { name: 'Withdrawal Reqs', path: '/admin/withdrawals', icon: <CreditCard size={20} /> },
        { name: 'Commissions & Fees', path: '/admin/commissions', icon: <DollarSign size={20} /> },
      ]
    },
    {
      title: 'Intelligence & Reports',
      items: [
        { 
          name: 'Comprehensive Reports', 
          icon: <FileText size={20} />,
          subItems: [
            { name: 'Passenger Calendar', path: '/admin/reports/passenger-calendar' },
            { name: 'Fare Quote Reports', path: '/admin/reports/fare-quotes' },
            { name: 'Debit Notes', path: '/admin/reports/debit-notes' },
            { name: 'Credit Notes', path: '/admin/reports/credit-notes' },
            { name: 'Flight Sales', path: '/admin/reports/flight-sales' },
            { name: 'Cancellations', path: '/admin/reports/cancellations' },
            { name: 'Hotel Cancellations', path: '/admin/reports/hotel-cancellations' },
            { name: 'Payment Gateway (PG)', path: '/admin/reports/pg-reports' },
            { name: 'Agent Outstanding', path: '/admin/reports/agent-outstanding' },
            { name: 'Agent Activation', path: '/admin/reports/agent-activation' },
            { name: 'Supplier Mapping', path: '/admin/reports/supplier-mapping' }
          ]
        }
      ]
    },
    {
      title: 'Operations & Logs',
      items: [
        { name: 'Booking Operations', path: '/admin/bookings', icon: <Briefcase size={20} /> },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'My Profile', path: '/admin/profile', icon: <UserIcon size={20} /> },
        { 
          name: 'System Settings', 
          icon: <Settings size={20} />,
          subItems: [
            { name: 'SMS & Emails', path: '/admin/settings/sms-emails' },
            { name: 'Role Master', path: '/admin/settings/roles' },
            { name: 'PG User Mapping', path: '/admin/settings/pg-mapping' },
            { name: 'Edit Footer Links', path: '/admin/settings/pages' }
          ]
        },
      ]
    }
  ];

  React.useEffect(() => {
    navGroups.forEach(group => {
      group.items.forEach(item => {
        if (item.subItems?.some(sub => location.pathname.includes(sub.path))) {
          setExpandedMenus([item.name]);
        }
      });
    });
  }, [location.pathname]);

  return (
    <>
      <TopNavbar portalMode={true} onMenuClick={() => setIsSidebarOpen(true)} />
      
      <div className="min-h-screen pt-[76px] bg-slate-50 flex overflow-hidden">
        
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-gradient-to-b from-[#1e3a8a] to-[#172554]/50 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div 
          className={`print:hidden fixed inset-y-0 left-0 z-50 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:relative md:translate-x-0 ${
            isSidebarOpen ? "w-64" : "w-20"
          } transition-all duration-300 ease-in-out bg-gradient-to-b from-[#1e3a8a] to-[#172554] text-white flex flex-col shadow-2xl flex-shrink-0 h-[calc(100vh)] md:h-[calc(100vh-76px)]`}
        >

        <div className={`p-4 border-b border-blue-800/50 flex items-center h-20 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {isSidebarOpen && (
            <Link to="/admin/dashboard" className="flex flex-col">
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white tracking-tight">
                Travel Admin
              </span>
              <span className="text-[10px] uppercase tracking-widest text-blue-300 font-bold">Control Panel</span>
            </Link>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-200"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 hidden-scrollbar">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {isSidebarOpen && (
                <h3 className="px-3 text-xs font-bold text-blue-300/70 uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.path ? location.pathname.includes(item.path) : (item.subItems?.some(sub => location.pathname.includes(sub.path)));
                  const isExpanded = expandedMenus.includes(item.name);
                  const hasSubItems = item.subItems && item.subItems.length > 0;

                  return (
                    <div key={item.name} className="flex flex-col">
                      {hasSubItems ? (
                        <button
                          onClick={() => {
                            if (!isSidebarOpen) setIsSidebarOpen(true);
                            toggleMenu(item.name);
                          }}
                          className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} px-3 py-3 rounded-xl transition-all duration-200 group ${
                            isActive 
                              ? 'bg-blue-600/40 text-white shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/50' 
                              : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`${isActive ? 'text-blue-300' : 'text-blue-200/70 group-hover:text-blue-300'} transition-colors`}>
                              {item.icon}
                            </span>
                            {isSidebarOpen && <span className="font-medium text-sm tracking-wide whitespace-nowrap">{item.name}</span>}
                          </div>
                          {isSidebarOpen && (
                            <ChevronDown size={16} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          )}
                        </button>
                      ) : (
                        <Link
                          to={item.path!}
                          onClick={() => {
                            if (window.innerWidth < 768) {
                              setIsSidebarOpen(false);
                            }
                          }}
                          className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} px-3 py-3 rounded-xl transition-all duration-200 group ${
                            isActive 
                              ? 'bg-blue-600/40 text-white shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/50' 
                              : 'text-blue-100/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`${isActive ? 'text-blue-300' : 'text-blue-200/70 group-hover:text-blue-300'} transition-colors`}>
                              {item.icon}
                            </span>
                            {isSidebarOpen && <span className="font-medium text-sm tracking-wide whitespace-nowrap">{item.name}</span>}
                          </div>
                          {!isSidebarOpen && (
                            <div className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                              {item.name}
                            </div>
                          )}
                        </Link>
                      )}

                      {/* Sub Items */}
                      {hasSubItems && isSidebarOpen && isExpanded && (
                        <div className="mt-1 ml-4 pl-4 border-l border-blue-500/30 space-y-1">
                          {item.subItems!.map(sub => {
                            const isSubActive = location.pathname.includes(sub.path);
                            return (
                              <Link
                                key={sub.name}
                                to={sub.path}
                                onClick={() => {
                                  if (window.innerWidth < 768) {
                                    setIsSidebarOpen(false);
                                  }
                                }}
                                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                                  isSubActive
                                    ? 'bg-blue-500/30 text-white font-medium'
                                    : 'text-blue-200/60 hover:text-white hover:bg-white/5'
                                }`}
                              >
                                <span className="text-sm">{sub.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-76px)] overflow-hidden relative">
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-3 lg:p-4">


          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
    </>
  );
}












