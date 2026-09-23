import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Home, LayoutDashboard, User } from 'lucide-react';
import MobileBottomNav from './MobileBottomNav';

export default function GlobalMobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state: any) => state.auth?.user);

  // Define paths where MobileBottomNav should NOT be shown for normal users
  const hiddenPaths = [
    '/admin',
    '/b2b',
    '/supplier',
    '/sub-admin',
    '/agent-portal'
  ];

  const roles = user?.roles || [user?.role].filter(Boolean);
  const isAdmin = roles.some((r: string) => ['SUPER_ADMIN', 'SUB_ADMIN'].includes(r));
  const isB2B = roles.includes('B2B_AGENT');
  const isSupplier = roles.includes('SUPPLIER');
  
  const hasAdminRole = user && (isAdmin || isB2B || isSupplier);

  const shouldHide = !hasAdminRole && hiddenPaths.some(path => location.pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }



  if (hasAdminRole) {
    let dashboardPath = '/admin/dashboard';
    let profilePath = '/admin/profile';
    if (isB2B) {
      dashboardPath = '/b2b/dashboard';
      profilePath = '/b2b/profile';
    } else if (isSupplier) {
      dashboardPath = '/supplier/dashboard';
      profilePath = '/supplier/profile';
    }

    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[100] pb-safe flex justify-around items-center px-4 py-2 rounded-t-[20px]">
        <button onClick={() => navigate('/')} className={`flex flex-col items-center justify-center gap-1 min-w-[65px] ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-500'}`}>
          <Home size={22} strokeWidth={location.pathname === '/' ? 2.5 : 2} className={location.pathname === '/' ? 'text-blue-600' : 'text-gray-400'} />
          <span className={`text-[10px] font-bold ${location.pathname === '/' ? 'text-blue-600' : 'text-gray-500'}`}>Home</span>
        </button>

        <button onClick={() => navigate(dashboardPath)} className={`flex flex-col items-center justify-center gap-1 min-w-[65px] text-gray-500`}>
          <LayoutDashboard size={22} strokeWidth={2} className="text-gray-400" />
          <span className={`text-[10px] font-bold text-gray-500`}>Dashboard</span>
        </button>

        <button onClick={() => navigate(profilePath)} className={`flex flex-col items-center justify-center gap-1 min-w-[65px] text-gray-500`}>
          <User size={22} strokeWidth={2} className="text-gray-400" />
          <span className={`text-[10px] font-bold text-gray-500`}>Profile</span>
        </button>
      </div>
    );
  }

  return <MobileBottomNav />;
}
