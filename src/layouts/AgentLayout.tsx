import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, Plane, Building2, User as UserIcon, FileText, Menu, ChevronRight, MessageSquare } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../store/authSlice';

import TopNavbar from '../components/layout/TopNavbar';

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
        { name: 'My Bookings', path: '/agent-portal/bookings', icon: <CreditCard size={20} /> },
      ]
    },
    {
      title: 'Business',
      items: [
        { name: 'Customers', path: '/agent-portal/customers', icon: <Users size={20} /> },
        { name: 'Invoices', path: '/agent-portal/invoices', icon: <FileText size={20} /> },
      ]
    },
    {
      title: 'Support',
      items: [
        { name: 'Helpdesk', path: '/agent-portal/helpdesk', icon: <MessageSquare size={20} /> },
      ]
    }
  ];

  return (
    <>
      <TopNavbar portalMode={true} />
      <div className="min-h-screen pt-[76px] bg-gray-50 flex overflow-hidden">
        {/* Sidebar */}
        <div 
          className={`print:hidden ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out bg-gradient-to-b from-[#1e3a8a] to-[#172554] text-white flex flex-col shadow-2xl z-20 relative flex-shrink-0 h-[calc(100vh-76px)]`}
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
      <div className="flex-1 flex flex-col min-w-0 h-[calc(100vh-76px)]">
        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50/50 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
    </>
  );
}
