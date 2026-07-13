import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, Plane, Building2, User as UserIcon, FileText, Menu, ChevronRight } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../store/authSlice';

export default function AgentLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      dispatch(logout());
    }, 0);
  };

  const navGroups = [
    {
      title: 'Overview',
      items: [
        { name: 'Dashboard', path: '/agent-portal/dashboard', icon: <LayoutDashboard size={20} /> },
      ]
    },
    {
      title: 'Bookings',
      items: [
        { name: 'Search Flights', path: '/agent-portal/flights', icon: <Plane size={20} /> },
        { name: 'Search Hotels', path: '/agent-portal/hotels', icon: <Building2 size={20} /> },
        { name: 'My Bookings', path: '/agent-portal/bookings', icon: <CreditCard size={20} /> },
      ]
    },
    {
      title: 'Business',
      items: [
        { name: 'Customers', path: '/agent-portal/customers', icon: <Users size={20} /> },
        { name: 'Invoices', path: '/agent-portal/invoices', icon: <FileText size={20} /> },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`print:hidden ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out bg-gradient-to-b from-[#1e3a8a] to-[#172554] text-white flex flex-col shadow-2xl z-20 relative flex-shrink-0`}
      >
        <div className={`p-4 border-b border-blue-800/50 flex items-center h-20 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {isSidebarOpen && (
            <Link to="/agent-portal/dashboard" className="flex flex-col">
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-white tracking-tight">
                Agent Portal
              </span>
              <span className="text-[10px] uppercase tracking-widest text-blue-300 font-bold">B2B Partner</span>
            </Link>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-200"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-8 scrollbar-thin scrollbar-thumb-gray-800">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx}>
              {isSidebarOpen && (
                <h3 className="px-3 text-xs font-bold text-blue-300/70 uppercase tracking-wider mb-3">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname.includes(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} px-3 py-3 rounded-xl transition-all duration-200 group ${
                        isActive 
                          ? 'bg-blue-600/40 text-white shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/50' 
                          : 'text-blue-100 hover:bg-white/5 hover:text-white'
                      }`}
                      title={!isSidebarOpen ? item.name : ''}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`${isActive ? 'text-blue-300' : 'text-blue-200 group-hover:text-white'} transition-colors`}>
                          {item.icon}
                        </div>
                        {isSidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
                      </div>
                      {isSidebarOpen && isActive && <ChevronRight size={16} className="text-blue-300" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        {/* Top Header */}
        <header className="print:hidden h-20 bg-white border-b border-gray-100 flex items-center justify-end px-8 shadow-sm z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase() || 'A'
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-bold text-gray-900 leading-tight">{user?.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{user?.email}</p>
                </div>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl py-2 border border-gray-100 transform opacity-100 scale-100 transition-all origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-sm text-gray-500 font-medium">Signed in as Agent</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 font-medium transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50/50 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
