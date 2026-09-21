import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Tag, History, Users, Layers, User } from 'lucide-react';

export default function SupplierMobileBottomNav({ onProfileClick }: { onProfileClick?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/supplier-portal/dashboard', action: () => navigate('/supplier-portal/dashboard') },
    { label: 'Series Fare', icon: Tag, path: '/supplier-portal/series-fare', action: () => navigate('/supplier-portal/series-fare') },
    { label: 'History', icon: History, path: '/supplier-portal/history', action: () => navigate('/supplier-portal/history') },
    { label: 'Profile', icon: User, action: () => { if(onProfileClick) onProfileClick(); } },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[100] pb-safe flex justify-around items-center px-2 py-2 rounded-t-[20px]">
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = item.path ? location.pathname === item.path : false;
        
        return (
          <button key={index} onClick={item.action} className={`flex flex-col items-center justify-center gap-1 min-w-[65px] ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
            <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{item.label}</span>
          </button>
        )
      })}
    </div>
  );
}
