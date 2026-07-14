import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Plane, Building2, Briefcase, User, ChevronDown, ArrowLeft, Heart } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, logout } from '../../store/authSlice';
import LoginModal from '../auth/LoginModal';

interface TopNavbarProps {
  forceWhite?: boolean;
}

export default function TopNavbar({ forceWhite = false }: TopNavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isNavWhite = forceWhite || isScrolled;

  const handleLogout = () => {
    navigate('/');
    setTimeout(() => {
      dispatch(logout());
    }, 0);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-40 transition-all duration-300 border-b ${isNavWhite ? 'bg-white shadow-md border-gray-200 py-3' : 'bg-transparent border-transparent py-4'}`}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex justify-between items-center">
          
          {/* Back Button & Logo */}
          <div className="flex items-center gap-4">
            {location.pathname !== '/' && (
              <button 
                onClick={() => navigate(-1)} 
                className={`p-2 rounded-full transition ${isNavWhite ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-white'}`}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
              <Plane size={28} className={isNavWhite ? 'text-blue-600' : 'text-white'} />
              <span className={`text-2xl font-black tracking-tight ${isNavWhite ? 'text-gray-900' : 'text-white'}`}>
                Travel<span className={isNavWhite ? 'text-blue-600' : 'text-blue-400'}>Go</span>
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            {/* List Your Property */}
            <Link to="/partner/connect" className={`hidden md:flex items-center gap-2 cursor-pointer transition px-3 py-1.5 rounded-md ${isNavWhite ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}>
              <Building2 size={20} className="text-orange-500" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold">List Your Property</span>
                <span className="text-[10px] opacity-70">Grow your business!</span>
              </div>
            </Link>

            {/* My Trips */}
            {isAuthenticated ? (
              <Link to="/dashboard/bookings" className={`hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition ${isNavWhite ? 'text-gray-700' : 'text-white'}`}>
                <Briefcase size={20} />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold">My Trips</span>
                  <span className="text-[10px] opacity-70">Manage your bookings</span>
                </div>
              </Link>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className={`hidden md:flex text-left items-center gap-2 cursor-pointer hover:opacity-80 transition ${isNavWhite ? 'text-gray-700' : 'text-white'}`}>
                <Briefcase size={20} />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold">My Trips</span>
                  <span className="text-[10px] opacity-70">Manage your bookings</span>
                </div>
              </button>
            )}

            {/* Wishlist */}
            {isAuthenticated ? (
              <Link to="/wishlist" className={`hidden md:flex items-center gap-2 cursor-pointer hover:opacity-80 transition ${isNavWhite ? 'text-gray-700' : 'text-white'}`}>
                <Heart size={20} className="text-[#ff4f4f] fill-[#ff4f4f]" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold">Wishlist</span>
                  <span className="text-[10px] opacity-70">Save favourites</span>
                </div>
              </Link>
            ) : (
              <button onClick={() => setIsLoginModalOpen(true)} className={`hidden md:flex text-left items-center gap-2 cursor-pointer hover:opacity-80 transition ${isNavWhite ? 'text-gray-700' : 'text-white'}`}>
                <Heart size={20} className="text-[#ff4f4f] fill-[#ff4f4f]" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold">Wishlist</span>
                  <span className="text-[10px] opacity-70">Save favourites</span>
                </div>
              </button>
            )}

            {/* Login / User Button */}
            <div className="ml-4 flex items-center gap-4">
              {isAuthenticated ? (
                <div className="group relative py-2">
                  <button className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition ${isNavWhite ? 'bg-blue-50 text-blue-700' : 'bg-white/20 text-white'}`}>
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
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
                      <Link to="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                      {user?.role === 'SUPER_ADMIN' || user?.role === 'SUB_ADMIN' ? (
                        <div onClick={() => { navigate('/admin/dashboard'); }} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700">
                          <Building2 size={16} /> Admin Panel
                        </div>
                      ) : user?.role === 'AGENT' && (
                        <div onClick={() => { navigate('/agent-portal'); }} className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-gray-700">
                          <Briefcase size={16} /> Agent Portal
                        </div>
                      )}
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Logout</button>
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
