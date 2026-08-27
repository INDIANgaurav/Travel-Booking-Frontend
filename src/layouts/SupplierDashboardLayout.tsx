import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Tag, History, Layers, User, LogOut, Phone, Mail, ChevronDown, Briefcase } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout, selectCurrentUser, setCredentials } from '../store/authSlice';
import api from '../services/api';

const SupplierDashboardLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileRef = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const fetchBalance = async () => {
      try {
        const { data } = await api.get('/api/wallet');
        if (currentUser && currentUser.walletBalance !== data.balance) {
          const token = localStorage.getItem('token');
          if (token) {
            dispatch(setCredentials({ user: { ...currentUser, walletBalance: data.balance }, token }));
          }
        }
      } catch (e) {
        console.error('Failed to sync wallet balance', e);
      }
    };
    if (currentUser) {
      fetchBalance();
    }
  }, []);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const confirmLogout = () => {
    dispatch(logout());
    navigate('/supplier/login');
  };

  const supplierName = currentUser?.name || (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser?.companyName) || 'SUPPLIER';
  const supplierInitial = (supplierName.charAt(0) || '').toUpperCase();

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col font-sans text-gray-800">
      
      {/* Top Header - Dark Premium Theme */}
      <header className="bg-[#0b1031] px-6 lg:px-10 py-3 flex justify-between items-center sticky top-0 z-50 shadow-xl border-b border-white/10 relative">
        {/* Subtle background glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        <div className="flex items-center gap-10 relative z-10">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/supplier-portal/dashboard')}>
            <div className="flex items-center justify-center bg-white p-1.5 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform">
              <img src="/tg-favicon.svg" alt="TrippeChalo" className="w-8 h-8" crossOrigin="anonymous" />
            </div>
            <div>
              <span className="text-xl font-black text-white tracking-tight uppercase">TRIPPE<span className="text-blue-400">CHALO</span></span>
              <span className="block text-[9px] text-blue-200/80 font-bold uppercase tracking-[0.2em] -mt-1">SUPPLIER PORTAL</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-5 relative z-10">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-0.5">Support</span>
            <div className="flex items-center gap-1.5 text-blue-400 font-black text-xs bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
              <span>+91 9555934205</span>
            </div>
          </div>

          <div 
            onClick={() => navigate('/supplier-portal/ledger')}
            className="flex flex-col items-end cursor-pointer group ml-2"
          >
            <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-0.5 group-hover:text-gray-300 transition-colors">Balance</span>
            <div className="flex items-center gap-1.5 text-green-400 font-black text-sm bg-green-500/10 px-4 py-1 rounded-lg border border-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
              <span>₹ {(currentUser?.walletBalance ?? currentUser?.balance ?? 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 mx-1"></div>

          <div className="relative" ref={profileRef}>
            <div 
              className="flex items-center gap-3 bg-white/5 px-2 py-1.5 pr-4 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-inner border border-white/20">
                {supplierInitial}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Welcome:</span>
                <span className="block text-xs font-black text-white truncate max-w-[120px]">{supplierName}</span>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
            </div>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-[#161c3f] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] py-2 border border-white/10 z-50 overflow-hidden backdrop-blur-xl">
                <div className="px-5 py-4 border-b border-white/10 mb-1 bg-white/5">
                  <p className="text-sm font-black text-white truncate">{supplierName}</p>
                  <p className="text-[10px] text-gray-400 truncate mt-0.5">{currentUser?.email || 'trippechaloindia@gmail.com'}</p>
                </div>
                {(currentUser?.roles?.includes('B2B_AGENT') || currentUser?.role === 'B2B_AGENT') && (
                  <button 
                    onClick={() => { setShowProfileMenu(false); navigate('/b2b/home'); }}
                    className="w-full text-left px-5 py-3 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
                  >
                    <Briefcase size={14} className="text-blue-400" />
                    <span>B2B Agent Portal</span>
                  </button>
                )}
                
                {(currentUser?.roles?.includes('SUPER_ADMIN') || currentUser?.roles?.includes('SUB_ADMIN')) && (
                  <button 
                    onClick={() => { setShowProfileMenu(false); navigate('/admin/dashboard'); }}
                    className="w-full text-left px-5 py-3 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
                  >
                    <LayoutDashboard size={14} className="text-purple-400" />
                    <span>Admin Portal</span>
                  </button>
                )}
                <button 
                  onClick={() => { setShowProfileMenu(false); setShowLogoutModal(true); }}
                  className="w-full text-left px-5 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Bar - Dark Premium Theme */}
      <nav className="bg-[#161c3f] border-b border-[#2a3461] px-6 lg:px-10 flex items-center gap-1 overflow-x-auto shadow-md">
        <NavLink 
          to="/supplier-portal/dashboard"
          className={({ isActive }) => 
            `px-4 py-3.5 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              isActive ? 'text-blue-400 border-blue-400 bg-white/5' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
            }`
          }
        >
          <LayoutDashboard size={16} />
          <span>DASHBOARD</span>
        </NavLink>

        <NavLink 
          to="/supplier-portal/series-fare"
          className={({ isActive }) => 
            `px-4 py-3.5 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              isActive ? 'text-blue-400 border-blue-400 bg-white/5' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Tag size={16} />
          <span>SERIES FARE</span>
        </NavLink>

        {(currentUser?.roles?.includes('SUPPLIER_AGENT') || currentUser?.roles?.includes('SUPPLIER_STAFF') || currentUser?.roles?.includes('SUB_ADMIN') || currentUser?.roles?.includes('SUPER_ADMIN')) && (
          <NavLink 
            to="/supplier-portal/users"
            className={({ isActive }) => 
              `px-4 py-3.5 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
                isActive ? 'text-blue-400 border-blue-400 bg-white/5' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Users size={16} />
            <span>USER MANAGEMENT</span>
          </NavLink>
        )}

        <NavLink 
          to="/supplier-portal/history"
          className={({ isActive }) => 
            `px-4 py-3.5 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              isActive ? 'text-blue-400 border-blue-400 bg-white/5' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
            }`
          }
        >
          <History size={16} />
          <span>HISTORY</span>
        </NavLink>

        <NavLink 
          to="/supplier-portal/ledger"
          className={({ isActive }) => 
            `px-4 py-3.5 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              isActive ? 'text-blue-400 border-blue-400 bg-white/5' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Tag size={16} />
          <span>LEDGER</span>
        </NavLink>

        <NavLink 
          to="/supplier-portal/series-queue"
          className={({ isActive }) => 
            `px-4 py-3.5 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              isActive ? 'text-blue-400 border-blue-400 bg-white/5' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
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
      <footer className="bg-[#0b1031] border-t border-white/10 py-3 text-center text-xs text-gray-400">
        © 2026 TrippeChalo. All rights reserved. Supplier Portal 
      </footer>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-[#0b1031]/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-black text-gray-900 mb-2">Confirm Logout</h3>
            <p className="text-sm text-gray-600 font-medium mb-6">Are you sure you want to securely log out of the Supplier Portal?</p>
            
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="px-5 py-2 rounded-xl text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLogout}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-md transition flex items-center gap-2"
              >
                <LogOut size={16} /> Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SupplierDashboardLayout;
