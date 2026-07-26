import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Plane, Building2, Briefcase, User, ChevronDown, ArrowLeft, Heart } from 'lucide-react';
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isNavWhite = forceWhite || (!portalMode && isScrolled);
  const isDarkText = portalMode ? false : (isNavWhite || (user?.role === 'TRAVEL_AGENT' && agentMode === 'MYBIZ'));
  
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
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 border-b ${navBgClass}`}
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
              {user?.role === 'TRAVEL_AGENT' && agentMode === 'MYBIZ' ? (
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

            {user?.role === 'TRAVEL_AGENT' && (
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
        <div className="flex items-center gap-6">
            {user?.role === 'TRAVEL_AGENT' && agentMode === 'MYBIZ' ? (
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
            ) : (
              <>
                {/* List Your Property */}
                <Link to="/partner/connect" className={`hidden md:flex items-center gap-2 cursor-pointer transition px-3 py-1.5 rounded-md ${isDarkText ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
                  <Building2 size={20} className="text-orange-500" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold">List Your Property</span>
                    <span className="text-[10px] opacity-70">Grow your business!</span>
                  </div>
                </Link>

                {/* My Trips */}
                {isAuthenticated ? (
                  <Link to="/dashboard/bookings" className={`hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition ${isDarkText ? 'text-gray-700' : 'text-white'}`}>
                    <Briefcase size={20} />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold">My Trips</span>
                      <span className="text-[10px] opacity-70">Manage your bookings</span>
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
                  <Link to="/wishlist" className={`hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition ${isDarkText ? 'text-gray-700' : 'text-white'}`}>
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
                  <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-gray-300/40">
                    <Link 
                      to="/b2b/login" 
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition ${isDarkText ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-amber-400 text-gray-900 hover:bg-amber-300'}`}
                    >
                      B2B Agent Portal
                    </Link>
                    <Link 
                      to="/supplier/login" 
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-full transition border ${isDarkText ? 'border-emerald-600 text-emerald-700 hover:bg-emerald-50' : 'border-emerald-400 text-emerald-300 hover:bg-emerald-950/50'}`}
                    >
                      Supplier Login ↗
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Login / User Button */}
            <div className="ml-4 flex items-center gap-4">
              {isAuthenticated ? (
                <div className="group relative py-2">
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition ${isDarkText ? 'bg-blue-50 text-blue-700' : 'bg-white/20 text-white'}`}>
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center overflow-hidden">
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
                        user?.name?.charAt(0)?.toUpperCase() || <User size={14} />
                      )}
                    </div>
                    Hi, {user?.name?.split(' ')[0] || 'User'}
                    <ChevronDown size={14} />
                  </button>
                  {/* Dropdown with invisible top padding to prevent hover loss */}
                  <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block">
                    <div className="bg-white rounded-lg shadow-xl py-2 border border-gray-100">
                      {user?.role === 'USER' && (
                        <div onClick={() => { navigate('/dashboard/profile'); }} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                          <User size={16} /> My Profile
                        </div>
                      )}
                      {(user?.role === 'TRAVEL_AGENT' || user?.role === 'AGENT' || user?.role === 'B2B_AGENT' || user?.role === 'SUPPLIER_AGENT') && (
                        <div onClick={() => { navigate('/b2b/home'); }} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                          <Briefcase size={16} /> B2B Dashboard
                        </div>
                      )}
                      {(user?.role === 'SUPER_ADMIN' || user?.role === 'SUB_ADMIN') && (
                        <div onClick={() => { navigate('/admin/dashboard'); }} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                          <Building2 size={16} /> Admin Panel
                        </div>
                      )}
                      {user?.role === 'SUPPLIER_PORTAL_ONLY' && (
                        <div onClick={() => { navigate('/supplier-portal/dashboard'); }} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700 text-sm">
                          <Briefcase size={16} /> Supplier Portal
                        </div>
                      )}
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100">Logout</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xs shadow-md hover:shadow-lg transition group"
                >
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-[10px]">my</span>
                  </div>
                  Login or Create Account
                  <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
                </button>
              )}
            </div>

          </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
}
