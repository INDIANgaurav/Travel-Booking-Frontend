import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Plane, Building2, Briefcase, User, ChevronDown, ArrowLeft, Heart, Menu, X, CreditCard } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, logout, selectAgentBookingMode, setAgentBookingMode } from '../../store/authSlice';
import LoginModal from '../auth/LoginModal';

interface TopNavbarProps {
  forceWhite?: boolean;
  portalMode?: boolean;
}

export default function TopNavbar({ forceWhite = false, portalMode = false }: TopNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const agentMode = useSelector(selectAgentBookingMode);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isNavWhite = forceWhite || (!portalMode && isScrolled);
  const isDarkText = portalMode ? false : isNavWhite;
  
  const navBgClass = portalMode 
    ? 'bg-[#1e3a8a] border-[#1e3a8a] py-3 shadow-md' 
    : (isNavWhite ? 'bg-white shadow-md border-gray-200 py-3' : 'bg-transparent border-transparent py-4');

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      dispatch(logout());
    }, 0);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 border-b print:hidden ${navBgClass}`}
      >
        <div className={`${portalMode ? 'w-full' : 'max-w-[1200px] mx-auto'} px-6 flex justify-between items-center`}>
          
          {/* Back Button & Logo */}
          <div className="flex items-center gap-4">
            {location.pathname !== '/' && (
              <button 
                onClick={() => navigate(-1)} 
                className={`p-2 rounded-full transition ${isDarkText ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-white'}`}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              {user?.role === 'B2B_AGENT' && agentMode === 'MYBIZ' ? (
                <>
                  <div className={`p-1.5 rounded-lg ${isNavWhite ? 'bg-orange-500' : 'bg-white'}`}>
                    <Briefcase size={20} className={isNavWhite ? 'text-white' : 'text-orange-500'} />
                  </div>
                  <span className={`text-2xl font-black tracking-tight ${isDarkText ? 'text-gray-900' : 'text-white'}`}>
                    Trippe<span className={isNavWhite ? 'text-orange-500' : 'text-orange-200'}>Biz</span>
                  </span>
                </>
              ) : (
                <>
                  <Plane size={28} className={isNavWhite ? 'text-blue-600' : 'text-white'} />
                  <span className={`text-2xl font-black tracking-tight ${isDarkText ? 'text-gray-900' : 'text-white'}`}>
                    Trippe<span className={isNavWhite ? 'text-blue-600' : 'text-blue-400'}>Chalo</span>
                  </span>
                </>
              )}
            </div>

            {user?.role === 'B2B_AGENT' && (
              <div className={`relative ml-8 flex items-center p-1 rounded-full ${isDarkText ? 'bg-gray-100' : 'bg-white/20'} transition-colors w-[180px]`}>
                {/* Sliding Background Pill */}
                <div
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-full shadow-md transition-all duration-300 ease-in-out ${
                    agentMode === 'PERSONAL' 
                      ? 'left-1 bg-blue-600' 
                      : 'left-[calc(50%+2px)] bg-white'
                  }`}
                ></div>
                
                {/* Buttons */}
                <button 
                  onClick={() => dispatch(setAgentBookingMode('PERSONAL'))}
                  className={`relative z-10 flex-1 py-1.5 rounded-full text-xs font-bold transition-colors duration-300 ${
                    agentMode === 'PERSONAL' 
                      ? 'text-white' 
                      : isDarkText ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-white/80'
                  }`}
                >
                  PERSONAL
                </button>
                <button 
                  onClick={() => dispatch(setAgentBookingMode('MYBIZ'))}
                  className={`relative z-10 flex-1 py-1.5 rounded-full text-xs font-bold transition-colors duration-300 ${
                    agentMode === 'MYBIZ' 
                      ? 'text-gray-900' 
                      : isDarkText ? 'text-gray-600 hover:text-gray-900' : 'text-white hover:text-white/80'
                  }`}
                >
                  MYBIZ
                </button>
              </div>
            )}
          </div>
        <div className="flex items-center gap-2 lg:gap-6">
            {user?.role === 'B2B_AGENT' && agentMode === 'MYBIZ' ? (
              <>
                <Link to="/agent/requests" className={`hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition ${isDarkText ? 'text-gray-700' : 'text-white'}`}>
                  <Briefcase size={20} className="text-orange-500" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold">Pending Requests</span>
                  </div>
                </Link>
                <Link to="/dashboard/bookings" className={`hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition ${isDarkText ? 'text-gray-700' : 'text-white'}`}>
                  <Briefcase size={20} />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold">My Trips</span>
                    <span className="text-[10px] opacity-70">Manage your bookings</span>
                  </div>
                </Link>
                <Link to="/agent/wallet" className={`hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition px-3 py-1.5 rounded-md ${isDarkText ? 'bg-orange-50 border border-orange-200 text-gray-700' : 'bg-white/10 text-white'}`}>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold">myBiz Wallet</span>
                  </div>
                </Link>
              </>
            ) : user?.role === 'B2B_AGENT' || user?.role === 'SUPPLIER_AGENT' ? (
              <>
                <Link to="/b2b/home" className={`hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition ${isDarkText ? 'text-gray-700' : 'text-white'}`}>
                  <Briefcase size={20} />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold">B2B Dashboard</span>
                    <span className="text-[10px] opacity-70">Manage your business</span>
                  </div>
                </Link>
              </>
            ) : (
              <>
                {/* List Your Property */}
                <Link to="/partner/connect" className={`hidden md:flex items-center gap-1 lg:gap-2 cursor-pointer transition px-2 py-1.5 lg:px-3 lg:py-1.5 rounded-md ${isDarkText ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
                  <Building2 size={20} className="text-orange-500 hidden lg:block" />
                  <Building2 size={16} className="text-orange-500 lg:hidden" />
                  <div className="flex flex-col">
                    <span className="text-[10px] lg:text-[11px] font-bold">List Your Property</span>
                    <span className="text-[9px] lg:text-[10px] opacity-70 hidden lg:block">Grow your business!</span>
                  </div>
                </Link>

                {/* My Trips */}
                {isAuthenticated ? (
                  <Link to="/dashboard/bookings" className={`hidden md:flex items-center gap-1 lg:gap-2 cursor-pointer hover:opacity-80 transition ${isDarkText ? 'text-gray-700' : 'text-white'}`}>
                    <Briefcase size={20} className="hidden lg:block" />
                    <Briefcase size={16} className="lg:hidden" />
                    <div className="flex flex-col">
                      <span className="text-[10px] lg:text-[11px] font-bold">My Trips</span>
                      <span className="text-[9px] lg:text-[10px] opacity-70 hidden lg:block">Manage your bookings</span>
                    </div>
                  </Link>
                ) : (
                  <button onClick={() => setIsLoginModalOpen(true)} className={`hidden md:flex text-left items-center gap-2 cursor-pointer hover:opacity-80 transition ${isDarkText ? 'text-gray-700' : 'text-white'}`}>
                    <Briefcase size={20} />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold">My Trips</span>
                      <span className="text-[10px] opacity-70">Manage your bookings</span>
                    </div>
                  </button>
                )}

                {/* Wishlist */}
                {isAuthenticated ? (
                  <Link to="/dashboard/wishlist" className={`hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition ${isDarkText ? 'text-gray-700' : 'text-white'}`}>
                    <Heart size={20} className="text-[#ff4f4f] fill-[#ff4f4f]" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold">Wishlist</span>
                      <span className="text-[10px] opacity-70">Save favourites</span>
                    </div>
                  </Link>
                ) : (
                  <button onClick={() => setIsLoginModalOpen(true)} className={`hidden md:flex text-left items-center gap-2 cursor-pointer hover:opacity-80 transition ${isDarkText ? 'text-gray-700' : 'text-white'}`}>
                    <Heart size={20} className="text-[#ff4f4f] fill-[#ff4f4f]" />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold">Wishlist</span>
                      <span className="text-[10px] opacity-70">Save favourites</span>
                    </div>
                  </button>
                )}

                {/* Agent Sign Up & Supplier Login Quick Links */}
                {!isAuthenticated && (
                  <div className="hidden md:flex flex-col lg:flex-row items-center gap-1 lg:gap-2 pl-2 border-l border-gray-300/40">
                    <Link 
                      to="/b2b/login" 
                      className={`text-[9px] lg:text-[11px] font-bold px-2 py-1 lg:px-3 lg:py-1.5 rounded-full transition ${isDarkText ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-amber-400 text-gray-900 hover:bg-amber-300'}`}
                    >
                      B2B Agent Portal
                    </Link>
                    <Link 
                      to="/supplier/login" 
                      className={`text-[9px] lg:text-[11px] font-bold px-2 py-1 lg:px-3 lg:py-1.5 rounded-full transition border ${isDarkText ? 'border-emerald-600 text-emerald-700 hover:bg-emerald-50' : 'border-emerald-400 text-emerald-300 hover:bg-emerald-950/50'}`}
                    >
                      Supplier Login ↗
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Login / User Button */}
            <div className="ml-2 md:ml-4 flex items-center gap-4 relative">
              {isAuthenticated ? (
                <div 
                  className="relative py-2"
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 p-1.5 md:px-4 md:py-2 rounded-full md:rounded-lg font-bold text-xs transition ${isDarkText ? 'bg-blue-50 hover:bg-blue-100 text-blue-700' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                  >
                    <div className="w-8 h-8 md:w-6 md:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0D8ABC&color=fff`;
                          }}
                        />
                      ) : (
                        <span className="text-sm md:text-xs font-black">{user?.name?.charAt(0)?.toUpperCase() || <User size={14} />}</span>
                      )}
                    </div>
                    <span className="hidden md:flex items-center gap-1">
                      Hi, {user?.name?.split(' ')[0] || 'User'}
                      <ChevronDown size={14} />
                    </span>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute right-0 top-full pt-1 w-56 z-50">
                      <div className="bg-white rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] py-2 border border-gray-100 animate-[fadeInUp_0.2s_ease-out]">
                        
                        {/* Mobile User Info */}
                        <div className="md:hidden px-4 py-3 border-b border-gray-100 bg-gray-50/80 mb-2">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Logged In As</p>
                          <p className="text-sm font-black text-gray-900 truncate mt-0.5">{user?.name}</p>
                          <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                        </div>
                      {user?.role === 'USER' && (
                        <>
                          <div onClick={() => { navigate('/dashboard/profile'); }} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                            <User size={16} /> My Profile
                          </div>
                          <div onClick={() => { navigate('/dashboard/wallet'); }} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                            <CreditCard size={16} /> My Wallet
                          </div>
                        </>
                      )}
                      {(user?.role === 'SUPPLIER_AGENT') && (
                        <div onClick={() => { navigate('/b2b/home'); }} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                          <Briefcase size={16} /> B2B Dashboard
                        </div>
                      )}
                      {(user?.role === 'SUPER_ADMIN' || user?.role === 'SUB_ADMIN') && (
                        <div onClick={() => { navigate('/admin/dashboard'); }} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                          <Building2 size={16} /> Admin Panel
                        </div>
                      )}
                      {(user?.role === 'SUPPLIER_AGENT' || user?.role === 'SUPPLIER_STAFF' || user?.role === 'SUPPLIER_PORTAL_ONLY') && (
                        <div onClick={() => { navigate('/supplier-portal/dashboard'); }} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                          <Briefcase size={16} /> Supplier Portal
                        </div>
                      )}
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100">Logout</button>
                    </div>
                  </div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-5 sm:py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition group"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <span className="text-[10px]">my</span>
                  </div>
                  <span className="hidden sm:inline">Login or Create Account</span>
                  <span className="sm:hidden">Login</span>
                  <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform hidden sm:block" />
                </button>
              )}
            </div>
            
            {/* Mobile Hamburger Toggle */}
            <button 
              className={`md:hidden ml-2 p-2 rounded-full transition ${isDarkText ? 'text-[#0c1a40] hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Drawer */}
      <div 
        className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Drawer Panel */}
        <div 
          className={`absolute top-0 right-0 w-[280px] h-full bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b border-gray-100">
            <span className="text-lg font-black text-[#0c1a40] tracking-tight">Menu</span>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Links */}
          <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <Link to="/partner/connect" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 text-gray-700 transition">
                  <Building2 size={20} className="text-orange-500" />
                  <span className="text-sm font-bold">List Your Property</span>
                </Link>
                <div className="my-2 border-t border-gray-100"></div>
                <Link to="/b2b/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 text-amber-900 transition">
                  <Briefcase size={20} className="text-amber-500" />
                  <span className="text-sm font-bold">B2B Agent Portal</span>
                </Link>
                <Link to="/supplier/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 text-emerald-900 transition">
                  <Building2 size={20} className="text-emerald-500" />
                  <span className="text-sm font-bold">Supplier Login</span>
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard/bookings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition">
                  <Briefcase size={20} className="text-blue-500" />
                  <span className="text-sm font-bold">My Trips</span>
                </Link>
                <Link to="/dashboard/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition">
                  <Heart size={20} className="text-[#ff4f4f]" />
                  <span className="text-sm font-bold">Wishlist</span>
                </Link>
                {user?.role === 'USER' && (
                  <Link to="/dashboard/wallet" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-gray-700 transition">
                    <CreditCard size={20} className="text-blue-500" />
                    <span className="text-sm font-bold">My Wallet</span>
                  </Link>
                )}
                
                {user?.role === 'B2B_AGENT' && agentMode === 'MYBIZ' && (
                  <>
                    <div className="my-2 border-t border-gray-100"></div>
                    <Link to="/agent/requests" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 text-gray-700 transition">
                      <Briefcase size={20} className="text-orange-500" />
                      <span className="text-sm font-bold">Pending Requests</span>
                    </Link>
                    <Link to="/agent/wallet" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 text-gray-700 transition">
                      <CreditCard size={20} className="text-blue-500" />
                      <span className="text-sm font-bold">myBiz Wallet</span>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
          
          {/* Footer (Logout) */}
          {isAuthenticated && (
            <div className="p-4 border-t border-gray-100">
              <button 
                onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold text-sm transition hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
