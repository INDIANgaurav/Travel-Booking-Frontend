import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, ChevronDown, User as UserIcon, Settings, Menu, Briefcase, DollarSign, PackageOpen, LayoutGrid, ChevronRight, ShieldCheck, Globe } from 'lucide-react';
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
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
      ]
    },
    {
      title: 'Management',
      items: [
        { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
        { name: 'Sub-Admins', path: '/admin/sub-admins', icon: <ShieldCheck size={20} /> },
        { name: 'Agents', path: '/admin/agents', icon: <Briefcase size={20} /> },
        { name: 'B2B Requests', path: '/admin/b2b-requests', icon: <PackageOpen size={20} /> },
        { name: 'Bookings', path: '/admin/bookings', icon: <CreditCard size={20} /> },
      ]
    },
    {
      title: 'Business',
      items: [
        { name: 'Inventory & CMS', path: '/admin/inventory', icon: <PackageOpen size={20} /> },
        { name: 'Financial Hub', path: '/admin/finance', icon: <DollarSign size={20} /> },
        { name: 'Suppliers', path: '/admin/suppliers', icon: <Globe size={20} /> },
      ]
    },
    {
      title: 'System',
      items: [
        { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
      ]
    }
  ];

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
                  const isActive = location.pathname.includes(item.path);
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          setIsSidebarOpen(false);
                        }
                      }}
                      className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} px-3 py-3 rounded-xl transition-all duration-200 group ${
                        isActive 
                          ? 'bg-blue-600/40 text-white shadow-lg shadow-blue-900/20 ring-1 ring-blue-500/50' 
                          : 'text-blue-100 text-blue-300 hover:bg-white/5 hover:text-white'
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












