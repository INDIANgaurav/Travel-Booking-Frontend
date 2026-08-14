import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Plane, Building2, ShieldCheck, CreditCard, Compass, MoreHorizontal, LogOut, Home, Calendar, Receipt, CreditCard as CreditCardIcon, FileText, FileSpreadsheet, Phone, BadgePercent, Pencil, Wallet } from 'lucide-react';
import type { RootState } from '../../store/store';
import { logout } from '../../store/authSlice';

const B2BAgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Example dummy data from store or state
  const loggedInUser = useSelector((state: RootState) => state.auth.user);
  const agentName = loggedInUser?.companyName || (loggedInUser?.firstName ? `${loggedInUser.firstName} ${loggedInUser.lastName || ''}`.trim() : loggedInUser?.name) || '';
  const agentCode = loggedInUser?.agencyCode || loggedInUser?.agencyId || (loggedInUser?._id ? `UPTF${loggedInUser._id.slice(-6).toUpperCase()}` : '');
  const dashboardCards = [
    {
      title: 'Bank Details',
      description: 'Account info and current balance amount',
      icon: <Home size={20} />,
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-500',
      path: '/b2b/dashboard/bank-details'
    },
    {
      title: 'Wallet & Balance',
      description: 'Manage agency funds and transactions',
      icon: <Wallet size={20} />,
      bgColor: 'bg-emerald-50',
      iconBg: 'bg-emerald-500',
      path: '/b2b/dashboard/wallet'
    },
    {
      title: 'Pax Calendar',
      description: 'Flight PAX Calendar & Trip Timeline',
      icon: <Calendar size={20} />,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-500',
      path: '/b2b/dashboard/pax-calendar'
    },
    {
      title: 'Invoice',
      description: 'Travel Fare & Booking Invoice',
      icon: <Receipt size={20} />,
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-500',
      path: '/b2b/dashboard/invoice'
    },
    {
      title: 'Credit Notes',
      description: 'Customer Account Credit and Reconciliation',
      icon: <CreditCardIcon size={20} />,
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-500',
      path: '/b2b/dashboard/credit-note'
    },
    {
      title: 'Debit Note',
      description: 'Charge Revision and Account Adjustment Record',
      icon: <FileText size={20} />,
      bgColor: 'bg-orange-50',
      iconBg: 'bg-orange-500',
      path: '/b2b/dashboard/debit-note'
    },
    {
      title: 'GST Invoice',
      description: 'GST Compliant Bill for Business Transactions',
      icon: <FileSpreadsheet size={20} />,
      bgColor: 'bg-pink-50',
      iconBg: 'bg-pink-500',
      path: '/b2b/dashboard/gst-invoice'
    },
    {
      title: 'Offline Booking',
      description: 'Traditional Booking Without Online Access',
      icon: <Phone size={20} />,
      bgColor: 'bg-indigo-50',
      iconBg: 'bg-indigo-500',
      path: '/b2b/dashboard/offline-booking'
    },
    {
      title: 'AgentMarkup',
      description: 'Agency Profit Margin on Client Bookings',
      icon: <BadgePercent size={20} />,
      bgColor: 'bg-lime-50',
      iconBg: 'bg-lime-500',
      path: '/b2b/dashboard/markup'
    }
  ];

  const location = useLocation();
  const isHome = location.pathname === '/b2b/dashboard' || location.pathname === '/b2b/dashboard/';

  return (
    <main className="flex-1 w-full px-4 md:px-8 lg:px-12 xl:px-16 py-10">
      
      {isHome ? (
        <>
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-[32px] font-black text-[#0c1a40] mb-1">Welcome back, {agentName}</h1>
            <p className="text-[13px] text-gray-500 font-semibold">Quick access to your B2B tools - {agentCode}.</p>
          </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {dashboardCards.map((card, index) => (
          <div 
            key={index} 
            onClick={() => card.path !== '#' && navigate(card.path)}
            className={`${card.bgColor} rounded-[20px] p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer group`}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className={`w-[50px] h-[50px] rounded-full ${card.iconBg} text-white flex items-center justify-center shadow-sm shrink-0`}>
                {card.icon}
              </div>
              <div>
                <h3 className="text-[#0c1a40] font-black text-[15px]">{card.title}</h3>
                <p className="text-gray-500 text-[11px] font-semibold mt-0.5 max-w-[180px] leading-tight">{card.description}</p>
              </div>
            </div>

            {/* Edit/Action Pencil Icon */}
            <div className="absolute top-4 right-4 w-7 h-7 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm opacity-80 group-hover:opacity-100 transition">
              <Pencil size={12} />
            </div>
          </div>
        ))}
      </div>
        </>
      ) : (
        <>
          {/* Compact Horizontal Tabs for Sub-pages */}
          <div className="mb-6 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {dashboardCards.map((card, index) => {
              const isActive = location.pathname.startsWith(card.path);
              return (
                <button
                  key={index}
                  onClick={() => card.path !== '#' && navigate(card.path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-[#0b1031] text-white shadow-md' 
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className={`${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {React.cloneElement(card.icon as React.ReactElement<any>, { size: 14 })}
                  </span>
                  {card.title}
                </button>
              );
            })}
          </div>
          
          {/* Sub-page Content */}
          <Outlet />
        </>
      )}

    </main>
  );
};

export default B2BAgentDashboard;


