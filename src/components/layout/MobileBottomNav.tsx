import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Briefcase, Heart, User, MessageCircle } from 'lucide-react';

export default function MobileBottomNav({ onProfileClick }: { onProfileClick?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: Home, path: '/', action: () => navigate('/') },
    { label: 'My Trips', icon: Briefcase, path: '/dashboard/bookings', action: () => navigate('/dashboard/bookings') },
    // Inject Myra AI in the middle
    { label: 'Offers', icon: Heart, path: '/dashboard/wishlist', action: () => navigate('/dashboard/wishlist') },
    { label: 'Profile', icon: User, action: () => { if(onProfileClick) { onProfileClick(); } else { navigate('/dashboard/profile'); } } },
  ];

  const handleMyraClick = () => {
    window.dispatchEvent(new CustomEvent('open-myra-ai'));
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[100] pb-safe flex justify-around items-center px-2 py-2 rounded-t-[20px]">
      <button onClick={navItems[0].action} className={`flex flex-col items-center justify-center gap-1 min-w-[65px] ${location.pathname === navItems[0].path ? 'text-blue-600' : 'text-gray-500'}`}>
        <Home size={22} strokeWidth={location.pathname === navItems[0].path ? 2.5 : 2} className={location.pathname === navItems[0].path ? 'text-blue-600' : 'text-gray-400'} />
        <span className={`text-[10px] font-bold ${location.pathname === navItems[0].path ? 'text-blue-600' : 'text-gray-500'}`}>{navItems[0].label}</span>
      </button>

      <button onClick={navItems[1].action} className={`flex flex-col items-center justify-center gap-1 min-w-[65px] ${location.pathname === navItems[1].path ? 'text-blue-600' : 'text-gray-500'}`}>
        <Briefcase size={22} strokeWidth={location.pathname === navItems[1].path ? 2.5 : 2} className={location.pathname === navItems[1].path ? 'text-blue-600' : 'text-gray-400'} />
        <span className={`text-[10px] font-bold ${location.pathname === navItems[1].path ? 'text-blue-600' : 'text-gray-500'}`}>{navItems[1].label}</span>
      </button>

      <button onClick={handleMyraClick} className="relative flex flex-col items-center justify-center gap-1 min-w-[65px] -mt-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_4px_15px_rgba(79,70,229,0.4)] border-4 border-white">
          <MessageCircle size={24} className="text-white" />
        </div>
        <span className="text-[10px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Trippe AI</span>
      </button>

      <button onClick={navItems[2].action} className={`flex flex-col items-center justify-center gap-1 min-w-[65px] ${location.pathname === navItems[2].path ? 'text-blue-600' : 'text-gray-500'}`}>
        <Heart size={22} strokeWidth={location.pathname === navItems[2].path ? 2.5 : 2} className={location.pathname === navItems[2].path ? 'text-blue-600' : 'text-gray-400'} />
        <span className={`text-[10px] font-bold ${location.pathname === navItems[2].path ? 'text-blue-600' : 'text-gray-500'}`}>{navItems[2].label}</span>
      </button>

      <button onClick={navItems[3].action} className="flex flex-col items-center justify-center gap-1 min-w-[65px] text-gray-500">
        <User size={22} strokeWidth={2} className="text-gray-400" />
        <span className="text-[10px] font-bold text-gray-500">{navItems[3].label}</span>
      </button>
    </div>
  );
}
