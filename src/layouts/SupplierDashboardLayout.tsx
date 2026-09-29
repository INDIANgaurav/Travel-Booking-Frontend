import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Tag, History, Layers, User, LogOut, Phone, Mail, ChevronDown, Briefcase } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {  logout, logoutUserThunk, selectCurrentUser, setCredentials } from '../store/authSlice';
import api from '../services/api';
import { settingsApi } from '../api/settingsApi';
import SupplierMobileBottomNav from '../components/layout/SupplierMobileBottomNav';
import { Megaphone, Info, AlertTriangle, CheckCircle, XCircle, X } from 'lucide-react';

const SupplierDashboardLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [showAnnouncementsDropdown, setShowAnnouncementsDropdown] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [hasSeenAnnouncements, setHasSeenAnnouncements] = useState(false);

  const profileRef = React.useRef<HTMLDivElement>(null);
  const announcementsRef = React.useRef<HTMLDivElement>(null);
  
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
      
      settingsApi.getActiveAnnouncements().then(res => {
        if (res.data) {
          const filtered = res.data.filter((a: any) => {
            const audience = Array.isArray(a.targetAudience) ? a.targetAudience : [a.targetAudience];
            return audience.includes('ALL') || audience.includes('SUPPLIER');
          });
          setAnnouncements(filtered);
        }
      }).catch(() => {});
    }
  }, [currentUser]);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (announcementsRef.current && !announcementsRef.current.contains(event.target as Node)) {
        setShowAnnouncementsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const confirmLogout = () => {
    dispatch(logoutUserThunk() as any);
    navigate('/supplier/login');
  };

  const supplierName = currentUser?.name || (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}`.trim() : currentUser?.companyName) || 'SUPPLIER';
  const supplierInitial = (supplierName.charAt(0) || '').toUpperCase();

  return (
    <div className="min-h-dvh bg-[#f1f5f9] flex flex-col font-sans text-gray-800">
      {/* Ticker / Banner for urgent announcements */}
      {!isBannerDismissed && announcements.length > 0 && announcements.some(a => a.type === 'ERROR' || a.type === 'WARNING') && (
        <div className="w-full bg-red-600 text-white text-xs font-medium py-1.5 px-2 overflow-hidden relative flex items-center z-[60]">
          <button 
            onClick={() => setIsBannerDismissed(true)} 
            className="absolute right-2 z-10 p-1 bg-red-700/80 hover:bg-red-800 rounded text-white cursor-pointer shadow-sm backdrop-blur-sm transition-colors"
            title="Dismiss"
          >
            <X size={14} />
          </button>
          
          <div className="flex-1 overflow-hidden mr-8 relative flex">
            <div className="animate-[scrollText_25s_linear_infinite] flex whitespace-nowrap items-center hover:[animation-play-state:paused]">
              {/* First Set */}
              <div className="flex items-center gap-8 px-4">
                {announcements.filter(a => a.type === 'ERROR' || a.type === 'WARNING').map((a, i) => (
                  <span key={`a1-${i}`} className="flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {a.title}: {a.message}
                    {a.validUntil && ` (Valid till ${new Date(a.validUntil).toLocaleDateString()})`}
                  </span>
                ))}
              </div>
              {/* Second Set (Duplicate for smooth loop) */}
              <div className="flex items-center gap-8 px-4">
                {announcements.filter(a => a.type === 'ERROR' || a.type === 'WARNING').map((a, i) => (
                  <span key={`a2-${i}`} className="flex items-center gap-2">
                    <AlertTriangle size={14} />
                    {a.title}: {a.message}
                    {a.validUntil && ` (Valid till ${new Date(a.validUntil).toLocaleDateString()})`}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <style>{`
            @keyframes scrollText {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
        </div>
      )}
      
      {/* Top Header - Dark Premium Theme */}
      <header className="bg-[#0b1031] px-3 sm:px-6 lg:px-10 py-3 flex justify-between items-center sticky top-0 z-50 shadow-xl border-b border-white/10">
        {/* Subtle background glow effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        <div className="flex items-center gap-2 sm:gap-10 relative z-10 shrink-0">
          <button 
            className="lg:hidden text-white p-1 hover:bg-white/10 rounded-lg transition"
            onClick={() => setShowMobileMenu(true)}
          >
            <Layers size={24} />
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group" onClick={() => navigate('/supplier-portal/dashboard')}>
            <div className="flex items-center justify-center bg-white p-1 sm:p-1.5 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.3)] group-hover:scale-105 transition-transform shrink-0">
              <img src="/tg-favicon.svg" alt="TrippeChalo" className="w-6 h-6 sm:w-8 sm:h-8" crossOrigin="anonymous" />
            </div>
            <div className="hidden min-[380px]:block">
              <span className="text-sm sm:text-xl font-black text-white tracking-tight uppercase">TRIPPE<span className="text-blue-400">CHALO</span></span>
              <span className="block text-[8px] sm:text-[9px] text-blue-200/80 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] -mt-1">SUPPLIER PORTAL</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-5 relative z-10">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-0.5">Support</span>
            <div className="flex items-center gap-1.5 text-blue-400 font-black text-xs bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">
              <span>+91 9555934205</span>
            </div>
          </div>

          <div 
            onClick={() => navigate('/supplier-portal/ledger')}
            className="flex flex-col items-end cursor-pointer group ml-1 sm:ml-2"
          >
            <span className="hidden sm:block text-[10px] text-gray-400 font-bold tracking-wider uppercase mb-0.5 group-hover:text-gray-300 transition-colors">Balance</span>
            <div className="flex items-center gap-1.5 text-green-400 font-black text-xs sm:text-sm bg-green-500/10 px-2 sm:px-4 py-1 rounded-lg border border-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
              <span>₹ {(currentUser?.walletBalance ?? currentUser?.balance ?? 0).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-white/10 mx-1"></div>

          {/* Supplier Announcements */}
          <div className="relative mr-1" ref={announcementsRef}>
            <button 
              onClick={() => {
                setShowAnnouncementsDropdown(!showAnnouncementsDropdown);
                if (!showAnnouncementsDropdown) {
                  setHasSeenAnnouncements(true);
                }
              }}
              className="relative p-2 rounded-full transition-colors hover:bg-white/10 text-white"
            >
              <Megaphone size={20} />
              {announcements.length > 0 && !hasSeenAnnouncements && (
                <span className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#0b1031] min-w-[20px] text-center">
                  {announcements.length}
                </span>
              )}
            </button>

            {/* Announcements Dropdown */}
            {showAnnouncementsDropdown && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-[#161c3f] rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/10 overflow-hidden z-50 backdrop-blur-xl">
                <div className="bg-white/5 border-b border-white/10 px-4 py-3 flex justify-between items-center">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <Megaphone size={16} className="text-blue-400" />
                    Announcements
                  </h3>
                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold border border-blue-500/30">{announcements.length} New</span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {announcements.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">No new announcements</div>
                  ) : (
                    announcements.map((a, i) => (
                      <div key={i} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                        <div className="flex gap-3">
                          <div className="mt-0.5 flex-shrink-0">
                            {a.type === 'INFO' && <Info size={16} className="text-blue-400" />}
                            {a.type === 'WARNING' && <AlertTriangle size={16} className="text-amber-400" />}
                            {a.type === 'SUCCESS' && <CheckCircle size={16} className="text-green-400" />}
                            {a.type === 'ERROR' && <XCircle size={16} className="text-red-400" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{a.title}</h4>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{a.message}</p>
                            <span className="text-[10px] text-gray-500 mt-2 block">
                              {new Date(a.createdAt).toLocaleDateString()}
                              {a.validUntil && ` (Valid till ${new Date(a.validUntil).toLocaleDateString()})`}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileRef}>
            <div 
              className="flex items-center gap-2 sm:gap-3 bg-white/5 px-1 sm:px-2 py-1 sm:py-1.5 pr-2 sm:pr-4 rounded-full border border-white/10 cursor-pointer hover:bg-white/10 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-inner border border-white/20">
                {supplierInitial}
              </div>
              <div className="text-left leading-tight hidden sm:block">
                <span className="block text-[10px] text-gray-400 font-bold uppercase">Welcome:</span>
                <span className="block text-xs font-black text-white truncate max-w-[120px]">{supplierName}</span>
              </div>
              <ChevronDown size={14} className={`hidden sm:block text-gray-400 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
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
      <nav className="hidden lg:flex bg-[#161c3f] border-b border-[#2a3461] px-6 lg:px-10 items-center gap-1 overflow-x-auto shadow-md">
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

        <NavLink 
          to="/supplier-portal/marketing/promos"
          className={({ isActive }) => 
            `px-4 py-3.5 text-xs font-bold flex items-center gap-2 transition-all border-b-2 ${
              isActive ? 'text-blue-400 border-blue-400 bg-white/5' : 'text-gray-400 border-transparent hover:text-white hover:bg-white/5'
            }`
          }
        >
          <Tag size={16} />
          <span>MARKETING & PROMOS</span>
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
      <main className="flex-1 p-4 lg:p-6 pb-20 lg:pb-6 w-full max-w-[1600px] mx-auto z-0 relative">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="hidden lg:block bg-[#0b1031] border-t border-white/10 py-3 text-center text-xs text-gray-400">
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

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[100] lg:hidden flex">
          <div className="absolute inset-0 bg-[#0b1031]/80 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}></div>
          <div className="relative w-[80%] max-w-[300px] h-full bg-[#161c3f] border-r border-white/10 shadow-2xl flex flex-col animate-[fadeInLeft_0.3s_ease-out]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#0b1031]">
              <div className="flex items-center gap-2">
                <img src="/tg-favicon.svg" alt="TrippeChalo" className="w-6 h-6" crossOrigin="anonymous" />
                <span className="text-white font-black">MENU</span>
              </div>
              <button onClick={() => setShowMobileMenu(false)} className="text-gray-400 hover:text-white p-1">
                <Layers size={20} className="rotate-45" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              <NavLink to="/supplier-portal/dashboard" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `px-4 py-3 text-sm font-bold flex items-center gap-3 rounded-xl transition-all ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <LayoutDashboard size={18} /> DASHBOARD
              </NavLink>
              <NavLink to="/supplier-portal/series-fare" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `px-4 py-3 text-sm font-bold flex items-center gap-3 rounded-xl transition-all ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <Tag size={18} /> SERIES FARE
              </NavLink>
              <NavLink to="/supplier-portal/marketing/promos" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `px-4 py-3 text-sm font-bold flex items-center gap-3 rounded-xl transition-all ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <Tag size={18} /> MARKETING & PROMOS
              </NavLink>
              {(currentUser?.roles?.includes('SUPPLIER_AGENT') || currentUser?.roles?.includes('SUPPLIER_STAFF') || currentUser?.roles?.includes('SUB_ADMIN') || currentUser?.roles?.includes('SUPER_ADMIN')) && (
                <NavLink to="/supplier-portal/users" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `px-4 py-3 text-sm font-bold flex items-center gap-3 rounded-xl transition-all ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                  <Users size={18} /> USER MANAGEMENT
                </NavLink>
              )}
              <NavLink to="/supplier-portal/history" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `px-4 py-3 text-sm font-bold flex items-center gap-3 rounded-xl transition-all ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <History size={18} /> HISTORY
              </NavLink>
              <NavLink to="/supplier-portal/ledger" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `px-4 py-3 text-sm font-bold flex items-center gap-3 rounded-xl transition-all ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <Tag size={18} /> LEDGER
              </NavLink>
              <NavLink to="/supplier-portal/series-queue" onClick={() => setShowMobileMenu(false)} className={({ isActive }) => `px-4 py-3 text-sm font-bold flex items-center gap-3 rounded-xl transition-all ${isActive ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                <Layers size={18} /> SERIES FARE QUEUE
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <SupplierMobileBottomNav />
    </div>
  );
};

export default SupplierDashboardLayout;
