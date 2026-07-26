import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Tag, History, Layers, User, LogOut, Phone, Mail } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser } from '../store/authSlice';

const SupplierDashboardLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/supplier/login');
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans text-gray-800">
      {/* Top Header */}
      <header className="bg-white px-6 py-2 border-b border-gray-200 flex justify-between items-center text-xs">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            <img src="/tg-favicon.svg" alt="TrippeChalo" className="w-10 h-10" crossOrigin="anonymous" />
          </div>
          <div>
            <span className="text-lg font-black text-[#0c1a40] tracking-tight">TRIPPE<span className="text-blue-600">CHALO</span></span>
            <span className="block text-[8px] text-gray-400 font-bold tracking-widest uppercase -mt-1">SUPPLIER PORTAL</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-gray-600 font-medium">
          <div className="flex items-center gap-1.5">
            <Mail size={14} className="text-gray-400" />
            <span>trippechaloindia@gmail.com</span>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
            <Phone size={14} className="text-emerald-600" />
            <span className="font-bold">24X7 Support: 9555934205</span>
          </div>

          <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
            <div className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center font-bold">
              <User size={16} />
            </div>
            <div>
              <span className="block text-[10px] text-gray-400 font-bold uppercase">Welcome:</span>
              <span className="font-bold text-gray-900 uppercase text-xs">{currentUser?.companyName || (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser?.name) || 'TRAVEL_AGENT'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="ml-3 text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-[#f8fafc] border-b border-gray-200 px-6 flex items-center gap-1 overflow-x-auto">
        <NavLink 
          to="/supplier-portal/dashboard"
          className={({ isActive }) => 
            `px-4 py-2.5 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              isActive ? 'text-[#1d6aa3] border-[#1d6aa3] bg-[#f0f7ff]' : 'text-gray-700 border-transparent hover:text-[#1d6aa3] hover:bg-gray-100'
            }`
          }
        >
          <LayoutDashboard size={16} />
          <span>DASHBOARD</span>
        </NavLink>

        <NavLink 
          to="/supplier-portal/series-fare"
          className={({ isActive }) => 
            `px-4 py-2.5 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              isActive ? 'text-[#1d6aa3] border-[#1d6aa3] bg-[#f0f7ff]' : 'text-gray-700 border-transparent hover:text-[#1d6aa3] hover:bg-gray-100'
            }`
          }
        >
          <Tag size={16} />
          <span>SERIES FARE</span>
        </NavLink>

        <NavLink 
          to="/supplier-portal/users"
          className={({ isActive }) => 
            `px-4 py-2.5 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              isActive ? 'text-[#1d6aa3] border-[#1d6aa3] bg-[#f0f7ff]' : 'text-gray-700 border-transparent hover:text-[#1d6aa3] hover:bg-gray-100'
            }`
          }
        >
          <Users size={16} />
          <span>USER MANAGEMENT</span>
        </NavLink>

        <NavLink 
          to="/supplier-portal/history"
          className={({ isActive }) => 
            `px-4 py-2.5 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              isActive ? 'text-[#1d6aa3] border-[#1d6aa3] bg-[#f0f7ff]' : 'text-gray-700 border-transparent hover:text-[#1d6aa3] hover:bg-gray-100'
            }`
          }
        >
          <History size={16} />
          <span>HISTORY</span>
        </NavLink>

        <NavLink 
          to="/supplier-portal/series-queue"
          className={({ isActive }) => 
            `px-4 py-2.5 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              isActive ? 'text-[#1d6aa3] border-[#1d6aa3] bg-[#f0f7ff]' : 'text-gray-700 border-transparent hover:text-[#1d6aa3] hover:bg-gray-100'
            }`
          }
        >
          <Layers size={16} />
          <span>SERIES FARE QUEUE</span>
        </NavLink>
      </nav>

      {/* Main View Area */}
      <main className="flex-1 p-6 w-full max-w-[1600px] mx-auto">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-3 text-center text-xs text-gray-500">
        © 2026 TrippeChalo. All rights reserved. Supplier Portal V2.0
      </footer>
    </div>
  );
};

export default SupplierDashboardLayout;
