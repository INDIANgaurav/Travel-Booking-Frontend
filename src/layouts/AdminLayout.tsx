import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut, ChevronDown, User as UserIcon, Settings, Menu, Briefcase, DollarSign, PackageOpen, LayoutGrid, ChevronRight, ShieldCheck } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../store/authSlice';

export default function AdminLayout() {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
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
        { name: 'Bookings', path: '/admin/bookings', icon: <CreditCard size={20} /> },
      ]
    },
    {
      title: 'Business',
      items: [
        { name: 'Inventory & CMS', path: '/admin/inventory', icon: <PackageOpen size={20} /> },
        { name: 'Financial Hub', path: '/admin/finance', icon: <DollarSign size={20} /> },
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
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`print:hidden ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out bg-gradient-to-b from-[#0a1930] to-[#112240] text-white flex flex-col shadow-2xl z-20 relative flex-shrink-0`}
      >
        <div className={`p-4 border-b border-gray-800/50 flex items-center h-20 ${isSidebarOpen ? 'justify-between' : 'justify-center'}`}>
          {isSidebarOpen && (
            <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 tracking-tight whitespace-nowrap overflow-hidden">Travel Admin</h2>
          )}
          
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors focus:outline-none"
          >
            <Menu size={22} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto hidden-scrollbar">
          <nav className="mt-4 pb-4">
            {navGroups.map((group, index) => (
              <div key={index} className="mb-6">
                {isSidebarOpen && (
                  <h3 className="px-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    {group.title}
                  </h3>
                )}
                <ul className="space-y-1 px-3">
                  {group.items.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center gap-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
                          isSidebarOpen ? 'px-4' : 'justify-center px-0'
                        } ${
                          location.pathname.startsWith(item.path)
                            ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.05)]'
                            : 'text-gray-400 hover:bg-gray-800/50 hover:text-white border border-transparent'
                        }`}
                      >
                  <div className={`${location.pathname.startsWith(item.path) ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'} transition-colors`}>
                    {item.icon}
                  </div>
                  {isSidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
                  
                  {/* Tooltip when collapsed */}
                  {!isSidebarOpen && (
                    <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                      {item.name}
                      {/* Arrow */}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-gray-900"></div>
                    </div>
                  )}
                </Link>
              </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-800/50">
          <button 
            onClick={handleLogout}
            className={`flex items-center gap-3 py-3 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-200 w-full group relative ${
              isSidebarOpen ? 'px-4 text-left' : 'justify-center px-0'
            }`}
          >
            <LogOut size={20} className="group-hover:text-red-300 transition-colors" />
            {isSidebarOpen && <span>Logout</span>}

            {!isSidebarOpen && (
              <div className="absolute left-full ml-4 px-2 py-1 bg-red-600 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                Logout
                <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-4 border-r-red-600"></div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible">
        {/* Top Navbar */}
        <header className="print:hidden h-20 bg-white border-b border-gray-100 flex items-center justify-end px-8 z-10 shadow-sm flex-shrink-0">

          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-1.5 pr-3 rounded-full border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all focus:outline-none"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-bold text-gray-800 leading-tight">{user?.name || 'Super Admin'}</p>
                <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{user?.role || 'Administrator'}</p>
              </div>
              <ChevronDown size={14} className="text-gray-400 ml-1" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-30" 
                  onClick={() => setIsDropdownOpen(false)}
                ></div>
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden z-40 transform origin-top-right transition-all animate-in fade-in slide-in-from-top-4">
                  <div className="p-5 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                  </div>
                  <div className="py-2 px-2">
                    <Link 
                      to="/admin/profile" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                    >
                      <UserIcon size={16} />
                      Edit Profile
                    </Link>
                    <Link 
                      to="/admin/profile?tab=security" 
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-colors"
                    >
                      <Settings size={16} />
                      Change Password
                    </Link>
                  </div>
                  <div className="py-2 px-2 border-t border-gray-50">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-colors w-full text-left"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
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
