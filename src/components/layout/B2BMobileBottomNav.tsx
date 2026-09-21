import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Plane, CreditCard, User, MoreHorizontal, FileText, Check, Briefcase, Users, ShieldCheck, X } from 'lucide-react';

export default function B2BMobileBottomNav({ onProfileClick, onCertificateClick }: { onProfileClick?: () => void, onCertificateClick?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMore, setShowMore] = useState(false);

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/b2b/dashboard', action: () => { setShowMore(false); navigate('/b2b/dashboard'); } },
    { label: 'Flights', icon: Plane, path: '/b2b/home', action: () => { setShowMore(false); navigate('/b2b/home'); } },
    { label: 'Wallet', icon: CreditCard, path: '/b2b/dashboard/wallet', action: () => { setShowMore(false); navigate('/b2b/dashboard/wallet'); } },
    { label: 'Profile', icon: User, path: '/b2b/profile', action: () => { setShowMore(false); if(onProfileClick) onProfileClick(); else navigate('/b2b/profile'); } },
    { label: 'More', icon: MoreHorizontal, action: () => setShowMore(!showMore) },
  ];

  const moreItems = [
    { label: 'Dashboard', path: '/b2b/dashboard', icon: <LayoutDashboard size={16} /> },
    { label: 'Account Statement', path: '/b2b/account-statement', icon: <FileText size={16} /> },
    { label: 'Booking Status', path: '/b2b/booking-status', icon: <Check size={16} /> },
    { label: 'Manage Booking', path: '/b2b/manage-booking', icon: <Briefcase size={16} /> },
    { label: 'Group Bookings RFQ', path: '/b2b/group-bookings', icon: <Users size={16} /> },
    { label: 'Agent Certificate', path: '#', icon: <ShieldCheck size={16} />, action: () => { if(onCertificateClick) onCertificateClick(); } }
  ];

  return (
    <>
      {/* Dimmed Background Overlay */}
      {showMore && (
        <div 
          className="fixed inset-0 bg-black/40 z-[90] lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setShowMore(false)}
        />
      )}

      {/* More Menu Bottom Sheet */}
      <div className={`fixed bottom-[70px] left-2 right-2 bg-white rounded-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-[95] lg:hidden transition-transform duration-300 transform origin-bottom ${showMore ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0 pointer-events-none'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-black text-[#0c1a40]">More Options</h3>
          <button onClick={() => setShowMore(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 p-1.5 rounded-full">
            <X size={16} />
          </button>
        </div>
        <div className="p-2 flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
          {moreItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setShowMore(false);
                if (item.action) {
                  item.action();
                } else if (item.path !== '#') {
                  navigate(item.path);
                }
              }}
              className="flex items-center gap-3 w-full p-3 text-left hover:bg-gray-50 rounded-xl transition-colors text-sm font-bold text-gray-700"
            >
              <div className="text-blue-600 bg-blue-50 p-2 rounded-lg">{item.icon}</div>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-[100] pb-safe flex justify-around items-center px-1 sm:px-2 py-2 rounded-t-[20px]">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.path ? location.pathname === item.path : (item.label === 'More' && showMore);
          
          return (
            <button key={index} onClick={item.action} className={`flex flex-col items-center justify-center gap-1 min-w-[55px] sm:min-w-[65px] ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
              <span className={`text-[10px] font-bold ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{item.label}</span>
            </button>
          )
        })}
      </div>
    </>
  );
}
